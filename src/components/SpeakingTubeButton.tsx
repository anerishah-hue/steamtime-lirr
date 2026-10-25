import React, { useId } from 'react';
import { VoiceState } from '../context/VoiceContext';

interface SpeakingTubeButtonProps {
  voiceState: VoiceState;
  isSpeechSupported: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Authentic Victorian Speaking-Tube & Telegraph Key Button.
 * 100% inline SVG with brass gradient, rivets, acoustic fluted horn, and depressed animation.
 * Features a guaranteed 48x48px tap target with zero layout shift during all state transitions.
 */
export const SpeakingTubeButton: React.FC<SpeakingTubeButtonProps> = ({
  voiceState,
  isSpeechSupported,
  onClick,
  disabled = false,
  className = ''
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const getButtonStyles = () => {
    if (!isSpeechSupported) {
      return 'opacity-40 cursor-not-allowed bg-stone-900 border-2 border-stone-700 shadow-none';
    }

    switch (voiceState) {
      case 'listening':
        return 'bg-gradient-to-b from-[#3B2806] via-[#5C4310] to-[#8F6B20] border-2 border-amber-400 ring-4 ring-amber-400/60 ring-offset-2 ring-offset-stone-900 translate-y-0.5 shadow-[inset_0_3px_6px_rgba(0,0,0,0.85)] animate-pulse';
      case 'thinking':
        return 'bg-gradient-to-b from-[#6B4E13] via-[#4A340C] to-[#2B1E07] border-2 border-amber-500/80 shadow-inner opacity-90 cursor-wait';
      case 'speaking':
        return 'bg-gradient-to-b from-[#1C3825] via-[#2D5A3C] to-[#122418] border-2 border-emerald-400 ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-stone-900 shadow-inner';
      case 'idle':
      default:
        return 'bg-gradient-to-b from-[#8F6B20] via-[#5C4310] to-[#362608] hover:from-[#A87E25] hover:via-[#6B4E13] hover:to-[#422F0A] border-2 border-[#D4AF37] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.5)] active:translate-y-0.5';
    }
  };

  const getAriaLabel = () => {
    if (!isSpeechSupported) return 'Voice works best in Chrome or Edge';
    switch (voiceState) {
      case 'listening':
        return 'Listening to your voice. Tap to stop listening.';
      case 'thinking':
        return 'Stationmaster Abernathy is composing a reply...';
      case 'speaking':
        return 'Stationmaster Abernathy is speaking. Tap to silence.';
      case 'idle':
      default:
        return 'Speak to the Stationmaster';
    }
  };

  const getTitle = () => {
    if (!isSpeechSupported) return 'Voice works best in Chrome or Edge';
    switch (voiceState) {
      case 'listening':
        return 'Listening... (Tap to stop)';
      case 'thinking':
        return 'Stationmaster is thinking...';
      case 'speaking':
        return 'Stationmaster is speaking (Tap to silence)';
      case 'idle':
      default:
        return 'Speak to the Stationmaster (Tap to speak)';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isSpeechSupported || disabled || voiceState === 'thinking'}
      aria-label={getAriaLabel()}
      title={getTitle()}
      className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900 transition-all ${getButtonStyles()} ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        className="w-6 h-6 select-none pointer-events-none drop-shadow-sm"
        aria-hidden="true"
      >
        <defs>
          {/* Outer Victorian brass bezel gradient */}
          <radialGradient id={`btnBrassBezelGrad_${uid}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFF3B0" />
            <stop offset="35%" stopColor="#E5C158" />
            <stop offset="70%" stopColor="#A8791E" />
            <stop offset="100%" stopColor="#4A3408" />
          </radialGradient>
          {/* Inner acoustic horn cone gradient */}
          <radialGradient id={`btnHornConeGrad_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1A150D" />
            <stop offset="45%" stopColor="#3E2B10" />
            <stop offset="85%" stopColor="#8A6319" />
            <stop offset="100%" stopColor="#C99E32" />
          </radialGradient>
          {/* Depressed inner shadow gradient for listening */}
          <radialGradient id={`btnDepressedGrad_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0B0906" />
            <stop offset="60%" stopColor="#2A1C0A" />
            <stop offset="100%" stopColor="#7A5614" />
          </radialGradient>
        </defs>

        {/* Outer brass housing with bezel */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill={`url(#btnBrassBezelGrad_${uid})`}
          stroke="#2E1C05"
          strokeWidth="1.5"
        />

        {/* 4 Decorative Victorian rivets */}
        <circle cx="24" cy="5" r="1.5" fill="#3B2506" />
        <circle cx="24" cy="5" r="0.8" fill="#FFF3B0" />
        <circle cx="24" cy="43" r="1.5" fill="#3B2506" />
        <circle cx="24" cy="43" r="0.8" fill="#FFF3B0" />
        <circle cx="5" cy="24" r="1.5" fill="#3B2506" />
        <circle cx="5" cy="24" r="0.8" fill="#FFF3B0" />
        <circle cx="43" cy="24" r="1.5" fill="#3B2506" />
        <circle cx="43" cy="24" r="0.8" fill="#FFF3B0" />

        {/* Stepped inner brass acoustic chamber */}
        <circle
          cx="24"
          cy="24"
          r="17"
          fill={voiceState === 'listening' ? `url(#btnDepressedGrad_${uid})` : `url(#btnHornConeGrad_${uid})`}
          stroke="#593E0B"
          strokeWidth="1"
        />

        {/* State-specific center iconography */}
        {voiceState === 'thinking' ? (
          // Spinning clockwork telegraph gear
          <g className="animate-spin origin-center text-amber-200">
            <circle cx="24" cy="24" r="6.5" fill="none" stroke="#FDE68A" strokeWidth="2" strokeDasharray="4 2.5" />
            <circle cx="24" cy="24" r="2.5" fill="#F59E0B" />
          </g>
        ) : voiceState === 'speaking' ? (
          // Radiating Victorian acoustic soundwaves
          <g fill="none" stroke="#FDE68A" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="24" cy="24" r="3.5" fill="#F59E0B" stroke="#B45309" />
            <path d="M18 19 A8 8 0 0 0 18 29" />
            <path d="M30 19 A8 8 0 0 1 30 29" />
            <path d="M15 15 A14 14 0 0 0 15 33" opacity="0.8" />
            <path d="M33 15 A14 14 0 0 1 33 33" opacity="0.8" />
          </g>
        ) : (
          // Victorian Fluted Speaking-Tube Mouthpiece / Telegraph Key
          <g>
            {/* Concentric sound diaphragm rings */}
            <circle cx="24" cy="24" r="11" fill="none" stroke="#D97706" strokeWidth="0.8" opacity="0.6" />
            <circle cx="24" cy="24" r="7" fill="none" stroke="#FBBF24" strokeWidth="0.85" />
            {/* Central horn aperture */}
            <circle cx="24" cy="24" r="3.5" fill="#1C1307" stroke="#F59E0B" strokeWidth="1.2" />
            {/* Grille crosshairs */}
            <line x1="24" y1="21.5" x2="24" y2="26.5" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" />
            <line x1="21.5" y1="24" x2="26.5" y2="24" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </button>
  );
};
