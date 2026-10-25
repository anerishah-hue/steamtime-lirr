import React, { useState, useEffect } from 'react';
import { SERVICE_ALERTS } from '../data/serviceAlerts';
import { ServiceAlert } from '../types';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Info,
  ChevronLeft,
  ChevronRight,
  Radio
} from 'lucide-react';

export const ServiceAlertsTicker: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);

  const activeAlerts: ServiceAlert[] = SERVICE_ALERTS;
  const goodServiceCount = activeAlerts.filter((a) => a.type === 'good').length;
  const advisoryCount = activeAlerts.length - goodServiceCount;

  // Auto-advance telegram ticker tape every 6 seconds
  useEffect(() => {
    if (activeAlerts.length <= 1) return;
    const timer = setInterval(() => {
      setActiveAlertIndex((prev) => (prev + 1) % activeAlerts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeAlerts.length]);

  const currentAlert = activeAlerts[activeAlertIndex] || activeAlerts[0];

  // Format real status text as authentic telegraph / newspaper wire dispatch with STOP.
  const formatTelegramText = (alert: ServiceAlert): string => {
    if (!alert) return 'ALL BRANCHES RUNNING ON SCHEDULE. STOP.';
    const cleanDesc = alert.description.trim().replace(/\.+$/, '');
    return `${alert.branch}: ${cleanDesc}. STOP.`;
  };

  const currentTelegram = formatTelegramText(currentAlert);

  const handlePrevTelegram = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAlertIndex((prev) => (prev - 1 + activeAlerts.length) % activeAlerts.length);
  };

  const handleNextTelegram = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAlertIndex((prev) => (prev + 1) % activeAlerts.length);
  };

  return (
    <div className="victorian-panel overflow-hidden shadow-lg relative">
      <span className="brass-rivet absolute top-1.5 left-1.5" />
      <span className="brass-rivet absolute top-1.5 right-1.5" />
      <span className="brass-rivet absolute bottom-1.5 left-1.5" />
      <span className="brass-rivet absolute bottom-1.5 right-1.5" />

      {/* Telegraph / Newspaper Ticker Banner Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-[#16080B] via-[#240E14] to-[#16080B] flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-[#2B1117] transition-colors gap-2"
        role="region"
        aria-label="Telegraph Service Status Ticker"
      >
        {/* Left: Vintage Telegraph Tape Badge & Real Ticker Message */}
        <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
          {/* Vintage Telegraph Header Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gradient-to-r from-[#B5942F] to-[#C5A059] text-[#1C140E] font-serif font-black text-xs tracking-wider border border-[#F3E5AB] shadow-sm shrink-0">
            <Radio className="w-3 h-3 text-[#1C140E] animate-pulse" />
            <span>TELEGRAM</span>
          </div>

          {/* Status Badge: All on time vs advisories */}
          {advisoryCount > 0 ? (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#8A1A24]/40 text-[#D65D65] border border-[#8A1A24] shrink-0 font-bold">
              <AlertTriangle className="w-2.5 h-2.5 text-[#D65D65]" />
              {advisoryCount} ADVISORY
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#185244]/50 text-[#44BBA4] border border-[#2E8872]/60 shrink-0 font-bold">
              <CheckCircle className="w-2.5 h-2.5 text-[#2E8872]" />
              NORMAL SERVICE
            </span>
          )}

          {/* Real Telegraph Status Text with STOP punctuation */}
          <div
            key={activeAlertIndex}
            className="text-xs font-mono tracking-wide text-[#F4EEDB] truncate flex-1 min-w-0 animate-in fade-in duration-300 select-none"
            aria-live="polite"
          >
            <span className="text-[#C5A059] font-bold mr-1">
              TELEGRAM:
            </span>
            <span className="text-[#F4EEDB]">
              {currentTelegram}
            </span>
          </div>
        </div>

        {/* Right: Telegram Pager Controls & Details Expand */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-[#8A6E2D]/40">
          {/* Ticker Pager Buttons */}
          <div className="flex items-center gap-1 text-[#C5A059]">
            <button
              type="button"
              onClick={handlePrevTelegram}
              aria-label="Previous service telegram"
              className="p-1 rounded hover:bg-[#38161E] hover:text-[#F3E5AB] transition-colors"
              title="Previous Telegram"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#C5A059]/80 px-1">
              {activeAlertIndex + 1}/{activeAlerts.length}
            </span>
            <button
              type="button"
              onClick={handleNextTelegram}
              aria-label="Next service telegram"
              className="p-1 rounded hover:bg-[#38161E] hover:text-[#F3E5AB] transition-colors"
              title="Next Telegram"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expand Details Drawer Button */}
          <button
            type="button"
            aria-label={isExpanded ? 'Collapse service telegrams' : 'Expand all service telegrams'}
            className="text-[#C5A059] hover:text-[#F3E5AB] transition-colors px-2 py-0.5 rounded border border-[#8A6E2D]/60 hover:border-[#F3E5AB] flex items-center gap-1 text-[11px] font-serif bg-[#1F0C10]"
          >
            <span>{isExpanded ? 'Hide' : 'All Telegrams'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Telegraph Drawer */}
      {isExpanded && (
        <div className="p-3.5 bg-[#12080B] border-t-2 border-[#8A6E2D]/50 space-y-2.5 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between text-xs font-serif text-[#C5A059] pb-1 border-b border-[#8A6E2D]/40">
            <span className="font-bold tracking-wider uppercase text-[10px]">
              OFFICIAL MTA TELEGRAPH DISPATCHES ({activeAlerts.length} ACTIVE)
            </span>
            <span className="text-[10px] font-mono text-[#8A6E2D]">
              Direct Wire Feed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeAlerts.map((alert, index) => (
              <div
                key={alert.id}
                onClick={() => setActiveAlertIndex(index)}
                className={`p-3 rounded-lg border transition-all cursor-pointer shadow-inner ${
                  index === activeAlertIndex
                    ? 'bg-[#2B1117] border-[#C5A059] ring-1 ring-[#C5A059]/50'
                    : 'bg-[#1A0B0E] border-[#8A6E2D]/50 hover:border-[#8A6E2D]'
                }`}
              >
                <div className="flex items-start gap-2.5 text-xs">
                  <div className="shrink-0 mt-0.5">
                    {alert.type === 'good' ? (
                      <CheckCircle className="w-4 h-4 text-[#2E8872]" />
                    ) : alert.type === 'delay' ? (
                      <AlertTriangle className="w-4 h-4 text-[#C5A059]" />
                    ) : (
                      <Info className="w-4 h-4 text-[#44BBA4]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-serif font-bold text-[#F4EEDB] text-xs truncate">
                        {alert.branch}
                      </span>
                      <span className="text-[10px] font-mono text-[#C5A059]/70 shrink-0">
                        {alert.timestamp}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-[#0F0608] border border-[#8A6E2D]/30 mb-1">
                      <p className="text-[11px] text-[#F3E5AB] font-mono leading-relaxed">
                        TELEGRAM: {formatTelegramText(alert)}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#EDE4D0]/70 font-serif italic">
                      {alert.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
