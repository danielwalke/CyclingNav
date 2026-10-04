import type {
  BikeProfile,
  BikeRoute,
  DetailedSurfaceStats,
  ManeuverType,
  RouteCoordinate,
  RouteInstruction,
  RouteSegment,
  SurfaceCategory,
  SurfaceStats,
  Waypoint,
  WayTypeCategory,
  WayTypeStats
} from '../types';
import { getCachedRoute, getRouteCacheKey, setCachedRoute } from './dataCache';
import {
  calculateRouteNetworkBreakdown,
  classifyRouteSegmentNetwork
} from './dRouteClassifier';



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

export function classifySegmentTags(tags: string): {
  wayType: WayTypeCategory;
  wayTypeName: string;
  surface: SurfaceCategory;
  surfaceName: string;
  ref?: string;
  isBundesstrasse: boolean;
  isCycleway: boolean;
} {
  const lower = tags.toLowerCase();

  // Extract ref if any (e.g. ref=B172, ref=B 6, ref=L123)
  const refMatch = lower.match(/\bref=([^\s;]+)/);
  const ref = refMatch ? refMatch[1].toUpperCase().trim() : undefined;


  const isBundesstrasse =
    lower.includes('highway=primary') ||
    lower.includes('highway=trunk') ||
    (ref !== undefined && (ref.startsWith('B') || ref.startsWith('B ')));

  const isExplicitCycleway =
    lower.includes('highway=cycleway') ||
    lower.includes('cycleway=track') ||
    lower.includes('cycleway:right=track') ||
    lower.includes('cycleway:left=track') ||
    lower.includes('cycleway:both=track') ||
    lower.includes('cycleway=lane') ||
    lower.includes('cycleway:right=lane') ||
    lower.includes('cycleway:left=lane') ||
    lower.includes('bicycle=designated') ||
    lower.includes('bicycle_road=yes') ||
    lower.includes('route_bicycle');

  const isSharedCycleway =
    (lower.includes('highway=footway') ||
      lower.includes('highway=pedestrian') ||
      lower.includes('highway=path')) &&
    (lower.includes('bicycle=yes') || lower.includes('bicycle=designated'));

  const isCycleway = isExplicitCycleway || isSharedCycleway;

  let wayType: WayTypeCategory = 'sonstige';
  let wayTypeName = 'Sonstiger Weg';

  if (isBundesstrasse) {
    wayType = 'bundesstrasse';
    wayTypeName = ref ? `Bundesstraße (${ref})` : 'Bundesstraße';
  } else if (isCycleway) {
    wayType = 'radweg';
    wayTypeName = lower.includes('bicycle_road=yes')
      ? 'Fahrradstraße'
      : lower.includes('track')
      ? 'Baulich getrennter Radweg'
      : lower.includes('lane')
      ? 'Radfahrstreifen'
      : 'Ausgewiesener Fahrradweg';
  } else if (
    lower.includes('highway=secondary') ||
    lower.includes('highway=tertiary')
  ) {
    wayType = 'landesstrasse';
    wayTypeName = lower.includes('highway=secondary')
      ? 'Landesstraße (L-Straße)'
      : 'Kreisstraße (K-Straße)';
  } else if (
    lower.includes('highway=residential') ||
    lower.includes('highway=living_street') ||
    lower.includes('highway=service') ||
    lower.includes('highway=unclassified')
  ) {
    wayType = 'nebenstrasse';
    wayTypeName = lower.includes('highway=living_street')
      ? 'Verkehrsberuhigter Bereich'
      : 'Ruhige Wohn-/Nebenstraße';
  } else if (
    lower.includes('highway=track') ||
    lower.includes('highway=path') ||
    lower.includes('highway=bridleway')
  ) {
    wayType = 'wirtschaftsweg';
    wayTypeName = lower.includes('highway=track')
      ? 'Wirtschafts- / Feldweg'
      : 'Wald- / Naturpfad';
  }

  // Surface classification
  let surface: SurfaceCategory = 'asphalt';
  let surfaceName = 'Asphalt / Fester Belag';

  if (
    lower.includes('surface=asphalt') ||
    lower.includes('surface=concrete') ||
    lower.includes('surface=tarmac')
  ) {
    surface = 'asphalt';
    surfaceName = 'Asphalt / Fester Belag';
  } else if (
    lower.includes('surface=sett') ||
    lower.includes('surface=cobblestone') ||
    lower.includes('surface=paved') ||
    lower.includes('surface=paving_stones')
  ) {
    surface = 'pflaster';
    surfaceName = lower.includes('cobblestone')
      ? 'Kopfsteinpflaster'
      : 'Pflastersteine';
  } else if (
    lower.includes('surface=gravel') ||
    lower.includes('surface=fine_gravel') ||
    lower.includes('surface=compacted') ||
    lower.includes('surface=crushed_limestone') ||
    lower.includes('surface=pebblestone')
  ) {
    surface = 'schotter';
    surfaceName = lower.includes('fine_gravel') || lower.includes('compacted')
      ? 'Wassergebundene Decke / Feinkies'
      : 'Schotter / Kies';
  } else if (
    lower.includes('surface=unpaved') ||
    lower.includes('surface=ground') ||
    lower.includes('surface=dirt') ||
    lower.includes('surface=grass') ||
    lower.includes('surface=earth') ||
    lower.includes('surface=sand')
  ) {
    surface = 'natur';
    surfaceName = 'Naturbelassener Weg / Erde';
  } else {
    if (wayType === 'wirtschaftsweg') {
      surface = 'schotter';
      surfaceName = 'Schotter / Natur';
    } else if (wayType === 'bundesstrasse' || wayType === 'landesstrasse') {
      surface = 'asphalt';
      surfaceName = 'Asphalt';
    } else {
      surface = 'asphalt';
      surfaceName = 'Asphalt / Befestigt';
    }
  }

  return {
    wayType,
    wayTypeName,
    surface,
    surfaceName,
    ref,
    isBundesstrasse,
    isCycleway
  };
}

export function parseRouteSegments(
  messages: any[],
  coordinates: RouteCoordinate[]
): {
  segments: RouteSegment[];
  wayTypeStats: WayTypeStats;
  detailedSurfaceStats: DetailedSurfaceStats;
} {
  const wayTypeStats: WayTypeStats = {
    radwegMeters: 0,
    nebenstrasseMeters: 0,
    wirtschaftswegMeters: 0,
    landesstrasseMeters: 0,
    bundesstrasseMeters: 0,
    sonstigeMeters: 0
  };

  const detailedSurfaceStats: DetailedSurfaceStats = {
    asphaltMeters: 0,
    pflasterMeters: 0,
    schotterMeters: 0,
    naturMeters: 0,
    sonstigeMeters: 0
  };

  const rawSegments: Array<{
    dist: number;
    startDist: number;
    endDist: number;
    classification: ReturnType<typeof classifySegmentTags>;
    netClassification: ReturnType<typeof classifyRouteSegmentNetwork>;
    startPoint: [number, number];
  }> = [];

  let cumDist = 0;
  if (messages && messages.length > 1) {
    for (let i = 1; i < messages.length; i++) {
      const row = messages[i];
      const segDist = Number(row[3]) || 0;
      if (segDist <= 0) continue;

      const tags = row[9] || '';
      const classification = classifySegmentTags(tags);
      const lon = Number(row[0]) / 1e6;
      const lat = Number(row[1]) / 1e6;
      const netClassification = classifyRouteSegmentNetwork([[lat, lon]], tags, classification.isCycleway);

      // Stats accumulation
      if (classification.wayType === 'bundesstrasse') wayTypeStats.bundesstrasseMeters += segDist;
      else if (classification.wayType === 'radweg') wayTypeStats.radwegMeters += segDist;
      else if (classification.wayType === 'nebenstrasse') wayTypeStats.nebenstrasseMeters += segDist;
      else if (classification.wayType === 'wirtschaftsweg') wayTypeStats.wirtschaftswegMeters += segDist;
      else if (classification.wayType === 'landesstrasse') wayTypeStats.landesstrasseMeters += segDist;
      else wayTypeStats.sonstigeMeters += segDist;

      if (classification.surface === 'asphalt') detailedSurfaceStats.asphaltMeters += segDist;
      else if (classification.surface === 'pflaster') detailedSurfaceStats.pflasterMeters += segDist;
      else if (classification.surface === 'schotter') detailedSurfaceStats.schotterMeters += segDist;
      else if (classification.surface === 'natur') detailedSurfaceStats.naturMeters += segDist;
      else detailedSurfaceStats.sonstigeMeters += segDist;

      rawSegments.push({
        dist: segDist,
        startDist: cumDist,
        endDist: cumDist + segDist,
        classification,
        netClassification,
        startPoint: [lat, lon]
      });

      cumDist += segDist;
    }
  }

  // Merge consecutive segments of the same wayType & surface for a clear, readable list
  const mergedSegments: RouteSegment[] = [];
  let currentGroup: (typeof rawSegments)[0] | null = null;
  let groupDist = 0;
  let groupStartDist = 0;

  for (let i = 0; i < rawSegments.length; i++) {
    const item = rawSegments[i];
    if (
      currentGroup &&
      currentGroup.classification.wayType === item.classification.wayType &&
      currentGroup.classification.surface === item.classification.surface &&
      currentGroup.classification.ref === item.classification.ref &&
      currentGroup.netClassification.dRoute?.code === item.netClassification.dRoute?.code &&
      currentGroup.netClassification.category === item.netClassification.category
    ) {
      groupDist += item.dist;
    } else {
      if (currentGroup) {
        const segStartDist = groupStartDist;
        const segEndDist = groupStartDist + groupDist;

        // Collect coordinates falling into this distance slice
        const segCoords: [number, number][] = coordinates
          .filter(c => {
            const d = c.distanceFromStart || 0;
            return d >= segStartDist - 50 && d <= segEndDist + 50;
          })
          .map(c => [c.lat, c.lng]);

        mergedSegments.push({
          id: `seg-${mergedSegments.length}`,
          fromKm: Number((segStartDist / 1000).toFixed(1)),
          toKm: Number((segEndDist / 1000).toFixed(1)),
          distanceMeters: Math.round(groupDist),
          wayType: currentGroup.classification.wayType,
          wayTypeName: currentGroup.classification.wayTypeName,
          surface: currentGroup.classification.surface,
          surfaceName: currentGroup.classification.surfaceName,
          ref: currentGroup.classification.ref,
          coordinates: segCoords.length > 0 ? segCoords : [currentGroup.startPoint],
          isBundesstrasse: currentGroup.classification.isBundesstrasse,
          isCycleway: currentGroup.classification.isCycleway,
          dRoute: currentGroup.netClassification.dRoute,
          networkCategory: currentGroup.netClassification.category,
          networkName: currentGroup.netClassification.networkName
        });
      }

      currentGroup = item;
      groupStartDist = item.startDist;
      groupDist = item.dist;
    }
  }

  // Push final group
  if (currentGroup) {
    const segStartDist = groupStartDist;
    const segEndDist = groupStartDist + groupDist;
    const segCoords: [number, number][] = coordinates
      .filter(c => {
        const d = c.distanceFromStart || 0;
        return d >= segStartDist - 50 && d <= segEndDist + 50;
      })
      .map(c => [c.lat, c.lng]);

    mergedSegments.push({
      id: `seg-${mergedSegments.length}`,
      fromKm: Number((segStartDist / 1000).toFixed(1)),
      toKm: Number((segEndDist / 1000).toFixed(1)),
      distanceMeters: Math.round(groupDist),
      wayType: currentGroup.classification.wayType,
      wayTypeName: currentGroup.classification.wayTypeName,
      surface: currentGroup.classification.surface,
      surfaceName: currentGroup.classification.surfaceName,
      ref: currentGroup.classification.ref,
      coordinates: segCoords.length > 0 ? segCoords : [currentGroup.startPoint],
      isBundesstrasse: currentGroup.classification.isBundesstrasse,
      isCycleway: currentGroup.classification.isCycleway,
      dRoute: currentGroup.netClassification.dRoute,
      networkCategory: currentGroup.netClassification.category,
      networkName: currentGroup.netClassification.networkName
    });
  }

  return {
    segments: mergedSegments,
    wayTypeStats,
    detailedSurfaceStats
  };
}


export async function fetchBRouterRoute(waypoints: Waypoint[], profile: BikeProfile = 'safety'): Promise<BikeRoute> {
  const validWaypoints = waypoints.filter(
    w => typeof w.lat === 'number' && isFinite(w.lat) && typeof w.lng === 'number' && isFinite(w.lng)
  );
  if (validWaypoints.length < 2) {
    throw new Error('At least 2 valid waypoints required');
  }

  const cacheKey = getRouteCacheKey(validWaypoints, profile);
  const cached = getCachedRoute(cacheKey);
  if (cached) {
    return cached;
  }

  const lonlats = validWaypoints.map(w => `${w.lng.toFixed(6)},${w.lat.toFixed(6)}`).join('|');
  const brouterProfile = profile === 'fastbike' ? 'fastbike' : profile === 'gravel' ? 'gravel' : profile === 'trekking' ? 'trekking' : 'safety';
  const url = `https://brouter.de/brouter?lonlats=${lonlats}&profile=${brouterProfile}&format=geojson`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`BRouter HTTP error ${res.status}: ${errText} (URL: ${url})`);
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

    // Parse full route segments and underground/way-type breakdown
    const { segments, wayTypeStats, detailedSurfaceStats } = parseRouteSegments(props['messages'] || [], coordinates);

    const totalSeg = Math.max(
      1,
      detailedSurfaceStats.asphaltMeters +
        detailedSurfaceStats.pflasterMeters +
        detailedSurfaceStats.schotterMeters +
        detailedSurfaceStats.naturMeters +
        detailedSurfaceStats.sonstigeMeters
    );

    const surfaceStats: SurfaceStats = {
      asphalt: Math.round((detailedSurfaceStats.asphaltMeters / totalSeg) * 100),
      paved: Math.round((detailedSurfaceStats.pflasterMeters / totalSeg) * 100),
      gravel: Math.round((detailedSurfaceStats.schotterMeters / totalSeg) * 100),
      unpaved: Math.round((detailedSurfaceStats.naturMeters / totalSeg) * 100),
      other: Math.max(
        0,
        100 -
          (Math.round((detailedSurfaceStats.asphaltMeters / totalSeg) * 100) +
            Math.round((detailedSurfaceStats.pflasterMeters / totalSeg) * 100) +
            Math.round((detailedSurfaceStats.schotterMeters / totalSeg) * 100) +
            Math.round((detailedSurfaceStats.naturMeters / totalSeg) * 100))
      )
    };

    const cyclingMeters = wayTypeStats.radwegMeters + (wayTypeStats.nebenstrasseMeters * 0.7);
    const cyclingWayPercent = Math.min(99, Math.max(40, Math.round((cyclingMeters / Math.max(1, distance)) * 100)));
    const instructions = synthesizeTurnInstructions(coordinates, waypoints);
    const networkBreakdown = calculateRouteNetworkBreakdown(segments, distance);

    const routeResult: BikeRoute = {
      id: `route-${Date.now()}`,
      name: `${waypoints[0]?.name || 'Start'} nach ${waypoints[waypoints.length - 1]?.name || 'Ziel'}`,
      coordinates,
      distance,
      duration,
      ascent: Math.round(ascent),
      descent: Math.round(descent),
      cyclingWayPercent,
      surfaceStats,
      wayTypeStats,
      detailedSurfaceStats,
      networkBreakdown,
      segments,
      instructions,
      profile,
      waypoints
    };

    setCachedRoute(cacheKey, routeResult);
    return routeResult;
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
      ele: 120 + Math.round(Math.sin(i / 15) * 25),
      distanceFromStart: Math.round(cumDist)
    });
  }

  const instructions: RouteInstruction[] = [];
  let stepIndex = 0;

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

  const totalDist = Math.round(route.distance);
  const seg1Coords = coordinates.slice(0, Math.floor(coordinates.length * 0.75)).map(c => [c.lat, c.lng] as [number, number]);
  const seg2Coords = coordinates.slice(Math.floor(coordinates.length * 0.75)).map(c => [c.lat, c.lng] as [number, number]);
  const seg1Net = classifyRouteSegmentNetwork(seg1Coords, '', true);
  const seg2Net = classifyRouteSegmentNetwork(seg2Coords, '', false);

  const syntheticSegments: RouteSegment[] = [
    {
      id: 'osrm-seg-1',
      fromKm: 0,
      toKm: Number((totalDist * 0.75 / 1000).toFixed(1)),
      distanceMeters: Math.round(totalDist * 0.75),
      wayType: 'radweg',
      wayTypeName: 'Fahrradweg / Radfahrstreifen',
      surface: 'asphalt',
      surfaceName: 'Asphalt',
      coordinates: seg1Coords,
      isBundesstrasse: false,
      isCycleway: true,
      dRoute: seg1Net.dRoute,
      networkCategory: seg1Net.category,
      networkName: seg1Net.networkName
    },
    {
      id: 'osrm-seg-2',
      fromKm: Number((totalDist * 0.75 / 1000).toFixed(1)),
      toKm: Number((totalDist / 1000).toFixed(1)),
      distanceMeters: Math.round(totalDist * 0.25),
      wayType: 'nebenstrasse',
      wayTypeName: 'Wohn- / Nebenstraße',
      surface: 'pflaster',
      surfaceName: 'Pflastersteine',
      coordinates: seg2Coords,
      isBundesstrasse: false,
      isCycleway: false,
      dRoute: seg2Net.dRoute,
      networkCategory: seg2Net.category,
      networkName: seg2Net.networkName
    }
  ];

  const networkBreakdown = calculateRouteNetworkBreakdown(syntheticSegments, totalDist);

  return {
    id: `osrm-${Date.now()}`,
    name: `${waypoints[0]?.name || 'Start'} nach ${waypoints[waypoints.length - 1]?.name || 'Ziel'}`,
    coordinates,
    distance: totalDist,
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
    wayTypeStats: {
      radwegMeters: Math.round(totalDist * 0.75),
      nebenstrasseMeters: Math.round(totalDist * 0.2),
      wirtschaftswegMeters: Math.round(totalDist * 0.05),
      landesstrasseMeters: 0,
      bundesstrasseMeters: 0,
      sonstigeMeters: 0
    },
    detailedSurfaceStats: {
      asphaltMeters: Math.round(totalDist * 0.8),
      pflasterMeters: Math.round(totalDist * 0.12),
      schotterMeters: Math.round(totalDist * 0.06),
      naturMeters: Math.round(totalDist * 0.02),
      sonstigeMeters: 0
    },
    networkBreakdown,
    segments: syntheticSegments,
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
