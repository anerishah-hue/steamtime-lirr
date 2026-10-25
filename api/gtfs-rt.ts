import type { IncomingMessage, ServerResponse } from 'http';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import trainRoutesMapData from '../src/data/trainRoutesMap.json';

export interface RealtimeTrainInfo {
  trainNumber: string;
  tripId: string;
  isCancelled: boolean;
  delaySeconds: number;
  delayMinutes: number;
  status: 'ON TIME' | 'DELAYED' | 'CANCELLED';
  statusLabel: string;
  track?: string;
  lastUpdated: number;
}

export interface RealtimeVehiclePosition {
  id: string;
  tripId: string;
  trainNumber: string;
  routeId?: string;
  lat: number;
  lon: number;
  stopId?: string;
  timestamp: number;
  label?: string;
  source: 'gtfs-rt' | 'estimated';
}

interface CachedRtData {
  timestamp: number;
  trains: Record<string, RealtimeTrainInfo>;
  vehicles: RealtimeVehiclePosition[];
}

// In-memory 20-second cache across warm lambda invocations
let cachedData: CachedRtData | null = null;
const CACHE_TTL_MS = 20 * 1000;

const trainRouteMap: Record<string, string> = trainRoutesMapData as Record<string, string>;

export async function fetchLirrGtfsRealtime(): Promise<{
  trains: Record<string, RealtimeTrainInfo>;
  vehicles: RealtimeVehiclePosition[];
}> {
  const now = Date.now();
  if (cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
    return { trains: cachedData.trains, vehicles: cachedData.vehicles };
  }

  try {
    const res = await fetch('https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/lirr%2Fgtfs-lirr', {
      headers: {
        'Accept': 'application/x-protobuf, application/octet-stream, */*'
      }
    });

    if (!res.ok) {
      console.warn(`[GTFS-RT] Upstream returned HTTP ${res.status}: ${res.statusText}`);
      return { trains: cachedData?.trains || {}, vehicles: cachedData?.vehicles || [] };
    }

    const buffer = await res.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));

    const trains: Record<string, RealtimeTrainInfo> = {};
    const vehicles: RealtimeVehiclePosition[] = [];

    for (const entity of feed.entity) {
      // 1. Process TripUpdates
      const tu = entity.tripUpdate;
      if (tu && tu.trip?.tripId) {
        const tripId = tu.trip.tripId;
        const match = tripId.match(/_(\d{3,4})(?:_|$)/);
        const trainNumber = match ? match[1] : null;
        if (trainNumber) {
          const isCancelled = tu.trip.scheduleRelationship === 3; // 3 = CANCELED
          let delaySeconds = 0;
          if (typeof tu.delay === 'number') {
            delaySeconds = tu.delay;
          } else if (tu.stopTimeUpdate && tu.stopTimeUpdate.length > 0) {
            const validDelays = tu.stopTimeUpdate
              .map(s => s.departure?.delay ?? s.arrival?.delay)
              .filter((d): d is number => typeof d === 'number');

            if (validDelays.length > 0) {
              delaySeconds = validDelays[validDelays.length - 1];
            }
          }

          const delayMinutes = Math.round(delaySeconds / 60);

          let status: 'ON TIME' | 'DELAYED' | 'CANCELLED' = 'ON TIME';
          let statusLabel = 'ON TIME';

          if (isCancelled) {
            status = 'CANCELLED';
            statusLabel = 'CANCELLED';
          } else if (delaySeconds >= 180) {
            status = 'DELAYED';
            statusLabel = `DELAYED ${delayMinutes}M`;
          } else {
            status = 'ON TIME';
            statusLabel = 'ON TIME';
          }

          let track: string | undefined = undefined;
          for (const stu of tu.stopTimeUpdate || []) {
            const anyStu = stu as any;
            if (anyStu.track || anyStu.platform) {
              track = String(anyStu.track || anyStu.platform);
              break;
            }
          }

          trains[trainNumber] = {
            trainNumber,
            tripId,
            isCancelled,
            delaySeconds,
            delayMinutes,
            status,
            statusLabel,
            track,
            lastUpdated: now
          };
        }
      }

      // 2. Process VehiclePositions (live GPS coordinates from GTFS-RT)
      const vp = entity.vehicle;
      if (vp && vp.position && typeof vp.position.latitude === 'number' && typeof vp.position.longitude === 'number') {
        const tripId = vp.trip?.tripId || '';
        const match = tripId.match(/_(\d{3,4})(?:_|$)/);
        const trainNumber = match ? match[1] : (vp.vehicle?.label || vp.vehicle?.id || 'Train');
        const routeId = trainRouteMap[tripId] || trainRouteMap[trainNumber] || undefined;

        vehicles.push({
          id: entity.id || vp.vehicle?.id || `${vp.position.latitude}-${vp.position.longitude}`,
          tripId,
          trainNumber,
          routeId,
          lat: vp.position.latitude,
          lon: vp.position.longitude,
          stopId: vp.stopId || undefined,
          timestamp: typeof vp.timestamp === 'number' ? Number(vp.timestamp) * 1000 : now,
          label: vp.vehicle?.label || trainNumber,
          source: 'gtfs-rt'
        });
      }
    }

    cachedData = {
      timestamp: now,
      trains,
      vehicles
    };

    return { trains, vehicles };
  } catch (err: any) {
    console.error('[GTFS-RT] Error fetching live feed:', err?.message || err);
    return { trains: cachedData?.trains || {}, vehicles: cachedData?.vehicles || [] };
  }
}

/**
 * Vercel Serverless Function & Connect Middleware handler for /api/gtfs-rt
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // 20-second CDN Edge Cache for Vercel, stale revalidate for 10s
  res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=10');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(204).end();
    }
    res.writeHead(204);
    return res.end();
  }

  try {
    const { trains, vehicles } = await fetchLirrGtfsRealtime();
    const payload = JSON.stringify({
      timestamp: Date.now(),
      cachedAt: cachedData?.timestamp || Date.now(),
      activeTrainsCount: Object.keys(trains).length,
      vehiclesCount: vehicles.length,
      trains,
      vehicles
    });

    if (typeof res.status === 'function') {
      return res.status(200).send(payload);
    }
    res.writeHead(200);
    return res.end(payload);
  } catch (err: any) {
    const errorPayload = JSON.stringify({
      error: 'Failed to fetch realtime data',
      details: err?.message || String(err)
    });
    if (typeof res.status === 'function') {
      return res.status(500).send(errorPayload);
    }
    res.writeHead(500);
    return res.end(errorPayload);
  }
}
