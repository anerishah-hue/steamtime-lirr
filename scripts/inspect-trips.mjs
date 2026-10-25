import fs from 'fs';

const tripsText = fs.readFileSync('data/gtfs/trips.txt', 'utf8');
const lines = tripsText.trim().split('\n');
const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
const ridIdx = headers.indexOf('route_id');
const tidIdx = headers.indexOf('trip_id');
const headsignIdx = headers.indexOf('trip_headsign');

const sampleTrips = [];
for (let i = 1; i < Math.min(lines.length, 30); i++) {
  const parts = lines[i].split(',').map(p => p.replace(/"/g, '').trim());
  sampleTrips.push({
    route_id: parts[ridIdx],
    trip_id: parts[tidIdx],
    headsign: parts[headsignIdx]
  });
}
console.log('Sample trips:', sampleTrips.slice(0, 10));

// Map all train numbers to route_id
const trainToRoute = {};
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',').map(p => p.replace(/"/g, '').trim());
  const rid = parts[ridIdx];
  const tid = parts[tidIdx];
  const match = tid.match(/_(\d{3,4})(?:_|$)/);
  if (match) {
    trainToRoute[match[1]] = rid;
  }
}

console.log('Total mapped train numbers to routes:', Object.keys(trainToRoute).length);
// Check some train numbers
console.log('Sample mappings:', Object.entries(trainToRoute).slice(0, 15));
