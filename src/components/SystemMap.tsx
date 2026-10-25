import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { Station, TrainDeparture, LiveTrainVehicle } from '../types';
import { Compass, Radio, RotateCcw, Filter, Layers } from 'lucide-react';
import rawStops from '../data/gtfsStops.json';
import rawLineShapes from '../data/gtfsLineShapes.json';

interface GtfsStopItem {
  stop_id: string;
  stop_code: string;
  stop_name: string;
  lat: number;
  lon: number;
  stop_url?: string;
  wheelchair_boarding?: string;
}

interface LineShapesConfig {
  portJefferson: [number, number][];
  ronkonkoma: [number, number][];
  mainLinePennToHicksville: [number, number][];
  atlanticBranch: [number, number][];
  grandCentralBranch: [number, number][];
}

const gtfsStops = rawStops as GtfsStopItem[];
const lineShapes = rawLineShapes as unknown as LineShapesConfig;

// Frame Manhattan through Port Jefferson, Long Island Sound, and Ronkonkoma
const LONG_ISLAND_BOUNDS: [[number, number], [number, number]] = [
  [40.63, -74.06], // Southwest: Manhattan/Brooklyn/Atlantic
  [40.99, -73.01]  // Northeast: Port Jefferson/Long Island Sound
];

const INITIAL_CENTER: [number, number] = [40.82, -73.53];
const INITIAL_ZOOM = 10;

// The 6 major stops specified to have permanent labels without overlapping
const MAJOR_STATION_STOP_IDS = new Set(['237', '349', '102', '91', '14', '164']);

/**
 * Authentic Victorian Cartographic SVG Compass Rose for the parchment railway chart.
 */
const SvgCompassRose: React.FC = () => {
  return (
    <div
      className="absolute top-3 right-3 z-[400] pointer-events-none select-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
      title="Victorian Cartographic Compass Rose"
    >
      <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 opacity-95">
        <defs>
          <radialGradient id="compassParchmentFace" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FAF6EB" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#F4EEDB" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#DDD2B5" stopOpacity="0.95" />
          </radialGradient>
          <linearGradient id="compassGoldBezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3E5AB" />
            <stop offset="50%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#7A5B1E" />
          </linearGradient>
        </defs>

        {/* Outer Brass Ring & Parchment Face */}
        <circle cx="50" cy="50" r="46" fill="url(#compassParchmentFace)" stroke="#7A5B1E" strokeWidth="2" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8A6E2D" strokeWidth="0.8" strokeDasharray="1.5 2.5" />
        <circle cx="50" cy="50" r="39" fill="none" stroke="#7A5B1E" strokeWidth="0.75" />

        {/* Diagonal Secondary Points (NE, SE, SW, NW) */}
        <g transform="rotate(45 50 50)">
          <polygon points="50,50 47.5,50 50,22" fill="#7A5B1E" opacity="0.85" />
          <polygon points="50,50 52.5,50 50,22" fill="#C5A059" opacity="0.85" />
          <polygon points="50,50 47.5,50 50,78" fill="#7A5B1E" opacity="0.85" />
          <polygon points="50,50 52.5,50 50,78" fill="#C5A059" opacity="0.85" />
          <polygon points="50,50 50,47.5 22,50" fill="#7A5B1E" opacity="0.85" />
          <polygon points="50,50 50,52.5 22,50" fill="#C5A059" opacity="0.85" />
          <polygon points="50,50 50,47.5 78,50" fill="#7A5B1E" opacity="0.85" />
          <polygon points="50,50 50,52.5 78,50" fill="#C5A059" opacity="0.85" />
        </g>

        {/* Primary Cardinal Points (N, S, E, W) */}
        {/* North Arrow Point in Deep Crimson & Gold */}
        <polygon points="50,50 46,50 50,11" fill="#691621" />
        <polygon points="50,50 54,50 50,11" fill="#992331" />
        {/* South Point */}
        <polygon points="50,50 46,50 50,89" fill="#5A4315" />
        <polygon points="50,50 54,50 50,89" fill="#C5A059" />
        {/* West Point */}
        <polygon points="50,50 50,46 11,50" fill="#5A4315" />
        <polygon points="50,50 50,54 11,50" fill="#C5A059" />
        {/* East Point */}
        <polygon points="50,50 50,46 89,50" fill="#5A4315" />
        <polygon points="50,50 50,54 89,50" fill="#C5A059" />

        {/* Cardinal Letters in Victorian Serif */}
        <text x="50" y="8.5" textAnchor="middle" fontSize="9" fontWeight="900" fontFamily="'IM Fell English', serif" fill="#691621">N</text>
        <text x="94" y="52.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fontFamily="'IM Fell English', serif" fill="#1C140E">E</text>
        <text x="50" y="97" textAnchor="middle" fontSize="7.5" fontWeight="bold" fontFamily="'IM Fell English', serif" fill="#1C140E">S</text>
        <text x="6" y="52.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fontFamily="'IM Fell English', serif" fill="#1C140E">W</text>

        {/* Center Brass Cap */}
        <circle cx="50" cy="50" r="4" fill="url(#compassGoldBezel)" stroke="#3D290F" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="1.5" fill="#1C140E" />
      </svg>
    </div>
  );
};

interface SystemMapProps {
  stations: Station[];
  origin: Station;
  destination: Station;
  departures?: TrainDeparture[];
  activeTrain?: TrainDeparture | null;
  onSelectOrigin: (st: Station) => void;
  onSelectDestination: (st: Station) => void;
}

// Controller component to frame bounds and handle touch resizes
function MapViewController() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.fitBounds(LONG_ISLAND_BOUNDS, {
      padding: [15, 15],
      maxZoom: 11
    });
  }, [map]);

  return null;
}

// Tracks current zoom level to conditionally show train labels
function ZoomTracker({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    }
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

// Helper to determine which GTFS route IDs serve the selected origin & destination corridor
function getCorridorRouteIds(origin: Station, dest: Station): Set<string> {
  const routes = new Set<string>();
  const origName = (origin.name || '').toLowerCase();
  const origBranch = (origin.branch || '').toLowerCase();
  const destName = (dest.name || '').toLowerCase();
  const destBranch = (dest.branch || '').toLowerCase();

  // Port Jefferson branch (Route 10)
  if (
    origBranch.includes('port jeff') ||
    destBranch.includes('port jeff') ||
    origName.includes('stony') ||
    destName.includes('stony') ||
    origName.includes('port jeff') ||
    destName.includes('port jeff') ||
    origName.includes('huntington') ||
    destName.includes('huntington')
  ) {
    routes.add('10');
  }

  // Ronkonkoma branch (Route 4)
  if (
    origBranch.includes('ronkonkoma') ||
    destBranch.includes('ronkonkoma') ||
    origName.includes('ronkonkoma') ||
    destName.includes('ronkonkoma')
  ) {
    routes.add('4');
  }

  // City Terminals & Main Line (Route 12 & Route 4 trunk)
  routes.add('12');
  routes.add('4');

  return routes;
}

export const SystemMap: React.FC<SystemMapProps> = ({
  stations,
  origin,
  destination,
  departures = [],
  activeTrain,
  onSelectOrigin,
  onSelectDestination
}) => {
  const [liveVehicles, setLiveVehicles] = useState<LiveTrainVehicle[]>([]);
  const [hasLivePositions, setHasLivePositions] = useState<boolean>(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(INITIAL_ZOOM);

  // Train filter toggle: 'route' (default, reduces clutter) or 'all'
  const [trainFilter, setTrainFilter] = useState<'route' | 'all'>('route');

  // Tile layer source: 'osm' (watermark-free with dark steam filter) or 'carto'
  const [useOsmTiles, setUseOsmTiles] = useState<boolean>(true);

  // Poll GTFS-RT feed for live train coordinates
  useEffect(() => {
    let isMounted = true;

    const fetchLiveTelemetry = async () => {
      try {
        const res = await fetch('/api/gtfs-rt');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          if (data.vehicles && Array.isArray(data.vehicles) && data.vehicles.length > 0) {
            setLiveVehicles(data.vehicles);
            setHasLivePositions(true);
          } else {
            setLiveVehicles([]);
            setHasLivePositions(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setHasLivePositions(false);
        }
      }
    };

    fetchLiveTelemetry();
    const intervalId = setInterval(fetchLiveTelemetry, 15000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleZoomChange = useCallback((z: number) => {
    setCurrentZoom(z);
  }, []);

  // Quick reset back to full Long Island framing
  const handleResetView = () => {
    if (mapInstance) {
      mapInstance.fitBounds(LONG_ISLAND_BOUNDS, {
        padding: [15, 15],
        maxZoom: 11
      });
    }
  };

  // Find or create Station object when a map marker is clicked
  const handleMarkerClick = (stop: GtfsStopItem) => {
    const matched = stations.find((s) => {
      if (s.stopId && s.stopId === stop.stop_id) return true;
      if (s.name.toLowerCase() === stop.stop_name.toLowerCase()) return true;
      if (stop.stop_name === 'Grand Central' && s.id === 'grand-central-madison') return true;
      if (stop.stop_name.includes('Penn') && s.id === 'penn-station') return true;
      return false;
    });

    const targetStation: Station = matched || {
      id: `stop-${stop.stop_id}`,
      name: stop.stop_name === 'Grand Central' ? 'Grand Central Madison' : stop.stop_name,
      branch: 'Long Island Rail Road',
      zone: 7,
      accessible: stop.wheelchair_boarding === '1',
      distanceFromPennMiles: 0,
      lat: stop.lat,
      lon: stop.lon,
      stopId: stop.stop_id,
      attractions: []
    };

    if (targetStation.id !== origin.id) {
      onSelectDestination(targetStation);
    } else {
      onSelectOrigin(targetStation);
    }
  };

  // Check if a GTFS stop is currently selected origin or destination
  const checkIsOrigin = (stop: GtfsStopItem) => {
    if (origin.stopId && origin.stopId === stop.stop_id) return true;
    if (origin.name.toLowerCase() === stop.stop_name.toLowerCase()) return true;
    if (stop.stop_name === 'Grand Central' && origin.id === 'grand-central-madison') return true;
    if (stop.stop_name.includes('Penn') && origin.id === 'penn-station') return true;
    return false;
  };

  const checkIsDestination = (stop: GtfsStopItem) => {
    if (destination.stopId && destination.stopId === stop.stop_id) return true;
    if (destination.name.toLowerCase() === stop.stop_name.toLowerCase()) return true;
    if (stop.stop_name === 'Grand Central' && destination.id === 'grand-central-madison') return true;
    if (stop.stop_name.includes('Penn') && destination.id === 'penn-station') return true;
    return false;
  };

  // Station markers: Styled as engraved railway chart depot pins
  const getStationIcon = (isOrigin: boolean, isDest: boolean, isMajor: boolean) => {
    if (isOrigin) {
      return L.divIcon({
        className: 'custom-station-icon origin-selected',
        html: `
          <div class="relative flex items-center justify-center w-6 h-6">
            <div class="absolute inset-0 rounded-full bg-emerald-600 opacity-60 animate-station-pulse"></div>
            <div class="w-3.5 h-3.5 rounded-full bg-[#185244] border-2 border-[#F8F4E8] shadow-lg"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    }

    if (isDest) {
      return L.divIcon({
        className: 'custom-station-icon dest-selected',
        html: `
          <div class="relative flex items-center justify-center w-6 h-6">
            <div class="absolute inset-0 rounded-full bg-amber-600 opacity-60 animate-station-pulse"></div>
            <div class="w-3.5 h-3.5 rounded-full bg-[#8A1A24] border-2 border-[#F8F4E8] shadow-lg"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    }

    if (isMajor) {
      return L.divIcon({
        className: 'custom-station-icon major-station',
        html: `
          <div class="w-3.5 h-3.5 rounded-full bg-[#F4EEDB] border-2 border-[#1C140E] shadow hover:scale-125 transition-transform flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-[#8A6E2D]"></div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
    }

    return L.divIcon({
      className: 'custom-station-icon minor-station',
      html: `
        <div class="w-2.5 h-2.5 rounded-full bg-[#1C140E] border border-[#F4EEDB] hover:scale-150 transition-transform"></div>
      `,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });
  };

  // Small Victorian steam locomotive icon moving along the tracks
  const getTrainIcon = (trainNum: string, isZoomedIn: boolean) => {
    return L.divIcon({
      className: 'custom-train-marker',
      html: `
        <div class="relative flex items-center group cursor-pointer" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
          <div class="w-6 h-6 rounded-full bg-[#1F0C10] border-1.5 border-[#C5A059] flex items-center justify-center shadow-md hover:scale-125 transition-transform">
            <!-- Victorian Steam Locomotive Silhouette SVG -->
            <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-[#F3E5AB]" fill="currentColor" aria-hidden="true">
              <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
          </div>
          ${
            isZoomedIn
              ? `<span class="ml-1 px-1.5 py-0.5 rounded bg-[#180A0E] text-[10px] font-mono font-bold text-[#F3E5AB] border border-[#8A6E2D] whitespace-nowrap shadow-md pointer-events-none">#${trainNum}</span>`
              : ''
          }
        </div>
      `,
      iconSize: isZoomedIn ? [60, 24] : [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Extract train numbers of upcoming timetable departures and active run
  const departuresTrainNums = useMemo(() => {
    const set = new Set<string>();
    if (departures) {
      for (const d of departures) {
        if (d.trainNumber) set.add(d.trainNumber);
        const match = d.trainNumber.match(/\d+/);
        if (match) set.add(match[0]);
      }
    }
    if (activeTrain?.trainNumber) {
      set.add(activeTrain.trainNumber);
      const match = activeTrain.trainNumber.match(/\d+/);
      if (match) set.add(match[0]);
    }
    return set;
  }, [departures, activeTrain]);

  // Filter live vehicles: Selected route (default) vs All trains
  const filteredVehicles = useMemo(() => {
    if (trainFilter === 'all') {
      return liveVehicles;
    }

    const corridorRoutes = getCorridorRouteIds(origin, destination);

    return liveVehicles.filter((v) => {
      // 1. Direct match with current timetable departures
      if (departuresTrainNums.has(v.trainNumber)) {
        return true;
      }
      // 2. Belongs to the corridor branch (e.g. Route 10 for Port Jeff, Route 12 for City Terminals)
      if (v.routeId && corridorRoutes.has(v.routeId)) {
        return true;
      }
      return false;
    });
  }, [trainFilter, liveVehicles, origin, destination, departuresTrainNums]);

  // Only display small train icons moving along the tracks where real GTFS-RT positions exist
  const realGtfsVehicles = useMemo(() => {
    return filteredVehicles.filter(
      (v) =>
        v.source !== 'estimated' &&
        typeof v.lat === 'number' &&
        typeof v.lon === 'number' &&
        !isNaN(v.lat) &&
        !isNaN(v.lon)
    );
  }, [filteredVehicles]);

  // Total count of real GTFS-RT vehicles system-wide
  const totalRealVehiclesCount = useMemo(() => {
    return liveVehicles.filter(
      (v) =>
        v.source !== 'estimated' &&
        typeof v.lat === 'number' &&
        typeof v.lon === 'number' &&
        !isNaN(v.lat) &&
        !isNaN(v.lon)
    ).length;
  }, [liveVehicles]);

  // Active route highlighting line connecting origin and destination
  const activeRouteCoords: [number, number][] = useMemo(() => {
    if (origin.id === destination.id) return [];
    if (origin.lat && origin.lon && destination.lat && destination.lon) {
      return [
        [origin.lat, origin.lon],
        [destination.lat, destination.lon]
      ];
    }
    return [];
  }, [origin, destination]);

  const isZoomedIn = currentZoom >= 13;

  return (
    <div className="victorian-panel p-3 sm:p-5 relative shadow-xl">
      <span className="brass-rivet absolute top-2 left-2" />
      <span className="brass-rivet absolute top-2 right-2" />
      <span className="brass-rivet absolute bottom-2 left-2" />
      <span className="brass-rivet absolute bottom-2 right-2" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b-2 border-[#8A6E2D]/50 gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#2B1117] border border-[#8A6E2D] text-[#F3E5AB]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#F4EEDB] tracking-wide">
                LONG ISLAND RAIL ROAD MAP
              </h2>
              {/* Only show live tracking badge if feed provides positions */}
              {realGtfsVehicles.length > 0 && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#185244]/50 border border-[#2E8872]/60 text-[10px] font-mono text-[#44BBA4] shadow-sm">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-[#2E8872]" />
                  Live train tracking active ({realGtfsVehicles.length} on corridor)
                </span>
              )}
            </div>
            <p className="text-xs text-[#C5A059]/90 font-serif italic">
              Real GTFS track alignment • Click station to select route • Tap train dot for telemetry
            </p>
          </div>
        </div>

        {/* Controls: Train Filter Toggle, Basemap Tile Toggle, Reset View */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg bg-[#180A0E] border border-[#8A6E2D]/80 p-0.5 text-xs font-serif">
            <button
              onClick={() => setTrainFilter('route')}
              className={`px-2.5 py-1 rounded transition-all font-bold ${
                trainFilter === 'route'
                  ? 'bg-gradient-to-r from-[#B5942F] to-[#C5A059] text-[#1C140E] shadow'
                  : 'text-[#C5A059] hover:text-[#F3E5AB]'
              }`}
              title="Show only trains serving the selected route corridor"
            >
              Selected route ({realGtfsVehicles.length})
            </button>
            <button
              onClick={() => setTrainFilter('all')}
              className={`px-2.5 py-1 rounded transition-all font-bold ${
                trainFilter === 'all'
                  ? 'bg-gradient-to-r from-[#B5942F] to-[#C5A059] text-[#1C140E] shadow'
                  : 'text-[#C5A059] hover:text-[#F3E5AB]'
              }`}
              title="Show all active trains across the LIRR system"
            >
              All trains ({totalRealVehiclesCount})
            </button>
          </div>

          <button
            onClick={() => setUseOsmTiles(!useOsmTiles)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2B1117] border border-[#8A6E2D] hover:border-[#F3E5AB] text-[#F3E5AB] transition-colors text-xs font-serif"
            title="Toggle between Watermark-free Steam OSM tiles and CARTO tiles"
          >
            <Layers className="w-3 h-3 text-[#C5A059]" />
            {useOsmTiles ? 'OSM (No Watermark)' : 'CARTO'}
          </button>

          <button
            onClick={handleResetView}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2B1117] border border-[#8A6E2D] hover:border-[#F3E5AB] text-[#F3E5AB] transition-colors text-xs font-serif"
            title="Reset map view to full Long Island corridor"
          >
            <RotateCcw className="w-3 h-3 text-[#C5A059]" />
            Reset View
          </button>
        </div>
      </div>

      {/* Map Container with Victorian Parchment Aesthetic */}
      <div className="w-full h-[440px] sm:h-[540px] rounded-xl overflow-hidden border-2 border-[#8A6E2D] relative bg-[#EDE4CF] shadow-inner">
        {/* Authentic Victorian Cartographic Compass Rose in Corner */}
        <SvgCompassRose />

        <MapContainer
          center={INITIAL_CENTER}
          zoom={INITIAL_ZOOM}
          minZoom={9}
          maxZoom={17}
          touchZoom={true}
          scrollWheelZoom={true}
          ref={setMapInstance}
          className="w-full h-full"
        >
          <MapViewController />
          <ZoomTracker onZoomChange={handleZoomChange} />

          {/* Requirement: Real Leaflet Tile Layer with Visible Attribution */}
          {useOsmTiles ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains={['a', 'b', 'c', 'd']}
              maxZoom={19}
            />
          )}

          {/* 1. Track Geometry Polylines from shapes.txt with Ink-Style Colors */}
          {/* Main Line: Penn Station to Hicksville */}
          <Polyline
            positions={lineShapes.mainLinePennToHicksville}
            pathOptions={{
              color: '#2C1810',
              weight: 4.5,
              opacity: 0.88
            }}
          />

          {/* Grand Central Madison Branch to Jamaica */}
          <Polyline
            positions={lineShapes.grandCentralBranch}
            pathOptions={{
              color: '#691621',
              weight: 3.5,
              opacity: 0.88
            }}
          />

          {/* Brooklyn / Atlantic Branch to Jamaica */}
          <Polyline
            positions={lineShapes.atlanticBranch}
            pathOptions={{
              color: '#184D3B',
              weight: 3.5,
              opacity: 0.88
            }}
          />

          {/* Port Jefferson Branch: Hicksville through Huntington to Port Jefferson */}
          <Polyline
            positions={lineShapes.portJefferson}
            pathOptions={{
              color: '#163B54',
              weight: 4,
              opacity: 0.92
            }}
          />

          {/* Ronkonkoma Branch: Hicksville to Ronkonkoma */}
          <Polyline
            positions={lineShapes.ronkonkoma}
            pathOptions={{
              color: '#4A154B',
              weight: 4,
              opacity: 0.92
            }}
          />

          {/* 2. Active Route Highlight Line: Dashed Antique Brass Ink */}
          {activeRouteCoords.length === 2 && (
            <Polyline
              positions={activeRouteCoords}
              pathOptions={{
                color: '#A8791E',
                weight: 3.5,
                dashArray: '6 8',
                opacity: 0.95
              }}
            />
          )}

          {/* 3. Station Markers using GTFS stops.txt coordinates */}
          {gtfsStops.map((stop) => {
            const isOrigin = checkIsOrigin(stop);
            const isDest = checkIsDestination(stop);
            const isMajor = MAJOR_STATION_STOP_IDS.has(stop.stop_id);
            const icon = getStationIcon(isOrigin, isDest, isMajor);

            // Requirement 4: Keep permanent labels ONLY for the 6 major stops with offset for Penn & Grand Central
            let permanentConfig: {
              permanent: boolean;
              direction: 'top' | 'bottom' | 'left' | 'right';
              offset: [number, number];
              className: string;
              displayName: string;
            } | null = null;

            if (stop.stop_id === '237') {
              // Penn Station: offset downward/bottom to prevent collision with Grand Central Madison
              permanentConfig = {
                permanent: true,
                direction: 'bottom',
                offset: [0, 8],
                className: 'steam-label-permanent steam-label-penn',
                displayName: 'Penn Station'
              };
            } else if (stop.stop_id === '349') {
              // Grand Central Madison: offset upward/top
              permanentConfig = {
                permanent: true,
                direction: 'top',
                offset: [0, -8],
                className: 'steam-label-permanent steam-label-gcm',
                displayName: 'Grand Central Madison'
              };
            } else if (stop.stop_id === '102') {
              // Jamaica
              permanentConfig = {
                permanent: true,
                direction: 'top',
                offset: [0, -8],
                className: 'steam-label-permanent',
                displayName: 'Jamaica'
              };
            } else if (stop.stop_id === '91') {
              // Huntington
              permanentConfig = {
                permanent: true,
                direction: 'top',
                offset: [0, -8],
                className: 'steam-label-permanent',
                displayName: 'Huntington'
              };
            } else if (stop.stop_id === '14') {
              // Stony Brook
              permanentConfig = {
                permanent: true,
                direction: 'top',
                offset: [0, -8],
                className: 'steam-label-permanent',
                displayName: 'Stony Brook'
              };
            } else if (stop.stop_id === '164') {
              // Port Jefferson
              permanentConfig = {
                permanent: true,
                direction: 'bottom',
                offset: [0, 8],
                className: 'steam-label-permanent',
                displayName: 'Port Jefferson'
              };
            }

            return (
              <Marker
                key={stop.stop_id}
                position={[stop.lat, stop.lon]}
                icon={icon}
                eventHandlers={{
                  click: () => handleMarkerClick(stop)
                }}
              >
                {/* Permanent label for 6 major stops; non-permanent hover/tap tooltip for all others */}
                {permanentConfig ? (
                  <Tooltip
                    permanent={true}
                    direction={permanentConfig.direction}
                    offset={permanentConfig.offset}
                    className={permanentConfig.className}
                  >
                    {permanentConfig.displayName}
                  </Tooltip>
                ) : (
                  <Tooltip
                    direction="top"
                    offset={[0, -6]}
                    className="steam-tooltip"
                  >
                    <div className="text-center font-serif px-1 py-0.5">
                      <div className="font-bold text-[#691621] text-xs">{stop.stop_name}</div>
                      <div className="text-[9px] text-[#554030] italic font-serif mt-0.5">
                        {isOrigin ? 'Selected Origin' : isDest ? 'Selected Destination' : 'Click to select station'}
                      </div>
                    </div>
                  </Tooltip>
                )}
              </Marker>
            );
          })}

          {/* 4. Live Moving Train Markers: small train icons moving along the tracks ONLY where real GTFS-RT positions exist */}
          {realGtfsVehicles.map((vehicle) => {
            return (
              <Marker
                key={vehicle.id}
                position={[vehicle.lat, vehicle.lon]}
                icon={getTrainIcon(vehicle.trainNumber, isZoomedIn)}
                zIndexOffset={1000}
              >
                <Tooltip direction="top" offset={[0, -8]} className="steam-tooltip">
                  <div className="font-serif text-center px-1 py-0.5">
                    <div className="font-bold text-[#691621] flex items-center justify-center gap-1.5 text-xs">
                      <span>🚂</span>
                      <span>Train #{vehicle.trainNumber}</span>
                    </div>
                    <div className="text-[10px] font-bold text-[#185244] mt-0.5 uppercase tracking-wider">
                      MTA GTFS-Realtime (Live GPS Telemetry)
                    </div>
                    <div className="text-[9px] text-[#554030] font-mono mt-0.5">
                      Coordinates: {vehicle.lat.toFixed(4)}°N, {Math.abs(vehicle.lon).toFixed(4)}°W
                    </div>
                    {vehicle.routeId && (
                      <div className="text-[9px] text-[#8A6E2D] font-serif italic mt-0.5">
                        {vehicle.routeId === '10' ? 'Port Jefferson Branch' :
                         vehicle.routeId === '4' ? 'Ronkonkoma Branch' :
                         vehicle.routeId === '12' ? 'City Terminal Zone' :
                         `Route ${vehicle.routeId}`}
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Footer Instructions / Selected Route summary */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#8A6E2D] font-serif gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#185244] border border-[#C5A059] inline-block shadow" />
          <span className="text-[#DDD2B5]">Origin: <strong className="text-[#F3E5AB] font-bold">{origin.name}</strong></span>
          <span className="text-[#8A6E2D]">→</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#691621] border border-[#C5A059] inline-block shadow" />
          <span className="text-[#DDD2B5]">Destination: <strong className="text-[#F3E5AB] font-bold">{destination.name}</strong></span>
        </div>
        <div className="text-[#C5A059]/80 text-[11px] font-serif italic">
          Showing {trainFilter === 'route' ? `${realGtfsVehicles.length} corridor trains` : `${totalRealVehiclesCount} active trains`} • Real GTFS-RT telemetry
        </div>
      </div>
    </div>
  );
};
