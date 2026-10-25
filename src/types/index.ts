export type CommuterRole = 'standard' | 'senior' | 'child' | 'frequent' | 'student' | 'veteran' | 'commuter' | 'tourist';

export type BudgetTier = 'all' | 'under-25' | '25-50' | '50-plus' | 'free' | 'favorites';

export interface LocalAttraction {
  name: string;
  category: 'food' | 'coffee' | 'culture' | 'transit' | 'nature';
  walkingMinutes: number;
  description: string;
  victorianTip: string;
  budgetTier: 'under-25' | '25-50' | '50-plus' | 'free';
  priceEstimate: string; // e.g. "$10 - $18", "$25 - $45", "$60+"
  websiteUrl: string;    // Official website link
}

export interface Station {
  id: string;
  name: string;
  branch: string;
  zone: number;
  accessible: boolean;
  distanceFromPennMiles: number;
  lat: number;
  lon: number;
  stopId?: string;
  mapCoords?: { x: number; y: number };
  attractions: LocalAttraction[];
}

export interface LiveTrainVehicle {
  id: string;
  tripId: string;
  trainNumber: string;
  routeId?: string;
  lat: number;
  lon: number;
  stopId?: string;
  timestamp: number;
  label?: string;
  source?: 'gtfs-rt' | 'estimated';
}

export interface TrainCarInfo {
  carNumber: number;
  fullnessPercent: number;
  isQuietCar: boolean;
  isAccessible: boolean;
}

export interface TripStop {
  stationName: string;
  scheduledTime: string;
  isPassed: boolean;
  isUserOrigin: boolean;
  isUserDestination: boolean;
}

export interface TrainDeparture {
  id: string;
  trainNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  peak: boolean;
  status: 'SCHEDULED' | 'ON TIME' | 'DEPARTED' | 'DELAYED 4M' | 'BOARDING' | 'ON SCHEDULE' | 'DELAYED' | 'CANCELLED' | string;
  track?: string;
  transfers: string[];
  crowdLevel: 'Low' | 'Moderate' | 'Heavy';
  farePeak: number;
  fareOffPeak: number;
  originZone: number;
  destinationZone: number;
  stopsList: TripStop[];
  carCrowding: TrainCarInfo[];
  currentStopIndex: number; // Index in stopsList where train is currently located
  isRealtime?: boolean;
  realtimeDelayMinutes?: number;
  isNextDay?: boolean;
  nextDayLabel?: string;
}

export interface AvoidanceMetrics {
  tollsSaved: number; // in USD
  trafficMinutesSaved: number; // in minutes
  fuelSaved: number; // in USD
  carbonLbsSaved: number; // in lbs CO2
  steamUnits: number; // Steampunk power equivalent metric
  methodologyNotes: {
    tollsBreakdown: string;
    trafficBreakdown: string;
    fuelBreakdown: string;
    carbonBreakdown: string;
  };
}

export interface RecentTrip {
  originId: string;
  originName: string;
  destinationId: string;
  destinationName: string;
  timestamp: string;
}

export type GenderPreference = 'male' | 'female' | 'unspecified';

export interface CommuterAccount {
  name: string;
  gender?: GenderPreference;
  role: CommuterRole;
  homeStation: string;
  frequentDestination: string;
  fareDiscountPercent: number;
  customPerks: string[];
  createdDate: string;
  accountNumber: string;
  favoriteStationIds: string[];
  favoritePlaceNames: string[];
  recentTrips: RecentTrip[];
  stationVisitCounts: Record<string, number>;
}

export interface ServiceAlert {
  id: string;
  branch: string;
  type: 'good' | 'delay' | 'maintenance' | 'weather';
  title: string;
  description: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendations?: LocalAttraction[];
}
