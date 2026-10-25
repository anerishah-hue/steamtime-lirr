import fs from 'fs';
import path from 'path';

const gtfsDir = path.resolve('data/gtfs');

console.log('=== 1. FEED INFO & AGENCY ===');
try {
  console.log('feed_info.txt:', fs.readFileSync(path.join(gtfsDir, 'feed_info.txt'), 'utf8').trim());
} catch (e) {
  console.log('feed_info.txt error:', e.message);
}
try {
  console.log('agency.txt:', fs.readFileSync(path.join(gtfsDir, 'agency.txt'), 'utf8').trim());
} catch (e) {}

console.log('\n=== 4. CHECK STOP IDS ===');
const stopsData = fs.readFileSync(path.join(gtfsDir, 'stops.txt'), 'utf8').trim().split('\n');
stopsData.forEach(line => {
  const p = line.replace(/"/g, '').split(',');
  const id = p[0];
  const name = p[2];
  if (name && (name.toLowerCase().includes('stony brook') || name.toLowerCase().includes('penn') || name.toLowerCase().includes('huntington'))) {
    console.log(`stop_id: "${id}", stop_name: "${name}"`);
  }
});

console.log('\n=== 3. CALENDAR DATES FOR TODAY (20261024 - Saturday) ===');
const calLines = fs.readFileSync(path.join(gtfsDir, 'calendar_dates.txt'), 'utf8').trim().split('\n');
const activeToday = [];
calLines.slice(1).forEach(l => {
  const [sid, date, exp] = l.replace(/"/g, '').split(',');
  if (date === '20261024' && exp === '1') {
    activeToday.push(sid);
  }
});
console.log('Active service_ids on 2026-10-24 (Saturday):', activeToday);

console.log('\n=== 2. TRIPS & STOP_TIMES FOR STONY BROOK ON TODAY\'S SERVICE_ID ===');
// Stony Brook stop ID: let's find it from stops.txt
// Let's load trips
const tripLines = fs.readFileSync(path.join(gtfsDir, 'trips.txt'), 'utf8').trim().split('\n');
const tripsMap = new Map(); // tripId -> trip
tripLines.slice(1).forEach(l => {
  const p = l.replace(/"/g, '').split(',');
  const routeId = p[0];
  const serviceId = p[1];
  const tripId = p[2];
  const headsign = p[3];
  const trainNum = p[4];
  tripsMap.set(tripId, { routeId, serviceId, tripId, headsign, trainNum });
});

// Let's scan stop_times.txt
const stLines = fs.readFileSync(path.join(gtfsDir, 'stop_times.txt'), 'utf8').trim().split('\n');
console.log(`Loaded ${stLines.length - 1} stop_times rows.`);

// Stony brook stop_id is '14' (or let's check any match)
const sbStops = [];
for (let i = 1; i < stLines.length; i++) {
  const p = stLines[i].replace(/"/g, '').split(',');
  const tripId = p[0];
  const arr = p[1];
  const dep = p[2];
  const stopId = p[3];
  const seq = p[4];

  if (stopId === '14') {
    const trip = tripsMap.get(tripId);
    if (trip && activeToday.includes(trip.serviceId)) {
      sbStops.push({
        rawLine: stLines[i].trim(),
        tripId,
        arr,
        dep,
        stopId,
        seq,
        trip
      });
    }
  }
}

console.log(`\nFound ${sbStops.length} Stony Brook departures on today's service_ids.`);
console.log('\nAll Stony Brook departures today (20261024):');
sbStops.sort((a, b) => a.dep.localeCompare(b.dep)).forEach(s => {
  console.log(`  Train #${s.trip.trainNum} (trip ${s.tripId}, service ${s.trip.serviceId}) Dep: ${s.dep} Arr: ${s.arr} Headsign: "${s.trip.headsign}"`);
});

console.log('\nRaw stop_times.txt rows for Stony Brook (stop 14) between 4 PM (16:00:00) and 10 PM (22:00:00) today:');
sbStops
  .filter(s => s.dep >= '16:00:00' && s.dep <= '22:00:00')
  .forEach(s => {
    console.log(`  ${s.rawLine}  --> Train #${s.trip.trainNum}, Headsign: ${s.trip.headsign}, Service: ${s.trip.serviceId}`);
  });
