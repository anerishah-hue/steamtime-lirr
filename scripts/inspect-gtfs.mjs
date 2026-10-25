import fs from 'fs';

const shapesText = fs.readFileSync('data/gtfs/shapes.txt', 'utf8');
const lines = shapesText.trim().split('\n');
const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
const sidIdx = headers.indexOf('shape_id');
const latIdx = headers.indexOf('shape_pt_lat');
const lonIdx = headers.indexOf('shape_pt_lon');
const seqIdx = headers.indexOf('shape_pt_sequence');

function getShapeCoords(targetId) {
  const pts = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.replace(/"/g, '').trim());
    if (parts[sidIdx] === targetId) {
      pts.push({
        lat: parseFloat(parts[latIdx]),
        lon: parseFloat(parts[lonIdx]),
        seq: parseInt(parts[seqIdx], 10)
      });
    }
  }
  pts.sort((a, b) => a.seq - b.seq);
  return pts.map(p => [p.lat, p.lon]);
}

// Check Hicksville coordinates: [40.76717491, -73.52853322]
// Check shape 91BE652D (Penn to Huntington)
const pennToHuntington = getShapeCoords('91BE652D');
const huntingtonToPortJeff = getShapeCoords('DECD0CE9');
console.log('Penn to Huntington points:', pennToHuntington.length);
console.log('Huntington to Port Jeff points:', huntingtonToPortJeff.length);

// Find index near Hicksville in pennToHuntington
let closestIdx = -1;
let minDist = Infinity;
pennToHuntington.forEach((pt, i) => {
  const d = Math.hypot(pt[0] - 40.767175, pt[1] - -73.528533);
  if (d < minDist) {
    minDist = d;
    closestIdx = i;
  }
});

console.log(`Closest to Hicksville in 91BE652D is index ${closestIdx}:`, pennToHuntington[closestIdx]);
// The Hicksville to Huntington segment is pennToHuntington.slice(closestIdx)
const hicksvilleToHuntington = pennToHuntington.slice(closestIdx);
const fullPortJeffBranch = [...hicksvilleToHuntington, ...huntingtonToPortJeff];
console.log('Full Port Jeff Branch (Hicksville -> Port Jeff) points:', fullPortJeffBranch.length);

// Ronkonkoma: Penn to Ronkonkoma is C5955902
const pennToRonkonkoma = getShapeCoords('C5955902');
console.log('Penn to Ronkonkoma points:', pennToRonkonkoma.length);
// Find Hicksville in pennToRonkonkoma
minDist = Infinity;
closestIdx = -1;
pennToRonkonkoma.forEach((pt, i) => {
  const d = Math.hypot(pt[0] - 40.767175, pt[1] - -73.528533);
  if (d < minDist) {
    minDist = d;
    closestIdx = i;
  }
});
console.log(`Closest to Hicksville in C5955902 is index ${closestIdx}:`, pennToRonkonkoma[closestIdx]);
const mainLinePennToHicksville = pennToRonkonkoma.slice(0, closestIdx + 1);
const hicksvilleToRonkonkoma = pennToRonkonkoma.slice(closestIdx);

// City Terminals:
// Atlantic Branch: Shape 76789C63 (Atlantic Terminal to Jamaica)
const atlanticToJamaica = getShapeCoords('76789C63');
// Grand Central Madison to Jamaica: Shape 5E489136
const gcmToJamaica = getShapeCoords('5E489136');

console.log('Main Line Penn -> Hicksville points:', mainLinePennToHicksville.length);
console.log('Hicksville -> Ronkonkoma points:', hicksvilleToRonkonkoma.length);
console.log('Atlantic -> Jamaica points:', atlanticToJamaica.length);
console.log('GCM -> Jamaica points:', gcmToJamaica.length);
