import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

async function checkRt() {
  try {
    const res = await fetch('https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/lirr%2Fgtfs-lirr', {
      headers: {
        'Accept': 'application/x-protobuf, application/octet-stream, */*'
      }
    });
    console.log('Status:', res.status);
    const buf = await res.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buf));
    console.log('Total entities:', feed.entity.length);
    let vehicleCount = 0;
    let tripUpdateCount = 0;
    let alertCount = 0;
    let hasPositions = 0;
    for (const ent of feed.entity) {
      if (ent.vehicle) {
        vehicleCount++;
        if (ent.vehicle.position) hasPositions++;
      }
      if (ent.tripUpdate) tripUpdateCount++;
      if (ent.alert) alertCount++;
    }
    console.log({ vehicleCount, tripUpdateCount, alertCount, hasPositions });
    if (vehicleCount > 0) {
      console.log('Sample vehicle:', feed.entity.find(e => e.vehicle)?.vehicle);
    }
  } catch (err) {
    console.error('Error fetching GTFS-RT:', err);
  }
}

checkRt();
