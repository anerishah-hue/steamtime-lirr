import React, { useState, useEffect } from 'react';
import { STATIONS } from './data/stations';
import { Station, TrainDeparture, CommuterAccount, AvoidanceMetrics } from './types';
import { generateSchedules, applyRealtimeUpdates, RealtimeTrainUpdate } from './utils/scheduleGenerator';
import { calculateAvoidanceMetrics } from './utils/calculations';
import { Header } from './components/Header';
import { BoilerDashboard } from './components/BoilerDashboard';
import { SplitFlapBoard } from './components/SplitFlapBoard';
import { StationMasterChat } from './components/StationMasterChat';
import { StationGuide } from './components/StationGuide';
import { AccountPage } from './components/AccountPage';
import { QRCodeModal } from './components/QRCodeModal';
import { ServiceAlertsTicker } from './components/ServiceAlertsTicker';
import { ActiveTripView } from './components/ActiveTripView';
import { SystemMap } from './components/SystemMap';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorPage } from './components/ErrorPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VoiceProvider } from './context/VoiceContext';
import { Train, Gauge, Bot, Compass, User, Smartphone, Map as MapIcon, AlertTriangle } from 'lucide-react';

type TabType = 'timetable' | 'boiler' | 'map' | 'chat' | 'guide' | 'account' | '404';

function MainApp() {
  const [origin, setOrigin] = useState<Station>(STATIONS[0]); // Stony Brook
  const [destination, setDestination] = useState<Station>(STATIONS[6]); // Penn Station
  const [targetTime, setTargetTime] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [departures, setDepartures] = useState<TrainDeparture[]>([]);
  const [realtimeMap, setRealtimeMap] = useState<Record<string, RealtimeTrainUpdate>>({});
  const [activeTrip, setActiveTrip] = useState<TrainDeparture | null>(null);
  const [prefilledChatQuery, setPrefilledChatQuery] = useState<string>('');

  // Initial boiler stoking loading screen state
  const [isBoilerStoking, setIsBoilerStoking] = useState<boolean>(true);

  // Check if current browser URL points to an invalid/404 route
  const [isNotFoundPath, setIsNotFoundPath] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    return path !== '/' && path !== '' && path !== '/index.html';
  });

  const [metrics, setMetrics] = useState<AvoidanceMetrics>({
    tollsSaved: 26.06,
    trafficMinutesSaved: 65,
    fuelSaved: 19.8,
    carbonLbsSaved: 41.1,
    steamUnits: 11.7,
    methodologyNotes: {
      tollsBreakdown: '',
      trafficBreakdown: '',
      fuelBreakdown: '',
      carbonBreakdown: ''
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('timetable');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Account profile state from localStorage with default fallbacks
  const [profile, setProfile] = useState<CommuterAccount>(() => {
    try {
      const saved =
        localStorage.getItem('brassline_commuter_account') ||
        localStorage.getItem('steamtime_commuter_account') ||
        localStorage.getItem('steamtime_commuter_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sanitize legacy or demo discount percentages to match official MTA fare rules
        if (parsed.role === 'senior') {
          parsed.fareDiscountPercent = 50;
        } else if (parsed.role === 'child') {
          parsed.fareDiscountPercent = 100;
        } else {
          parsed.fareDiscountPercent = 0;
          if (parsed.role !== 'standard' && parsed.role !== 'frequent' && parsed.role !== 'student') {
            parsed.role = 'standard';
          }
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return {
      name: 'Alex Morgan',
      gender: 'unspecified',
      role: 'standard',
      homeStation: 'Stony Brook',
      frequentDestination: 'New York Penn Station',
      fareDiscountPercent: 0,
      customPerks: ['Standard MTA Tariff', 'Valid on all peak & off-peak runs', 'TrainTime mobile ticketing'],
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      accountNumber: 'LIRR-582914',
      favoriteStationIds: ['stony-brook', 'penn-station', 'port-jefferson'],
      favoritePlaceNames: ["Dunkin'", "Druthers Coffee & Roasters", "Tara Inn"],
      recentTrips: [
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
      stationVisitCounts: {
        'stony-brook': 14,
        'penn-station': 12,
        'jamaica': 8,
        'port-jefferson': 5,
        'huntington': 4
      }
    };
  });

  // Fetch live GTFS-RT feed updates
  const fetchRealtimeData = async () => {
    try {
      const res = await fetch('/api/gtfs-rt');
      if (res.ok) {
        const json = await res.json();
        if (json.trains) {
          setRealtimeMap(json.trains);
          return json.trains as Record<string, RealtimeTrainUpdate>;
        }
      }
    } catch (e) {
      console.warn('[Realtime] GTFS-RT fetch error:', e);
    }
    return null;
  };

  // Poll live GTFS-RT every 30 seconds
  useEffect(() => {
    fetchRealtimeData();
    const interval = setInterval(() => {
      fetchRealtimeData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Regenerate departures and avoidance metrics when stations, target time, service date, or realtime data change
  useEffect(() => {
    const rawDepartures = generateSchedules(origin, destination, targetTime, selectedDate);
    const updated = applyRealtimeUpdates(rawDepartures, realtimeMap);
    setDepartures(updated);

    const newMetrics = calculateAvoidanceMetrics(origin, destination, true);
    setMetrics(newMetrics);
  }, [origin, destination, targetTime, selectedDate, realtimeMap]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const freshRt = await fetchRealtimeData();
    const rawDepartures = generateSchedules(origin, destination, targetTime, selectedDate);
    setDepartures(applyRealtimeUpdates(rawDepartures, freshRt || realtimeMap));
    setIsRefreshing(false);
  };

  const handleSwapStations = () => {
    const prevOrigin = origin;
    setOrigin(destination);
    setDestination(prevOrigin);
  };

  const handleSaveProfile = (newProfile: CommuterAccount) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('brassline_commuter_account', JSON.stringify(newProfile));
      localStorage.setItem('steamtime_commuter_account', JSON.stringify(newProfile));
    } catch (e) {
      console.warn(e);
    }
  };

  // Requirement 7: Favorite Stations Toggle
  const handleToggleFavoriteStation = (stationId: string) => {
    const currentFavs = profile.favoriteStationIds || [];
    const isFav = currentFavs.includes(stationId);
    const updatedFavs = isFav
      ? currentFavs.filter((id) => id !== stationId)
      : [...currentFavs, stationId];

    const updatedProfile = {
      ...profile,
      favoriteStationIds: updatedFavs
    };
    handleSaveProfile(updatedProfile);
  };

  // Requirement 7: Favorite Places Toggle
  const handleToggleFavoritePlace = (placeName: string) => {
    const currentFavs = profile.favoritePlaceNames || [];
    const isFav = currentFavs.includes(placeName);
    const updatedFavs = isFav
      ? currentFavs.filter((name) => name !== placeName)
      : [...currentFavs, placeName];

    const updatedProfile = {
      ...profile,
      favoritePlaceNames: updatedFavs
    };
    handleSaveProfile(updatedProfile);
  };

  // Requirement 8: Launch Active Trip Mode ("GO")
  const handleLaunchTrip = (train: TrainDeparture) => {
    setActiveTrip(train);

    // Record to recent trips and increment station visit count (Requirement 6)
    const newRecentTrip = {
      originId: origin.id,
      originName: origin.name,
      destinationId: destination.id,
      destinationName: destination.name,
      timestamp: `Today at ${train.departureTime}`
    };

    const currentVisits = { ...(profile.stationVisitCounts || {}) };
    currentVisits[origin.id] = (currentVisits[origin.id] || 0) + 1;
    currentVisits[destination.id] = (currentVisits[destination.id] || 0) + 1;

    const existingTrips = profile.recentTrips || [];
    const updatedTrips = [
      newRecentTrip,
      ...existingTrips.filter(
        (t) => !(t.originId === origin.id && t.destinationId === destination.id)
      )
    ].slice(0, 10);

    const updatedProfile = {
      ...profile,
      recentTrips: updatedTrips,
      stationVisitCounts: currentVisits
    };
    handleSaveProfile(updatedProfile);
  };

  // Requirement 6: Rerun a recent trip
  const handleSelectRoute = (originId: string, destId: string) => {
    const foundOrigin = STATIONS.find((s) => s.id === originId);
    const foundDest = STATIONS.find((s) => s.id === destId);
    if (foundOrigin) setOrigin(foundOrigin);
    if (foundDest) setDestination(foundDest);
    setActiveTab('timetable');
    setActiveTrip(null);
  };

  const handleAskConductorFromTrip = (query: string) => {
    setPrefilledChatQuery(query);
    setActiveTab('chat');
  };

  // Bottom navigation items (Including Requirement 2: System Map)
  const navItems: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'timetable', label: 'Schedule', icon: Train },
    { id: 'boiler', label: 'Dynamo', icon: Gauge },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'chat', label: 'Conductor', icon: Bot },
    { id: 'guide', label: 'Vicinity', icon: Compass },
    { id: 'account', label: 'Ledger', icon: User }
  ];

  const renderTabContent = (isHandsetMode: boolean = false) => {
    switch (activeTab) {
      case 'timetable':
        return (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {/* Requirement 4: News/updates/cancellations easily visible */}
            <ServiceAlertsTicker />

            {/* Requirement 8: Active Trip Mode if user clicked "GO" */}
            {activeTrip ? (
              <ActiveTripView
                train={activeTrip}
                origin={origin}
                destination={destination}
                stations={STATIONS}
                onExitTrip={() => setActiveTrip(null)}
                onAskConductor={handleAskConductorFromTrip}
              />
            ) : (
              <>
                <SplitFlapBoard
                  stations={STATIONS}
                  origin={origin}
                  destination={destination}
                  departures={departures}
                  profile={profile}
                  targetTime={targetTime}
                  selectedDate={selectedDate}
                  onSelectOrigin={setOrigin}
                  onSelectDestination={setDestination}
                  onSwapStations={handleSwapStations}
                  onUpdateTime={(time) => setTargetTime(time)}
                  onSelectDate={(date) => setSelectedDate(date)}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                  onLaunchTrip={handleLaunchTrip}
                  onToggleFavoriteStation={handleToggleFavoriteStation}
                />
                <BoilerDashboard
                  metrics={metrics}
                  origin={origin}
                  destination={destination}
                  isHandset={isHandsetMode}
                />
              </>
            )}
          </div>
        );

      case 'boiler':
        return (
          <div className="animate-in fade-in duration-200">
            <BoilerDashboard
              metrics={metrics}
              origin={origin}
              destination={destination}
              isHandset={isHandsetMode}
            />
          </div>
        );

      case 'map':
        return (
          <div className="animate-in fade-in duration-200 space-y-4">
            <SystemMap
              stations={STATIONS}
              origin={origin}
              destination={destination}
              departures={departures}
              activeTrain={activeTrip}
              onSelectOrigin={setOrigin}
              onSelectDestination={setDestination}
            />
          </div>
        );

      case 'chat':
        return (
          <div className="animate-in fade-in duration-200">
            <StationMasterChat
              origin={origin}
              destination={destination}
              departures={departures}
              selectedDate={selectedDate}
              profile={profile}
              prefilledQuery={prefilledChatQuery}
              onOpenProfileModal={() => setActiveTab('account')}
            />
          </div>
        );

      case 'guide':
        return (
          <div className="animate-in fade-in duration-200">
            <StationGuide
              station={origin}
              profile={profile}
              onAskAboutPlace={(place) => {
                setPrefilledChatQuery(`Tell me about ${place} near ${origin.name} station, its walking distance, and what food or sights you recommend.`);
                setActiveTab('chat');
              }}
              onToggleFavoritePlace={handleToggleFavoritePlace}
            />
          </div>
        );

      case 'account':
        return (
          <div className="animate-in fade-in duration-200">
            <AccountPage
              currentProfile={profile}
              onSaveProfile={handleSaveProfile}
              onSelectRoute={handleSelectRoute}
              origin={origin}
              destination={destination}
              onSelectOrigin={setOrigin}
              onSelectDestination={setDestination}
              isHandset={isHandsetMode}
            />
          </div>
        );

      case '404':
        return (
          <div className="animate-in fade-in duration-200">
            <ErrorPage
              onReturnHome={() => {
                setActiveTab('timetable');
                setIsNotFoundPath(false);
                if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
              }}
              onAskStationmaster={(query) => {
                setIsNotFoundPath(false);
                setPrefilledChatQuery(query);
                setActiveTab('chat');
              }}
            />
          </div>
        );
    }
  };

  // 1. Initial Boiler Stoking Loading Screen
  if (isBoilerStoking) {
    return (
      <LoadingScreen
        onComplete={() => setIsBoilerStoking(false)}
        message="Stoking the boiler..."
      />
    );
  }

  // 2. Direct 404 / Blocked Track URL route handling
  if (isNotFoundPath) {
    return (
      <div className="min-h-screen iron-grain-bg text-[#EDE4D0] flex flex-col antialiased">
        <Header
          profile={profile}
          onOpenProfile={() => {
            setIsNotFoundPath(false);
            setActiveTab('account');
          }}
          onOpenQR={() => setShowQRModal(true)}
          onGoHome={() => {
            setIsNotFoundPath(false);
            setActiveTab('timetable');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
          }}
          isMobileFrame={isMobileFrame}
          onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
        />
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 flex items-center justify-center">
          <ErrorPage
            onReturnHome={() => {
              setIsNotFoundPath(false);
              setActiveTab('timetable');
              if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
            }}
            onAskStationmaster={(query) => {
              setIsNotFoundPath(false);
              setPrefilledChatQuery(query);
              setActiveTab('chat');
            }}
          />
        </main>
      </div>
    );
  }

  // Handset Frame View (When user clicks "Handset" button on desktop)
  if (isMobileFrame) {
    return (
      <div className="min-h-screen iron-grain-bg text-[#EDE4D0] flex flex-col items-center justify-center p-2 sm:p-4">
        {/* Frame Top Controls */}
        <div className="mb-2 flex items-center justify-between w-full max-w-[400px] px-2 text-xs text-[#C5A059]/80">
          <span className="font-serif text-[11px] flex items-center gap-1.5 text-[#F3E5AB]">
            <Smartphone className="w-3.5 h-3.5 text-[#C5A059]" />
            Handset View Mode
          </span>
          <button
            onClick={() => setIsMobileFrame(false)}
            className="hover:text-[#F3E5AB] text-[#C5A059] text-[11px] font-serif underline"
          >
            Exit to Full Screen
          </button>
        </div>

        {/* Handset Mockup Container with internal scroll and pinned nav */}
        <div className="w-full max-w-[400px] h-[86vh] max-h-[820px] rounded-[38px] border-4 border-[#8A6E2D] bg-[#12080B] shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative">
          {/* Header */}
          <Header
            profile={profile}
            onOpenProfile={() => setActiveTab('account')}
            onOpenQR={() => setShowQRModal(true)}
            onGoHome={() => {
              setActiveTab('timetable');
              setActiveTrip(null);
            }}
            isMobileFrame={isMobileFrame}
            onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
          />

          {/* Handset Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-2.5 pb-20">
            {renderTabContent(true)}
          </div>

          {/* Handset Fixed Bottom Navigation */}
          <nav className="absolute bottom-0 left-0 right-0 z-40 bg-[#180A0E]/95 backdrop-blur-md border-t-2 border-[#8A6E2D]/50 px-1 py-1.5">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                    }}
                    className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition-all ${
                      isActive ? 'text-[#F3E5AB] bg-[#C5A059]/15' : 'text-[#C5A059]/70 hover:text-[#F3E5AB]'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px] font-serif font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* QR Code Modal for quick popup */}
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
        />
      </div>
    );
  }

  // Full Screen Desktop & Mobile View
  return (
    <div className="min-h-screen iron-grain-bg text-[#EDE4D0] flex flex-col antialiased">
      {/* Header */}
      <Header
        profile={profile}
        onOpenProfile={() => setActiveTab('account')}
        onOpenQR={() => setShowQRModal(true)}
        onGoHome={() => {
          setActiveTab('timetable');
          setActiveTrip(null);
        }}
        isMobileFrame={isMobileFrame}
        onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
      />

      {/* Main Full-Width Stage (Clean margins, no side gap, full scrolling at 100% zoom) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 pb-28 md:pb-32">
        {renderTabContent(false)}

        {/* Victorian Footer Console */}
        <footer className="mt-8 pt-4 border-t border-[#8A6E2D]/30 flex flex-wrap items-center justify-between text-[11px] font-serif text-[#C5A059]/70 gap-2 select-none">
          <span>BrassLine • Long Island Rail Road • Founded 1834 • Every line, right on time</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === '404' ? 'timetable' : '404')}
              className="text-[#8A6E2D] hover:text-[#D65D65] transition-colors underline flex items-center gap-1 cursor-pointer"
              title="Test the 404 blocked track cow page"
            >
              <AlertTriangle className="w-3 h-3 text-[#C5A059]" />
              <span>{activeTab === '404' ? 'Return to Schedule' : 'Simulate Blocked Line (Cow)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBoilerStoking(true)}
              className="text-[#8A6E2D] hover:text-[#F3E5AB] transition-colors underline cursor-pointer"
              title="Re-run boiler stoking loading screen"
            >
              Re-stoke Boiler
            </button>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation Console (App-Like on Mobile & Tablets) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#180A0E]/95 backdrop-blur-md border-t-2 border-[#8A6E2D]/50 px-3 py-2 shadow-2xl">
        <div className="max-w-xl mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all ${
                  isActive
                    ? 'text-[#F3E5AB] bg-[#C5A059]/20 border border-[#8A6E2D]/60'
                    : 'text-[#C5A059]/70 hover:text-[#F3E5AB]'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] font-serif font-bold tracking-wide">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <VoiceProvider>
      <ErrorBoundary>
        <MainApp />
      </ErrorBoundary>
    </VoiceProvider>
  );
}

export default App;
