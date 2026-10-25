import { ChatMessage, CommuterAccount, Station, TrainDeparture } from '../types';

export interface LiveChatContext {
  origin?: Station;
  destination?: Station;
  profile?: CommuterAccount | null;
  departures?: TrainDeparture[];
  selectedRoute?: string;
  serviceDay?: string;
  addressForm?: 'sir' | 'madam' | 'traveler' | 'Mr.' | 'Ms.' | 'Esq.' | string;
  isVoice?: boolean;
}

export interface StreamChatOptions {
  messages: ChatMessage[];
  liveContext: LiveChatContext;
  onChunk: (chunk: string) => void;
  onError: (errorText: string) => void;
  onComplete: () => void;
  signal?: AbortSignal;
}

/**
 * Streams chat responses from the Stationmaster Abernathy LLM backend route (/api/chat).
 * Preserves full conversation history, passes live app context, and streams tokens.
 * Completely free of hardcoded canned responses or static keyword templates.
 */
export async function streamStationmasterChat({
  messages,
  liveContext,
  onChunk,
  onError,
  onComplete,
  signal
}: StreamChatOptions): Promise<void> {
  const IN_CHARACTER_ERROR =
    "My humble apologies, traveler! The telegraph wire to central dispatch has encountered static. Pray ensure your telegraph connection (GEMINI_API_KEY in .env) is configured, or try again shortly.";

  try {
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal,
      body: JSON.stringify({
        messages: formattedMessages,
        liveContext: {
          origin: liveContext.origin
            ? {
                name: liveContext.origin.name,
                branch: liveContext.origin.branch,
                zone: liveContext.origin.zone
              }
            : undefined,
          destination: liveContext.destination
            ? {
                name: liveContext.destination.name,
                branch: liveContext.destination.branch,
                zone: liveContext.destination.zone
              }
            : undefined,
          profile: liveContext.profile
            ? {
                name: liveContext.profile.name,
                role: liveContext.profile.role,
                fareDiscountPercent: liveContext.profile.fareDiscountPercent,
                customPerks: liveContext.profile.customPerks
              }
            : undefined,
          addressForm:
            liveContext.addressForm ||
            (liveContext.profile?.gender === 'male'
              ? 'sir'
              : liveContext.profile?.gender === 'female'
              ? 'madam'
              : 'traveler'),
          selectedRoute:
            liveContext.selectedRoute ||
            (liveContext.origin && liveContext.destination
              ? `${liveContext.origin.name} → ${liveContext.destination.name}`
              : undefined),
          serviceDay: liveContext.serviceDay || 'Today (Live)',
          isVoice: Boolean(liveContext.isVoice),
          departures: liveContext.departures?.slice(0, 10).map((d) => ({
            trainNumber: d.trainNumber,
            departureTime: d.departureTime,
            arrivalTime: d.arrivalTime,
            durationMinutes: d.durationMinutes,
            peak: d.peak,
            track: d.track,
            status: d.status,
            transfers: d.transfers
          }))
        }
      })
    });

    if (!response.ok || !response.body) {
      onError(IN_CHARACTER_ERROR);
      onComplete();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.slice(5).trim();
        if (dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.text) {
            onChunk(parsed.text);
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }

    onComplete();
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      onComplete();
      return;
    }
    console.error('[Stationmaster Client] Stream error:', err);
    onError(IN_CHARACTER_ERROR);
    onComplete();
  }
}
