import fs from 'fs';
import path from 'path';

const gtfsDir = path.resolve('data/gtfs');
const tripLines = fs.readFileSync(path.join(gtfsDir, 'trips.txt'), 'utf8').trim().split('\n');
const trips = new Map();
tripLines.slice(1).forEach(l => {
  const p = l.replace(/"/g, '').split(',');
  trips.set(p[2], { headsign: p[3], trainNum: p[4], serviceId: p[1], routeId: p[0], isPeak: p[7] === '1' });
});

const stLines = fs.readFileSync(path.join(gtfsDir, 'stop_times.txt'), 'utf8').trim().split('\n');
const stopsLines = fs.readFileSync(path.join(gtfsDir, 'stops.txt'), 'utf8').trim().split('\n');
const stops = new Map();
stopsLines.slice(1).forEach(l => {
  const p = l.replace(/"/g, '').split(',');
  stops.set(p[0], p[2]);
});

for (const [id, t] of trips.entries()) {
  if (t.trainNum === '7559' && t.serviceId === '11648B27') {
    console.log(`Stops for Train #7559 to ${t.headsign}:`);
    const stList = [];
    stLines.slice(1).forEach(l => {
      const p = l.replace(/"/g, '').split(',');
      if (p[0] === id) stList.push({ stopId: p[3], arr: p[1], dep: p[2], seq: parseInt(p[4]) });
    });
    stList.sort((a,b) => a.seq - b.seq);
    stList.forEach(s => {
      console.log(`  ${s.arr} | ${stops.get(s.stopId)} (${s.stopId})`);
    });
  }
}
