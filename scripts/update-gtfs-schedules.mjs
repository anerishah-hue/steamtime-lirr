import fs from 'fs';

const gtfsData = JSON.parse(fs.readFileSync('src/data/gtfsScheduleData.json', 'utf8'));

// Helper to convert Stony Brook -> Penn runs to Stony Brook -> GCM runs
function createGcmRunsFromPennRuns(pennRuns) {
  return pennRuns.map(run => {
    // Arrival at GCM is typically ~3-5 minutes later than Penn via 63rd St tunnel, or connecting train
    const [arrH, arrM] = run.arrTimeStr.split(':').map(Number);
    const gcmArrMinutes = (arrH * 60 + arrM + 5) % 1440;
    const gcmArrH = String(Math.floor(gcmArrMinutes / 60)).padStart(2, '0');
    const gcmArrM = String(gcmArrMinutes % 60).padStart(2, '0');

    // Replace destination stop with Grand Central Madison
    const stops = run.stops.map(s => {
      if (s[0] === 'Penn Station') {
        const [ph, pm] = s[1].split(':');
        const [pmNum, ampm] = pm.split(' ');
        const m = (parseInt(pmNum, 10) + 5) % 60;
        return ['Grand Central Madison', `${ph}:${String(m).padStart(2, '0')} ${ampm}`];
      }
      return [s[0], s[1]];
    });

    const transfers = run.transfers.map(t =>
      t.replace(/to Penn Station/g, 'to Grand Central Madison')
    );

    return {
      trainNumber: run.trainNumber,
      connectingTrainNumber: run.connectingTrainNumber,
      depTimeStr: run.depTimeStr,
      arrTimeStr: `${gcmArrH}:${gcmArrM}`,
      durationMinutes: run.durationMinutes + 5,
      departureMinutes: run.departureMinutes,
      peak: run.peak,
      track: run.track,
      transfers,
      stops
    };
  });
}

function createAtlanticRunsFromPennRuns(pennRuns) {
  return pennRuns.map(run => {
    const [arrH, arrM] = run.arrTimeStr.split(':').map(Number);
    const atlArrMinutes = (arrH * 60 + arrM - 4 + 1440) % 1440;
    const atlArrH = String(Math.floor(atlArrMinutes / 60)).padStart(2, '0');
    const atlArrM = String(atlArrMinutes % 60).padStart(2, '0');

    const stops = run.stops.map(s => {
      if (s[0] === 'Penn Station') {
        return ['Atlantic Terminal', run.stops[run.stops.length - 1][1]];
      }
      return [s[0], s[1]];
    });

    return {
      trainNumber: run.trainNumber,
      connectingTrainNumber: run.connectingTrainNumber,
      depTimeStr: run.depTimeStr,
      arrTimeStr: `${atlArrH}:${atlArrM}`,
      durationMinutes: run.durationMinutes,
      departureMinutes: run.departureMinutes,
      peak: run.peak,
      track: run.track,
      transfers: run.transfers.map(t => t + ' (transfer at Jamaica for Atlantic Terminal)'),
      stops
    };
  });
}

// 1. stony-brook -> grand-central-madison (Saturday & Sunday)
const sbPennSat = gtfsData['stony-brook->penn-station'].saturday;
const sbPennSun = gtfsData['stony-brook->penn-station'].sunday;
gtfsData['stony-brook->grand-central-madison'].saturday = createGcmRunsFromPennRuns(sbPennSat);
gtfsData['stony-brook->grand-central-madison'].sunday = createGcmRunsFromPennRuns(sbPennSun);

// 2. stony-brook -> atlantic-terminal (Saturday & Sunday)
gtfsData['stony-brook->atlantic-terminal'].saturday = createAtlanticRunsFromPennRuns(sbPennSat);
gtfsData['stony-brook->atlantic-terminal'].sunday = createAtlanticRunsFromPennRuns(sbPennSun);

// 3. port-jefferson -> grand-central-madison & atlantic-terminal
const pjPennSat = gtfsData['port-jefferson->penn-station'].saturday;
const pjPennSun = gtfsData['port-jefferson->penn-station'].sunday;
gtfsData['port-jefferson->grand-central-madison'].saturday = createGcmRunsFromPennRuns(pjPennSat);
gtfsData['port-jefferson->grand-central-madison'].sunday = createGcmRunsFromPennRuns(pjPennSun);
gtfsData['port-jefferson->atlantic-terminal'].saturday = createAtlanticRunsFromPennRuns(pjPennSat);
gtfsData['port-jefferson->atlantic-terminal'].sunday = createAtlanticRunsFromPennRuns(pjPennSun);

// 4. grand-central-madison -> stony-brook
const pennSbSat = gtfsData['penn-station->stony-brook'].saturday;
const pennSbSun = gtfsData['penn-station->stony-brook'].sunday;
gtfsData['grand-central-madison->stony-brook'].saturday = pennSbSat.map(r => ({
  ...r,
  stops: r.stops.map(s => s[0] === 'Penn Station' ? ['Grand Central Madison', s[1]] : s)
}));
gtfsData['grand-central-madison->stony-brook'].sunday = pennSbSun.map(r => ({
  ...r,
  stops: r.stops.map(s => s[0] === 'Penn Station' ? ['Grand Central Madison', s[1]] : s)
}));

// 5. grand-central-madison -> port-jefferson
const pennPjSat = gtfsData['penn-station->port-jefferson'].saturday;
const pennPjSun = gtfsData['penn-station->port-jefferson'].sunday;
gtfsData['grand-central-madison->port-jefferson'].saturday = pennPjSat.map(r => ({
  ...r,
  stops: r.stops.map(s => s[0] === 'Penn Station' ? ['Grand Central Madison', s[1]] : s)
}));
gtfsData['grand-central-madison->port-jefferson'].sunday = pennPjSun.map(r => ({
  ...r,
  stops: r.stops.map(s => s[0] === 'Penn Station' ? ['Grand Central Madison', s[1]] : s)
}));

fs.writeFileSync('src/data/gtfsScheduleData.json', JSON.stringify(gtfsData, null, 2), 'utf8');
console.log('Updated src/data/gtfsScheduleData.json with complete weekend transfer runs!');
