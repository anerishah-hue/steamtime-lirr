import React, { useState } from 'react';
import { TrainDeparture, Station } from '../types';
import { SystemMap } from './SystemMap';
import {
  Train,
  ArrowLeft,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  Radio,
  VolumeX,
  Accessibility,
  MessageSquareQuote,
  Sparkles,
  Flag
} from 'lucide-react';

interface ActiveTripViewProps {
  train: TrainDeparture;
  origin: Station;
  destination: Station;
  stations: Station[];
  onExitTrip: () => void;
  onAskConductor: (query: string) => void;
}

export const ActiveTripView: React.FC<ActiveTripViewProps> = ({
  train,
  origin,
  destination,
  stations,
  onExitTrip,
  onAskConductor
}) => {
  const [showFullStops, setShowFullStops] = useState(false);

  // Calculate stops breakdown
  const stops = train.stopsList || [];
  const originIndex = stops.findIndex((s) => s.isUserOrigin);
  const destIndex = stops.findIndex((s) => s.isUserDestination);

  const priorStopsCount = originIndex !== -1 ? originIndex : 0;
  const ridingStopsCount =
    originIndex !== -1 && destIndex !== -1 && destIndex > originIndex
      ? destIndex - originIndex
      : Math.max(1, stops.length - 1);

  // Best cars for seating
  const bestCar = train.carCrowding
    ? [...train.carCrowding].sort((a, b) => a.fullnessPercent - b.fullnessPercent)[0]
    : null;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Active Trip Header Bar */}
      <div className="victorian-panel p-4 sm:p-5 relative shadow-xl overflow-hidden">
        <span className="brass-rivet absolute top-2 left-2" />
        <span className="brass-rivet absolute top-2 right-2" />
        <span className="brass-rivet absolute bottom-2 left-2" />
        <span className="brass-rivet absolute bottom-2 right-2" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#8A6E2D]/50">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitTrip}
              className="p-2 rounded-lg bg-[#2B1117] border border-[#8A6E2D] hover:border-[#F3E5AB] text-[#C5A059] hover:text-[#F3E5AB] transition-all shrink-0 shadow-sm"
              title="Return to Schedule Timetable"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#185244]/50 border border-[#2E8872]/60 text-[10px] font-mono text-[#44BBA4] shadow-sm">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-[#2E8872]" />
                  LIVE RUN ACTIVE
                </span>
                <span className="font-mono text-xs text-[#F3E5AB] font-bold">
                  Train #{train.trainNumber}
                </span>
                {train.track && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#2B1117] border border-[#8A6E2D]/60 text-[#EDE4D0]">
                    {train.track}
                  </span>
                )}
              </div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-[#F4EEDB] mt-0.5">
                {origin.name} → {destination.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="px-3 py-1.5 rounded-lg bg-[#180A0E] border border-[#8A6E2D] text-right shadow-inner">
              <span className="text-[10px] text-[#C5A059] font-mono block">DEP: {train.departureTime}</span>
              <span className="text-xs font-mono font-bold text-[#F3E5AB]">ARR: {train.arrivalTime}</span>
            </div>
            <button
              onClick={onExitTrip}
              className="px-3 py-1.5 rounded-lg bg-[#38161E] hover:bg-[#4A1D27] text-[#F4EEDB] text-xs font-serif border border-[#8A6E2D] transition-all shrink-0 shadow-sm"
            >
              End Trip
            </button>
          </div>
        </div>

        {/* Live Trip Stat Chips on Cream Parchment */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-1">
          <div className="parchment-card p-2.5 rounded-lg relative shadow-md">
            <span className="text-[10px] font-serif text-[#6B5749] block uppercase tracking-wider font-bold">RIDING STOPS</span>
            <span className="text-sm font-mono font-bold text-[#1C140E] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8A6E2D]" />
              {ridingStopsCount} Stops
            </span>
          </div>

          <div className="parchment-card p-2.5 rounded-lg relative shadow-md">
            <span className="text-[10px] font-serif text-[#6B5749] block uppercase tracking-wider font-bold">PRIOR STOPS</span>
            <span className="text-sm font-mono font-bold text-[#1C140E]">
              {priorStopsCount} stops before
            </span>
          </div>

          <div className="parchment-card p-2.5 rounded-lg relative shadow-md">
            <span className="text-[10px] font-serif text-[#6B5749] block uppercase tracking-wider font-bold">EST. DURATION</span>
            <span className="text-sm font-mono font-bold text-[#8A6E2D] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#8A6E2D]" />
              {train.durationMinutes} Minutes
            </span>
          </div>

          <div className="parchment-card p-2.5 rounded-lg relative shadow-md">
            <span className="text-[10px] font-serif text-[#6B5749] block uppercase tracking-wider font-bold">BEST SEATING</span>
            <span className="text-sm font-mono font-bold text-[#185244] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2E8872]" />
              Car #{bestCar ? bestCar.carNumber : 1} ({bestCar ? bestCar.fullnessPercent : 35}% full)
            </span>
          </div>
        </div>
      </div>

      {/* 8-Car Train Crowding Diagram */}
      <div className="victorian-panel p-4 sm:p-5 relative shadow-xl">
        <span className="brass-rivet absolute top-2 left-2" />
        <span className="brass-rivet absolute top-2 right-2" />
        <span className="brass-rivet absolute bottom-2 left-2" />
        <span className="brass-rivet absolute bottom-2 right-2" />

        <div className="flex items-center justify-between pb-3 border-b-2 border-[#8A6E2D]/50 mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#2B1117] text-[#F3E5AB] border border-[#8A6E2D]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#F4EEDB]">
                8-CAR REAL-TIME TRAIN OCCUPANCY
              </h3>
              <p className="text-[11px] text-[#C5A059]/90 font-serif italic">
                Sensor telemetry showing passenger fullness, quiet cars & accessibility across each car
              </p>
            </div>
          </div>

          {/* Diagram Legend */}
          <div className="flex items-center gap-3 text-[10px] font-serif text-[#EDE4D0] flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2E8872]" />
              Light (&lt;50%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#C5A059]" />
              Moderate (50-75%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#8A1A24]" />
              Full (&gt;75%)
            </span>
          </div>
        </div>

        {/* Train Consist Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {train.carCrowding.map((car) => {
            const isFull = car.fullnessPercent >= 75;
            const isModerate = car.fullnessPercent >= 50 && car.fullnessPercent < 75;
            const barColor = isFull ? 'bg-[#8A1A24]' : isModerate ? 'bg-[#C5A059]' : 'bg-[#2E8872]';
            const badgeBg = isFull
              ? 'bg-[#8A1A24]/30 text-[#D65D65] border-[#8A1A24]/60'
              : isModerate
              ? 'bg-[#B5942F]/20 text-[#F3E5AB] border-[#8A6E2D]'
              : 'bg-[#185244]/40 text-[#44BBA4] border-[#2E8872]/60';

            return (
              <div
                key={car.carNumber}
                className="p-2.5 rounded-lg bg-[#180A0E] border border-[#8A6E2D]/60 flex flex-col justify-between shadow-inner"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs text-[#F4EEDB]">
                      Car #{car.carNumber}
                    </span>
                    <span className={`text-[10px] font-mono px-1 rounded border font-bold ${badgeBg}`}>
                      {car.fullnessPercent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#12080B] border border-[#4E1D27] overflow-hidden mb-2">
                    <div
                      className={`h-full ${barColor} transition-all duration-500`}
                      style={{ width: `${car.fullnessPercent}%` }}
                    />
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-[#4E1D27]">
                  {car.isQuietCar && (
                    <span
                      className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 text-[9px] font-serif"
                      title="Designated Quiet Commuter Car"
                    >
                      <VolumeX className="w-2.5 h-2.5" />
                      Quiet
                    </span>
                  )}
                  {car.isAccessible && (
                    <span
                      className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-sky-950/60 text-sky-300 border border-sky-800/40 text-[9px] font-serif"
                      title="ADA Accessible & Restroom"
                    >
                      <Accessibility className="w-2.5 h-2.5" />
                      ADA
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Map View with Animated Locomotive */}
      <div>
        <SystemMap
          stations={stations}
          origin={origin}
          destination={destination}
          activeTrain={train}
          onSelectOrigin={() => {}}
          onSelectDestination={() => {}}
        />
      </div>

      {/* Stops Timeline: Before, Boarding, and Riding */}
      <div className="victorian-panel p-4 sm:p-5 relative shadow-xl">
        <span className="brass-rivet absolute top-2 left-2" />
        <span className="brass-rivet absolute top-2 right-2" />
        <span className="brass-rivet absolute bottom-2 left-2" />
        <span className="brass-rivet absolute bottom-2 right-2" />

        <div className="flex items-center justify-between pb-3 border-b-2 border-[#8A6E2D]/50 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#2B1117] text-[#F3E5AB] border border-[#8A6E2D]">
              <Train className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#F4EEDB]">
                INTERMEDIATE STOPS & CORRIDOR TIMELINE
              </h3>
              <p className="text-[11px] text-[#C5A059]/90 font-serif italic">
                Track every station stop along Train #{train.trainNumber}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFullStops(!showFullStops)}
            className="text-xs font-mono text-amber-400 hover:text-amber-300 hover:underline"
          >
            {showFullStops ? 'Show Summary' : 'View All Stops'}
          </button>
        </div>

        <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-800">
          {stops.map((stop, idx) => {
            const isBoarding = stop.isUserOrigin;
            const isDestination = stop.isUserDestination;
            const isPassed = stop.isPassed;
            const isRiding = !isPassed && !isBoarding && !isDestination;

            // Only show prior stops if full view is expanded or if it's right before boarding
            if (!showFullStops && isPassed && idx < originIndex - 1) {
              return null;
            }

            return (
              <div key={idx} className="relative flex items-center justify-between text-xs font-sans group">
                {/* Node icon on vertical line */}
                <div
                  className={`absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isBoarding
                      ? 'bg-emerald-500 border-white text-black shadow-lg scale-110'
                      : isDestination
                      ? 'bg-amber-500 border-white text-black shadow-lg scale-110'
                      : isPassed
                      ? 'bg-stone-900 border-stone-700 text-stone-500'
                      : 'bg-[#181A1F] border-amber-500/50 text-amber-400'
                  }`}
                >
                  {isBoarding ? (
                    <Train className="w-3 h-3" />
                  ) : isDestination ? (
                    <Flag className="w-3 h-3" />
                  ) : isPassed ? (
                    <CheckCircle2 className="w-3 h-3 text-stone-500" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </div>

                {/* Station Info */}
                <div className="pl-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        isBoarding
                          ? 'text-emerald-400 text-sm'
                          : isDestination
                          ? 'text-amber-300 text-sm'
                          : isPassed
                          ? 'text-stone-500'
                          : 'text-stone-200'
                      }`}
                    >
                      {stop.stationName}
                    </span>
                    {isBoarding && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        YOU BOARD HERE
                      </span>
                    )}
                    {isDestination && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        YOUR DESTINATION
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">
                    {isPassed ? 'Passed' : isBoarding ? 'Origin Terminal' : isDestination ? 'Final Arrival' : 'Intermediate Stop'}
                  </span>
                </div>

                {/* Scheduled Time */}
                <div className="text-right">
                  <span
                    className={`font-mono ${
                      isBoarding || isDestination ? 'font-bold text-amber-300' : 'text-stone-400'
                    }`}
                  >
                    {stop.scheduledTime}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ask Conductor Quick Action */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#181A1F] to-[#121316] border border-stone-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <MessageSquareQuote className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-stone-200 block">Questions during your ride?</span>
            <span className="text-stone-400">Ask Stationmaster Abernathy about delays, dining, or transfers.</span>
          </div>
        </div>
        <button
          onClick={() => onAskConductor(`I am currently onboard Train #${train.trainNumber} from ${origin.name} to ${destination.name}. What should I know about my arrival and next transfer?`)}
          className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-semibold text-xs transition-all shrink-0 active:scale-95"
        >
          Ask Conductor
        </button>
      </div>
    </div>
  );
};
