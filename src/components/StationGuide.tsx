import React, { useState } from 'react';
import { Station, LocalAttraction, BudgetTier, CommuterAccount } from '../types';
import {
  MapPin,
  Compass,
  Coffee,
  Utensils,
  Landmark,
  Trees,
  MessageSquareQuote,
  DollarSign,
  Tag,
  ExternalLink,
  Heart,
  Feather
} from 'lucide-react';

interface StationGuideProps {
  station: Station;
  profile?: CommuterAccount | null;
  onAskAboutPlace: (placeName: string) => void;
  onToggleFavoritePlace?: (placeName: string) => void;
}

export const StationGuide: React.FC<StationGuideProps> = ({
  station,
  profile,
  onAskAboutPlace,
  onToggleFavoritePlace
}) => {
  const [selectedBudget, setSelectedBudget] = useState<BudgetTier>('all');

  const stationDisplayName = station.name.endsWith('Station') ? station.name : `${station.name} Station`;

  const getCategoryIcon = (cat: LocalAttraction['category']) => {
    switch (cat) {
      case 'coffee':
        return <Coffee className="w-4 h-4 text-amber-300" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-rose-300" />;
      case 'culture':
        return <Landmark className="w-4 h-4 text-sky-300" />;
      case 'nature':
        return <Trees className="w-4 h-4 text-emerald-300" />;
      default:
        return <Compass className="w-4 h-4 text-amber-300" />;
    }
  };

  const favoritePlaces = profile?.favoritePlaceNames || [];

  const filteredAttractions = station.attractions.filter((spot) => {
    if (selectedBudget === 'all') return true;
    if (selectedBudget === 'favorites') return favoritePlaces.includes(spot.name);
    return spot.budgetTier === selectedBudget;
  });

  const budgetButtons: Array<{ id: BudgetTier; label: string }> = [
    { id: 'all', label: 'All Budgets' },
    { id: 'under-25', label: 'Under $25' },
    { id: '25-50', label: '$25 – $50' },
    { id: '50-plus', label: '$50+' },
    { id: 'free', label: 'Free' },
    { id: 'favorites', label: `★ Favorites (${favoritePlaces.length})` }
  ];

  return (
    <section className="victorian-panel p-4 sm:p-5 relative shadow-xl">
      {/* Corner Brass Rivets on Section Panel */}
      <span className="brass-rivet absolute top-2 left-2" />
      <span className="brass-rivet absolute top-2 right-2" />
      <span className="brass-rivet absolute bottom-2 left-2" />
      <span className="brass-rivet absolute bottom-2 right-2" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#8A6E2D]/50 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#2B1117] border border-[#8A6E2D] text-[#F3E5AB]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#F4EEDB] tracking-wide">
              Notable Establishments Near {stationDisplayName}
            </h2>
            <p className="text-xs text-[#C5A059]/90 font-serif italic">
              A Victorian gazetteer & postcard guide to local eateries, coffee roasters & sights within walking distance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-full bg-[#1F0C10] border border-[#8A6E2D] text-xs font-serif text-[#F3E5AB] shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Zone {station.zone} • {station.branch}</span>
        </div>
      </div>

      {/* Budget & Favorites Filter Buttons */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-serif uppercase tracking-wider text-[#C5A059] flex items-center gap-1 shrink-0 font-semibold">
          <DollarSign className="w-3.5 h-3.5 text-[#C5A059]" />
          Budget:
        </span>
        {budgetButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setSelectedBudget(btn.id)}
            className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all shrink-0 border ${
              selectedBudget === btn.id
                ? 'bg-gradient-to-r from-[#B5942F] to-[#C5A059] text-[#1C140E] border-[#F3E5AB] shadow-sm'
                : 'bg-[#2B1117] hover:bg-[#38161E] text-[#EDE4D0] hover:text-[#F3E5AB] border-[#8A6E2D]/60'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Attractions Grid - Styled as Antique Postcard / Gazetteer Cards */}
      {filteredAttractions.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#C5A059]/80 font-serif italic rounded-lg bg-[#1A0B0E] border-2 border-[#4E1D27] shadow-inner">
          {selectedBudget === 'favorites'
            ? 'No saved favorite places for this station yet. Click the heart icon on any place below to save it!'
            : `No destinations found in this budget category for ${station.name}. Try selecting "All Budgets".`}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredAttractions.map((spot, i) => {
            const isFav = favoritePlaces.includes(spot.name);

            return (
              <div
                key={i}
                className="parchment-card p-4 rounded-xl border-2 border-[#8A6E2D] relative shadow-md flex flex-col justify-between group overflow-hidden"
              >
                {/* Brass Corner Rivets */}
                <span className="brass-rivet absolute top-1.5 left-1.5 opacity-70" />
                <span className="brass-rivet absolute top-1.5 right-1.5 opacity-70" />
                <span className="brass-rivet absolute bottom-1.5 left-1.5 opacity-70" />
                <span className="brass-rivet absolute bottom-1.5 right-1.5 opacity-70" />

                {/* Vintage Postcard Stamp & Cancellation Postmark */}
                <div className="absolute top-2.5 right-6 flex items-center gap-1.5 opacity-85 select-none pointer-events-none">
                  <div className="px-1.5 py-0.5 border border-dashed border-[#8A6E2D] bg-[#F4EEDB] rounded text-[8px] font-mono text-[#691621] font-bold tracking-widest uppercase shadow-sm">
                    2¢ POST
                  </div>
                  <div className="w-6 h-6 rounded-full border border-[#8A6E2D] flex items-center justify-center text-[7px] font-serif text-[#7A5B1E] -rotate-12 bg-[#FAF6EB]/60">
                    LIRR
                  </div>
                </div>

                <div>
                  {/* Postcard Gazetteer Top Bar */}
                  <div className="flex items-center justify-between pr-20 mb-2 border-b border-[#D8CCA8] pb-1.5">
                    <span className="text-[9px] font-serif uppercase tracking-widest text-[#691621] font-bold">
                      Gazetteer Card No. {i + 1}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full verdigris-badge">
                      {spot.walkingMinutes} min walk
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#EDE4CC] border border-[#D8CCA8] text-[#8A6E2D]">
                        {getCategoryIcon(spot.category)}
                      </div>

                      <a
                        href={spot.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-serif font-bold text-sm text-[#1C140E] hover:text-[#691621] transition-colors flex items-center gap-1.5 group/link"
                        title={`Open official website for ${spot.name} in a new tab`}
                      >
                        <span className="group-hover/link:underline">{spot.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#8A6E2D] group-hover/link:text-[#691621] shrink-0" />
                      </a>
                    </div>

                    {onToggleFavoritePlace && (
                      <button
                        type="button"
                        onClick={() => onToggleFavoritePlace(spot.name)}
                        className={`p-1 rounded-md transition-colors shrink-0 ${
                          isFav
                            ? 'text-[#D65D65] bg-[#FDE8E8]'
                            : 'text-[#8A6E2D] hover:text-[#D65D65] bg-[#EDE4CC]'
                        }`}
                        title={isFav ? 'Remove from favorites' : 'Add to favorite places'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-[#D65D65]' : ''}`} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-[#48392F] font-sans leading-relaxed mb-2.5">
                    {spot.description}
                  </p>

                  {/* Price Estimate & Category Badge */}
                  <div className="flex items-center justify-between text-xs font-serif text-[#8A6E2D] mb-2.5 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-[#8A6E2D]" />
                      Est. Cost: <strong className="text-[#1C140E] font-mono">{spot.priceEstimate}</strong>
                    </span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#EDE4CC] border border-[#D8CCA8] text-[#48392F]">
                      {spot.budgetTier === 'under-25'
                        ? 'Under $25'
                        : spot.budgetTier === '25-50'
                        ? '$25-$50'
                        : spot.budgetTier === '50-plus'
                        ? '$50+'
                        : 'Free'}
                    </span>
                  </div>

                  {/* One-Line Stationmaster Remark */}
                  <div className="p-2.5 rounded-lg bg-[#FAF6EB] border-l-4 border-[#8A6E2D] border border-[#D8CCA8] shadow-sm mb-3 text-left">
                    <div className="flex items-center gap-1 text-[10px] font-serif font-bold uppercase tracking-wider text-[#691621] mb-1">
                      <Feather className="w-3 h-3 text-[#691621]" />
                      <span>Stationmaster's Remark</span>
                    </div>
                    <p className="text-xs text-[#2B1B10] font-serif italic leading-snug">
                      "{spot.victorianTip}"
                    </p>
                  </div>
                </div>

                {/* Actions: Visit Website & Ask Conductor */}
                <div className="flex items-center justify-between pt-2 border-t border-[#D8CCA8] mt-1">
                  <a
                    href={spot.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#6B5749] hover:text-[#1C140E] font-serif flex items-center gap-1 hover:underline font-semibold"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => onAskAboutPlace(spot.name)}
                    className="flex items-center gap-1.5 text-xs text-[#185244] hover:text-[#2E8872] font-serif font-bold hover:underline"
                  >
                    <MessageSquareQuote className="w-3.5 h-3.5 text-[#2E8872]" />
                    <span>Ask Conductor</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
