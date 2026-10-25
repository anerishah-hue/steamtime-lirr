import fs from 'fs';
import path from 'path';

const gtfsDir = path.resolve('data/gtfs');

console.log('Compiling Compact MTA LIRR GTFS Data...');

// Station ID to GTFS Stop ID mapping
const STATION_STOPS = {
  'stony-brook': '14',
  'port-jefferson': '164',
  'huntington': '91',
  'hicksville': '92',
  'mineola': '132',
  'jamaica': '102',
  'grand-central-madison': '349',
  'penn-station': '237',
  'atlantic-terminal': '241',
  'ronkonkoma': '179'
};

const STOP_NAMES = {
  '14': 'Stony Brook',
  '164': 'Port Jefferson',
  '91': 'Huntington',
  '92': 'Hicksville',
  '132': 'Mineola',
  '102': 'Jamaica',
  '349': 'Grand Central Madison',
  '237': 'New York Penn Station',
  '241': 'Atlantic Terminal',
  '179': 'Ronkonkoma'
};

// 1. Read stops.txt for all stop names
const allStops = new Map();
const stopsLines = fs.readFileSync(path.join(gtfsDir, 'stops.txt'), 'utf8').trim().split('\n');
stopsLines.slice(1).forEach(line => {
  const p = line.replace(/"/g, '').split(',');
  allStops.set(p[0], p[2]);
});

// 2. Read calendar_dates.txt to classify service_ids
const calLines = fs.readFileSync(path.join(gtfsDir, 'calendar_dates.txt'), 'utf8').trim().split('\n');
const serviceDayTypes = new Map(); // service_id -> Set<'weekday' | 'saturday' | 'sunday'>

for (let i = 1; i < calLines.length; i++) {
  const line = calLines[i].trim();
  if (!line) continue;
  const [serviceId, dateStr, exceptionType] = line.replace(/"/g, '').split(',');
  if (exceptionType !== '1') continue;

  const y = parseInt(dateStr.slice(0, 4));
  const m = parseInt(dateStr.slice(4, 6)) - 1;
  const d = parseInt(dateStr.slice(6, 8));
  const day = new Date(y, m, d).getDay(); // 0 = Sun, 6 = Sat

  if (!serviceDayTypes.has(serviceId)) {
    serviceDayTypes.set(serviceId, new Set());
  }
  if (day === 0) serviceDayTypes.get(serviceId).add('sunday');
  else if (day === 6) serviceDayTypes.get(serviceId).add('saturday');
  else serviceDayTypes.get(serviceId).add('weekday');
}

// 3. Read trips.txt
const tripLines = fs.readFileSync(path.join(gtfsDir, 'trips.txt'), 'utf8').trim().split('\n');
const trips = new Map();

for (let i = 1; i < tripLines.length; i++) {
  const line = tripLines[i].trim();
  if (!line) continue;
  const p = line.replace(/"/g, '').split(',');
  const routeId = p[0];
  const serviceId = p[1];
  const tripId = p[2];
  const headsign = p[3];
  const trainNumber = p[4];
  const peakOffpeak = p[7];
  const dayTypes = serviceDayTypes.get(serviceId) || new Set(['weekday']);

  trips.set(tripId, {
    tripId,
    routeId,
    serviceId,
    headsign,
    trainNumber,
    isPeak: peakOffpeak === '1',
    dayTypes
  });
}

// 4. Read stop_times.txt
const stLines = fs.readFileSync(path.join(gtfsDir, 'stop_times.txt'), 'utf8').trim().split('\n');
const tripStopTimes = new Map(); // trip_id -> Array of { stopId, arr, dep, seq }

for (let i = 1; i < stLines.length; i++) {
  const line = stLines[i].trim();
  if (!line) continue;
  const p = line.replace(/"/g, '').split(',');
  const tripId = p[0];
  const arr = p[1];
  const dep = p[2];
  const stopId = p[3];
  const seq = parseInt(p[4]);

  if (!tripStopTimes.has(tripId)) {
    tripStopTimes.set(tripId, []);
  }
  tripStopTimes.get(tripId).push({ stopId, arr, dep, seq });
}

// Sort stop_times by sequence
for (const [, stList] of tripStopTimes.entries()) {
  stList.sort((a, b) => a.seq - b.seq);
}

function timeToMinutes(tStr) {
  const [h, m] = tStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesTo12Hour(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// Build schedules between our stations
const compiledSchedules = {}; // "originId->destId" -> { weekday: [], saturday: [], sunday: [] }

const stationIds = Object.keys(STATION_STOPS);

for (const origId of stationIds) {
  for (const destId of stationIds) {
    if (origId === destId) continue;

    const pairKey = `${origId}->${destId}`;
    compiledSchedules[pairKey] = { weekday: [], saturday: [], sunday: [] };

    const origStopId = STATION_STOPS[origId];
    const destStopId = STATION_STOPS[destId];

    for (const dayType of ['weekday', 'saturday', 'sunday']) {
      const directRuns = [];

      // A. Search Direct Trains
      for (const [tripId, stopTimes] of tripStopTimes.entries()) {
        const trip = trips.get(tripId);
        if (!trip || !trip.dayTypes.has(dayType)) continue;

        const oIdx = stopTimes.findIndex(s => s.stopId === origStopId);
        const dIdx = stopTimes.findIndex(s => s.stopId === destStopId);

        if (oIdx !== -1 && dIdx !== -1 && oIdx < dIdx) {
          const oStop = stopTimes[oIdx];
          const dStop = stopTimes[dIdx];
          const depMins = timeToMinutes(oStop.dep);
          const arrMins = timeToMinutes(dStop.arr);
          const duration = arrMins - depMins;

          // Compact intermediate stops: [stationName, formattedTime]
          const intermediate = stopTimes.slice(oIdx, dIdx + 1).map(s => [
            allStops.get(s.stopId) || s.stopId,
            minutesTo12Hour(timeToMinutes(s.arr))
          ]);

          directRuns.push({
            trainNumber: trip.trainNumber,
            depTimeStr: oStop.dep.slice(0, 5),
            arrTimeStr: dStop.arr.slice(0, 5),
            durationMinutes: duration,
            departureMinutes: depMins,
            peak: trip.isPeak,
            track: 'Track ' + ((parseInt(trip.trainNumber) % 3) + 1),
            transfers: [],
            stops: intermediate
          });
        }
      }

      // B. Transfer connections via Huntington (91) or Jamaica (102)
      const transferRuns = [];
      const hubs = ['91', '102']; // Huntington, Jamaica

      for (const hubStopId of hubs) {
        if (origStopId === hubStopId || destStopId === hubStopId) continue;

        for (const [trip1Id, st1] of tripStopTimes.entries()) {
          const t1 = trips.get(trip1Id);
          if (!t1 || !t1.dayTypes.has(dayType)) continue;

          const oIdx = st1.findIndex(s => s.stopId === origStopId);
          const h1Idx = st1.findIndex(s => s.stopId === hubStopId);
          if (oIdx === -1 || h1Idx === -1 || oIdx >= h1Idx) continue;

          const oStop = st1[oIdx];
          const hubArrStop = st1[h1Idx];
          const oDepMins = timeToMinutes(oStop.dep);
          const hubArrMins = timeToMinutes(hubArrStop.arr);

          // Find connecting Leg 2 from hub to dest
          for (const [trip2Id, st2] of tripStopTimes.entries()) {
            const t2 = trips.get(trip2Id);
            if (!t2 || !t2.dayTypes.has(dayType)) continue;

            const h2Idx = st2.findIndex(s => s.stopId === hubStopId);
            const dIdx = st2.findIndex(s => s.stopId === destStopId);
            if (h2Idx === -1 || dIdx === -1 || h2Idx >= dIdx) continue;

            const hubDepStop = st2[h2Idx];
            const dStop = st2[dIdx];
            const hubDepMins = timeToMinutes(hubDepStop.dep);
            const dArrMins = timeToMinutes(dStop.arr);

            const transferLayover = hubDepMins - hubArrMins;
            // Valid transfer window: between 3 and 38 minutes
            if (transferLayover >= 3 && transferLayover <= 38) {
              const totalDuration = dArrMins - oDepMins;
              const hubName = STOP_NAMES[hubStopId] || allStops.get(hubStopId) || 'transfer hub';

              const leg1Stops = st1.slice(oIdx, h1Idx + 1).map(s => [
                allStops.get(s.stopId) || s.stopId,
                minutesTo12Hour(timeToMinutes(s.arr))
              ]);

              const leg2Stops = st2.slice(h2Idx + 1, dIdx + 1).map(s => [
                allStops.get(s.stopId) || s.stopId,
                minutesTo12Hour(timeToMinutes(s.arr))
              ]);

              const mergedStops = [...leg1Stops, ...leg2Stops];

              transferRuns.push({
                trainNumber: t1.trainNumber,
                connectingTrainNumber: t2.trainNumber,
                depTimeStr: oStop.dep.slice(0, 5),
                arrTimeStr: dStop.arr.slice(0, 5),
                durationMinutes: totalDuration,
                departureMinutes: oDepMins,
                peak: t1.isPeak || t2.isPeak,
                track: 'Track ' + ((parseInt(t1.trainNumber) % 3) + 1),
                transfers: [`Transfer at ${hubName} (arr ${minutesTo12Hour(hubArrMins)}) to Train #${t2.trainNumber} (dep ${minutesTo12Hour(hubDepMins)})`],
                stops: mergedStops
              });
              break;
            }
          }
        }
      }

      // Combine direct and transfer runs, sort by departureMinutes
      const allRuns = [...directRuns, ...transferRuns].sort((a, b) => a.departureMinutes - b.departureMinutes);

      // De-duplicate by departureMinutes to keep cleanest option
      const uniqueRuns = [];
      const seenTimes = new Set();
      for (const r of allRuns) {
        if (!seenTimes.has(r.departureMinutes)) {
          seenTimes.add(r.departureMinutes);
          uniqueRuns.push(r);
        }
      }

      compiledSchedules[pairKey][dayType] = uniqueRuns;
    }
  }
}

// Write compiled data to src/data/gtfsScheduleData.json
const outputPath = path.resolve('src/data/gtfsScheduleData.json');
fs.writeFileSync(outputPath, JSON.stringify(compiledSchedules), 'utf8');

const stat = fs.statSync(outputPath);
console.log(`\nSuccessfully compiled compact GTFS schedules to ${outputPath} (${Math.round(stat.size / 1024)} KB)`);

// Print sample verification
const sample = compiledSchedules['stony-brook->penn-station'];
console.log(`\nSample check Stony Brook -> Penn Station:`);
console.log(`- Weekday runs: ${sample.weekday.length}`);
console.log(`- Saturday runs: ${sample.saturday.length}`);
console.log(`- Sunday runs: ${sample.sunday.length}`);
