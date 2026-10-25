import React from 'react';
import { X, ExternalLink, Database, ShieldCheck, Clock, FileText } from 'lucide-react';

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourcesModal: React.FC<SourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="victorian-panel w-full max-w-xl bg-[#180A0E] p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto cursor-default"
      >
        <span className="brass-rivet absolute top-2 left-2" />
        <span className="brass-rivet absolute top-2 right-2" />
        <span className="brass-rivet absolute bottom-2 left-2" />
        <span className="brass-rivet absolute bottom-2 right-2" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#8A6E2D]/50 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#2B1117] border border-[#8A6E2D] text-[#F3E5AB]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#F4EEDB]">
                TIMETABLE & TELEMETRY SOURCES
              </h2>
              <p className="text-xs text-[#C5A059]/90 font-serif italic">
                Official MTA Open Data Feeds, Google Maps GTFS & Tariff Citations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#2B1117] border border-[#8A6E2D] text-[#C5A059] hover:text-[#F3E5AB] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Cards */}
        <div className="space-y-3.5 text-xs text-[#EDE4D0] font-sans">
          <div className="p-3.5 rounded-xl bg-[#1F0C10] border border-[#8A6E2D]/60 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-[#F3E5AB] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                1. MTA Real-Time GTFS-RT Telemetry Feed
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#185244]/50 text-[#44BBA4] border border-[#2E8872]/60 shadow-sm">
                Live Open Data
              </span>
            </div>
            <p className="text-[#C5A059]/80 leading-relaxed text-[11px] font-serif">
              Direct GTFS-Realtime Protocol Buffer feed published by the Metropolitan Transportation Authority (MTA):
            </p>
            <a
              href="https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/lirr%2Fgtfs-lirr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-[#F3E5AB] hover:underline flex items-center gap-1 break-all"
            >
              <span>https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/lirr/gtfs-lirr</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1F0C10] border border-[#8A6E2D]/60 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-[#F3E5AB] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#44BBA4]" />
                2. Google Maps Transit & Official LIRR Schedules
              </span>
              <span className="text-[10px] font-serif px-2 py-0.5 rounded bg-[#2B1117] text-[#EDE4D0] border border-[#8A6E2D]/60">
                Public Timetables
              </span>
            </div>
            <p className="text-[#C5A059]/80 leading-relaxed text-[11px] font-serif">
              Schedules reflect the Port Jefferson, Main Line, and City Terminal timetables (e.g. Saturday departures from Stony Brook at 12:51 PM, 2:51 PM, 4:51 PM; weekday morning express at 6:42 AM and 7:18 AM).
            </p>
            <a
              href="https://new.mta.info/schedules"
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif text-[11px] text-[#F3E5AB] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>MTA Official Schedules Portal (new.mta.info/schedules)</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1F0C10] border border-[#8A6E2D]/60 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-[#F3E5AB] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E8872]" />
                3. MTA Tariff Zone Fare Structure
              </span>
              <span className="text-[10px] font-serif px-2 py-0.5 rounded bg-[#2B1117] text-[#EDE4D0] border border-[#8A6E2D]/60">
                Fare Regulations
              </span>
            </div>
            <p className="text-[#C5A059]/80 leading-relaxed text-[11px] font-serif">
              Fares are computed according to official MTA Tariff Zones: Zone 10 (Stony Brook, Port Jefferson) to Zone 1 (Penn Station, Grand Central Madison) = $19.25 Peak, $14.00 Off-Peak, 50% Reduced Fare for Senior 65+ / Disability / Medicare (valid except weekday AM peak). Children under 5 ride free. Monthly and Ten-Trip tickets offer multi-ride savings.
            </p>
            <a
              href="https://new.mta.info/fares"
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif text-[11px] text-[#F3E5AB] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>MTA Official Fare Rules (mta.info/fares)</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1F0C10] border border-[#8A6E2D]/60 space-y-1.5 shadow-inner">
            <span className="font-serif font-bold text-[#F3E5AB] block">
              4. Bridge Toll & Highway Congestion Benchmarks
            </span>
            <p className="text-[#C5A059]/80 leading-relaxed text-[11px] font-serif">
              Calculations reference Triborough Bridge and Tunnel Authority (TBTA) toll schedules (Queens-Midtown Tunnel $6.94 E-ZPass standard / $11.19 toll-by-mail) and NYSDOT Long Island Expressway (I-495) congestion indexes during rush hours.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t-2 border-[#8A6E2D]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#B5942F] to-[#C5A059] hover:from-[#C5A059] hover:to-[#F3E5AB] text-[#1C140E] font-bold text-xs font-serif transition-colors shadow-md border border-[#F3E5AB]/40"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
