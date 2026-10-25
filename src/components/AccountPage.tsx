import React, { useState, useEffect } from 'react';
import { CommuterAccount, CommuterRole, GenderPreference, Station } from '../types';
import { ACCOUNT_ROLES, STATIONS } from '../data/stations';
import {
  UserCircle,
  CheckCircle,
  Save,
  Smartphone,
  Copy,
  Check,
  Wifi,
  Globe,
  Award,
  History,
  Star,
  Heart,
  TrendingUp,
  RotateCcw,
  MapPin,
  Trash2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

interface AccountPageProps {
  currentProfile: CommuterAccount | null;
  onSaveProfile: (profile: CommuterAccount) => void;
  onSelectRoute?: (originId: string, destinationId: string) => void;
  origin?: Station;
  destination?: Station;
  onSelectOrigin?: (st: Station) => void;
  onSelectDestination?: (st: Station) => void;
  isHandset?: boolean;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  currentProfile,
  onSaveProfile,
  onSelectRoute,
  origin,
  destination,
  onSelectOrigin,
  onSelectDestination,
  isHandset = false
}) => {
  const [name, setName] = useState(currentProfile?.name || 'Alex Morgan');
  const [gender, setGender] = useState<GenderPreference>(currentProfile?.gender || 'unspecified');
  const [selectedRole, setSelectedRole] = useState<CommuterRole>(currentProfile?.role || 'standard');
  const [homeStation, setHomeStation] = useState(origin?.name || currentProfile?.homeStation || 'Stony Brook');
  const [destinationStation, setDestinationStation] = useState(destination?.name || currentProfile?.frequentDestination || 'Penn Station');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Keep in sync with shared origin/destination
  useEffect(() => {
    if (origin) setHomeStation(origin.name);
  }, [origin]);

  useEffect(() => {
    if (destination) setDestinationStation(destination.name);
  }, [destination]);

  const PRODUCTION_URL = 'https://steamtime-lirr.vercel.app';
  const [selectedQrUrl] = useState<string>(PRODUCTION_URL);
  const roleMeta = ACCOUNT_ROLES.find((r) => r.role === selectedRole) || ACCOUNT_ROLES[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: CommuterAccount = {
      name: name.trim() || 'Commuter Passenger',
      gender,
      role: selectedRole,
      homeStation,
      frequentDestination: destinationStation,
      fareDiscountPercent: roleMeta.discount,
      customPerks: roleMeta.perks,
      createdDate: currentProfile?.createdDate || new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      accountNumber: currentProfile?.accountNumber || `LIRR-${Math.floor(100000 + Math.random() * 900000)}`,
      favoriteStationIds: currentProfile?.favoriteStationIds || ['stony-brook', 'penn-station'],
      favoritePlaceNames: currentProfile?.favoritePlaceNames || ["Dunkin'", "Druthers Coffee & Roasters"],
      recentTrips: currentProfile?.recentTrips || [
        {
          originId: 'stony-brook',
          originName: 'Stony Brook',
          destinationId: 'penn-station',
          destinationName: 'New York Penn Station',
          timestamp: 'Today at 12:51 PM'
        },
        {
          originId: 'penn-station',
          originName: 'New York Penn Station',
          destinationId: 'stony-brook',
          destinationName: 'Stony Brook',
          timestamp: 'Yesterday at 5:19 PM'
        }
      ],
      stationVisitCounts: currentProfile?.stationVisitCounts || {
        'stony-brook': 14,
        'penn-station': 12,
        'port-jefferson': 5,
        'huntington': 4,
        'jamaica': 8
      }
    };

    onSaveProfile(newProfile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#B87333', '#4A90E2', '#50E3C2']
    });
  };

  const handleCopyQr = () => {
    navigator.clipboard.writeText(selectedQrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recentTrips = currentProfile?.recentTrips || [
    {
      originId: 'stony-brook',
      originName: 'Stony Brook',
      destinationId: 'penn-station',
      destinationName: 'New York Penn Station',
      timestamp: 'Today at 12:51 PM'
    },
    {
      originId: 'penn-station',
      originName: 'New York Penn Station',
      destinationId: 'stony-brook',
      destinationName: 'Stony Brook',
      timestamp: 'Yesterday at 5:19 PM'
    }
  ];

  const visitCounts = currentProfile?.stationVisitCounts || {
    'stony-brook': 14,
    'penn-station': 12,
    'jamaica': 8,
    'port-jefferson': 5,
    'huntington': 4
  };

  const sortedVisits = Object.entries(visitCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const favoriteStationIds = currentProfile?.favoriteStationIds || ['stony-brook', 'penn-station'];
  const favoritePlaceNames = currentProfile?.favoritePlaceNames || ["Dunkin'", "Druthers Coffee & Roasters"];

  // Format passenger name with formal address form from optional gender field
  const addressedPassengerName =
    gender === 'male'
      ? `Mr. ${name}`
      : gender === 'female'
      ? `Ms. ${name}`
      : `${name}, Esq.`;

  // Total runs and estimated highway tolls avoided
  const totalTrips = Math.max(
    recentTrips.length,
    Math.floor(Object.values(visitCounts).reduce((a, b) => a + b, 0) / 2) || 4
  );
  const estimatedTollsAvoided = totalTrips * 26.06;

  // Rank title based on estimated tolls avoided (labeled as an estimate)
  let rankTitle = 'Passenger';
  let rankSubtitle = 'Steadfast Rail Traveler';
  if (estimatedTollsAvoided >= 250) {
    rankTitle = 'Honourable';
    rankSubtitle = 'Distinguished Corridor Patron';
  } else if (estimatedTollsAvoided >= 100) {
    rankTitle = "Conductor's Friend";
    rankSubtitle = 'Frequent Line Traveler';
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Victorian Passenger Ticket / Pass (Passenger's Ledger) */}
      <div className="victorian-panel p-4 sm:p-6 relative shadow-xl">
        <span className="brass-rivet absolute top-2 left-2" />
        <span className="brass-rivet absolute top-2 right-2" />
        <span className="brass-rivet absolute bottom-2 left-2" />
        <span className="brass-rivet absolute bottom-2 right-2" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-[#8A6E2D]/50 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#2B1117] border-2 border-[#8A6E2D] flex items-center justify-center text-[#F3E5AB] shrink-0 shadow-md">
              <UserCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-[#F4EEDB] tracking-wide">
                PASSENGER'S LEDGER
              </h2>
              <p className="text-xs text-[#C5A059]/90 font-serif italic">
                Official BrassLine Commuter Ticket & Travel Pass • Stored locally on this device
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="px-3 py-1 rounded-full bg-[#185244]/40 border border-[#2E8872]/60 text-xs font-mono text-[#44BBA4] shadow-sm flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#2E8872]" />
              <span>Rank: {rankTitle} (Estimate)</span>
            </div>
          </div>
        </div>

        {/* Authentic Victorian Railway Ticket / Pass */}
        <div className="mt-5 relative p-4 sm:p-5 rounded-2xl parchment-card border-2 border-[#8A6E2D] shadow-xl overflow-hidden">
          {/* Serrated Ticket Cutout Notches on Left and Right */}
          <div className="absolute top-1/2 -left-3.5 w-7 h-7 rounded-full bg-[#12080B] border-r-2 border-[#8A6E2D] -translate-y-1/2" />
          <div className="absolute top-1/2 -right-3.5 w-7 h-7 rounded-full bg-[#12080B] border-l-2 border-[#8A6E2D] -translate-y-1/2" />

          {/* Ticket Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-dashed border-[#8A6E2D]/60 gap-2 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2B1117] border-2 border-[#8A6E2D] flex items-center justify-center text-[#C5A059] font-serif font-black text-xs shadow-inner">
                BL
              </div>
              <div>
                <div className="text-[10px] font-serif uppercase tracking-widest text-[#691621] font-bold">
                  BrassLine Passenger Ticket & Pass
                </div>
                <div className="font-mono text-xs text-[#1C140E] font-bold">
                  PASS NO. {currentProfile?.accountNumber || 'LIRR-582914'}
                </div>
              </div>
            </div>

            {/* Rank Title Badge on Pass (Labeled as an estimate) */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="px-3 py-1.5 rounded-lg bg-[#FAF6EB] border border-[#8A6E2D] shadow-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-[#691621]" />
                <div className="text-left">
                  <div className="text-[9px] font-serif uppercase tracking-wider text-[#691621] font-bold">
                    Rank Title (Estimate)
                  </div>
                  <div className="text-xs font-serif font-bold text-[#1C140E] leading-none">
                    {rankTitle}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Main Details Body */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3.5 pb-2.5 px-2">
            <div>
              <span className="text-[10px] font-serif uppercase tracking-wider text-[#7A5B1E] font-bold block">
                Passenger (Addressed)
              </span>
              <span className="font-serif font-bold text-base sm:text-lg text-[#1C140E] block leading-tight">
                {addressedPassengerName}
              </span>
              <span className="text-[11px] font-serif italic text-[#554030]">
                {roleMeta.role === 'child'
                  ? `${roleMeta.title} • Rides Free (Under 5)`
                  : roleMeta.role === 'senior'
                  ? `${roleMeta.title} • 50% Reduced Fare (AM Peak excluded)`
                  : roleMeta.role === 'frequent'
                  ? `${roleMeta.title} • Standard tariff (Monthly/Ten-Trip at mta.info/fares)`
                  : roleMeta.isConcept
                  ? `${roleMeta.title} • Concept Demo (No discount applied)`
                  : `${roleMeta.title} • Standard MTA Tariff`}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-serif uppercase tracking-wider text-[#7A5B1E] font-bold block">
                Corridor of Travel
              </span>
              <span className="font-serif font-bold text-sm text-[#1C140E] block">
                {homeStation} ⇄ {destinationStation}
              </span>
              <span className="text-[11px] font-mono text-[#554030]">
                Zone {origin?.zone || 7} to Zone {destination?.zone || 1}
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-serif uppercase tracking-wider text-[#7A5B1E] font-bold block">
                Estimated Tolls Avoided
              </span>
              <span className="font-mono font-bold text-base sm:text-lg text-[#185244] block">
                ${estimatedTollsAvoided.toFixed(2)}
              </span>
              <span className="text-[10px] font-serif italic text-[#691621]">
                Estimate based on {totalTrips} logged runs
              </span>
            </div>
          </div>

          {/* Ticket Perforated Bottom Bar */}
          <div className="pt-2 border-t border-dashed border-[#8A6E2D]/60 flex flex-wrap items-center justify-between text-[10px] font-serif text-[#7A5B1E] px-2 gap-1">
            <span>Valid on all BrassLine steam & electric rail corridors</span>
            <span className="font-mono text-[#1C140E] font-bold">
              ISSUED: {currentProfile?.createdDate || 'Oct 25, 2026'}
            </span>
          </div>
        </div>

        {/* Account Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-[#C5A059] mb-1">
                PASSENGER NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                required
                className="w-full bg-[#12080B] border border-[#8A6E2D]/80 focus:border-[#F3E5AB] rounded-lg px-3 py-2 text-sm text-[#F4EEDB] font-serif focus:outline-none transition-all shadow-inner"
              />

              {/* Optional Gender Field Used Only for Address Form (Mr. / Ms. / neutral Esq.) */}
              <div className="mt-3">
                <label className="block text-xs font-serif uppercase tracking-wider text-[#C5A059] mb-1.5 font-bold">
                  GENDER / ADDRESS FORM (OPTIONAL)
                </label>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#EDE4D0] font-serif">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={gender === 'male'}
                      onChange={() => setGender('male')}
                      className="accent-[#C5A059] cursor-pointer"
                    />
                    <span>Male (Mr.)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                      className="accent-[#C5A059] cursor-pointer"
                    />
                    <span>Female (Ms.)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="unspecified"
                      checked={gender === 'unspecified'}
                      onChange={() => setGender('unspecified')}
                      className="accent-[#C5A059] cursor-pointer"
                    />
                    <span>Prefer not to say (Esq.)</span>
                  </label>
                </div>
                <p className="text-[11px] text-[#8A6E2D] font-serif italic mt-1.5 leading-snug">
                  Optional. Only used for your formal address on your pass (Mr., Ms., or Esq.) and by the Stationmaster. Never used for fares, filtering, or anything else. Stored only on this device.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-[#C5A059] mb-1">
                HOME STATION (DEPARTURE)
              </label>
              <select
                value={origin ? origin.id : (STATIONS.find(s => s.name === homeStation)?.id || homeStation)}
                onChange={(e) => {
                  const st = STATIONS.find((s) => s.id === e.target.value || s.name === e.target.value);
                  if (st) {
                    setHomeStation(st.name);
                    if (onSelectOrigin) onSelectOrigin(st);
                  }
                }}
                className="w-full bg-[#12080B] border border-[#8A6E2D]/80 focus:border-[#F3E5AB] rounded-lg px-3 py-2 text-sm text-[#F4EEDB] font-serif focus:outline-none cursor-pointer shadow-inner"
              >
                {STATIONS.map((st) => (
                  <option key={st.id} value={st.id} className="bg-[#1F0C10] text-[#F4EEDB]">
                    {st.name} ({st.branch})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-[#C5A059] mb-1">
                PRIMARY DESTINATION (ARRIVAL)
              </label>
              <select
                value={destination ? destination.id : (STATIONS.find(s => s.name === destinationStation)?.id || destinationStation)}
                onChange={(e) => {
                  const st = STATIONS.find((s) => s.id === e.target.value || s.name === e.target.value);
                  if (st) {
                    setDestinationStation(st.name);
                    if (onSelectDestination) onSelectDestination(st);
                  }
                }}
                className="w-full bg-[#12080B] border border-[#8A6E2D]/80 focus:border-[#F3E5AB] rounded-lg px-3 py-2 text-sm text-[#F4EEDB] font-serif focus:outline-none cursor-pointer shadow-inner"
              >
                {STATIONS.map((st) => (
                  <option key={st.id} value={st.id} className="bg-[#1F0C10] text-[#F4EEDB]">
                    {st.name} ({st.branch})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Commuter Role Selector */}
          <div>
            <label className="block text-xs font-serif uppercase tracking-wider text-[#C5A059] mb-2 font-bold">
              SELECT COMMUTER CATEGORY
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {ACCOUNT_ROLES.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => setSelectedRole(r.role)}
                    className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'parchment-card border-[#C5A059] shadow-md'
                        : 'bg-[#2B1117] border-[#4E1D27] hover:border-[#8A6E2D] hover:bg-[#38161E]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-serif font-bold text-xs ${isSelected ? 'text-[#1C140E]' : 'text-[#F4EEDB]'}`}>
                          {r.title}
                        </span>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#2E8872] shrink-0" />}
                      </div>
                      <span className={`text-[11px] font-mono font-bold block mb-1 ${isSelected ? 'text-[#185244]' : 'text-[#44BBA4]'}`}>
                        {r.role === 'child'
                          ? 'Rides Free'
                          : r.role === 'senior'
                          ? '-50% Reduced Fare'
                          : r.isConcept
                          ? 'Concept Demo (0% Real Discount)'
                          : 'No flat discount'}
                      </span>
                      <p className={`text-[11px] font-sans leading-tight ${isSelected ? 'text-[#48392F]' : 'text-[#C5A059]/80'}`}>
                        {r.description}
                      </p>
                      {r.note && (
                        <p className="text-[10px] font-serif italic mt-1.5 text-[#8A6E2D] leading-snug">
                          {r.note}
                        </p>
                      )}
                    </div>
                    {r.linkUrl && (
                      <div className="mt-2 pt-1 border-t border-[#8A6E2D]/40">
                        <a
                          href={r.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center gap-1 text-[10px] font-serif underline ${
                            isSelected ? 'text-[#691621] hover:text-[#1C140E]' : 'text-[#C5A059] hover:text-[#F3E5AB]'
                          }`}
                        >
                          <span>{r.linkText || 'See mta.info/fares'}</span>
                          <Globe className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Small note on Account tab: "Fare rules from mta.info. Always confirm at the ticket window or in the TrainTime app." */}
            <div className="mt-3 p-2.5 rounded-lg bg-[#180A0E] border border-[#8A6E2D]/60 flex items-center gap-2 text-xs font-serif text-[#C5A059] shadow-inner">
              <CheckCircle className="w-4 h-4 text-[#2E8872] shrink-0" />
              <span>Fare rules from mta.info. Always confirm at the ticket window or in the TrainTime app.</span>
            </div>
          </div>

          {/* Applied Benefits Card on Cream Parchment */}
          <div className="parchment-card p-3.5 rounded-xl border-2 border-[#8A6E2D] text-xs text-[#1C140E] relative shadow-md">
            <span className="brass-rivet absolute top-1 left-1 opacity-70" />
            <span className="brass-rivet absolute top-1 right-1 opacity-70" />
            <span className="brass-rivet absolute bottom-1 left-1 opacity-70" />
            <span className="brass-rivet absolute bottom-1 right-1 opacity-70" />

            <span className="font-serif text-[11px] uppercase text-[#8A6E2D] font-bold block mb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#8A6E2D]" />
              BENEFITS INCLUDED WITH {roleMeta.title.toUpperCase()}:
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-[#48392F] font-sans">
              {roleMeta.perks.map((p, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A6E2D] shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#B5942F] to-[#C5A059] hover:from-[#C5A059] hover:to-[#F3E5AB] text-[#1C140E] font-bold font-serif text-xs transition-all flex items-center gap-2 shadow-md active:scale-95 border border-[#F3E5AB]/40"
            >
              <Save className="w-4 h-4" />
              <span>Save Account Settings</span>
            </button>

            {saveSuccess && (
              <span className="text-xs text-[#44BBA4] font-serif flex items-center gap-1 animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Account settings saved successfully!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Recent Trips & Most Visited Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Journeys */}
        <div className="victorian-panel p-4 sm:p-5 relative shadow-xl">
          <span className="brass-rivet absolute top-1.5 left-1.5" />
          <span className="brass-rivet absolute top-1.5 right-1.5" />
          <span className="brass-rivet absolute bottom-1.5 left-1.5" />
          <span className="brass-rivet absolute bottom-1.5 right-1.5" />

          <div className="flex items-center justify-between pb-3 border-b-2 border-[#8A6E2D]/50 mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#C5A059]" />
              <h3 className="font-serif font-bold text-sm text-[#F4EEDB]">
                RECENT JOURNEYS
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#C5A059]">
              {recentTrips.length} Logged
            </span>
          </div>

          <div className="space-y-2">
            {recentTrips.map((trip, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#180A0E] border border-[#8A6E2D]/60 hover:border-[#C5A059] flex items-center justify-between gap-2 shadow-inner"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4EEDB] font-serif">
                    <span>{trip.originName}</span>
                    <span className="text-[#8A6E2D]">→</span>
                    <span className="text-[#F3E5AB]">{trip.destinationName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#C5A059]/70">
                    {trip.timestamp}
                  </span>
                </div>

                {onSelectRoute && (
                  <button
                    onClick={() => onSelectRoute(trip.originId, trip.destinationId)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2B1117] hover:bg-[#38161E] text-[#F3E5AB] text-[11px] font-serif border border-[#8A6E2D] transition-colors shrink-0 shadow-sm"
                    title="Load this route into the Schedule Timetable"
                  >
                    <RotateCcw className="w-3 h-3 text-[#C5A059]" />
                    <span>Rerun</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Most Visited Stations */}
        <div className="victorian-panel p-4 sm:p-5 relative shadow-xl">
          <span className="brass-rivet absolute top-1.5 left-1.5" />
          <span className="brass-rivet absolute top-1.5 right-1.5" />
          <span className="brass-rivet absolute bottom-1.5 left-1.5" />
          <span className="brass-rivet absolute bottom-1.5 right-1.5" />

          <div className="flex items-center justify-between pb-3 border-b-2 border-[#8A6E2D]/50 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2E8872]" />
              <h3 className="font-serif font-bold text-sm text-[#F4EEDB]">
                MOST VISITED STATIONS
              </h3>
            </div>
            <span className="text-[10px] font-serif uppercase tracking-wider text-[#C5A059]">
              Frequency
            </span>
          </div>

          <div className="space-y-2">
            {sortedVisits.map(([stId, count], idx) => {
              const stationObj = STATIONS.find((s) => s.id === stId);
              const stName = stationObj ? stationObj.name : stId;
              const branch = stationObj ? stationObj.branch : 'LIRR';

              return (
                <div
                  key={stId}
                  className="p-2.5 rounded-lg bg-[#180A0E] border border-[#8A6E2D]/60 flex items-center justify-between shadow-inner"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#2B1117] border border-[#8A6E2D] flex items-center justify-center font-mono text-[10px] text-[#F3E5AB] font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-serif font-bold text-[#F4EEDB] block">
                        {stName}
                      </span>
                      <span className="text-[10px] font-serif text-[#C5A059]/80 italic">
                        {branch}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-[#185244]/40 text-[11px] font-mono text-[#44BBA4] border border-[#2E8872]/60">
                    {count} visits
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Saved Favorites Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Favorite Stations */}
        <div className="victorian-panel p-4 sm:p-5 relative shadow-xl">
          <span className="brass-rivet absolute top-1.5 left-1.5" />
          <span className="brass-rivet absolute top-1.5 right-1.5" />
          <span className="brass-rivet absolute bottom-1.5 left-1.5" />
          <span className="brass-rivet absolute bottom-1.5 right-1.5" />

          <div className="flex items-center gap-2 pb-3 border-b-2 border-[#8A6E2D]/50 mb-3">
            <Star className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
            <h3 className="font-serif font-bold text-sm text-[#F4EEDB]">
              FAVORITE STATIONS ({favoriteStationIds.length})
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {favoriteStationIds.map((id) => {
              const st = STATIONS.find((s) => s.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#180A0E] border border-[#8A6E2D]/60 text-xs text-[#F4EEDB] font-serif shadow-sm"
                >
                  <MapPin className="w-3 h-3 text-[#C5A059]" />
                  <span>{st ? st.name : id}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Favorite Places */}
        <div className="victorian-panel p-4 sm:p-5 relative shadow-xl">
          <span className="brass-rivet absolute top-1.5 left-1.5" />
          <span className="brass-rivet absolute top-1.5 right-1.5" />
          <span className="brass-rivet absolute bottom-1.5 left-1.5" />
          <span className="brass-rivet absolute bottom-1.5 right-1.5" />

          <div className="flex items-center gap-2 pb-3 border-b-2 border-[#8A6E2D]/50 mb-3">
            <Heart className="w-4 h-4 text-[#D65D65] fill-[#D65D65]" />
            <h3 className="font-serif font-bold text-sm text-[#F4EEDB]">
              FAVORITE LOCAL DESTINATIONS ({favoritePlaceNames.length})
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {favoritePlaceNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#180A0E] border border-[#8A6E2D]/60 text-xs text-[#F4EEDB] font-serif shadow-sm"
              >
                <Heart className="w-3 h-3 text-[#D65D65] fill-[#D65D65]" />
                <span>{name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded Permanent QR Code Card for SBU Hacks Phone Scanning */}
      <div className="victorian-panel p-4 sm:p-6 relative shadow-xl">
        <span className="brass-rivet absolute top-2 left-2" />
        <span className="brass-rivet absolute top-2 right-2" />
        <span className="brass-rivet absolute bottom-2 left-2" />
        <span className="brass-rivet absolute bottom-2 right-2" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-left max-w-md">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#185244]/40 border border-[#2E8872]/60 text-[11px] font-mono text-[#44BBA4] shadow-sm">
              <Smartphone className="w-3.5 h-3.5" />
              <span>MOBILE WEB APP PWA</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-[#F4EEDB]">
              Open BrassLine on Your Phone
            </h3>
            <p className="text-xs text-[#C5A059]/90 font-serif italic leading-relaxed">
              Scan this code with your iPhone or Android camera to experience BrassLine live on mobile. Your phone does not need to be on the same Wi-Fi. Tap "Add to Home Screen" to install it.
            </p>

            <div className="flex items-center gap-2 pt-2 justify-center md:justify-start">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12080B] border border-[#8A6E2D] text-xs font-mono text-[#F3E5AB]">
                <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="truncate max-w-[200px]">{selectedQrUrl}</span>
              </div>
              <button
                onClick={handleCopyQr}
                className="p-2 rounded-lg bg-[#2B1117] hover:bg-[#38161E] border border-[#8A6E2D] text-[#F3E5AB] text-xs transition-colors shrink-0 shadow-sm"
                title="Copy link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#44BBA4]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* High-Contrast SVG QR Code (qrcode.react) with Brass Bezel Card */}
          <div className="p-3.5 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.8)] border-4 border-[#8A6E2D] shrink-0">
            <QRCodeSVG
              value={selectedQrUrl}
              size={180}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
              marginSize={4}
              className="block"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
