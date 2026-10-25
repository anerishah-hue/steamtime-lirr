import fs from 'fs';

const coords = {
  'stony-brook': { lat: 40.92032252, lon: -73.12854943, stopId: '14' },
  'port-jefferson': { lat: 40.9345531, lon: -73.05250164, stopId: '164' },
  'huntington': { lat: 40.85300971, lon: -73.40952576, stopId: '91' },
  'hicksville': { lat: 40.76717491, lon: -73.52853322, stopId: '92' },
  'mineola': { lat: 40.74034743, lon: -73.64086293, stopId: '132' },
  'jamaica': { lat: 40.69960817, lon: -73.80852987, stopId: '102' },
  'grand-central-madison': { lat: 40.755162, lon: -73.975455, stopId: '349' },
  'penn-station': { lat: 40.75058844, lon: -73.99358408, stopId: '237' },
  'atlantic-terminal': { lat: 40.68359596, lon: -73.97567112, stopId: '241' },
  'ronkonkoma': { lat: 40.80808613, lon: -73.10594023, stopId: '179' }
};

let content = fs.readFileSync('src/data/stations.ts', 'utf8');

for (const [id, c] of Object.entries(coords)) {
  const regex = new RegExp(`(id:\\s*'${id}',[\\s\\S]*?)mapCoords:\\s*\\{[^}]+\\},`, 'g');
  content = content.replace(regex, `$1lat: ${c.lat},\n    lon: ${c.lon},\n    stopId: '${c.stopId}',`);
}

fs.writeFileSync('src/data/stations.ts', content, 'utf8');
console.log('Updated src/data/stations.ts with lat/lon/stopId and removed hardcoded mapCoords!');
