import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, Monitor, User, Volume2, VolumeX } from 'lucide-react';
import { CommuterAccount } from '../types';
import { useVoiceContext } from '../context/VoiceContext';
import { playChooChoo, getOrCreateAudioContext, isSoundEnabled } from '../utils/audioWhistle';

interface HeaderProps {
  profile: CommuterAccount | null;
  onOpenProfile: () => void;
  onOpenQR: () => void;
  onGoHome: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenProfile,
  onOpenQR,
  onGoHome,
  isMobileFrame,
  onToggleFrame
}) => {
  const { soundEnabled, toggleSound } = useVoiceContext();
  const [clockDate, setClockDate] = useState<Date>(new Date());

  useEffect(() => {
    const updateTime = () => setClockDate(new Date());
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeString = clockDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Calculate analog clock hand angles
  const sec = clockDate.getSeconds();
  const min = clockDate.getMinutes() + sec / 60;
  const hr = (clockDate.getHours() % 12) + min / 60;
  const secAngle = sec * 6;
  const minAngle = min * 6;
  const hourAngle = hr * 30;

  const handleLogoClick = () => {
    // Clicking the logo plays the steam train sound from /choochoo.mp3 (if sound is on)
    if (isSoundEnabled()) {
      getOrCreateAudioContext();
      playChooChoo({ withWhistle: true });
    }
    onGoHome();
  };

  return (
    <header className="border-b-2 border-[#8A6E2D]/70 bg-gradient-to-r from-[#14080B] via-[#1F0C10] to-[#14080B] text-[#EDE4D0] px-3 sm:px-6 py-2.5 relative shadow-lg">
      {/* Corner Brass Rivets on Header Bar */}
      <span className="brass-rivet absolute top-1.5 left-2 hidden sm:block" />
      <span className="brass-rivet absolute top-1.5 right-2 hidden sm:block" />

      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Clickable Steam Locomotive Logo with Animated Steam Puffs */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 sm:gap-3 text-left group transition-all cursor-pointer"
          title="BrassLine — Click to sound train whistle & return home"
          aria-label="BrassLine logo. Click to sound train whistle and return home."
        >
          {/* Steam Locomotive Badge with Chimney Steam Puffs */}
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#2B1117] via-[#180A0D] to-[#0A0507] border-2 border-[#C5A059] shadow-[0_2px_8px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(243,229,171,0.4)] group-hover:border-[#F3E5AB] transition-colors shrink-0">
            {/* Drifting Steam Puffs from Smokestack (Disabled with prefers-reduced-motion) */}
            <div className="absolute -top-3.5 left-2 pointer-events-none z-20">
              <span className="steam-puff-1 absolute -top-1 left-0 w-2.5 h-2.5 rounded-full bg-stone-200/75 blur-[0.6px]" />
              <span className="steam-puff-2 absolute -top-2 -left-1 w-3 h-3 rounded-full bg-stone-300/60 blur-[0.8px]" />
              <span className="steam-puff-3 absolute -top-3 left-0.5 w-3.5 h-3.5 rounded-full bg-stone-100/50 blur-[1px]" />
            </div>

            {/* Victorian Steam Locomotive Inline SVG */}
            <svg
              viewBox="0 0 40 40"
              className="w-7 h-7 text-[#C5A059] group-hover:text-[#F3E5AB] transition-colors drop-shadow"
              fill="currentColor"
              aria-label="Steam Locomotive"
            >
              {/* Smokestack Chimney */}
              <path d="M10 13 L14 13 L15 7 L9 7 Z" fill="url(#locoBrassGrad)" />
              {/* Smokebox & Boiler */}
              <rect x="8" y="14" width="18" height="12" rx="2" fill="currentColor" />
              {/* Boiler Brass Bands */}
              <line x1="14" y1="14" x2="14" y2="26" stroke="#F3E5AB" strokeWidth="1" />
              <line x1="20" y1="14" x2="20" y2="26" stroke="#F3E5AB" strokeWidth="1" />
              {/* Brass Steam Dome */}
              <path d="M19 14 C19 10 23 10 23 14 Z" fill="url(#locoBrassGrad)" />
              {/* Cab */}
              <rect x="25" y="9" width="11" height="17" rx="1.5" fill="currentColor" />
              {/* Cab Window */}
              <rect x="27" y="12" width="7" height="6" rx="1" fill="#F4EEDB" />
              <line x1="30.5" y1="12" x2="30.5" y2="18" stroke="#1C140E" strokeWidth="0.8" />
              {/* Cowcatcher / Pilot */}
              <polygon points="5,28 8,24 8,28" fill="url(#locoBrassGrad)" />
              {/* Headlamp */}
              <circle cx="6" cy="19" r="2" fill="#F3E5AB" />
              {/* Front Small Wheel */}
              <circle cx="10" cy="29" r="3.5" fill="#1C140E" stroke="#C5A059" strokeWidth="1" />
              <circle cx="10" cy="29" r="1" fill="#C5A059" />
              {/* Driving Wheels */}
              <circle cx="18" cy="28.5" r="4.5" fill="#1C140E" stroke="#C5A059" strokeWidth="1.2" />
              <circle cx="18" cy="28.5" r="1.5" fill="#F3E5AB" />
              <circle cx="28" cy="28.5" r="4.5" fill="#1C140E" stroke="#C5A059" strokeWidth="1.2" />
              <circle cx="28" cy="28.5" r="1.5" fill="#F3E5AB" />
              {/* Side Connecting Rod */}
              <line x1="18" y1="28.5" x2="28" y2="28.5" stroke="#F3E5AB" strokeWidth="1.4" strokeLinecap="round" />
              
              <defs>
                <linearGradient id="locoBrassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F3E5AB" />
                  <stop offset="50%" stopColor="#C5A059" />
                  <stop offset="100%" stopColor="#8A6E2D" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-black tracking-wider text-base sm:text-xl text-[#F4EEDB] group-hover:text-[#F3E5AB] transition-colors drop-shadow-sm">
                BRASSLINE
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#C5A059]/15 text-[#F3E5AB] border border-[#8A6E2D]">
                SBU '26
              </span>
            </div>
            <p className="text-[11px] text-[#C5A059]/90 font-serif italic tracking-wide">
              Every line, right on time
            </p>
          </div>
        </button>

        {/* Victorian Brass Station Clock with Roman Numerals (Hidden on mobile handsets) */}
        {!isMobileFrame && (
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#180A0E] via-[#240E14] to-[#180A0E] border-2 border-[#8A6E2D] shadow-[0_2px_10px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(243,229,171,0.2)]">
            {/* Analog Brass Station Clock with Roman Numerals */}
            <div className="relative w-8 h-8 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.8)] shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="stationClockBezel" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F3E5AB" />
                    <stop offset="45%" stopColor="#C5A059" />
                    <stop offset="100%" stopColor="#6E541E" />
                  </linearGradient>
                  <radialGradient id="stationClockDial" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FAF6EB" />
                    <stop offset="85%" stopColor="#EFE7D2" />
                    <stop offset="100%" stopColor="#DDD2B5" />
                  </radialGradient>
                </defs>
                {/* Brass Rim */}
                <circle cx="50" cy="50" r="48" fill="url(#stationClockBezel)" stroke="#3D290F" strokeWidth="1.5" />
                {/* Parchment Dial Face */}
                <circle cx="50" cy="50" r="41" fill="url(#stationClockDial)" stroke="#8A6E2D" strokeWidth="1" />
                
                {/* Roman Numerals: XII, III, VI, IX */}
                <text x="50" y="21" textAnchor="middle" fontSize="12" fontWeight="bold" fontFamily="'IM Fell English', serif" fill="#1C140E">
                  XII
                </text>
                <text x="83" y="54" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="'IM Fell English', serif" fill="#1C140E">
                  III
                </text>
                <text x="50" y="85" textAnchor="middle" fontSize="12" fontWeight="bold" fontFamily="'IM Fell English', serif" fill="#1C140E">
                  VI
                </text>
                <text x="17" y="54" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="'IM Fell English', serif" fill="#1C140E">
                  IX
                </text>

                {/* Additional Hour Dots */}
                {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
                  <circle
                    key={deg}
                    cx="50"
                    cy="16"
                    r="1.8"
                    fill="#48392F"
                    transform={`rotate(${deg} 50 50)`}
                  />
                ))}

                {/* Hour Hand */}
                <line
                  x1="50"
                  y1="50"
                  x2="50"
                  y2="26"
                  stroke="#1C140E"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  transform={`rotate(${hourAngle} 50 50)`}
                />
                {/* Minute Hand */}
                <line
                  x1="50"
                  y1="50"
                  x2="50"
                  y2="16"
                  stroke="#1C140E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  transform={`rotate(${minAngle} 50 50)`}
                />
                {/* Second Hand in Verdigris */}
                <line
                  x1="50"
                  y1="56"
                  x2="50"
                  y2="14"
                  stroke="#2E8872"
                  strokeWidth="1"
                  strokeLinecap="round"
                  transform={`rotate(${secAngle} 50 50)`}
                />
                {/* Central Brass Cap */}
                <circle cx="50" cy="50" r="3" fill="#C5A059" stroke="#1C140E" strokeWidth="0.8" />
              </svg>
            </div>

            {/* Time Readout (Monospace exclusively for time and numbers) */}
            <div className="flex items-center gap-2 font-mono text-xs text-[#F3E5AB]">
              <span className="tracking-widest font-bold">{timeString}</span>
              <span className="text-[10px] font-serif text-[#C5A059]/80 border-l border-[#8A6E2D]/60 pl-2 uppercase tracking-wider">
                PORT JEFF LINE
              </span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Global Locomotive Sound & Voice Toggle (Off by default, saved in localStorage) */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Disable locomotive audio effects and speech' : 'Enable locomotive audio effects and speech'}
            aria-pressed={soundEnabled}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all active:scale-95 shadow-sm text-xs font-serif ${
              soundEnabled
                ? 'bg-gradient-to-r from-[#185244] to-[#2E8872] border-[#3A9B83] text-[#F8F4E8] shadow-[0_0_8px_rgba(46,136,114,0.35)]'
                : 'bg-[#2B1117] hover:bg-[#38161E] border-[#8A6E2D]/60 text-[#C5A059] hover:text-[#F3E5AB]'
            }`}
            title={soundEnabled ? 'Sound is ON (Whistle, chuff, and speech active)' : 'Sound is OFF (Whistle, chuff, and speech muted)'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#F3E5AB]" />
                <span className="hidden sm:inline">Sound: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#8A6E2D]" />
                <span className="hidden sm:inline">Sound: OFF</span>
              </>
            )}
          </button>

          {/* Account Profile Tab Button */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2B1117] hover:bg-[#38161E] border border-[#8A6E2D] hover:border-[#C5A059] text-xs text-[#F4EEDB] transition-all active:scale-95 shadow-sm"
            title="Open Commuter Account Page"
          >
            <User className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="font-serif">{profile ? profile.name.split(' ')[0] : 'Account'}</span>
            {profile && profile.role === 'senior' && (
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2E8872]/20 text-[#44BBA4] border border-[#2E8872]/40"
                title="Official MTA Reduced Fare: Senior 65+ / Disability / Medicare (50% Off peak/off-peak, not valid weekday AM peak)"
              >
                Senior (50%)
              </span>
            )}
            {profile && profile.role === 'child' && (
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2E8872]/20 text-[#44BBA4] border border-[#2E8872]/40"
                title="Official MTA Child Policy: Children under 5 ride free with paying adult"
              >
                Child (Free)
              </span>
            )}
          </button>

          {/* QR Code Button for Phone Access */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onOpenQR();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#B5942F] to-[#C5A059] hover:from-[#C5A059] hover:to-[#F3E5AB] text-[#1C140E] font-bold text-xs transition-all active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-[#F3E5AB]/40"
            title="Scan QR Code to open on your phone"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-serif">Phone View</span>
          </button>

          {/* Handset Frame Toggle for desktop presentation */}
          <button
            type="button"
            onClick={onToggleFrame}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#180A0D] border border-[#4E1D27] hover:border-[#8A6E2D] text-xs text-[#C5A059]/80 hover:text-[#F3E5AB] transition-all"
            title={isMobileFrame ? 'Expand to Full View' : 'Simulate Phone Handset View'}
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px] font-serif">Full</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px] font-serif">Handset</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
