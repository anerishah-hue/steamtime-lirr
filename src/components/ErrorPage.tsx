import React, { useState } from 'react';
import { RotateCcw, Volume2, Compass, MessageSquareQuote } from 'lucide-react';
import { playWhistle, isSoundEnabled } from '../utils/audioWhistle';

interface ErrorPageProps {
  onReturnHome?: () => void;
  error?: Error | null;
  resetErrorBoundary?: () => void;
  onAskStationmaster?: (prompt: string) => void;
}

/**
 * Authentic Victorian Railway Error / 404 Page.
 * Displays:
 * - Headline: "The line is blocked by a cow."
 * - Victorian illustration of a tranquil cow on the tracks facing a steam locomotive.
 * - Telegraph advisory copy.
 * - Interactive whistle button and return to station navigation.
 */
export const ErrorPage: React.FC<ErrorPageProps> = ({
  onReturnHome,
  error,
  resetErrorBoundary,
  onAskStationmaster
}) => {
  const [mooReaction, setMooReaction] = useState<string | null>(null);

  const handleWhistle = () => {
    playWhistle();
    setMooReaction('The cow blinks placidly and chews its cud with undisturbed composure. "Mooo."');
    setTimeout(() => setMooReaction(null), 4500);
  };

  const handleClearLine = () => {
    if (resetErrorBoundary) resetErrorBoundary();
    if (onReturnHome) onReturnHome();
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="victorian-panel max-w-xl w-full p-6 sm:p-8 relative shadow-2xl border-4 border-[#8A6E2D] rounded-2xl text-center">
        {/* Brass Rivets on Corners */}
        <span className="brass-rivet absolute top-2.5 left-2.5" />
        <span className="brass-rivet absolute top-2.5 right-2.5" />
        <span className="brass-rivet absolute bottom-2.5 left-2.5" />
        <span className="brass-rivet absolute bottom-2.5 right-2.5" />

        {/* Telegram Top Dispatch Header */}
        <div className="inline-block px-4 py-1 rounded bg-[#2B1117] border border-[#8A6E2D] text-[#C5A059] font-serif text-[11px] uppercase tracking-widest font-bold shadow-sm mb-4">
          TELEGRAM ADVISORY • TRACK DELAY NOTICE
        </div>

        {/* Illustrated Cow On Tracks & Steam Locomotive SVG */}
        <div className="relative mx-auto my-3 w-full max-w-sm h-48 bg-[#EDE4CF] rounded-xl border-2 border-[#8A6E2D] overflow-hidden shadow-inner flex items-center justify-center p-2">
          <svg viewBox="0 0 320 180" className="w-full h-full" aria-label="Illustration: A cow sitting peacefully on the train tracks before a stopped steam locomotive">
            <defs>
              <linearGradient id="skySepia" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5EEDB" />
                <stop offset="100%" stopColor="#E2D4B7" />
              </linearGradient>
              <linearGradient id="grassSepia" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C9B890" />
                <stop offset="100%" stopColor="#A8946E" />
              </linearGradient>
              <linearGradient id="locoOxblood" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4A161E" />
                <stop offset="100%" stopColor="#1C0A0E" />
              </linearGradient>
            </defs>

            {/* Background Sky & Distant Pasture */}
            <rect x="0" y="0" width="320" height="110" fill="url(#skySepia)" />
            <rect x="0" y="110" width="320" height="70" fill="url(#grassSepia)" />

            {/* Telegraph Pole & Wires */}
            <line x1="45" y1="20" x2="45" y2="120" stroke="#5A4315" strokeWidth="2.5" />
            <line x1="35" y1="30" x2="55" y2="30" stroke="#5A4315" strokeWidth="2" />
            <line x1="35" y1="40" x2="55" y2="40" stroke="#5A4315" strokeWidth="2" />
            <path d="M 0 32 Q 45 42 120 32" fill="none" stroke="#7A5B1E" strokeWidth="0.8" opacity="0.7" />
            <path d="M 0 42 Q 45 52 120 42" fill="none" stroke="#7A5B1E" strokeWidth="0.8" opacity="0.7" />

            {/* Distant Pasture Fence */}
            <line x1="10" y1="110" x2="310" y2="110" stroke="#8A6E2D" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />

            {/* Ballast & Track Bed */}
            <polygon points="10,175 310,175 270,120 50,120" fill="#9C8966" opacity="0.6" />

            {/* Cross-ties / Sleepers */}
            {Array.from({ length: 8 }).map((_, i) => {
              const y = 125 + i * 6.5;
              const w = 180 + i * 14;
              const x = 160 - w / 2;
              return (
                <rect key={i} x={x} y={y} width={w} height={3.5} fill="#4A341E" stroke="#2B1B0E" strokeWidth="0.5" />
              );
            })}

            {/* Two Steel Rails Converging */}
            <line x1="90" y1="120" x2="45" y2="175" stroke="#48392F" strokeWidth="3" />
            <line x1="88" y1="120" x2="43" y2="175" stroke="#E2DED9" strokeWidth="1" />
            <line x1="230" y1="120" x2="275" y2="175" stroke="#48392F" strokeWidth="3" />
            <line x1="232" y1="120" x2="277" y2="175" stroke="#E2DED9" strokeWidth="1" />

            {/* Stopped Steam Locomotive (Left Side of Tracks) */}
            <g transform="translate(10, 45)">
              {/* Steam Puffs from Stack */}
              <circle cx="95" cy="18" r="9" fill="#FFFFFF" opacity="0.7" />
              <circle cx="108" cy="10" r="12" fill="#FFFFFF" opacity="0.6" />
              <circle cx="125" cy="5" r="15" fill="#FFFFFF" opacity="0.45" />

              {/* Engine Body */}
              <rect x="20" y="32" width="75" height="42" rx="3" fill="url(#locoOxblood)" stroke="#14080A" strokeWidth="1.5" />
              {/* Cab */}
              <rect x="0" y="20" width="30" height="54" rx="2" fill="url(#locoOxblood)" stroke="#14080A" strokeWidth="1.5" />
              <rect x="5" y="26" width="16" height="14" rx="1" fill="#FAF6EB" stroke="#1C140E" strokeWidth="0.8" />
              {/* Smokestack */}
              <polygon points="85,32 98,32 95,15 88,15" fill="#C5A059" stroke="#3D290F" strokeWidth="1" />
              {/* Steam Dome */}
              <path d="M 50 32 C 50 20 62 20 62 32 Z" fill="#C5A059" stroke="#3D290F" strokeWidth="1" />
              {/* Front Cowcatcher / Pilot */}
              <polygon points="95,74 125,74 95,50" fill="#C5A059" stroke="#3D290F" strokeWidth="1" />
              {/* Front Golden Headlamp Beaming at Cow */}
              <circle cx="96" cy="46" r="5" fill="#FFF4C2" stroke="#C5A059" strokeWidth="1" />
              <polygon points="101,46 220,20 220,140" fill="#FFFBE6" opacity="0.25" />
              {/* Driving Wheels */}
              <circle cx="35" cy="74" r="12" fill="#1C140E" stroke="#C5A059" strokeWidth="2" />
              <circle cx="65" cy="74" r="12" fill="#1C140E" stroke="#C5A059" strokeWidth="2" />
              <circle cx="92" cy="74" r="8" fill="#1C140E" stroke="#C5A059" strokeWidth="1.5" />
              <line x1="35" y1="74" x2="65" y2="74" stroke="#F3E5AB" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* The Obstinate Placid Cow (Sitting Squarely on the Right Track) */}
            <g transform="translate(165, 88)">
              {/* Cow Shadow */}
              <ellipse cx="50" cy="56" rx="42" ry="10" fill="#3D2E14" opacity="0.4" />

              {/* Cow Body (sitting peacefully on the tracks) */}
              <ellipse cx="50" cy="40" rx="38" ry="22" fill="#F8F4E8" stroke="#1C140E" strokeWidth="1.5" />
              {/* Classic Black Spots */}
              <path d="M 30 25 C 25 32 32 46 45 44 C 40 30 35 25 30 25 Z" fill="#1C140E" />
              <path d="M 60 28 C 72 30 76 45 68 50 C 58 48 56 36 60 28 Z" fill="#1C140E" />
              <path d="M 40 52 C 45 56 55 58 52 50 Z" fill="#1C140E" />

              {/* Folded Hooves */}
              <ellipse cx="28" cy="54" rx="8" ry="4" fill="#1C140E" />
              <ellipse cx="70" cy="54" rx="9" ry="4" fill="#1C140E" />

              {/* Cow Head Turned Towards the Train */}
              <g transform="translate(10, 15)">
                {/* Head Base */}
                <ellipse cx="14" cy="16" rx="14" ry="16" fill="#F8F4E8" stroke="#1C140E" strokeWidth="1.5" />
                {/* Black Eye Patch */}
                <path d="M 6 8 C 3 14 6 22 14 20 C 12 12 10 7 6 8 Z" fill="#1C140E" />
                {/* Horns */}
                <path d="M 4 8 C -2 3 0 -4 4 -2" fill="none" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" />
                <path d="M 24 8 C 30 3 28 -4 24 -2" fill="none" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" />
                {/* Ears */}
                <ellipse cx="1" cy="11" rx="5" ry="2.5" fill="#E8C39E" stroke="#1C140E" strokeWidth="0.8" transform="rotate(-20 1 11)" />
                <ellipse cx="27" cy="11" rx="5" ry="2.5" fill="#E8C39E" stroke="#1C140E" strokeWidth="0.8" transform="rotate(20 27 11)" />
                {/* Muzzle / Nose */}
                <ellipse cx="14" cy="24" rx="10" ry="7" fill="#F2C8B8" stroke="#1C140E" strokeWidth="1" />
                <circle cx="10.5" cy="23" r="1.5" fill="#5A3A30" />
                <circle cx="17.5" cy="23" r="1.5" fill="#5A3A30" />
                {/* Chewing Cud Grass Blade */}
                <path d="M 14 28 Q 10 36 2 34" fill="none" stroke="#3A7545" strokeWidth="1.5" strokeLinecap="round" />
                {/* Calm Big Eyes */}
                <circle cx="8" cy="13" r="2.2" fill="#1C140E" />
                <circle cx="8.6" cy="12.4" r="0.8" fill="#FFFFFF" />
                <circle cx="20" cy="13" r="2.2" fill="#1C140E" />
                <circle cx="20.6" cy="12.4" r="0.8" fill="#FFFFFF" />
              </g>

              {/* Cow Tail Flicking */}
              <path d="M 88 38 Q 98 42 94 52" fill="none" stroke="#1C140E" strokeWidth="1.5" />
              <circle cx="94" cy="52" r="2" fill="#1C140E" />
            </g>
          </svg>
        </div>

        {/* Primary Headline Required */}
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#F4EEDB] tracking-wide mt-4 mb-2">
          The line is blocked by a cow.
        </h1>

        {/* Narrative Description */}
        <p className="text-xs sm:text-sm text-[#C5A059] font-serif italic leading-relaxed max-w-md mx-auto mb-4">
          All service is momentarily delayed. An obstinate heifer has taken up residence upon the steel tracks near Mineola and displays complete indifference to the whistle.
        </p>

        {/* Technical Error Disclosure if Present */}
        {error && (
          <div className="mb-4 p-2.5 rounded bg-[#180A0E] border border-[#8A1A24] text-[10px] font-mono text-[#FCA5A5] text-left overflow-x-auto max-h-24 no-scrollbar">
            <strong>Signal Breakdown:</strong> {error.message || String(error)}
          </div>
        )}

        {/* Interactive Whistle Moo Reaction */}
        {mooReaction && (
          <div className="mb-4 p-2 rounded-lg bg-[#FAF6EB] border border-[#8A6E2D] text-xs font-serif italic text-[#1C140E] animate-in fade-in">
            {mooReaction}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t-2 border-[#8A6E2D]/40">
          <button
            type="button"
            onClick={handleClearLine}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#B5942F] to-[#C5A059] hover:from-[#C5A059] hover:to-[#F3E5AB] text-[#1C140E] font-bold font-serif text-xs transition-all flex items-center gap-2 shadow-md active:scale-95 border border-[#F3E5AB]/40"
          >
            <RotateCcw className="w-4 h-4 text-[#1C140E]" />
            <span>Clear the Line & Return to Station</span>
          </button>

          <button
            type="button"
            onClick={handleWhistle}
            className="px-4 py-2.5 rounded-lg bg-[#2B1117] hover:bg-[#38161E] border border-[#8A6E2D] hover:border-[#F3E5AB] text-[#F3E5AB] font-serif text-xs transition-all flex items-center gap-2 shadow-sm active:scale-95"
            title="Blow the steam whistle (if sound is enabled)"
          >
            <Volume2 className="w-4 h-4 text-[#C5A059]" />
            <span>Sound Whistle ({isSoundEnabled() ? 'Sound ON' : 'Muted'})</span>
          </button>

          {onAskStationmaster && (
            <button
              type="button"
              onClick={() => onAskStationmaster('Stationmaster Abernathy, the tracks appear blocked by a cow! What is our projected delay?')}
              className="px-3.5 py-2.5 rounded-lg bg-[#180A0E] hover:bg-[#240E14] border border-[#8A6E2D]/70 text-[#C5A059] hover:text-[#F4EEDB] font-serif text-xs transition-all flex items-center gap-1.5"
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#2E8872]" />
              <span>Ask Abernathy</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
