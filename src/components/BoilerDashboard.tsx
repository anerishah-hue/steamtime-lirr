import React, { useState } from 'react';
import { AvoidanceMetrics, Station } from '../types';
import { Gauge, DollarSign, Clock, Flame, Wind, Info, CheckCircle2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { SteamPressureGauge } from './SteamPressureGauge';
import { QRCodeSVG } from 'qrcode.react';

interface BoilerDashboardProps {
  metrics: AvoidanceMetrics;
  origin: Station;
  destination: Station;
  isHandset?: boolean;
}

export const BoilerDashboard: React.FC<BoilerDashboardProps> = ({
  metrics,
  origin,
  destination,
  isHandset = false
}) => {
  const [showMethodology, setShowMethodology] = useState(false);
  const [copied, setCopied] = useState(false);

  // Needle rotation calculation for the LIE Gridlock pressure gauge (0 - 180 degrees)
  const trafficAngle = Math.min(180, Math.max(0, (metrics.trafficMinutesSaved / 120) * 180));

  const handleCopyBoardingUrl = () => {
    navigator.clipboard.writeText('https://steamtime-lirr.vercel.app');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={`victorian-panel relative shadow-xl ${
      isHandset ? 'p-3' : 'p-4 sm:p-5'
    }`}>
      {/* Corner Brass Rivets on Section Panel */}
      <span className="brass-rivet absolute top-2 left-2" />
      <span className="brass-rivet absolute top-2 right-2" />
      <span className="brass-rivet absolute bottom-2 left-2" />
      <span className="brass-rivet absolute bottom-2 right-2" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 mb-3 border-b-2 border-[#8A6E2D]/50 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#2B1117] border border-[#8A6E2D] text-[#F3E5AB] shrink-0">
            <Gauge className={isHandset ? 'w-4 h-4' : 'w-5 h-5'} />
          </div>
          <div>
            <h2 className={`font-serif font-bold text-[#F4EEDB] tracking-wide flex items-center gap-2 ${
              isHandset ? 'text-sm' : 'text-base sm:text-lg'
            }`}>
              CONGESTION & TOLL DYNAMO
            </h2>
            <p className={`text-[#C5A059]/90 font-serif italic ${isHandset ? 'text-[10px]' : 'text-xs'}`}>
              Tolls, Rush-Hour Delay & Emissions Avoided via LIRR (Estimates)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1F0C10] border border-[#8A6E2D] text-[11px] text-[#EDE4D0] hover:text-[#F3E5AB] transition-all font-serif"
            title="Inspect Data Sources and Estimation Methodology"
          >
            <Info className="w-3 h-3 text-[#C5A059]" />
            <span>Sources</span>
            {showMethodology ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#185244]/40 border border-[#2E8872]/60 text-[10px] font-mono text-[#44BBA4] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E8872] inline-block animate-pulse" />
            <span>140 PSI</span>
          </div>
        </div>
      </div>

      {/* Data Sources & Estimation Methodology Drawer (Estimates Disclosure) */}
      {showMethodology && (
        <div className="mb-3 p-3 rounded-lg bg-[#1A0B0E] border border-[#8A6E2D]/60 text-xs font-sans text-[#EDE4D0] space-y-1.5 animate-in fade-in duration-200 shadow-inner">
          <div className="flex items-center gap-1.5 text-[#F3E5AB] font-serif text-[11px] font-semibold border-b border-[#4E1D27] pb-1">
            <CheckCircle2 className="w-3 h-3 text-[#2E8872]" />
            <span>MTA / NYSDOT / EPA TRAVEL ESTIMATE METHODOLOGY</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] leading-relaxed text-[#C5A059]/80 font-serif">
            <div>
              <strong className="text-[#F4EEDB] block mb-0.5">Pennies kept from the Toll Collector (Estimates):</strong>
              {metrics.methodologyNotes?.tollsBreakdown || 'Estimated from MTA Bridges & Tunnels 2026 E-ZPass schedule + Central Business District Tolling Program.'}
            </div>
            <div>
              <strong className="text-[#F4EEDB] block mb-0.5">Traffic Congestion (Estimates):</strong>
              {metrics.methodologyNotes?.trafficBreakdown || 'Estimated from NYSDOT 511NY corridor speed sensors on I-495 (LIE) measuring peak rush hour crawl.'}
            </div>
            <div>
              <strong className="text-[#F4EEDB] block mb-0.5">Coal Saved / Vehicle Fuel (Estimates):</strong>
              {metrics.methodologyNotes?.fuelBreakdown || 'Estimated from AAA 2026 Driving Costs @ $3.49/gal + Manhattan parking offset.'}
            </div>
            <div>
              <strong className="text-[#F4EEDB] block mb-0.5">Atmospheric Emissions (Estimates):</strong>
              {metrics.methodologyNotes?.carbonBreakdown || 'Estimated from US EPA standard: 0.89 lbs CO2/car-mile vs 0.12 lbs electric rail.'}
            </div>
          </div>
        </div>
      )}

      {/* Locomotive Cab Boiler Pressure Console (0 - 200 PSI Needle Gauge) */}
      <div className="mb-3.5 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#180A0E] via-[#240E14] to-[#180A0E] border-2 border-[#8A6E2D] shadow-[0_2px_12px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(243,229,171,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4 relative">
        <span className="brass-rivet absolute top-1.5 left-1.5 opacity-80" />
        <span className="brass-rivet absolute top-1.5 right-1.5 opacity-80" />
        <span className="brass-rivet absolute bottom-1.5 left-1.5 opacity-80" />
        <span className="brass-rivet absolute bottom-1.5 right-1.5 opacity-80" />

        <div className="flex items-center gap-4">
          <SteamPressureGauge psi={140} size={isHandset ? 100 : 120} />
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#185244]/50 border border-[#2E8872]/60 text-[10px] font-mono text-[#44BBA4] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E8872] inline-block animate-pulse" />
              <span>OPTIMAL OPERATING STEAM</span>
            </div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#F4EEDB]">
              Locomotive Boiler Head
            </h3>
            <p className="text-[11px] text-[#C5A059]/90 font-serif italic max-w-sm leading-relaxed">
              Maintained at a steady 140 PSI operating pressure. Clean electric third-rail energy replaces highway fossil combustion.
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#4E1D27] text-right">
          <span className="text-[10px] font-serif uppercase tracking-wider text-[#C5A059]">Boiler Spec</span>
          <span className="text-xs font-mono text-[#F3E5AB] font-bold">140 / 200 PSI</span>
          <span className="text-[10px] font-serif text-[#C5A059]/80 italic">Brass Bezel No. 1834</span>
        </div>
      </div>

      {/* Grid of Gauges & Indicators - Styled as Cream Parchment Instrument Cards */}
      <div className={`grid gap-2 sm:gap-3 ${
        isHandset ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }`}>
        {/* 1. Toll Counter */}
        <div className={`parchment-card flex flex-col justify-between relative shadow-md ${
          isHandset ? 'p-2.5' : 'p-3.5'
        }`}>
          <span className="brass-rivet absolute top-1 left-1 opacity-70" />
          <span className="brass-rivet absolute top-1 right-1 opacity-70" />
          <span className="brass-rivet absolute bottom-1 left-1 opacity-70" />
          <span className="brass-rivet absolute bottom-1 right-1 opacity-70" />

          <div className="flex items-center justify-between text-xs text-[#48392F] mb-1">
            <span className={`font-bold text-[#1C140E] font-serif flex items-center gap-1 leading-snug ${isHandset ? 'text-[11px]' : 'text-xs'}`}>
              <DollarSign className="w-3.5 h-3.5 text-[#8A6E2D] shrink-0" />
              Pennies kept from the Toll Collector
            </span>
            <span className="text-[9px] text-[#6B5749] font-serif uppercase tracking-wider shrink-0">ESTIMATE</span>
          </div>

          <div className="my-1 py-1 px-2 rounded bg-[#180A0E] border border-[#8A6E2D] flex items-center justify-center shadow-inner">
            <div className="flex items-baseline gap-0.5 font-mono">
              <span className="text-[#C5A059] text-sm font-bold">$</span>
              <span className={`font-black text-[#F3E5AB] tracking-wider ${
                isHandset ? 'text-lg' : 'text-2xl sm:text-3xl'
              }`}>
                {metrics.tollsSaved.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-[#48392F] font-sans leading-tight mt-0.5 line-clamp-2">
            {metrics.tollsSaved > 0 ? 'Queens-Midtown & Manhattan toll gates spared.' : 'Intra-Island: No highway tolls required.'}
          </p>
          <span className="text-[8px] font-serif text-[#7A5B1E] italic mt-1 block">
            Source: MTA Bridges & Tunnels 2026 E-ZPass Rates
          </span>
        </div>

        {/* 2. L.I.E. Gridlock Pressure Gauge */}
        <div className={`parchment-card flex flex-col items-center justify-between relative shadow-md ${
          isHandset ? 'p-2.5' : 'p-3.5'
        }`}>
          <span className="brass-rivet absolute top-1 left-1 opacity-70" />
          <span className="brass-rivet absolute top-1 right-1 opacity-70" />
          <span className="brass-rivet absolute bottom-1 left-1 opacity-70" />
          <span className="brass-rivet absolute bottom-1 right-1 opacity-70" />

          <div className="w-full flex items-center justify-between text-xs text-[#48392F] mb-0.5">
            <span className={`font-bold text-[#1C140E] font-serif flex items-center gap-1 ${isHandset ? 'text-[11px]' : 'text-xs'}`}>
              <Clock className="w-3.5 h-3.5 text-[#8A1A24]" />
              L.I.E. DELAY
            </span>
            <span className="text-[9px] text-[#6B5749] font-serif uppercase tracking-wider">ESTIMATE</span>
          </div>

          {/* Scaled Semi-Circle Gauge */}
          <div className={`relative flex items-end justify-center overflow-hidden my-1 ${
            isHandset ? 'w-20 h-10' : 'w-26 h-13'
          }`}>
            <div className={`rounded-full border-2 border-[#8A6E2D] bg-gradient-to-t from-[#1F0C10] to-[#0A0507] relative shadow-inner ${
              isHandset ? 'w-20 h-20' : 'w-26 h-26'
            }`}>
              {/* Dial tick marks */}
              <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[7px] font-mono text-[#F4EEDB]">
                <span>0m</span>
                <span className="text-[#C5A059]">60m</span>
                <span className="text-[#D65D65]">120m</span>
              </div>
              {/* Needle */}
              <div
                className={`absolute bottom-1/2 left-1/2 w-0.5 bg-[#DC2626] origin-bottom transition-transform duration-700 ease-out shadow-sm ${
                  isHandset ? 'h-8' : 'h-11'
                }`}
                style={{
                  transform: `translateX(-50%) rotate(${trafficAngle - 90}deg)`
                }}
              />
              <div className="absolute bottom-1/2 left-1/2 w-2 h-2 rounded-full bg-[#C5A059] -translate-x-1/2 translate-y-1/2 border border-[#1C140E]" />
            </div>
          </div>

          <div className="text-center">
            <span className={`font-mono font-bold text-[#1C140E] ${isHandset ? 'text-sm' : 'text-lg'}`}>
              {metrics.trafficMinutesSaved} mins
            </span>
            <p className="text-[9px] text-[#48392F] font-sans">
              Expressway gridlock saved (Estimated)
            </p>
            <span className="text-[8px] font-serif text-[#7A5B1E] italic mt-0.5 block">
              Source: NYSDOT 511NY Speed Telemetry
            </span>
          </div>
        </div>

        {/* 3. Fuel & Vehicle Wear / Coal Saved */}
        <div className={`parchment-card flex flex-col justify-between relative shadow-md ${
          isHandset ? 'p-2.5' : 'p-3.5'
        }`}>
          <span className="brass-rivet absolute top-1 left-1 opacity-70" />
          <span className="brass-rivet absolute top-1 right-1 opacity-70" />
          <span className="brass-rivet absolute bottom-1 left-1 opacity-70" />
          <span className="brass-rivet absolute bottom-1 right-1 opacity-70" />

          <div className="flex items-center justify-between text-xs text-[#48392F] mb-1">
            <span className={`font-bold text-[#1C140E] font-serif flex items-center gap-1 ${isHandset ? 'text-[11px]' : 'text-xs'}`}>
              <Flame className="w-3.5 h-3.5 text-[#B5942F]" />
              Coal saved
            </span>
            <span className="text-[9px] text-[#6B5749] font-serif uppercase tracking-wider">ESTIMATE</span>
          </div>

          <div className="my-1 py-1 px-2 rounded bg-[#180A0E] border border-[#8A6E2D] flex items-center justify-center shadow-inner">
            <div className="flex items-baseline gap-0.5 font-mono">
              <span className="text-[#C5A059] text-sm font-bold">$</span>
              <span className={`font-black text-[#F3E5AB] tracking-wider ${
                isHandset ? 'text-lg' : 'text-2xl sm:text-3xl'
              }`}>
                {metrics.fuelSaved.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-[#48392F] font-sans leading-tight mt-0.5 line-clamp-2">
            Fuel gallons and parking meter fees saved in coal economy.
          </p>
          <span className="text-[8px] font-serif text-[#7A5B1E] italic mt-1 block">
            Source: AAA 2026 Driving Costs Benchmark
          </span>
        </div>

        {/* 4. Atmospheric Steam vs. Smog Meter */}
        <div className={`parchment-card flex flex-col items-center justify-between relative shadow-md ${
          isHandset ? 'p-2.5' : 'p-3.5'
        }`}>
          <span className="brass-rivet absolute top-1 left-1 opacity-70" />
          <span className="brass-rivet absolute top-1 right-1 opacity-70" />
          <span className="brass-rivet absolute bottom-1 left-1 opacity-70" />
          <span className="brass-rivet absolute bottom-1 right-1 opacity-70" />

          <div className="w-full flex items-center justify-between text-xs text-[#48392F] mb-0.5">
            <span className={`font-bold text-[#1C140E] font-serif flex items-center gap-1 ${isHandset ? 'text-[11px]' : 'text-xs'}`}>
              <Wind className="w-3.5 h-3.5 text-[#2E8872]" />
              CO₂ KEPT
            </span>
            <span className="text-[9px] text-[#6B5749] font-serif uppercase tracking-wider">ESTIMATE</span>
          </div>

          <div className="w-full my-1 flex items-center justify-center gap-2">
            <div className="flex flex-col items-center">
              <span className={`font-black font-mono text-[#185244] ${isHandset ? 'text-base' : 'text-xl'}`}>
                {metrics.carbonLbsSaved}
              </span>
              <span className="text-[8px] uppercase font-serif text-[#6B5749] font-semibold">lbs CO₂</span>
            </div>
            <div className="h-6 w-px bg-[#D8CCA8]" />
            <div className="flex flex-col items-center">
              <span className={`font-black font-mono text-[#8A6E2D] ${isHandset ? 'text-base' : 'text-xl'}`}>
                {metrics.steamUnits}
              </span>
              <span className="text-[8px] uppercase font-serif text-[#6B5749] font-semibold">Steam Units</span>
            </div>
          </div>

          <p className="text-[9px] text-[#48392F] font-sans text-center leading-tight">
            Clean third-rail power vs automobile smog (Estimated).
          </p>
          <span className="text-[8px] font-serif text-[#7A5B1E] italic mt-0.5 block">
            Source: US EPA Light-Duty Vehicle Model
          </span>
        </div>
      </div>

      {/* Victorian Brass Plaque: "Scan to board" QR Code */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-b from-[#2B161B] via-[#1F0C10] to-[#14080A] border-2 border-[#C5A059] shadow-[0_4px_16px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(243,229,171,0.3)] relative text-center">
        <span className="brass-rivet absolute top-2 left-2" />
        <span className="brass-rivet absolute top-2 right-2" />
        <span className="brass-rivet absolute bottom-2 left-2" />
        <span className="brass-rivet absolute bottom-2 right-2" />

        {/* Engraved Plaque Header */}
        <div className="inline-block px-4 py-1 rounded bg-gradient-to-r from-[#8A6E2D] via-[#C5A059] to-[#8A6E2D] text-[#1C140E] border border-[#F3E5AB] shadow-md mb-2">
          <h3 className="font-serif font-black tracking-widest text-sm uppercase">
            Scan to board
          </h3>
        </div>

        <p className="text-[11px] text-[#C5A059]/90 font-serif italic mb-3">
          Board via mobile handset • Official BrassLine Live Timetable & Dispatch
        </p>

        {/* Crisp QR Code with Pure White Quiet Zone */}
        <div className="inline-block p-3 rounded-lg bg-white shadow-2xl border-2 border-[#8A6E2D]">
          <QRCodeSVG
            value="https://steamtime-lirr.vercel.app"
            size={isHandset ? 150 : 175}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#000000"
            includeMargin={true}
          />
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] text-[#F3E5AB] bg-[#12080B] px-2.5 py-1 rounded border border-[#8A6E2D]/60">
            https://steamtime-lirr.vercel.app
          </span>
          <button
            type="button"
            onClick={handleCopyBoardingUrl}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2B1117] hover:bg-[#3A1720] border border-[#8A6E2D] text-[#F3E5AB] text-[11px] font-serif transition-all active:scale-95"
            title="Copy URL to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-[#2E8872]" /> : <Copy className="w-3 h-3 text-[#C5A059]" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Route context note */}
      <div className="mt-3 pt-2 border-t-2 border-[#8A6E2D]/40 flex flex-wrap items-center justify-between text-[11px] text-[#C5A059]/90 font-serif gap-1">
        <span>
          <strong className="text-[#F4EEDB]">{origin.name}</strong> to{' '}
          <strong className="text-[#F4EEDB]">{destination.name}</strong>
        </span>
        <span className="text-[9px] text-[#8A6E2D] uppercase tracking-wider font-semibold">
          COMMUTER TRAVEL ESTIMATES
        </span>
      </div>
    </section>
  );
};
