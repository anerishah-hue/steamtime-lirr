import { Station, TrainDeparture, TripStop, TrainCarInfo } from '../types';
import gtfsDataRaw from '../data/gtfsScheduleData.json';

export interface CompactGtfsRun {
  trainNumber: string;
  connectingTrainNumber?: string;
  depTimeStr: string;
  arrTimeStr: string;
  durationMinutes: number;
  departureMinutes: number;
  peak: boolean;
  track: string;
  transfers: string[];
  stops: [string, string][];
}

type GtfsScheduleMap = Record<
  string,
  {
    weekday: CompactGtfsRun[];
    saturday: CompactGtfsRun[];
    sunday: CompactGtfsRun[];
  }
>;

const gtfsData = gtfsDataRaw as unknown as GtfsScheduleMap;

export function getMtaOfficialFare(originZone: number, destZone: number): { peak: number; offPeak: number } {
  const diff = Math.abs(originZone - destZone);
  if (diff === 0) {
    return { peak: 7.75, offPeak: 5.00 }; // CityTicket or intra-zone
  }
  // Zone 10 (Stony Brook / Port Jeff) to Zone 1 (Penn / Grand Central)
  if ((originZone >= 9 && destZone === 1) || (originZone === 1 && destZone >= 9)) {
    return { peak: 19.25, offPeak: 14.00 };
  }
  // Zone 7 (Huntington / Hicksville) to Zone 1
  if ((originZone >= 7 && destZone === 1) || (originZone === 1 && destZone >= 7)) {
    return { peak: 16.00, offPeak: 11.75 };
  }
  // Zone 4 (Mineola) to Zone 1
  if ((originZone >= 4 && destZone === 1) || (originZone === 1 && destZone >= 4)) {
    return { peak: 13.50, offPeak: 9.75 };
  }
  // Zone 3 (Jamaica) to Zone 1
  if ((originZone <= 3 && destZone === 1) || (originZone === 1 && destZone <= 3)) {
    return { peak: 10.75, offPeak: 8.25 };
  }
  // Default based on zone formula
  const basePeak = 7.75 + diff * 1.50;
  return {
    peak: Number(basePeak.toFixed(2)),
    offPeak: Number((basePeak * 0.73).toFixed(2))
  };
}

export function generateCarCrowding(isPeak: boolean, seed: number): TrainCarInfo[] {
  const baseRates = isPeak
    ? [55, 82, 40, 91, 88, 76, 62, 50]
    : [30, 48, 25, 52, 45, 38, 28, 22];

  return baseRates.map((rate, idx) => ({
    carNumber: idx + 1,
    fullnessPercent: Math.min(100, Math.max(15, rate + ((seed * (idx + 3)) % 15) - 7)),
    isQuietCar: idx === 0 || idx === 2,
    isAccessible: idx === 1 || idx === 6
  }));
}

/**
 * Correctly formats 24-hour and GTFS post-midnight times (>24:00) to 12-hour AM/PM format.
 * Examples:
 * - "24:17" -> 12:17 AM (belongs to previous service day's night run)
 * - "25:00" -> 1:00 AM
 * - "13:07" -> 1:07 PM
 */
export function formatTo12Hour(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(':');
  const rawH = parseInt(hStr, 10);
  const m = mStr || '00';

  // Normalize hours past 24:00 (e.g. 24 -> 0, 25 -> 1)
  const normalizedHour = rawH % 24;
  const ampm = normalizedHour >= 12 ? 'PM' : 'AM';
  const displayHour = normalizedHour % 12 || 12;

  return `${displayHour}:${m} ${ampm}`;
}

export type DayType = 'weekday' | 'saturday' | 'sunday';

export function getDayTypeFromDate(dateInput?: string | Date): DayType {
  if (!dateInput || dateInput === 'today') {
    const today = new Date().getDay();
    if (today === 0) return 'sunday';
    if (today === 6) return 'saturday';
    return 'weekday';
  }
  if (typeof dateInput === 'string') {
    const lower = dateInput.trim().toLowerCase();
    if (lower === 'today' || lower === 'now') {
      const today = new Date().getDay();
      if (today === 0) return 'sunday';
      if (today === 6) return 'saturday';
      return 'weekday';
    }
    if (lower === 'weekday') return 'weekday';
    if (lower === 'saturday' || lower === 'sat') return 'saturday';
    if (lower === 'sunday' || lower === 'sun') return 'sunday';
    if (lower === 'weekend') {
      const today = new Date().getDay();
      return today === 0 ? 'sunday' : 'saturday';
    }

    // Parse YYYY-MM-DD or standard date string
    const parts = lower.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const day = new Date(y, m, d).getDay();
      if (day === 0) return 'sunday';
      if (day === 6) return 'saturday';
      return 'weekday';
    }

    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) {
      const day = parsed.getDay();
      if (day === 0) return 'sunday';
      if (day === 6) return 'saturday';
      return 'weekday';
    }
  } else if (dateInput instanceof Date) {
    const day = dateInput.getDay();
    if (day === 0) return 'sunday';
    if (day === 6) return 'saturday';
    return 'weekday';
  }
  const today = new Date().getDay();
  return today === 0 ? 'sunday' : today === 6 ? 'saturday' : 'weekday';
}

/**
 * Resolves the consecutive service day and display label when rolling over past midnight.
 */
export function getNextServiceDay(
  currentDayType: DayType,
  selectedDate?: string | Date
): { nextDayType: DayType; nextDayLabel: string } {
  const isToday = !selectedDate || selectedDate === 'today';
  const now = selectedDate instanceof Date ? selectedDate : new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  if (isToday) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const nextDayIndex = (dayOfWeek + 1) % 7;
    const nextDayName = dayNames[nextDayIndex];
    let nextDayType: DayType = 'weekday';
    if (nextDayIndex === 0) nextDayType = 'sunday';
    else if (nextDayIndex === 6) nextDayType = 'saturday';

    return { nextDayType, nextDayLabel: nextDayName };
  }

  if (currentDayType === 'saturday') {
    return { nextDayType: 'sunday', nextDayLabel: 'Sunday' };
  }
  if (currentDayType === 'sunday') {
    return { nextDayType: 'weekday', nextDayLabel: 'Monday' };
  }
  // weekday
  if (dayOfWeek === 5) {
    return { nextDayType: 'saturday', nextDayLabel: 'Saturday' };
  }
  return { nextDayType: 'weekday', nextDayLabel: 'Weekday' };
}

export function parseTargetMinutes(timeStr?: string): number {
  if (!timeStr || !timeStr.trim() || timeStr.trim().toLowerCase() === 'now') {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
  const clean = timeStr.trim().toLowerCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return h * 60 + m;
  }

  const colonMatch = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (colonMatch) {
    const h = parseInt(colonMatch[1], 10);
    const m = parseInt(colonMatch[2], 10);
    return h * 60 + m;
  }

  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Generates official MTA GTFS timetable departures:
 * - Shows ALL departures at or after the target time, in order through the end of the service day.
 * - If fewer than 5 departures remain, continues with the first departures of the NEXT service day
 *   with an explicit "Next day: [Day]" divider.
 * - Handles GTFS times past 24:00:00 correctly.
 * - "Today (Live)" starts from current time. Weekday, Saturday, Sunday buttons start from chosen
 *   time, or from the first departure of that day (00:00) if no time is chosen.
 */
export function generateSchedules(
  origin: Station,
  destination: Station,
  targetTimeStr?: string,
  selectedDate?: string | Date
): TrainDeparture[] {
  // Identical origin and destination has no transit schedule
  if (origin.id === destination.id) {
    return [];
  }

  const pairKey = `${origin.id}->${destination.id}`;
  const pairSchedule = gtfsData[pairKey];
  if (!pairSchedule) {
    return [];
  }

  const dayType = getDayTypeFromDate(selectedDate);
  let runsForDay = pairSchedule[dayType] || [];

  // Fallback if specific weekend day has empty set
  if (runsForDay.length === 0) {
    if (dayType === 'saturday' && pairSchedule.sunday?.length > 0) {
      runsForDay = pairSchedule.sunday;
    } else if (dayType === 'sunday' && pairSchedule.saturday?.length > 0) {
      runsForDay = pairSchedule.saturday;
    } else {
      runsForDay = pairSchedule.weekday || [];
    }
  }

  if (runsForDay.length === 0) {
    return [];
  }

  const isToday = !selectedDate || selectedDate === 'today';
  const hasExplicitTime = Boolean(
    targetTimeStr &&
    targetTimeStr.trim().length > 0 &&
    targetTimeStr.trim().toLowerCase() !== 'now'
  );

  // Determine starting minutes:
  // - If an explicit time is chosen (e.g. "8:00 AM", typed "5:17 PM"), parse it.
  // - If "Today (Live)" with "Now" / empty, use the current time.
  // - If a specific day button (Weekday, Saturday, Sunday) is chosen without an explicit time,
  //   start from the first departure of that day (0 minutes).
  let targetMinutes = 0;
  if (hasExplicitTime) {
    targetMinutes = parseTargetMinutes(targetTimeStr);
  } else if (isToday) {
    const now = new Date();
    targetMinutes = now.getHours() * 60 + now.getMinutes();
  } else {
    targetMinutes = 0; // First departure of that service day
  }

  const fares = getMtaOfficialFare(origin.zone, destination.zone);

  // All departures at or after the chosen time through the end of the service day
  const currentDayRuns = runsForDay
    .filter((r) => r.departureMinutes >= targetMinutes)
    .sort((a, b) => a.departureMinutes - b.departureMinutes);

  interface MappedRunItem {
    run: CompactGtfsRun;
    isNextDay: boolean;
    nextDayLabel?: string;
  }

  const candidateRuns: MappedRunItem[] = currentDayRuns.map((r) => ({
    run: r,
    isNextDay: false
  }));

  // If fewer than 5 departures remain on that day, continue with the first departures of the NEXT service day
  if (currentDayRuns.length < 5) {
    const nextDayInfo = getNextServiceDay(dayType, selectedDate);
    let nextDaySchedule = pairSchedule[nextDayInfo.nextDayType] || [];

    if (nextDaySchedule.length === 0) {
      if (nextDayInfo.nextDayType === 'saturday' && pairSchedule.sunday?.length > 0) {
        nextDaySchedule = pairSchedule.sunday;
      } else if (nextDayInfo.nextDayType === 'sunday' && pairSchedule.saturday?.length > 0) {
        nextDaySchedule = pairSchedule.saturday;
      } else {
        nextDaySchedule = pairSchedule.weekday || [];
      }
    }

    if (nextDaySchedule.length > 0) {
      const sortedNextDay = [...nextDaySchedule].sort((a, b) => a.departureMinutes - b.departureMinutes);
      // Take enough departures to provide a comprehensive upcoming schedule
      const neededFromNextDay = Math.max(10, 15 - currentDayRuns.length);
      const nextDaySlice = sortedNextDay.slice(0, neededFromNextDay);

      nextDaySlice.forEach((r) => {
        candidateRuns.push({
          run: r,
          isNextDay: true,
          nextDayLabel: nextDayInfo.nextDayLabel
        });
      });
    }
  }

  return candidateRuns.map((item, idx) => {
    const { run, isNextDay, nextDayLabel } = item;
    const trainNumInt = parseInt(run.trainNumber, 10) || 6600;

    // Build intermediate stops list from GTFS stops
    const stopsList: TripStop[] = run.stops.map(([stName, schTime]) => {
      const isUserOrigin =
        stName.toLowerCase().includes(origin.name.toLowerCase()) ||
        origin.name.toLowerCase().includes(stName.toLowerCase());
      const isUserDest =
        stName.toLowerCase().includes(destination.name.toLowerCase()) ||
        destination.name.toLowerCase().includes(stName.toLowerCase());

      return {
        stationName: stName,
        scheduledTime: schTime,
        isPassed: false,
        isUserOrigin,
        isUserDestination: isUserDest
      };
    });

    if (!stopsList.some((s) => s.isUserOrigin) && stopsList.length > 0) {
      stopsList[0].isUserOrigin = true;
    }
    if (!stopsList.some((s) => s.isUserDestination) && stopsList.length > 0) {
      stopsList[stopsList.length - 1].isUserDestination = true;
    }

    const originIdx = stopsList.findIndex((s) => s.isUserOrigin);
    const currentStopIndex = Math.max(0, originIdx !== -1 ? originIdx : 0);

    return {
      id: `gtfs-${run.trainNumber}-${idx}-${run.departureMinutes}${isNextDay ? '-next' : ''}`,
      trainNumber: run.trainNumber,
      origin: origin.name,
      destination: destination.name,
      departureTime: formatTo12Hour(run.depTimeStr),
      arrivalTime: formatTo12Hour(run.arrTimeStr),
      durationMinutes: run.durationMinutes,
      peak: run.peak,
      status: 'SCHEDULED',
      track: undefined,
      transfers: run.transfers || [],
      crowdLevel: run.peak ? 'Heavy' : 'Moderate',
      farePeak: fares.peak,
      fareOffPeak: fares.offPeak,
      originZone: origin.zone,
      destinationZone: destination.zone,
      stopsList,
      carCrowding: generateCarCrowding(run.peak, trainNumInt),
      currentStopIndex,
      isRealtime: false,
      isNextDay,
      nextDayLabel
    };
  });
}

export interface RealtimeTrainUpdate {
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

/**
 * Merges official MTA GTFS-Realtime telemetry into static departures.
 * Preserves isNextDay and nextDayLabel metadata.
 */
export function applyRealtimeUpdates(
  departures: TrainDeparture[],
  realtimeMap: Record<string, RealtimeTrainUpdate> | null | undefined
): TrainDeparture[] {
  if (!realtimeMap || Object.keys(realtimeMap).length === 0) {
    return departures;
  }

  return departures.map((train) => {
    const rt = realtimeMap[train.trainNumber];
    if (!rt) {
      return {
        ...train,
        isRealtime: false,
        status: train.status || 'SCHEDULED',
        track: undefined
      };
    }

    let statusLabel = rt.statusLabel || 'ON TIME';
    if (rt.isCancelled) {
      statusLabel = 'CANCELLED';
    } else if (rt.delayMinutes >= 3) {
      statusLabel = `DELAYED ${rt.delayMinutes}M`;
    } else if (rt.delaySeconds <= -60) {
      statusLabel = 'EARLY';
    } else {
      statusLabel = 'ON TIME';
    }

    return {
      ...train,
      isRealtime: true,
      status: statusLabel,
      track: rt.track || undefined,
      realtimeDelayMinutes: rt.delayMinutes
    };
  });
}
