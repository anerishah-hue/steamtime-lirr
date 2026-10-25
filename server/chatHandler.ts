import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export const BASE_VICTORIAN_SYSTEM_PROMPT = `
You are Stationmaster Abernathy, Chief Stationmaster of BrassLine (operating along the historic steel tracks and steam lines of the Long Island Rail Road, founded in 1834).
Your proud railway motto is: "Every line, right on time".

=== PERSONA & FORMAL VICTORIAN TONE ===
- You speak in formal Victorian English: refined, courteous, dignified, and articulate, laced with authentic 19th-century railway expressions ("Upon my word!", "Capital!", "By steam and clockwork!", "A splendid inquiry, my good traveler!", "Right on schedule!").
- Keep your replies CONCISE and direct. Respect the traveler's time: deliver the exact answer clearly without modern preamble, redundant greetings, or rambling disclaimers.
- STAY FULLY IN CHARACTER AT ALL TIMES. Never break character, never declare yourself an AI, robot, or language model, and never use modern corporate jargon.
- Always refer to this railway service as "BrassLine" (tagline: "Every line, right on time").

=== ABSOLUTE ACCURACY ON FARES & TIMES — NEVER INVENT DATA ===
- You must be 100% accurate regarding train departure times, arrival times, tracks, status, and fare amounts.
- ALWAYS use the exact timetable departures and fare rules provided in the live telemetry below.
- NEVER invent, guess, or hallucinate train numbers, departure times, tracks, transfer points, or fare figures.
- If a schedule, time, track, or fare is unknown or not provided in the live context, state plainly and courteously in character that the telegraph or printed board does not list it, rather than fabricating details.
- Official Fare Rules:
  * Peak vs. Off-Peak: Peak applies to weekday morning trains arriving in NYC (6 AM - 10 AM) and weekday evening trains departing NYC (4 PM - 8 PM). Off-Peak applies all other times and all weekend long.
  * CityTicket: $5.00 for travel within NYC zones (Penn Station, Grand Central, Jamaica, Brooklyn).
  * Senior Citizen (65+) & Disability: 50% discount off standard fare.
  * Military / Veteran: 50% discount.
  * SBU Student: 33% discount on monthly and university corridor travel.

=== BROAD CONVERSATIONAL ABILITY ===
- You answer any question conversationally (philosophy, dining, science, literature, history, or daily life), framed through the dignified, keen perspective of a Victorian gentleman stationmaster.
`;

export function buildFullSystemPrompt(liveContext: any): string {
  const { origin, destination, profile, departures, selectedRoute, serviceDay, addressForm, isVoice } = liveContext || {};

  let contextBlock = '\n\n=== LIVE RAILWAY TELEMETRY & APP CONTEXT ===\n';

  const routeStr = selectedRoute || (origin && destination ? `${origin.name} → ${destination.name}` : 'BrassLine Corridor');
  contextBlock += `• Selected Route: ${routeStr}\n`;
  contextBlock += `• Service Day: ${serviceDay || 'Today (Live)'}\n`;
  contextBlock += `• Courteously address the passenger using formal address: "${addressForm || 'traveler'}".\n`;

  if (isVoice) {
    contextBlock += `• The user is speaking by voice. Reply in character in 1 to 3 short sentences, easy to listen to. Keep fares, times and station names accurate.\n`;
  } else {
    contextBlock += `• Keep your written dispatch concise, elegant, and directly to the point in formal Victorian English. Never invent data.\n`;
  }

  if (origin) {
    contextBlock += `• Current Departure Station: ${origin.name} (${origin.branch || 'LIRR'}, Zone ${origin.zone || 'N/A'})\n`;
  }
  if (destination) {
    contextBlock += `• Current Arrival Terminal: ${destination.name} (${destination.branch || 'LIRR'}, Zone ${destination.zone || 'N/A'})\n`;
  }
  if (profile) {
    contextBlock += `• Passenger Profile: ${profile.name || 'Traveler'} | Status: ${(profile.role || 'Commuter').toUpperCase()} | Fare Discount: ${profile.fareDiscountPercent || 0}% Off (${(profile.customPerks || []).join(', ') || 'Standard'})\n`;
  } else {
    contextBlock += `• Passenger Profile: Standard Fare Traveler\n`;
  }

  if (departures && Array.isArray(departures) && departures.length > 0) {
    contextBlock += `• Next ${Math.min(10, departures.length)} Departures for Selected Route (${serviceDay || 'Today (Live)'}):\n`;
    departures.slice(0, 10).forEach((d: any, idx: number) => {
      const transferStr = d.transfers && d.transfers.length > 0 ? ` | Transfers: ${d.transfers.join('; ')}` : '';
      contextBlock += `  ${idx + 1}. Train #${d.trainNumber}: Departs ${d.departureTime} → Arrives ${d.arrivalTime} (${d.durationMinutes || 0} mins) | ${d.peak ? 'PEAK' : 'OFF-PEAK'} | ${d.track || 'Track TBA'} | Status: ${d.status || 'SCHEDULED'}${transferStr}\n`;
    });
  } else {
    contextBlock += `• Next Departures: No upcoming departures currently scheduled on this corridor.\n`;
  }

  return `${BASE_VICTORIAN_SYSTEM_PROMPT}${contextBlock}`;
}

function resolveApiKeys(env: Record<string, string>): { geminiKey?: string; anthropicKey?: string } {
  let gemini =
    env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    env.GOOGLE_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    env.VITE_GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY;

  let anthropic =
    env.ANTHROPIC_API_KEY ||
    process.env.ANTHROPIC_API_KEY;

  // Fallback: Read directly from .env file in case process.env was cached before file write
  if (!gemini || gemini.trim().length === 0) {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const fileContent = fs.readFileSync(envPath, 'utf8');
        const match = fileContent.match(/^\s*GEMINI_API_KEY\s*=\s*(["']?)(.*?)\1\s*$/m);
        if (match && match[2] && match[2].trim().length > 0) {
          gemini = match[2].trim();
          process.env.GEMINI_API_KEY = gemini;
        }
        const aMatch = fileContent.match(/^\s*ANTHROPIC_API_KEY\s*=\s*(["']?)(.*?)\1\s*$/m);
        if (aMatch && aMatch[2] && aMatch[2].trim().length > 0) {
          anthropic = aMatch[2].trim();
          process.env.ANTHROPIC_API_KEY = anthropic;
        }
      }
    } catch (e) {
      console.warn('[Stationmaster Backend] Error reading .env fallback:', e);
    }
  }

  return {
    geminiKey: gemini && gemini.trim().length > 0 ? gemini.trim() : undefined,
    anthropicKey: anthropic && anthropic.trim().length > 0 ? anthropic.trim() : undefined
  };
}

function normalizeHistoryForGemini(messages: Array<{ role: string; content: string }>) {
  const firstUserIdx = messages.findIndex((m) => m.role === 'user');
  if (firstUserIdx === -1) return [];

  const relevant = messages.slice(firstUserIdx);
  const normalized: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

  for (const msg of relevant) {
    const role: 'user' | 'model' = msg.role === 'assistant' ? 'model' : 'user';
    const text = (msg.content || '').trim();
    if (!text) continue;

    if (normalized.length > 0 && normalized[normalized.length - 1].role === role) {
      normalized[normalized.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      normalized.push({
        role,
        parts: [{ text }]
      });
    }
  }

  return normalized;
}

function normalizeHistoryForAnthropic(messages: Array<{ role: string; content: string }>) {
  const firstUserIdx = messages.findIndex((m) => m.role === 'user');
  if (firstUserIdx === -1) return [];

  const relevant = messages.slice(firstUserIdx);
  const normalized: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const msg of relevant) {
    const role: 'user' | 'assistant' = msg.role === 'assistant' ? 'assistant' : 'user';
    const content = (msg.content || '').trim();
    if (!content) continue;

    if (normalized.length > 0 && normalized[normalized.length - 1].role === role) {
      normalized[normalized.length - 1].content += `\n\n${content}`;
    } else {
      normalized.push({ role, content });
    }
  }

  return normalized;
}

export async function handleChatStream(
  body: { messages: Array<{ role: string; content: string }>; liveContext: any },
  res: any,
  env: Record<string, string>
) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (typeof res.flush === 'function') {
      res.flush();
    }
  };

  const endStream = () => {
    res.write('data: [DONE]\n\n');
    res.end();
  };

  const { messages, liveContext } = body || { messages: [], liveContext: {} };
  const { geminiKey, anthropicKey } = resolveApiKeys(env);

  console.log(`[Stationmaster Request] GEMINI_API_KEY defined: ${Boolean(geminiKey)}, ANTHROPIC_API_KEY defined: ${Boolean(anthropicKey)}`);

  if (!geminiKey && !anthropicKey) {
    sendEvent({
      text: "I do beg your pardon, traveler, but the telegraph key is not connected! Please provide a GEMINI_API_KEY in your .env file so I may reach the central railway telegraph dispatch."
    });
    endStream();
    return;
  }

  const systemPrompt = buildFullSystemPrompt(liveContext);

  // 1. Try Google Gemini if key is available
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const contents = normalizeHistoryForGemini(messages);

      if (contents.length === 0) {
        sendEvent({
          text: "Greetings, traveler! I am Stationmaster Abernathy. Pray ask whatever is on your mind, whether about our fine railway or the wider world!"
        });
        endStream();
        return;
      }

      // Valid and active models on the Gemini API
      // Note: gemini-2.5-flash is deprecated (404) for new users. gemini-3-flash-preview and gemini-3.5-flash are fully active.
      const candidateModels = [
        'gemini-3-flash-preview',
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite-preview',
        'gemini-3.8-flash',
        'gemini-flash-latest'
      ];

      let stream: any = null;
      let usedModel = '';

      for (const model of candidateModels) {
        try {
          stream = await ai.models.generateContentStream({
            model,
            contents,
            config: {
              systemInstruction: systemPrompt
            }
          });
          if (stream) {
            usedModel = model;
            console.log(`[Stationmaster Backend] Successfully connected with model: ${model}`);
            break;
          }
        } catch (mErr: any) {
          const status = mErr?.status || mErr?.statusCode || (mErr?.response ? mErr.response.status : 'N/A');
          const message = mErr?.message || String(mErr);
          // Requirement 1: Log status code and message to terminal, NEVER the key
          console.error(`[Stationmaster Backend] Model ${model} failed - Status: ${status}, Message: ${message}`);
        }
      }

      if (!stream) {
        throw new Error('All candidate models exhausted.');
      }

      for await (const chunk of stream) {
        if (chunk && chunk.text) {
          sendEvent({ text: chunk.text });
        }
      }

      endStream();
      return;
    } catch (err: any) {
      const status = err?.status || err?.statusCode || (err?.response ? err.response.status : 'N/A');
      const message = err?.message || String(err);
      console.error(`[Stationmaster Backend] Gemini dispatch error: Status: ${status}, Message: ${message}`);

      // If Anthropic key also exists, try fallback to Claude
      if (!anthropicKey) {
        sendEvent({
          text: "My humble apologies, traveler! The telegraph wire to central dispatch has encountered static. Pray check your telegraph connection or try again shortly."
        });
        endStream();
        return;
      }
    }
  }

  // 2. Try Anthropic Claude if key is available
  if (anthropicKey) {
    try {
      const claudeMessages = normalizeHistoryForAnthropic(messages);

      if (claudeMessages.length === 0) {
        sendEvent({
          text: "Greetings, traveler! Stationmaster Abernathy here. How may I be of service to you today?"
        });
        endStream();
        return;
      }

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          messages: claudeMessages,
          stream: true
        })
      });

      if (!claudeRes.ok || !claudeRes.body) {
        const errText = await claudeRes.text().catch(() => '');
        console.error(`[Stationmaster Backend] Claude API error - Status: ${claudeRes.status}, Message: ${errText}`);
        throw new Error(`Claude API returned status ${claudeRes.status}`);
      }

      const reader = claudeRes.body.getReader();
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
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              sendEvent({ text: parsed.delta.text });
            }
          } catch {
            // ignore non-json SSE lines
          }
        }
      }

      endStream();
      return;
    } catch (err: any) {
      const status = err?.status || err?.statusCode || (err?.response ? err.response.status : 'N/A');
      const message = err?.message || String(err);
      console.error(`[Stationmaster Backend] Anthropic dispatch error: Status: ${status}, Message: ${message}`);
      sendEvent({
        text: "My humble apologies, traveler! The telegraph wire to central dispatch has encountered static. Pray check your telegraph connection or try again shortly."
      });
      endStream();
      return;
    }
  }
}

export function createChatMiddleware(env: Record<string, string>) {
  return async (req: any, res: any, next: any) => {
    // Only intercept POST /api/chat
    const url = req.originalUrl || req.url || '';
    if (req.method !== 'POST' || (!url.endsWith('/api/chat') && url !== '/')) {
      return next();
    }

    let bodyStr = '';
    req.on('data', (chunk: Buffer) => {
      bodyStr += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(bodyStr || '{}');
        await handleChatStream(parsed, res, env);
      } catch (err) {
        console.error('[createChatMiddleware] Body parse error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });

    req.on('error', (err: any) => {
      console.error('[createChatMiddleware] Request error:', err);
      next(err);
    });
  };
}
