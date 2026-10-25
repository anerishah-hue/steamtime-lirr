import fs from 'fs';

// 1. Parse stops.txt
const stopsText = fs.readFileSync('data/gtfs/stops.txt', 'utf8');
const stopLines = stopsText.trim().split('\n');
const stopHeaders = stopLines[0].split(',').map(h => h.replace(/"/g, '').trim());
const stops = stopLines.slice(1).map(line => {
  const parts = line.split(',').map(p => p.replace(/"/g, '').trim());
  const row = {};
  stopHeaders.forEach((h, i) => row[h] = parts[i] || '');
  return {
    stop_id: row.stop_id,
    stop_code: row.stop_code,
    stop_name: row.stop_name,
    lat: parseFloat(row.stop_lat),
    lon: parseFloat(row.stop_lon),
    stop_url: row.stop_url,
    wheelchair_boarding: row.wheelchair_boarding
  };
}).filter(s => !isNaN(s.lat) && !isNaN(s.lon));

console.log(`Parsed ${stops.length} valid stops from stops.txt`);
fs.writeFileSync('src/data/gtfsStops.json', JSON.stringify(stops, null, 2));

// 2. Parse shapes.txt for Route 4 (Ronkonkoma), Route 10 (Port Jefferson), Route 12 (City Terminals)
const shapesText = fs.readFileSync('data/gtfs/shapes.txt', 'utf8');
const shapeLines = shapesText.trim().split('\n');
const sHeaders = shapeLines[0].split(',').map(h => h.replace(/"/g, '').trim());
const sidIdx = sHeaders.indexOf('shape_id');
const latIdx = sHeaders.indexOf('shape_pt_lat');
const lonIdx = sHeaders.indexOf('shape_pt_lon');
const seqIdx = sHeaders.indexOf('shape_pt_sequence');

const shapePoints = {
  // Ronkonkoma: Penn to Ronkonkoma
  'C5955902': [],
  // Port Jeff: Huntington to Port Jeff
  'DECD0CE9': [],
  // Penn to Huntington
  '91BE652D': [],
  // City Terminals: Atlantic to Jamaica
  '76789C63': [],
  // City Terminals: GCM to Jamaica
  '5E489136': []
};

for (let i = 1; i < shapeLines.length; i++) {
  const parts = shapeLines[i].split(',').map(p => p.replace(/"/g, '').trim());
  const sid = parts[sidIdx];
  if (shapePoints[sid]) {
    shapePoints[sid].push({
      lat: parseFloat(parts[latIdx]),
      lon: parseFloat(parts[lonIdx]),
      seq: parseInt(parts[seqIdx], 10)
    });
  }
}

for (const sid of Object.keys(shapePoints)) {
  shapePoints[sid].sort((a, b) => a.seq - b.seq);
}

function toLatLng(pts) {
  return pts.map(p => [Number(p.lat.toFixed(6)), Number(p.lon.toFixed(6))]);
}

// Extract Hicksville intersection index (~[40.767, -73.528])
const pennToHunt = shapePoints['91BE652D'];
let huntHicksvilleIdx = 0;
let minD = Infinity;
pennToHunt.forEach((p, idx) => {
  const d = Math.hypot(p.lat - 40.767175, p.lon - -73.528533);
  if (d < minD) { minD = d; huntHicksvilleIdx = idx; }
});

const hicksvilleToHunt = pennToHunt.slice(huntHicksvilleIdx);
const huntToPortJeff = shapePoints['DECD0CE9'];
const fullPortJeffLine = toLatLng([...hicksvilleToHunt, ...huntToPortJeff]);

const pennToRonk = shapePoints['C5955902'];
minD = Infinity;
let ronkHicksvilleIdx = 0;
pennToRonk.forEach((p, idx) => {
  const d = Math.hypot(p.lat - 40.767175, p.lon - -73.528533);
  if (d < minD) { minD = d; ronkHicksvilleIdx = idx; }
});

// Ronkonkoma line from Hicksville junction to Ronkonkoma
const hicksvilleToRonk = toLatLng(pennToRonk.slice(ronkHicksvilleIdx));

// Main Line / City Terminals Trunk: Penn to Hicksville
const pennToHicksville = toLatLng(pennToRonk.slice(0, ronkHicksvilleIdx + 1));

// City Terminals:
// Atlantic Terminal to Jamaica
const atlanticToJamaica = toLatLng(shapePoints['76789C63']);
// Grand Central Madison to Jamaica
const gcmToJamaica = toLatLng(shapePoints['5E489136']);

const lineShapes = {
  portJefferson: fullPortJeffLine,
  ronkonkoma: hicksvilleToRonk,
  mainLinePennToHicksville: pennToHicksville,
  atlanticBranch: atlanticToJamaica,
  grandCentralBranch: gcmToJamaica
};

console.log('Shapes summary:');
console.log('- Port Jefferson line points:', fullPortJeffLine.length);
console.log('- Ronkonkoma line points:', hicksvilleToRonk.length);
console.log('- Main line Penn -> Hicksville points:', pennToHicksville.length);
console.log('- Atlantic -> Jamaica points:', atlanticToJamaica.length);
console.log('- GCM -> Jamaica points:', gcmToJamaica.length);

fs.writeFileSync('src/data/gtfsLineShapes.json', JSON.stringify(lineShapes));
console.log('Successfully written src/data/gtfsStops.json and src/data/gtfsLineShapes.json');
