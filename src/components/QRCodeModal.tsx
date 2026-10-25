import React, { useState } from 'react';
import { X, Smartphone, Copy, Check, Globe, Laptop } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRODUCTION_URL = 'https://steamtime-lirr.vercel.app';

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Check if running on localhost / dev environment
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
  );

  const localUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:5173/';

  // Default to production URL ("Live site")
  const [activeTab, setActiveTab] = useState<'live' | 'local'>('live');

  if (!isOpen) return null;

  const targetUrl = activeTab === 'local' && isLocalhost ? localUrl : PRODUCTION_URL;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="victorian-panel max-w-sm w-full p-6 text-center shadow-2xl relative cursor-default bg-[#180A0E]"
      >
        <span className="brass-rivet absolute top-2 left-2" />
        <span className="brass-rivet absolute top-2 right-2" />
        <span className="brass-rivet absolute bottom-2 left-2" />
        <span className="brass-rivet absolute bottom-2 right-2" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#C5A059] hover:text-[#F3E5AB] transition-colors p-1"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-[#2B1117] border-2 border-[#8A6E2D] text-[#F3E5AB] flex items-center justify-center mx-auto mb-3 shadow-md">
          <Smartphone className="w-6 h-6 text-[#C5A059]" />
        </div>

        <h2 className="font-serif font-bold text-xl text-[#F4EEDB] tracking-wider">
          SCAN WITH PHONE
        </h2>
        <p className="text-xs text-[#C5A059]/90 font-serif italic mb-4">
          Point your iPhone or Android camera to open BrassLine on mobile
        </p>

        {/* High-Contrast Crisp Standards-Compliant QR Code using qrcode.react */}
        <div className="p-4 bg-white rounded-xl inline-block shadow-[0_4px_24px_rgba(0,0,0,0.85)] border-4 border-[#8A6E2D] mb-4">
          <QRCodeSVG
            value={targetUrl}
            size={240}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
            marginSize={4}
            className="block"
          />
        </div>

        {/* Target URL Display & Copy Button */}
        <div className="flex items-center gap-1.5 p-2 rounded bg-[#12080B] border border-[#8A6E2D] text-xs font-mono text-[#F4EEDB] mb-3 justify-between shadow-inner">
          <span className="truncate max-w-[210px] text-left text-[#F3E5AB]">{targetUrl}</span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-[#2B1117] hover:bg-[#38161E] text-[#F3E5AB] border border-[#8A6E2D] text-xs font-serif transition-colors shrink-0 flex items-center gap-1 shadow-sm"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#44BBA4]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Tabs: Live site (default) and Local network (dev only). Only shown when running on localhost. */}
        {isLocalhost && (
          <div className="flex justify-center gap-2 mb-3">
            <button
              onClick={() => setActiveTab('live')}
              className={`text-[11px] font-serif px-2.5 py-1 rounded border transition-all flex items-center gap-1 ${
                activeTab === 'live'
                  ? 'bg-gradient-to-r from-[#B5942F] to-[#C5A059] text-[#1C140E] font-bold border-[#F3E5AB]'
                  : 'bg-[#2B1117] text-[#C5A059] border-[#8A6E2D] hover:text-[#F3E5AB]'
              }`}
            >
              <Globe className="w-3 h-3 inline" />
              Live site
            </button>
            <button
              onClick={() => setActiveTab('local')}
              className={`text-[11px] font-serif px-2.5 py-1 rounded border transition-all flex items-center gap-1 ${
                activeTab === 'local'
                  ? 'bg-gradient-to-r from-[#B5942F] to-[#C5A059] text-[#1C140E] font-bold border-[#F3E5AB]'
                  : 'bg-[#2B1117] text-[#C5A059] border-[#8A6E2D] hover:text-[#F3E5AB]'
              }`}
            >
              <Laptop className="w-3 h-3 inline" />
              Local network (dev only)
            </button>
          </div>
        )}

        <div className="text-[11px] text-[#C5A059]/90 font-serif italic leading-relaxed">
          Tip: Your phone does not need to be on the same Wi-Fi. In mobile Safari or Chrome, tap <strong>"Add to Home Screen"</strong> to run BrassLine in full-screen native app mode.
        </div>
      </div>
    </div>
  );
};
