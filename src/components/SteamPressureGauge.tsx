import React, { useState, useEffect, useRef, useId } from 'react';
import { useVoiceContext, VoiceState } from '../context/VoiceContext';

interface SteamPressureGaugeProps {
  psi?: number;
  size?: number;
  className?: string;
  showLabel?: boolean;
  voiceStateOverride?: VoiceState;
}

/**
 * Authentic Victorian Locomotive Boiler Steam Pressure Gauge (0 - 200 PSI).
 * Features:
 * - 240-degree dial arc from 150 deg (bottom left) to 390 deg (bottom right).
 * - Live needle jitter (+/- 3 to 6 deg every 60-100ms) when voiceState === 'listening', easing smoothly back when idle.
 * - Gentle rhythmic wobble when voiceState === 'speaking'.
 * - Full prefers-reduced-motion support (replaces needle jitter with a subtle amber/golden glow).
 * - Reusable compact mini gauge (via size prop) for header placement with no duplicated logic.
 */
export const SteamPressureGauge: React.FC<SteamPressureGaugeProps> = ({
  psi = 140,
  size = 140,
  className = '',
  showLabel,
  voiceStateOverride
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');

  const { voiceState: contextVoiceState } = useVoiceContext();
  const voiceState = voiceStateOverride || contextVoiceState;

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
  });

  const [jitterOffset, setJitterOffset] = useState<number>(0);
  const wobbleStepRef = useRef<number>(0);

  // Check prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  // Needle gentle idle wobble & active voiceState jitter
  useEffect(() => {
    if (prefersReducedMotion) {
      setJitterOffset(0);
      return;
    }

    if (voiceState === 'listening') {
      // Active jitter around current value (+/- 3 to 6 degrees every 75ms)
      const interval = setInterval(() => {
        const sign = Math.random() > 0.5 ? 1 : -1;
        const deg = (3 + Math.random() * 3) * sign;
        setJitterOffset(deg);
      }, 75);

      return () => clearInterval(interval);
    }

    if (voiceState === 'speaking') {
      // Rhythmic speech wobble (+/- 1.8 to 2.2 degrees)
      const interval = setInterval(() => {
        wobbleStepRef.current += 0.35;
        const wobble = Math.sin(wobbleStepRef.current) * 2.0;
        setJitterOffset(wobble);
      }, 65);

      return () => clearInterval(interval);
    }

    // Idle state: gentle mechanical boiler steam wobble (+/- 0.8 to 1.2 deg)
    const idleInterval = setInterval(() => {
      wobbleStepRef.current += 0.12;
      const gentleWobble = Math.sin(wobbleStepRef.current) * 1.1;
      setJitterOffset(gentleWobble);
    }, 85);

    return () => clearInterval(idleInterval);
  }, [voiceState, prefersReducedMotion]);

  const clampedPsi = Math.max(0, Math.min(200, psi));

  // 240-degree dial arc: starts at 150 deg (bottom left), sweeps to 390 deg (bottom right)
  const startAngle = 150;
  const sweepAngle = 240;
  const baseNeedleAngle = startAngle + (clampedPsi / 200) * sweepAngle;
  const currentNeedleAngle = baseNeedleAngle + jitterOffset;

  const cx = 70;
  const cy = 70;
  const radius = 54;

  // Major ticks every 50 PSI: 0, 50, 100, 150, 200
  const majorTicks = [0, 50, 100, 150, 200];

  // Minor ticks every 10 PSI
  const minorTicks = [
    10, 20, 30, 40,
    60, 70, 80, 90,
    110, 120, 130, 140,
    160, 170, 180, 190
  ];

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Warning zone: 160 - 200 PSI
  const warningArc = describeArc(cx, cy, 47, startAngle + (160 / 200) * sweepAngle, startAngle + sweepAngle);
  // Optimal operating zone: 120 - 150 PSI
  const optimalArc = describeArc(cx, cy, 47, startAngle + (120 / 200) * sweepAngle, startAngle + (150 / 200) * sweepAngle);

  // 8 rivets positioned symmetrically around outer brass bezel
  const rivets = [0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
    return polarToCartesian(cx, cy, 64, angle);
  });

  // Display label if explicitly requested or if gauge is large enough (>= 80px)
  const shouldRenderLabel = showLabel !== undefined ? showLabel : size >= 80;

  // Transition: snappy for live jitter/wobble, smooth and easing when returning to idle
  const needleTransition =
    voiceState === 'listening'
      ? 'transform 0.08s ease-in-out'
      : voiceState === 'speaking'
      ? 'transform 0.07s ease-out'
      : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';

  // Glow filter styling for reduced motion mode
  const glowStyle =
    prefersReducedMotion && (voiceState === 'listening' || voiceState === 'speaking')
      ? { filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.8))' }
      : {};

  return (
    <div
      className={`inline-flex flex-col items-center select-none ${className}`}
      title={
        voiceState !== 'idle'
          ? `Boiler Steam Pressure: ${clampedPsi} PSI (${voiceState})`
          : `Boiler Steam Pressure: ${clampedPsi} PSI`
      }
    >
      <svg
        viewBox="0 0 140 140"
        width={size}
        height={size}
        className="block drop-shadow-md transition-all"
        style={glowStyle}
        role="img"
        aria-label={`Boiler steam pressure gauge reading ${clampedPsi} PSI, state: ${voiceState}`}
      >
        <defs>
          {/* Metallic Brass Bezel Gradient */}
          <radialGradient id={`brassOuterBezel_${uid}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#8A6E18" />
            <stop offset="100%" stopColor="#4A3B0D" />
          </radialGradient>

          {/* Steampunk Dark Parchment Dial Face */}
          <radialGradient id={`gaugeDialFace_${uid}`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#1C1813" />
            <stop offset="75%" stopColor="#12100D" />
            <stop offset="100%" stopColor="#080705" />
          </radialGradient>

          {/* Inner Inset Shadow */}
          <radialGradient id={`innerShade_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
          </radialGradient>

          {/* Center Brass Cap */}
          <radialGradient id={`centerBrassCap_${uid}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF4C2" />
            <stop offset="45%" stopColor="#E5C158" />
            <stop offset="85%" stopColor="#8F7118" />
            <stop offset="100%" stopColor="#3B2E07" />
          </radialGradient>

          {/* Needle Drop Shadow */}
          <filter id={`needleShadow_${uid}`} x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="1" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.7" />
          </filter>

          {/* Convex Glass Glare Reflection Gradient */}
          <linearGradient id={`gaugeGlassGlare_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id={`gaugeBottomGlare_${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* 1. Outer Brass Bezel Rim */}
        <circle cx={cx} cy={cy} r="68" fill={`url(#brassOuterBezel_${uid})`} stroke="#2D2307" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="61" fill="#14110C" stroke="#755E16" strokeWidth="1" />

        {/* 2. Rivets / Brass Studs */}
        {rivets.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="2" fill="#544310" />
            <circle cx={pt.x} cy={pt.y} r="1.4" fill="#FCE588" />
            <circle cx={pt.x - 0.3} cy={pt.y - 0.3} r="0.6" fill="#FFF9DF" />
          </g>
        ))}

        {/* 3. Inner Bevel Ring */}
        <circle cx={cx} cy={cy} r="57" fill={`url(#brassOuterBezel_${uid})`} />
        <circle cx={cx} cy={cy} r="54" fill="#2E240B" />

        {/* 4. Dial Face */}
        <circle cx={cx} cy={cy} r={radius} fill={`url(#gaugeDialFace_${uid})`} />
        <circle cx={cx} cy={cy} r={radius} fill={`url(#innerShade_${uid})`} />

        {/* 5. Colored Operational Arcs */}
        {/* Optimal Green Zone (120 - 150 PSI) */}
        <path d={optimalArc} fill="none" stroke="#10B981" strokeWidth="2.5" opacity="0.85" strokeLinecap="round" />
        {/* Red Danger Zone (160 - 200 PSI) */}
        <path d={warningArc} fill="none" stroke="#EF4444" strokeWidth="2.5" opacity="0.9" strokeLinecap="round" />

        {/* 6. Major Ticks and Labels */}
        {majorTicks.map((val) => {
          const angle = startAngle + (val / 200) * sweepAngle;
          const outerPt = polarToCartesian(cx, cy, 51, angle);
          const innerPt = polarToCartesian(cx, cy, 43, angle);
          const textPt = polarToCartesian(cx, cy, 34, angle);

          return (
            <g key={val}>
              <line
                x1={innerPt.x}
                y1={innerPt.y}
                x2={outerPt.x}
                y2={outerPt.y}
                stroke={val >= 160 ? '#F87171' : '#E6C673'}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <text
                x={textPt.x}
                y={textPt.y + 2.5}
                textAnchor="middle"
                fill={val >= 160 ? '#FCA5A5' : '#D1C4A5'}
                fontSize="7"
                fontFamily="'Share Tech Mono', monospace"
                fontWeight="bold"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* 7. Minor Ticks */}
        {minorTicks.map((val) => {
          const angle = startAngle + (val / 200) * sweepAngle;
          const outerPt = polarToCartesian(cx, cy, 50, angle);
          const innerPt = polarToCartesian(cx, cy, 46, angle);

          return (
            <line
              key={val}
              x1={innerPt.x}
              y1={innerPt.y}
              x2={outerPt.x}
              y2={outerPt.y}
              stroke={val >= 160 ? '#EF4444' : '#8A7753'}
              strokeWidth="0.75"
              opacity="0.8"
            />
          );
        })}

        {/* 8. Gauge Legend & Markings */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fill="#C5A059"
          fontSize="6"
          fontFamily="'Cinzel', serif"
          fontWeight="bold"
          letterSpacing="0.08em"
        >
          STEAM BOILER
        </text>

        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fill="#E6C673"
          fontSize="9"
          fontFamily="'Share Tech Mono', monospace"
          fontWeight="bold"
        >
          {clampedPsi} <tspan fontSize="6" fill="#A8946E">PSI</tspan>
        </text>

        <text
          x={cx}
          y={cy + 25}
          textAnchor="middle"
          fill="#8A7753"
          fontSize="4.5"
          fontFamily="'IM Fell English', serif"
          letterSpacing="0.05em"
        >
          BRASSLINE DYNAMO
        </text>

        {/* 9. Needle (Rotated Around Center Pivot with Live Jitter / Wobble) */}
        <g
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotate(${currentNeedleAngle}deg)`,
            transition: needleTransition
          }}
          filter={`url(#needleShadow_${uid})`}
        >
          {/* Counterweight Tail */}
          <polygon
            points={`${cx - 2},${cy + 12} ${cx + 2},${cy + 12} ${cx},${cy + 16}`}
            fill="#8A6E18"
          />
          <line
            x1={cx}
            y1={cy + 12}
            x2={cx}
            y2={cy - 44}
            stroke="#B91C1C"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Needle Arrow Tip */}
          <polygon
            points={`${cx - 2},${cy - 38} ${cx + 2},${cy - 38} ${cx},${cy - 46}`}
            fill="#EF4444"
          />
          {/* Needle Center Highlight */}
          <line
            x1={cx}
            y1={cy - 8}
            x2={cx}
            y2={cy - 42}
            stroke="#FCA5A5"
            strokeWidth="0.6"
            strokeLinecap="round"
          />
        </g>

        {/* 10. Center Brass Cap & Screw */}
        <circle cx={cx} cy={cy} r="6.5" fill={`url(#centerBrassCap_${uid})`} stroke="#3D2E0A" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r="4" fill="#695315" />
        <circle cx={cx} cy={cy} r="2.5" fill={`url(#centerBrassCap_${uid})`} />
        {/* Bolt groove */}
        <line x1={cx - 1.5} y1={cy} x2={cx + 1.5} y2={cy} stroke="#2E240A" strokeWidth="0.6" />

        {/* 11. Convex Watch-Crystal Glass Glare Overlay */}
        <path
          d={`M ${cx - 43},${cy - 8} A 48,48 0 0,1 ${cx + 43},${cy - 8} A 48,36 0 0,0 ${cx - 43},${cy - 8} Z`}
          fill={`url(#gaugeGlassGlare_${uid})`}
          pointerEvents="none"
        />
        <path
          d={`M ${cx - 32},${cy + 34} A 48,48 0 0,0 ${cx + 32},${cy + 34} A 48,44 0 0,1 ${cx - 32},${cy + 34} Z`}
          fill={`url(#gaugeBottomGlare_${uid})`}
          pointerEvents="none"
        />
      </svg>

      {shouldRenderLabel && (
        <div className="text-[10px] font-mono text-amber-300 font-semibold tracking-wider mt-1 text-center">
          BOILER PRESSURE: {clampedPsi} PSI
        </div>
      )}
    </div>
  );
};
