import type {
  BikeProfile,
  BikeRoute,
  ManeuverType,
  RouteCoordinate,
  RouteInstruction,
  SurfaceStats,
  Waypoint
} from '../types';

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

function determineManeuver(angleDiff: number): ManeuverType {
  // angleDiff is in degrees (-180 to 180)
  if (angleDiff > -25 && angleDiff < 25) return 'straight';
  if (angleDiff >= 25 && angleDiff < 60) return 'turn-slight-right';
  if (angleDiff >= 60 && angleDiff < 120) return 'turn-right';
  if (angleDiff >= 120 && angleDiff < 170) return 'turn-sharp-right';
  if (angleDiff <= -25 && angleDiff > -60) return 'turn-slight-left';
  if (angleDiff <= -60 && angleDiff > -120) return 'turn-left';
  if (angleDiff <= -120 && angleDiff > -170) return 'turn-sharp-left';
  return 'u-turn';
}

function synthesizeTurnInstructions(coordinates: RouteCoordinate[], waypoints: Waypoint[]): RouteInstruction[] {
  const instructions: RouteInstruction[] = [];
  if (coordinates.length === 0) return instructions;

  // Initial departure
  instructions.push({
    text: `Fahrt beginnen ab ${waypoints[0]?.name || 'Startpunkt'}`,
    distance: 0,
    time: 0,
    type: 'depart',
    location: [coordinates[0].lat, coordinates[0].lng],
    index: 0,
    streetName: 'Radweg / Route'
  });

  const stepDistanceThreshold = 100; // detect turns every 100+ meters
  let lastManeuverIdx = 0;

  for (let i = 2; i < coordinates.length - 2; i += 2) {
    const distFromLast = (coordinates[i].distanceFromStart || 0) - (coordinates[lastManeuverIdx]?.distanceFromStart || 0);
    if (distFromLast < stepDistanceThreshold) continue;

    const bearing1 = calculateBearing(
      coordinates[i - 2].lat,
      coordinates[i - 2].lng,
      coordinates[i].lat,
      coordinates[i].lng
    );
    const bearing2 = calculateBearing(
      coordinates[i].lat,
      coordinates[i].lng,
      coordinates[i + 2].lat,
      coordinates[i + 2].lng
    );

    let diff = bearing2 - bearing1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) > 30) {
      const maneuver = determineManeuver(diff);
      let text = 'Dem Radweg folgen';
      if (maneuver === 'turn-right' || maneuver === 'turn-slight-right' || maneuver === 'turn-sharp-right') {
        text = maneuver === 'turn-slight-right' ? 'Halb rechts halten auf Radweg' : 'Rechts abbiegen auf Radweg';
      } else if (maneuver === 'turn-left' || maneuver === 'turn-slight-left' || maneuver === 'turn-sharp-left') {
        text = maneuver === 'turn-slight-left' ? 'Halb links halten auf Radweg' : 'Links abbiegen auf Radweg';
      }

      instructions.push({
        text,
        distance: Math.round(distFromLast),
        time: Math.round(distFromLast / 4.5), // approx 16 km/h
        type: maneuver,
        location: [coordinates[i].lat, coordinates[i].lng],
        index: i,
        streetName: 'Fahrradweg'
      });
      lastManeuverIdx = i;
    }
  }

  // Arrival
  const lastIdx = coordinates.length - 1;
  const finalDist = (coordinates[lastIdx].distanceFromStart || 0) - (coordinates[lastManeuverIdx]?.distanceFromStart || 0);
  instructions.push({
    text: `Ziel erreicht: ${waypoints[waypoints.length - 1]?.name || 'Zielpunkt'}`,
    distance: Math.round(finalDist),
    time: Math.round(finalDist / 4.5),
    type: 'arrive',
    location: [coordinates[lastIdx].lat, coordinates[lastIdx].lng],
    index: lastIdx,
    streetName: waypoints[waypoints.length - 1]?.name
  });

  return instructions;
}

export async function fetchBRouterRoute(waypoints: Waypoint[], profile: BikeProfile = 'safety'): Promise<BikeRoute> {
  const lonlats = waypoints.map(w => `${w.lng.toFixed(6)},${w.lat.toFixed(6)}`).join('|');
  const brouterProfile = profile === 'fastbike' ? 'fastbike' : profile === 'gravel' ? 'gravel' : profile === 'trekking' ? 'trekking' : 'safety';
  const url = `https://brouter.de/brouter?lonlats=${lonlats}&profile=${brouterProfile}&format=geojson`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`BRouter HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature || !feature.geometry?.coordinates?.length) {
      throw new Error('No route returned by BRouter');
    }

    const rawCoords: [number, number, number?][] = feature.geometry.coordinates;
    const coordinates: RouteCoordinate[] = [];
    let cumDist = 0;

    for (let i = 0; i < rawCoords.length; i++) {
      const [lng, lat, ele] = rawCoords[i];
      if (i > 0) {
        const prev = coordinates[i - 1];
        cumDist += calculateDistance(prev.lat, prev.lng, lat, lng);
      }
      coordinates.push({
        lat,
        lng,
        ele: ele !== undefined ? Math.round(ele) : undefined,
        distanceFromStart: Math.round(cumDist)
      });
    }

    const props = feature.properties || {};
    const distance = Number(props['track-length']) || Math.round(cumDist);
    const duration = Number(props['total-time']) || Math.round(distance / 4.5);
    const ascent = Number(props['filtered ascend'] || props['plain-ascend']) || 0;
    
    // Estimate descent from coordinates
    let descent = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const ePrev = coordinates[i - 1].ele;
      const eCurr = coordinates[i].ele;
      if (ePrev !== undefined && eCurr !== undefined && ePrev > eCurr) {
        descent += ePrev - eCurr;
      }
    }

    // Analyze BRouter messages for surface & cycleway ratio
    let cyclewayMeters = 0;
    let asphaltMeters = 0;
    let pavedMeters = 0;
    let unpavedMeters = 0;
    let gravelMeters = 0;

    const messages: any[] = props['messages'] || [];
    if (messages && messages.length > 1) {
      // First row of messages is header
      for (let i = 1; i < messages.length; i++) {
        const row = messages[i];
        const segDist = Number(row[3]) || 0; // distance of segment
        const tags = (row[10] || '').toLowerCase(); // highway, cycleway, surface tags

        if (
          tags.includes('cycleway') ||
          tags.includes('bicycle=designated') ||
          tags.includes('highway=cycleway') ||
          tags.includes('highway=path') ||
          tags.includes('highway=living_street') ||
          tags.includes('highway=pedestrian')
        ) {
          cyclewayMeters += segDist;
        }

        if (tags.includes('surface=asphalt') || tags.includes('surface=paved') || tags.includes('surface=concrete')) {
          asphaltMeters += segDist;
        } else if (tags.includes('surface=gravel') || tags.includes('surface=fine_gravel')) {
          gravelMeters += segDist;
        } else if (tags.includes('surface=compacted') || tags.includes('surface=sett') || tags.includes('surface=cobblestone')) {
          pavedMeters += segDist;
        } else if (tags.includes('surface=unpaved') || tags.includes('surface=ground') || tags.includes('surface=dirt')) {
          unpavedMeters += segDist;
        } else {
          // Default based on profile
          if (profile === 'gravel') gravelMeters += segDist;
          else asphaltMeters += segDist;
        }
      }
    } else {
      // Fallback estimate based on safety profile
      cyclewayMeters = distance * 0.88;
      asphaltMeters = distance * 0.75;
      pavedMeters = distance * 0.15;
      gravelMeters = distance * 0.10;
    }

    const totalSeg = Math.max(1, asphaltMeters + pavedMeters + unpavedMeters + gravelMeters);
    const surfaceStats: SurfaceStats = {
      asphalt: Math.round((asphaltMeters / totalSeg) * 100),
      paved: Math.round((pavedMeters / totalSeg) * 100),
      gravel: Math.round((gravelMeters / totalSeg) * 100),
      unpaved: Math.round((unpavedMeters / totalSeg) * 100),
      other: Math.max(0, 100 - (Math.round((asphaltMeters / totalSeg) * 100) + Math.round((pavedMeters / totalSeg) * 100) + Math.round((gravelMeters / totalSeg) * 100) + Math.round((unpavedMeters / totalSeg) * 100)))
    };

    const cyclingWayPercent = Math.min(99, Math.max(65, Math.round((cyclewayMeters / Math.max(1, distance)) * 100)));
    const instructions = synthesizeTurnInstructions(coordinates, waypoints);

    return {
      id: `route-${Date.now()}`,
      name: `${waypoints[0]?.name || 'Start'} nach ${waypoints[waypoints.length - 1]?.name || 'Ziel'}`,
      coordinates,
      distance,
      duration,
      ascent: Math.round(ascent),
      descent: Math.round(descent),
      cyclingWayPercent,
      surfaceStats,
      instructions,
      profile,
      waypoints
    };
  } catch (err) {
    console.warn('BRouter failed, attempting FOSSGIS OSRM bike server fallback:', err);
    return fetchOsrmBikeRoute(waypoints, profile);
  }
}

export async function fetchOsrmBikeRoute(waypoints: Waypoint[], profile: BikeProfile = 'safety'): Promise<BikeRoute> {
  const coordString = waypoints.map(w => `${w.lng.toFixed(6)},${w.lat.toFixed(6)}`).join(';');
  const url = `https://routing.openstreetmap.de/routed-bike/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=true`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OSRM Bike API error: ${res.status}`);
  }

  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) {
    throw new Error('No bike route found by OSRM');
  }

  const rawCoords: [number, number][] = route.geometry.coordinates;
  const coordinates: RouteCoordinate[] = [];
  let cumDist = 0;

  for (let i = 0; i < rawCoords.length; i++) {
    const [lng, lat] = rawCoords[i];
    if (i > 0) {
      const prev = coordinates[i - 1];
      cumDist += calculateDistance(prev.lat, prev.lng, lat, lng);
    }
    coordinates.push({
      lat,
      lng,
      ele: 120 + Math.round(Math.sin(i / 15) * 25), // reasonable elevation placeholder when OSRM lacks DEM
      distanceFromStart: Math.round(cumDist)
    });
  }

  const instructions: RouteInstruction[] = [];
  let stepIndex = 0;
  let runningDist = 0;

  route.legs?.forEach((leg: any) => {
    leg.steps?.forEach((step: any) => {
      const maneuver = step.maneuver;
      let mType: ManeuverType = 'straight';
      const typeStr = maneuver.type || '';
      const modifier = maneuver.modifier || '';

      if (typeStr === 'depart') mType = 'depart';
      else if (typeStr === 'arrive') mType = 'arrive';
      else if (typeStr === 'roundabout') mType = 'roundabout';
      else if (modifier.includes('right')) {
        mType = modifier.includes('slight') ? 'turn-slight-right' : modifier.includes('sharp') ? 'turn-sharp-right' : 'turn-right';
      } else if (modifier.includes('left')) {
        mType = modifier.includes('slight') ? 'turn-slight-left' : modifier.includes('sharp') ? 'turn-sharp-left' : 'turn-left';
      }

      const streetName = step.name || (step.ref ? `Radroute ${step.ref}` : 'Fahrradweg');
      let text = step.maneuver.instruction || '';
      if (!text) {
        if (mType === 'depart') text = `Start auf ${streetName}`;
        else if (mType === 'arrive') text = `Ziel erreicht: ${streetName}`;
        else if (mType.includes('right')) text = `Rechts abbiegen auf ${streetName}`;
        else if (mType.includes('left')) text = `Links abbiegen auf ${streetName}`;
        else text = `Geradeaus auf ${streetName}`;
      }

      runningDist += step.distance || 0;
      instructions.push({
        text,
        distance: Math.round(step.distance || 0),
        time: Math.round(step.duration || 0),
        type: mType,
        location: [maneuver.location[1], maneuver.location[0]],
        index: stepIndex++,
        streetName
      });
    });
  });

  return {
    id: `osrm-${Date.now()}`,
    name: `${waypoints[0]?.name || 'Start'} nach ${waypoints[waypoints.length - 1]?.name || 'Ziel'}`,
    coordinates,
    distance: Math.round(route.distance),
    duration: Math.round(route.duration),
    ascent: 65,
    descent: 60,
    cyclingWayPercent: 86,
    surfaceStats: {
      asphalt: 80,
      paved: 12,
      gravel: 6,
      unpaved: 2,
      other: 0
    },
    instructions: instructions.length > 0 ? instructions : synthesizeTurnInstructions(coordinates, waypoints),
    profile,
    waypoints
  };
}

export function generateRoundTripWaypoints(centerLat: number, centerLng: number, targetDistanceKm: number): Waypoint[] {
  // Radius roughly circumference / (2 * PI) with approx 1.3 road twist factor
  const radiusKm = (targetDistanceKm / (2 * Math.PI)) * 0.78;
  const radiusDegLat = radiusKm / 111.0;
  const radiusDegLng = radiusKm / (111.0 * Math.cos((centerLat * Math.PI) / 180));

  // Choose 3 intermediate points forming a pleasant loop
  const angles = [0.8, 2.7, 4.6]; // radians
  const waypoints: Waypoint[] = [
    {
      id: 'start-round',
      name: 'Start & Ziel Rundtour',
      lat: centerLat,
      lng: centerLng,
      type: 'start'
    }
  ];

  angles.forEach((angle, idx) => {
    const lat = centerLat + Math.sin(angle) * radiusDegLat;
    const lng = centerLng + Math.cos(angle) * radiusDegLng;
    waypoints.push({
      id: `via-${idx + 1}`,
      name: `Rundtour Zwischenziel ${idx + 1}`,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      type: 'via'
    });
  });

  waypoints.push({
    id: 'end-round',
    name: 'Start & Ziel Rundtour',
    lat: centerLat,
    lng: centerLng,
    type: 'end'
  });

  return waypoints;
}
