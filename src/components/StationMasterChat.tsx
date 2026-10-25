import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, CommuterAccount, Station, TrainDeparture } from '../types';
import { streamStationmasterChat } from '../services/geminiService';
import { useVoiceConductor } from '../hooks/useVoiceConductor';
import { SpeakingTubeButton } from './SpeakingTubeButton';
import { SteamPressureGauge } from './SteamPressureGauge';
import {
  Send,
  Bot,
  User,
  Coffee,
  Utensils,
  Award,
  Clock,
  RefreshCw,
  Feather,
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX
} from 'lucide-react';

/**
 * Authentic Illustrated Portrait of Stationmaster Abernathy.
 * Features:
 * - Stationmaster peaked cap with gold braid & brass badge.
 * - Victorian high collar, cravat with gold pin, and dark uniform coat.
 * - Gleaming brass pocket watch with Roman dial & chain.
 * - Fully inline SVG with metallic gradients and brass frame rivets.
 */
export const AbernathyPortrait: React.FC<{ size?: number; className?: string }> = ({
  size = 46,
  className = ''
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`inline-block drop-shadow-md select-none shrink-0 ${className}`}
      aria-label="Illustrated portrait of Stationmaster Abernathy"
      role="img"
    >
      <defs>
        <radialGradient id="abernathyBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FBF7EE" />
          <stop offset="65%" stopColor="#E6D7BA" />
          <stop offset="100%" stopColor="#C8B388" />
        </radialGradient>
        <linearGradient id="abernathyBrass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2B8" />
          <stop offset="45%" stopColor="#C5A059" />
          <stop offset="100%" stopColor="#7A5B1E" />
        </linearGradient>
        <linearGradient id="abernathyCoat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2D141A" />
          <stop offset="100%" stopColor="#14080A" />
        </linearGradient>
        <clipPath id="abernathyCircleClip">
          <circle cx="50" cy="50" r="44" />
        </clipPath>
      </defs>

      {/* Outer Brass Frame Ring with Engraved Rim */}
      <circle cx="50" cy="50" r="48" fill="url(#abernathyBrass)" stroke="#3D290F" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="44.5" fill="#1C140E" />

      {/* Clipped Portrait Area */}
      <g clipPath="url(#abernathyCircleClip)">
        {/* Background Vintage Sepia Vignette */}
        <circle cx="50" cy="50" r="44" fill="url(#abernathyBg)" />

        {/* Train Shed Arch in Distant Sepia */}
        <path d="M 20 62 A 30 30 0 0 1 80 62" fill="none" stroke="#BFA880" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6" />

        {/* Double-Breasted Uniform Coat & Shoulders */}
        <path d="M 14 100 C 16 76 30 70 42 68 L 50 82 L 58 68 C 70 70 84 76 86 100 Z" fill="url(#abernathyCoat)" stroke="#14080A" strokeWidth="1" />
        
        {/* Brass Waistcoat Buttons */}
        <circle cx="48" cy="85" r="1.2" fill="url(#abernathyBrass)" />
        <circle cx="48" cy="91" r="1.2" fill="url(#abernathyBrass)" />
        <circle cx="48" cy="97" r="1.2" fill="url(#abernathyBrass)" />

        {/* High Victorian Wing Collar & Cream Cravat */}
        <path d="M 43 64 L 50 78 L 57 64 L 50 61 Z" fill="#F8F4E8" stroke="#7A5B1E" strokeWidth="0.8" />
        <circle cx="50" cy="69" r="1.4" fill="url(#abernathyBrass)" stroke="#3D290F" strokeWidth="0.4" />

        {/* Gentleman's Head / Face */}
        <path d="M 36 41 C 36 30 64 30 64 41 C 64 56 59 63 50 63 C 41 63 36 56 36 41 Z" fill="#E8C39E" stroke="#5C381E" strokeWidth="0.8" />

        {/* Sideburns */}
        <path d="M 36 39 L 39 49 L 36 48 Z" fill="#4A3425" />
        <path d="M 64 39 L 61 49 L 64 48 Z" fill="#4A3425" />

        {/* Distinguished Victorian Handlebar Mustache */}
        <path d="M 50 50 C 45 47 36 49 33 54 C 38 56 45 53 50 53.5 C 55 53 62 56 67 54 C 64 49 55 47 50 50 Z" fill="#3D291A" stroke="#26180E" strokeWidth="0.6" />

        {/* Eyes & Spectacles */}
        <ellipse cx="43.5" cy="41.5" rx="2.5" ry="1.8" fill="#F8F4E8" stroke="#3D291A" strokeWidth="0.6" />
        <circle cx="44" cy="41.5" r="1" fill="#1C140E" />
        <ellipse cx="56.5" cy="41.5" rx="2.5" ry="1.8" fill="#F8F4E8" stroke="#3D291A" strokeWidth="0.6" />
        <circle cx="56" cy="41.5" r="1" fill="#1C140E" />
        {/* Wire-Rim Spectacle Bridge */}
        <path d="M 46 41 Q 50 39.5 54 41" fill="none" stroke="url(#abernathyBrass)" strokeWidth="0.8" />
        <circle cx="43.5" cy="41.5" r="3.2" fill="none" stroke="url(#abernathyBrass)" strokeWidth="0.6" />
        <circle cx="56.5" cy="41.5" r="3.2" fill="none" stroke="url(#abernathyBrass)" strokeWidth="0.6" />

        {/* Stationmaster Peaked Cap */}
        {/* Visor / Peak */}
        <path d="M 30 35 C 36 38.5 64 38.5 70 35 C 72 38 67 41 50 41 C 33 41 28 38 30 35 Z" fill="#14080A" stroke="#000000" strokeWidth="0.8" />
        {/* Visor Highlight */}
        <path d="M 34 36.5 Q 50 39 66 36.5" fill="none" stroke="#7A6655" strokeWidth="0.6" opacity="0.6" />
        {/* Gold Braid / Cap Band */}
        <path d="M 32 33 C 38 36 62 36 68 33 L 68 30 C 62 32.5 38 32.5 32 30 Z" fill="url(#abernathyBrass)" stroke="#5A4315" strokeWidth="0.6" />
        {/* Cap Crown */}
        <path d="M 32 30 C 29 18 71 18 68 30 Z" fill="#240F14" stroke="#14080A" strokeWidth="0.8" />
        {/* Brass Stationmaster Badge */}
        <polygon points="50,25 46,30 54,30" fill="url(#abernathyBrass)" stroke="#3D290F" strokeWidth="0.5" />
        <circle cx="50" cy="28" r="1" fill="#691621" />

        {/* Gleaming Brass Pocket Watch (Held in Hand with Drape Chain) */}
        {/* Watch Chain draped from waistcoat pocket */}
        <path d="M 50 78 Q 62 83 67 74" fill="none" stroke="url(#abernathyBrass)" strokeWidth="1" strokeDasharray="1.5 1" />

        {/* Pocket Watch Assembly */}
        <g transform="translate(63, 68)">
          <circle cx="10" cy="10" r="10" fill="url(#abernathyBrass)" stroke="#3D290F" strokeWidth="0.8" />
          <circle cx="10" cy="10" r="8" fill="#FAF6EB" stroke="#7A5B1E" strokeWidth="0.5" />
          {/* Stem & Bow Ring */}
          <rect x="9" y="-2" width="2" height="2.5" fill="url(#abernathyBrass)" />
          <circle cx="10" cy="-3" r="2.2" fill="none" stroke="url(#abernathyBrass)" strokeWidth="0.8" />
          {/* Hands pointing to Punctual Time */}
          <circle cx="10" cy="10" r="1" fill="#1C140E" />
          <line x1="10" y1="10" x2="10" y2="4.8" stroke="#1C140E" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="10" y1="10" x2="14" y2="10" stroke="#1C140E" strokeWidth="0.8" strokeLinecap="round" />
          {/* Roman Markers (12, 3, 6, 9) */}
          <line x1="10" y1="3" x2="10" y2="4.2" stroke="#691621" strokeWidth="0.7" />
          <line x1="16.2" y1="10" x2="15" y2="10" stroke="#691621" strokeWidth="0.7" />
          <line x1="10" y1="17" x2="10" y2="15.8" stroke="#691621" strokeWidth="0.7" />
          <line x1="3.8" y1="10" x2="5" y2="10" stroke="#691621" strokeWidth="0.7" />
        </g>
      </g>

      {/* Frame Rivets */}
      <circle cx="15" cy="15" r="1.6" fill="#FCE588" stroke="#5A4315" strokeWidth="0.5" />
      <circle cx="85" cy="15" r="1.6" fill="#FCE588" stroke="#5A4315" strokeWidth="0.5" />
      <circle cx="15" cy="85" r="1.6" fill="#FCE588" stroke="#5A4315" strokeWidth="0.5" />
      <circle cx="85" cy="85" r="1.6" fill="#FCE588" stroke="#5A4315" strokeWidth="0.5" />
    </svg>
  );
};

interface StationMasterChatProps {
  origin: Station;
  destination: Station;
  departures: TrainDeparture[];
  selectedDate?: string;
  profile: CommuterAccount | null;
  prefilledQuery?: string;
  onOpenProfileModal: () => void;
}

export const StationMasterChat: React.FC<StationMasterChatProps> = ({
  origin,
  destination,
  departures,
  selectedDate = 'today',
  profile,
  prefilledQuery,
  onOpenProfileModal
}) => {
  const formalGreeting = profile
    ? profile.gender === 'male'
      ? `Mr. ${profile.name}`
      : profile.gender === 'female'
      ? `Ms. ${profile.name}`
      : `${profile.name}, Esq.`
    : 'esteemed traveler';

  const welcomeFareTopic = profile?.role === 'senior'
    ? 'calculate your Senior 65+ / Reduced fare'
    : profile?.role === 'child'
    ? 'inquire about young children riding free'
    : profile?.role === 'frequent'
    ? 'discuss Monthly and Ten-Trip ticket savings'
    : 'review official MTA ticket fares and times';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Greetings, ${formalGreeting}! I am Stationmaster Abernathy, welcoming you to BrassLine—every line, right on time! Whether you wish to discuss our upcoming train runs to ${destination.name}, explore local dining near ${origin.name}, ${welcomeFareTopic}, or converse about literature, science, or life beyond the rails—pray ask whatever is on your mind!`,
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState(prefilledQuery || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeStreamingId, setActiveStreamingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isConnecting, isStreaming]);

  useEffect(() => {
    if (prefilledQuery && prefilledQuery.trim().length > 0) {
      setInputValue(prefilledQuery);
    }
  }, [prefilledQuery]);

  const handleSendMessage = async (textToSend?: string, options?: { isVoice?: boolean }) => {
    const isVoice = Boolean(options?.isVoice);
    const text = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!text || isConnecting || isStreaming) return;

    // Abort ongoing speech & any existing stream
    silenceSpeech();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const placeholderAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];

    setMessages([...updatedHistory, placeholderAssistantMsg]);
    setInputValue('');
    setIsConnecting(true);
    setIsStreaming(true);
    setActiveStreamingId(assistantMsgId);
    clearVoiceError();

    let accumulatedContent = '';

    const serviceDayLabel =
      selectedDate === 'today'
        ? 'Today (Live)'
        : selectedDate === 'weekday'
        ? 'Weekday'
        : selectedDate === 'saturday'
        ? 'Saturday'
        : selectedDate === 'sunday'
        ? 'Sunday'
        : selectedDate || 'Today (Live)';

    await streamStationmasterChat({
      messages: updatedHistory,
      liveContext: {
        origin,
        destination,
        profile,
        addressForm:
          profile?.gender === 'male'
            ? `Mr. ${profile.name}`
            : profile?.gender === 'female'
            ? `Ms. ${profile.name}`
            : profile
            ? `${profile.name}, Esq.`
            : 'traveler',
        departures: departures.slice(0, 10),
        selectedRoute: `${origin.name} → ${destination.name}`,
        serviceDay: serviceDayLabel,
        isVoice
      },
      signal: abortController.signal,
      onChunk: (chunk: string) => {
        setIsConnecting(false);
        accumulatedContent += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m
          )
        );
      },
      onError: (errorText: string) => {
        setIsConnecting(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content:
                    accumulatedContent.length > 0
                      ? `${accumulatedContent}\n\n[Telegraph Interruption: ${errorText}]`
                      : errorText
                }
              : m
          )
        );
      },
      onComplete: () => {
        setIsConnecting(false);
        setIsStreaming(false);
        setActiveStreamingId(null);

        // Abernathy reads the reply aloud if message was sent via voice or if "Read replies aloud" toggle is on
        speakReply(accumulatedContent, isVoice);
      }
    });
  };

  // Wire custom hook for voice interaction, whistle synthesis, and speech recognition
  const {
    voiceState,
    isSpeechSupported,
    isMuted,
    toggleMute,
    readAloud,
    setReadAloud,
    voiceError,
    clearVoiceError,
    ariaLiveText,
    handleSpeakingTubeClick,
    silenceSpeech,
    speakReply
  } = useVoiceConductor({
    onSendMessage: handleSendMessage,
    onInterimSpeech: (interim) => setInputValue(interim)
  });

  const QUICK_PROMPTS = [
    {
      icon: Clock,
      label: `Next Train to ${destination.name.replace(' Station', '').replace(' Central Junction', '')}`,
      query: `When is our next departure from ${origin.name} to ${destination.name}, and what track is assigned?`
    },
    {
      icon: Award,
      label: 'MTA Ticket Fare',
      query: `What is the official MTA ticket fare between ${origin.name} (Zone ${origin.zone}) and ${destination.name} (Zone ${destination.zone}) for my category?`
    },
    {
      icon: Coffee,
      label: 'Coffee & Breakfast',
      query: `Where can I get good hot coffee and breakfast near ${origin.name} station within walking distance?`
    },
    {
      icon: Utensils,
      label: 'Dining Guide',
      query: `Recommend a fine tavern or restaurant near ${origin.name} under $25 and over $50.`
    },
    {
      icon: HelpCircle,
      label: 'Steam locomotive riddle',
      query: `Stationmaster, share an amusing 19th-century railway riddle or philosophy on life and punctuality!`
    }
  ];

  return (
    <section className="victorian-panel p-4 sm:p-5 relative shadow-xl flex flex-col h-[600px]">
      {/* Corner Brass Rivets on Section Panel */}
      <span className="brass-rivet absolute top-2 left-2" />
      <span className="brass-rivet absolute top-2 right-2" />
      <span className="brass-rivet absolute bottom-2 left-2" />
      <span className="brass-rivet absolute bottom-2 right-2" />

      {/* Hidden ARIA Live Region for Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaLiveText}
      </div>

      {/* Header with Live Context Indicators, Abernathy Portrait & Mini Boiler Pressure Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#8A6E2D]/50 mb-3 gap-2">
        <div className="flex items-center gap-3">
          {/* Illustrated Portrait of Stationmaster Abernathy (Cap & Pocket Watch) */}
          <AbernathyPortrait size={48} className="border border-[#C5A059]/40 rounded-full" />

          {/* Compact Mini Steam Pressure Gauge in Header (Needle jitters while talking!) */}
          <div className="relative shrink-0 flex items-center justify-center p-0.5 rounded-full bg-gradient-to-br from-[#8A6E2D] via-[#2B1117] to-[#12080B] border-2 border-[#C5A059] shadow-md">
            <SteamPressureGauge size={40} showLabel={false} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#F4EEDB]">
                STATIONMASTER ABERNATHY
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#185244]/50 text-[#44BBA4] border border-[#2E8872]/60 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-[#44BBA4]" />
                Live Telegraph LLM
              </span>
            </div>
            <p className="text-[11px] text-[#C5A059]/90 font-serif italic flex items-center gap-1.5 mt-0.5">
              <span>Stationed at {origin.name}</span>
              <span>•</span>
              <span className="text-[#F3E5AB] font-mono">
                {origin.name} → {destination.name} ({Math.min(10, departures.length)} trains listed)
              </span>
            </p>
          </div>
        </div>

        {/* Current profile button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {profile ? (
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#2B1117] border border-[#8A6E2D] hover:border-[#F3E5AB] text-[#F3E5AB] font-serif transition-all flex items-center gap-1.5 shadow-sm"
              title="Edit Commuter Account"
            >
              <Award className="w-3 h-3 text-[#C5A059]" />
              <span>
                {profile.name} (
                {profile.role === 'senior'
                  ? 'Senior 65+ / Reduced'
                  : profile.role === 'child'
                  ? 'Child under 5'
                  : profile.role === 'frequent'
                  ? 'Frequent Commuter'
                  : profile.role === 'student' || (profile as any).isConcept
                  ? 'Demo Concept'
                  : 'Standard Fare'}
                )
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#2B1117] border border-[#8A6E2D] hover:border-[#F3E5AB] text-[#EDE4D0] hover:text-[#F3E5AB] transition-all font-serif"
            >
              + Set Up Account
            </button>
          )}
        </div>
      </div>

      {/* Suggested Questions Styled as Little Calling Cards */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between text-[10px] font-serif uppercase tracking-wider text-[#C5A059] mb-1.5 font-bold">
          <span className="flex items-center gap-1">
            <Feather className="w-3 h-3 text-[#C5A059]" />
            <span>Passenger Calling Cards</span>
          </span>
          <span className="text-[#C5A059]/70 text-[9px] italic">Tap card to present inquiry</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {QUICK_PROMPTS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.query)}
                disabled={isConnecting || isStreaming || voiceState === 'listening'}
                className="group relative flex flex-col text-left p-2.5 rounded-lg bg-[#FAF6EB] hover:bg-[#FFFDF7] text-[#1C140E] border-2 border-[#8A6E2D] shadow-[0_2px_6px_rgba(0,0,0,0.35)] hover:shadow-[0_4px_12px_rgba(197,160,89,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0 w-[170px] sm:w-[185px] cursor-pointer disabled:opacity-50 select-none"
              >
                {/* Ornate corner marks */}
                <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#8A6E2D]/60 pointer-events-none" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#8A6E2D]/60 pointer-events-none" />
                <span className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-[#8A6E2D]/60 pointer-events-none" />
                <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#8A6E2D]/60 pointer-events-none" />

                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[9px] font-serif uppercase tracking-wider text-[#691621] font-bold">
                    Carte de Visite
                  </span>
                  <Icon className="w-3 h-3 text-[#8A6E2D] group-hover:text-[#691621] transition-colors" />
                </div>

                <span className="font-serif font-bold text-xs text-[#1C140E] line-clamp-1 leading-snug group-hover:text-[#691621] transition-colors">
                  {p.label}
                </span>

                <span className="text-[10px] text-[#554030] font-serif italic mt-0.5 line-clamp-1">
                  "{p.query}"
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCurrentlyStreamingThis = isStreaming && msg.id === activeStreamingId;

          if (!isUser && !msg.content && isConnecting) {
            return null;
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border overflow-hidden ${
                  isUser
                    ? 'bg-[#38161E] border-[#8A6E2D] text-[#F3E5AB]'
                    : 'bg-[#F4EEDB] border border-[#8A6E2D] shadow-sm'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <AbernathyPortrait size={28} />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-[#2B1117] text-[#F4EEDB] border border-[#8A6E2D] rounded-tr-none text-xs font-sans'
                    : 'parchment-card text-[#1C140E] rounded-tl-none border-2 border-[#8A6E2D] font-serif text-[13px]'
                }`}
              >
                {!isUser && (
                  <div className="text-[10px] font-serif text-[#8A6E2D] font-bold border-b border-[#D8CCA8] pb-1 mb-1.5 flex justify-between tracking-wider">
                    <span>TELEGRAPH DISPATCH</span>
                    <span className="font-mono text-[#6B5749]">{msg.timestamp}</span>
                  </div>
                )}

                <div className="whitespace-pre-line">
                  {msg.content}
                  {isCurrentlyStreamingThis && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#8A6E2D] animate-pulse align-middle" />
                  )}
                </div>

                {isUser && (
                  <div className="text-[9px] font-mono text-[#C5A059]/70 text-right mt-1">
                    {msg.timestamp}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator while connecting to LLM */}
        {isConnecting && (
          <div className="flex items-center gap-2.5 text-xs text-[#F3E5AB] font-serif italic animate-pulse p-2.5 bg-[#2B1117] rounded-lg border-2 border-[#8A6E2D] w-fit shadow-md">
            <Clock className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
            <span>consulting the pocket watch...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status & Controls Bar (Fixed height to guarantee ZERO layout shift) */}
      <div className="flex items-center justify-between min-h-[26px] px-1 py-1 text-[11px] font-sans border-t border-[#4E1D27]">
        <div className="flex items-center gap-2 overflow-hidden">
          {voiceState === 'listening' && (
            <span className="inline-flex items-center gap-1.5 text-[#F3E5AB] font-mono text-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-ping inline-block" />
              <span>Listening... Speak into the tube</span>
            </span>
          )}

          {voiceState === 'thinking' && (
            <span className="inline-flex items-center gap-1.5 text-[#C5A059] font-serif italic text-xs animate-pulse">
              <Clock className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
              <span>consulting the pocket watch...</span>
            </span>
          )}

          {voiceState === 'speaking' && (
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[#44BBA4] font-mono text-xs">
                <Volume2 className="w-3.5 h-3.5 animate-pulse text-[#44BBA4]" />
                <span>Stationmaster is speaking...</span>
              </span>
              <button
                type="button"
                onClick={silenceSpeech}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#4A161E] hover:bg-[#631E29] border border-[#8A1A24] text-[10px] font-serif text-[#FDE8E8] transition-all active:scale-95 shadow-sm"
                aria-label="Silence Stationmaster Abernathy"
                title="Silence reply"
              >
                <VolumeX className="w-3 h-3 text-[#D65D65]" />
                <span>Silence</span>
              </button>
            </div>
          )}

          {voiceError && (
            <span className="text-[#D65D65] font-serif text-[11px] inline-flex items-center gap-1.5 truncate">
              <span>{voiceError}</span>
              <button
                type="button"
                onClick={clearVoiceError}
                className="text-[#C5A059] hover:text-white text-xs px-1"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </span>
          )}
        </div>

        {/* Audio Effects Speaker Mute & Read Aloud Controls */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Steam Whistle Sound Effect Speaker Mute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-serif transition-all border ${
              isMuted
                ? 'bg-[#2B1117] border-[#8A1A24] text-[#D65D65]'
                : 'bg-[#185244]/40 border-[#3A9B83] text-[#44BBA4]'
            }`}
            title={isMuted ? 'Sound is OFF (Click to enable whistle, chuff & voice)' : 'Sound is ON (Click to mute)'}
            aria-label={isMuted ? 'Turn on sound' : 'Mute sound'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#D65D65]" />
                <span className="text-[10px]">Sound: OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#44BBA4]" />
                <span className="text-[10px]">Sound: ON</span>
              </>
            )}
          </button>

          {/* Read replies aloud toggle */}
          <label
            className="flex items-center gap-1.5 text-[11px] font-serif text-[#C5A059] hover:text-[#F3E5AB] cursor-pointer select-none transition-colors"
            title="Read Abernathy's replies aloud using voice synthesis"
          >
            <input
              type="checkbox"
              checked={readAloud}
              onChange={(e) => setReadAloud(e.target.checked)}
              className="accent-[#C5A059] w-3.5 h-3.5 rounded cursor-pointer"
            />
            <span className="hidden sm:inline">Read aloud</span>
          </label>
        </div>
      </div>

      {/* Free-form Input Area (Supports Enter key, typed text, and Speaking-Tube voice button) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2 border-t-2 border-[#8A6E2D]/40 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              voiceState === 'listening'
                ? 'Listening to your voice through the speaking-tube...'
                : 'Ask about train times, philosophy, local dining, or life advice...'
            }
            className="w-full bg-[#12080B] border border-[#8A6E2D]/80 focus:border-[#F3E5AB] rounded-lg px-3.5 py-2 text-xs text-[#F4EEDB] placeholder:text-[#8A6E2D] focus:outline-none transition-all pr-8 font-serif"
            disabled={isConnecting || isStreaming || voiceState === 'listening'}
          />
          <Feather className="w-3.5 h-3.5 text-[#8A6E2D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Speak to the Stationmaster Mic Button (Victorian Speaking-Tube / Telegraph Key) */}
        <SpeakingTubeButton
          voiceState={voiceState}
          isSpeechSupported={isSpeechSupported}
          onClick={handleSpeakingTubeClick}
          disabled={isConnecting || isStreaming}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputValue.trim() || isConnecting || isStreaming || voiceState === 'listening'}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#B5942F] to-[#C5A059] hover:from-[#C5A059] hover:to-[#F3E5AB] text-[#1C140E] font-bold text-xs font-serif active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md shrink-0 min-h-[44px] border border-[#F3E5AB]/40"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </section>
  );
};
