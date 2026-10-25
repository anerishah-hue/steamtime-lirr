import React, { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
  message?: string;
  minDurationMs?: number;
}

/**
 * Authentic Victorian Railway Crossing Loading Screen.
 * Displays:
 * - Train crossing crossbuck sign & signal lanterns.
 * - Steam locomotive chuffing along steel rails.
 * - "Stoking the boiler..." message with building steam pressure gauge.
 * - Full prefers-reduced-motion support (stationary locomotive, zero flashing).
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  message = 'Stoking the boiler...',
  minDurationMs = 1800
}) => {
  const [psi, setPsi] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
  });

  // Listen for prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  // Animate steam boiler pressure rising from 0 to 140 PSI
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / minDurationMs);
      setPsi(Math.round(progress * 140));

      if (progress >= 1) {
        clearInterval(interval);
        setIsDone(true);
        if (onComplete) {
          setTimeout(onComplete, 250);
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-[#14080B] text-[#EDE4D0] select-none overflow-hidden"
    >
      {/* Background Iron Texture & Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0C0406]/80 to-[#050203] pointer-events-none" />

      {/* Main Victorian Panel Cartouche */}
      <div className="victorian-panel p-6 sm:p-8 max-w-lg w-full relative shadow-[0_10px_50px_rgba(0,0,0,0.9)] border-4 border-[#8A6E2D] rounded-2xl text-center">
        {/* Corner Brass Rivets */}
        <span className="brass-rivet absolute top-2.5 left-2.5" />
        <span className="brass-rivet absolute top-2.5 right-2.5" />
        <span className="brass-rivet absolute bottom-2.5 left-2.5" />
        <span className="brass-rivet absolute bottom-2.5 right-2.5" />

        {/* 1. Victorian Railway Crossing Crossbuck & Signal Lanterns */}
        <div className="flex flex-col items-center justify-center mb-5">
          {/* Wooden / Brass Crossbuck Sign ("RAILWAY CROSSING") */}
          <div className="relative w-36 h-20 flex items-center justify-center drop-shadow-md">
            {/* Post */}
            <div className="absolute w-2.5 h-20 bg-gradient-to-r from-[#4A3215] via-[#7A5B1E] to-[#38260D] rounded-sm" />
            {/* Top Post Cap */}
            <div className="absolute -top-1 w-4 h-2 bg-[#C5A059] rounded-sm border border-[#3D290F]" />

            {/* Left Cross Blade */}
            <div
              className="absolute w-36 h-6 rounded bg-[#F8F4E8] border-2 border-[#1C140E] flex items-center justify-center shadow-md"
              style={{ transform: 'rotate(28deg)' }}
            >
              <span className="font-serif font-black text-[10px] tracking-widest text-[#1C140E]">
                RAILWAY
              </span>
            </div>

            {/* Right Cross Blade */}
            <div
              className="absolute w-36 h-6 rounded bg-[#F8F4E8] border-2 border-[#1C140E] flex items-center justify-center shadow-md"
              style={{ transform: 'rotate(-28deg)' }}
            >
              <span className="font-serif font-black text-[10px] tracking-widest text-[#1C140E]">
                CROSSING
              </span>
            </div>

            {/* Center Pivot Bolt */}
            <div className="absolute w-3 h-3 rounded-full bg-[#C5A059] border border-[#1C140E] z-10" />
          </div>

          {/* Dual Flashing Crossing Lanterns */}
          <div className="flex items-center gap-12 -mt-1 z-10">
            {/* Left Lantern */}
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 border-[#3D290F] transition-all duration-300 ${
                  prefersReducedMotion
                    ? 'bg-[#8A1A24] shadow-[0_0_8px_rgba(220,38,38,0.5)]'
                    : 'train-crossing-light-left'
                }`}
                style={{
                  backgroundColor: prefersReducedMotion ? '#DC2626' : undefined
                }}
              />
              <div className="w-1 h-2 bg-[#5A4315]" />
            </div>

            {/* Right Lantern */}
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 border-[#3D290F] transition-all duration-300 ${
                  prefersReducedMotion
                    ? 'bg-[#8A1A24] shadow-[0_0_8px_rgba(220,38,38,0.5)]'
                    : 'train-crossing-light-right'
                }`}
                style={{
                  backgroundColor: prefersReducedMotion ? '#DC2626' : undefined
                }}
              />
              <div className="w-1 h-2 bg-[#5A4315]" />
            </div>
          </div>
        </div>

        {/* 2. Steel Rails & Train Crossing Track Corridor */}
        <div className="relative w-full h-16 my-2 overflow-hidden rounded-lg bg-[#0E0507] border-y-2 border-[#8A6E2D] flex items-center shadow-inner">
          {/* Wooden Cross-ties (Track Sleepers) */}
          <div className="absolute inset-0 flex justify-between px-1 opacity-75">
            {Array.from({ length: 18 }).map((_, idx) => (
              <div
                key={idx}
                className="w-1.5 h-full bg-[#3D2612] border-x border-[#1C1208]"
              />
            ))}
          </div>

          {/* Two Polished Steel Rail Lines */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-gradient-to-r from-[#8A837A] via-[#E2DED9] to-[#8A837A] shadow" />
          <div className="absolute bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-[#8A837A] via-[#E2DED9] to-[#8A837A] shadow" />

          {/* Moving Victorian Steam Locomotive Crossing the Tracks */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 flex items-center ${
              prefersReducedMotion ? 'left-1/2 -translate-x-1/2' : 'train-crossing-locomotive'
            }`}
          >
            {/* Steam Puffs Drifting from Chimney (stationary if reduced motion) */}
            {!prefersReducedMotion && (
              <div className="relative -mr-2 mb-4 pointer-events-none">
                <span className="steam-puff-1 absolute -top-1 right-0 w-2 h-2 rounded-full bg-stone-200/70 blur-[0.5px]" />
                <span className="steam-puff-2 absolute -top-2 right-2 w-2.5 h-2.5 rounded-full bg-stone-300/60 blur-[0.6px]" />
              </div>
            )}

            {/* Locomotive Silhouette SVG */}
            <svg viewBox="0 0 50 30" className="w-14 h-9 text-[#C5A059] drop-shadow-lg" fill="currentColor">
              {/* Cowcatcher / Pilot */}
              <polygon points="44,25 50,25 44,18" fill="#F3E5AB" />
              {/* Headlamp */}
              <circle cx="43" cy="14" r="2" fill="#FFF4C2" />
              {/* Smokestack */}
              <polygon points="36,12 40,12 38,6 35,6" fill="#F3E5AB" />
              {/* Boiler & Dome */}
              <rect x="18" y="10" width="22" height="12" rx="2" fill="currentColor" />
              <path d="M 28 10 C 28 7 32 7 32 10 Z" fill="#F3E5AB" />
              {/* Cab */}
              <rect x="6" y="6" width="12" height="17" rx="1" fill="currentColor" />
              <rect x="8" y="9" width="5" height="5" rx="0.5" fill="#FAF6EB" />
              {/* Wheels */}
              <circle cx="14" cy="24" r="4" fill="#1C140E" stroke="#F3E5AB" strokeWidth="1" />
              <circle cx="26" cy="24" r="4" fill="#1C140E" stroke="#F3E5AB" strokeWidth="1" />
              <circle cx="38" cy="24" r="3" fill="#1C140E" stroke="#F3E5AB" strokeWidth="1" />
              {/* Side Connecting Rod */}
              <line x1="14" y1="24" x2="26" y2="24" stroke="#F3E5AB" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 3. "Stoking the boiler..." Headline & Punctuality Tagline */}
        <div className="mt-4 mb-3">
          <h2 className="font-serif font-black text-xl sm:text-2xl text-[#F4EEDB] tracking-wider mb-1 flex items-center justify-center gap-2">
            <span>{message}</span>
          </h2>
          <p className="text-xs text-[#C5A059] font-serif italic">
            Long Island Rail Road • Founded 1834 • Every line, right on time
          </p>
        </div>

        {/* 4. Steam Pressure Progress Bar (0 to 140 PSI) */}
        <div className="space-y-1.5 max-w-xs mx-auto">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#C5A059] flex items-center gap-1 font-serif text-[11px]">
              <Gauge className="w-3.5 h-3.5 text-[#C5A059]" />
              Steam Pressure:
            </span>
            <span className="text-[#F3E5AB] font-bold">{psi} / 140 PSI</span>
          </div>

          <div className="w-full h-3 rounded-full bg-[#180A0E] border border-[#8A6E2D] overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8A6E2D] via-[#C5A059] to-[#F3E5AB] transition-all duration-75 shadow-sm"
              style={{ width: `${(psi / 140) * 100}%` }}
            />
          </div>
        </div>

        {/* Skip button for immediate access if needed */}
        {onComplete && (
          <button
            type="button"
            onClick={onComplete}
            className="mt-4 text-[11px] font-serif text-[#C5A059]/80 hover:text-[#F3E5AB] underline transition-colors"
          >
            Board Train Immediately &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
