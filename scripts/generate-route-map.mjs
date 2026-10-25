import fs from 'fs';
import path from 'path';

const tripsPath = path.resolve(process.cwd(), 'data/gtfs/trips.txt');
if (!fs.existsSync(tripsPath)) {
  console.error('trips.txt not found');
  process.exit(1);
}

const content = fs.readFileSync(tripsPath, 'utf8');
const lines = content.trim().split('\n');
const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
const ridIdx = headers.indexOf('route_id');
const tidIdx = headers.indexOf('trip_id');

const map = {};
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',').map(p => p.replace(/"/g, '').trim());
  const rid = parts[ridIdx];
  const tid = parts[tidIdx];
  if (tid && rid) {
    map[tid] = rid;
    const match = tid.match(/_(\d{3,4})(?:_|$)/);
    if (match) map[match[1]] = rid;
  }
}

const outPath = path.resolve(process.cwd(), 'src/data/trainRoutesMap.json');
fs.writeFileSync(outPath, JSON.stringify(map, null, 2), 'utf8');
console.log(`Generated ${outPath} with ${Object.keys(map).length} mappings.`);
