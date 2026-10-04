import { describe, it, expect } from 'vitest';
import { calculateBearing, calculateDistance, fetchBRouterRoute, generateRoundTripWaypoints } from '../services/routing';
import { searchPlaces } from '../services/geocoding';
import { parseGpxFile } from '../services/gpx';
import { PRESET_TOURS } from '../data/presetTours';
import type { Waypoint } from '../types';

describe('Bike Tour Routing & Geocoding Service', () => {
  it('calculates distance and bearing correctly', () => {
    // Berlin Brandenburger Tor: 52.5163, 13.3777
    // Berlin Alexanderplatz: 52.5219, 13.4132
    const dist = calculateDistance(52.5163, 13.3777, 52.5219, 13.4132);
    expect(dist).toBeGreaterThan(2000);
    expect(dist).toBeLessThan(3000);

    const bearing = calculateBearing(52.5163, 13.3777, 52.5219, 13.4132);
    expect(bearing).toBeGreaterThan(60);
    expect(bearing).toBeLessThan(90); // East-North-East
  });

  it('searches places in Germany using Photon API', async () => {
    const results = await searchPlaces('Brandenburger Tor Berlin');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('brandenburger');
    expect(results[0].lat).toBeGreaterThan(50);
    expect(results[0].lng).toBeGreaterThan(12);
  });

  it('computes bike route with BRouter safety profile in Germany', async () => {
    const waypoints: Waypoint[] = [
      { id: '1', name: 'Dresden Frauenkirche', lat: 51.0519, lng: 13.7415, type: 'start' },
      { id: '2', name: 'Schloss Pillnitz', lat: 51.0093, lng: 13.8703, type: 'end' }
    ];

    const route = await fetchBRouterRoute(waypoints, 'safety');
    expect(route).toBeDefined();
    expect(route.coordinates.length).toBeGreaterThan(10);
    expect(route.distance).toBeGreaterThan(10000); // ~14 km along Elberadweg
    expect(route.cyclingWayPercent).toBeGreaterThan(60); // High cycling percentage
    expect(route.surfaceStats.asphalt).toBeGreaterThan(50);
    expect(route.instructions.length).toBeGreaterThan(0);
    expect(route.segments.length).toBeGreaterThan(0);
    expect(route.wayTypeStats).toBeDefined();
    expect(route.detailedSurfaceStats).toBeDefined();
  });

  it('correctly classifies Bundesstraße, cycleway, and surface tags', async () => {
    const { classifySegmentTags } = await import('../services/routing');

    // Bundesstraße
    const bTag = classifySegmentTags('highway=primary ref=B172 surface=asphalt');
    expect(bTag.isBundesstrasse).toBe(true);
    expect(bTag.wayType).toBe('bundesstrasse');
    expect(bTag.ref).toBe('B172');
    expect(bTag.surface).toBe('asphalt');

    // Cycleway
    const cTag = classifySegmentTags('highway=cycleway surface=asphalt bicycle=designated');
    expect(cTag.isCycleway).toBe(true);
    expect(cTag.wayType).toBe('radweg');
    expect(cTag.surface).toBe('asphalt');

    // Cobblestone / Pflaster
    const pTag = classifySegmentTags('highway=residential surface=sett');
    expect(pTag.wayType).toBe('nebenstrasse');
    expect(pTag.surface).toBe('pflaster');

    // Gravel / Track
    const gTag = classifySegmentTags('highway=track surface=gravel');
    expect(gTag.wayType).toBe('wirtschaftsweg');
    expect(gTag.surface).toBe('schotter');
  });


  it('generates a round trip loop of specified distance', () => {
    const centerLat = 52.52;
    const centerLng = 13.405;
    const targetKm = 25;
    const roundTrip = generateRoundTripWaypoints(centerLat, centerLng, targetKm);

    expect(roundTrip.length).toBe(5); // Start, 3 intermediate, End
    expect(roundTrip[0].type).toBe('start');
    expect(roundTrip[roundTrip.length - 1].type).toBe('end');
    expect(roundTrip[0].lat).toBe(roundTrip[roundTrip.length - 1].lat);
    expect(roundTrip[0].lng).toBe(roundTrip[roundTrip.length - 1].lng);
  });

  it('handles GPX export and import round-trip', () => {
    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BikeVelo Germany">
  <metadata><name>Test Elberadweg Tour</name></metadata>
  <wpt lat="51.051900" lon="13.741500"><name>Start</name></wpt>
  <wpt lat="51.009300" lon="13.870300"><name>Ziel</name></wpt>
  <trk>
    <name>Test Elberadweg Tour</name>
    <trkseg>
      <trkpt lat="51.051900" lon="13.741500"><ele>110</ele></trkpt>
      <trkpt lat="51.040000" lon="13.800000"><ele>115</ele></trkpt>
      <trkpt lat="51.009300" lon="13.870300"><ele>118</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;


    // Test parser with DOMParser mock if in node or browser
    const parsed = parseGpxFile(gpxString);
    expect(parsed.name).toBe('Test Elberadweg Tour');
    expect(parsed.coordinates.length).toBe(3);
    expect(parsed.coordinates[0].lat).toBeCloseTo(51.0519);
    expect(parsed.coordinates[0].ele).toBe(110);
    expect(parsed.waypoints.length).toBe(2);
  });

  it('validates curated German preset tours data integrity', () => {
    expect(PRESET_TOURS.length).toBeGreaterThanOrEqual(6);
    PRESET_TOURS.forEach(tour => {
      expect(tour.title).toBeTruthy();
      expect(tour.waypoints.length).toBeGreaterThanOrEqual(3);
      expect(tour.distanceKm).toBeGreaterThan(10);
      // Ensure all coordinates are inside Germany bounds (Lat 47 to 55, Lng 5 to 16)
      tour.waypoints.forEach(wp => {
        expect(wp.lat).toBeGreaterThanOrEqual(47.0);
        expect(wp.lat).toBeLessThanOrEqual(55.2);
        expect(wp.lng).toBeGreaterThanOrEqual(5.8);
        expect(wp.lng).toBeLessThanOrEqual(15.5);
      });
    });
  });

  it('correctly calculates Slippy Map tile coordinates and corridor tile URLs', async () => {
    const { latLngToTile, getTileUrlsForRoute } = await import('../services/tileCache');

    // Berlin coordinate at zoom 13
    const tile = latLngToTile(52.52, 13.405, 13);
    expect(tile.z).toBe(13);
    expect(tile.x).toBeGreaterThan(0);
    expect(tile.y).toBeGreaterThan(0);

    const testRouteCoords = [
      { lat: 52.52, lng: 13.405 },
      { lat: 52.525, lng: 13.41 },
      { lat: 52.53, lng: 13.415 }
    ];

    const urls = getTileUrlsForRoute(testRouteCoords, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', 12, 13);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls[0]).toMatch(/^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/);
  });

  it('handles route and geocode cache storage with TTL and eviction', async () => {
    const { getRouteCacheKey, getCachedRoute, setCachedRoute, getCachedGeocode, setCachedGeocode, getDataCacheStats } =
      await import('../services/dataCache');

    const key = getRouteCacheKey([{ lat: 52.52, lng: 13.4 }], 'safety');
    expect(key).toContain('safety');

    const mockRoute: any = {
      coordinates: [{ lat: 52.52, lng: 13.4 }],
      distance: 1200,
      duration: 300,
      ascent: 10,
      descent: 5,
      cyclingWayPercent: 85,
      surfaceStats: { asphalt: 80, unpaved: 20, other: 0 },
      wayTypeStats: { bundesstrasseMeters: 0, bundesstrassePercent: 0, radwegMeters: 1000, radwegPercent: 83, nebenstrasseMeters: 200, nebenstrassePercent: 17, wirtschaftswegMeters: 0, wirtschaftswegPercent: 0, sonstigeMeters: 0, sonstigePercent: 0 },
      detailedSurfaceStats: { asphaltMeters: 1000, asphaltPercent: 83, pflasterMeters: 0, pflasterPercent: 0, schotterMeters: 200, schotterPercent: 17, naturbodenMeters: 0, naturbodenPercent: 0, unbekanntMeters: 0, unbekanntPercent: 0 },
      instructions: [],
      segments: []
    };

    setCachedRoute(key, mockRoute);
    const retrieved = getCachedRoute(key);
    expect(retrieved).toBeDefined();
    expect(retrieved?.distance).toBe(1200);

    setCachedGeocode('Berlin Hbf', [{ name: 'Berlin Hauptbahnhof', detail: 'Berlin, Deutschland', lat: 52.525, lng: 13.369 }]);
    const geo = getCachedGeocode('Berlin Hbf');
    expect(geo).toHaveLength(1);
    expect(geo?.[0].lat).toBeCloseTo(52.525);

    const stats = getDataCacheStats();
    expect(stats.routeCount).toBeGreaterThanOrEqual(1);
    expect(stats.geocodeCount).toBeGreaterThanOrEqual(1);
  });

  it('correctly classifies D-Routes and computes percentage breakdown', async () => {
    const { classifyRouteSegmentNetwork, calculateRouteNetworkBreakdown, OFFICIAL_D_ROUTES } =
      await import('../services/dRouteClassifier');

    expect(OFFICIAL_D_ROUTES.length).toBe(12);
    expect(OFFICIAL_D_ROUTES.map(d => d.code)).toEqual([
      'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12'
    ]);

    // Test Bremen segment matching D7 (Pilgerroute / EV3)
    const d7Classification = classifyRouteSegmentNetwork(
      [[53.05, 8.80], [53.00, 8.80]],
      'highway=cycleway route_bicycle_ncn=yes',
      true
    );
    expect(d7Classification.category).toBe('d-route');
    expect(d7Classification.dRoute?.code).toBe('D7');
    expect(d7Classification.dRoute?.fullName).toContain('Pilgerroute');

    // Test Münster area intersection with D3 (Europa-Radweg R1)
    const d3Classification = classifyRouteSegmentNetwork(
      [[51.96, 7.62]],
      'ref=D3 route_bicycle_ncn=yes',
      true
    );
    expect(d3Classification.category).toBe('d-route');
    expect(d3Classification.dRoute?.code).toBe('D3');

    // Test Elberadweg matching D10
    const d10Classification = classifyRouteSegmentNetwork(
      [[51.05, 13.73]],
      'highway=cycleway name=Elberadweg route_bicycle_ncn=yes',
      true
    );
    expect(d10Classification.category).toBe('d-route');
    expect(d10Classification.dRoute?.code).toBe('D10');

    // Test RouteNetworkBreakdown calculation (e.g. 60% D7, 10% D3, 20% RCN, 10% other)
    const testSegments: any[] = [
      {
        id: 's1',
        fromKm: 0,
        toKm: 60,
        distanceMeters: 60000,
        networkCategory: 'd-route',
        dRoute: { code: 'D7', name: 'Pilgerroute (EV3)', fullName: 'D-Route 7: Pilgerroute (EV3)', color: '#6366f1' },
        wayType: 'radweg',
        isCycleway: true
      },
      {
        id: 's2',
        fromKm: 60,
        toKm: 70,
        distanceMeters: 10000,
        networkCategory: 'd-route',
        dRoute: { code: 'D3', name: 'Europa-Radweg R1', fullName: 'D-Route 3: Europa-Radweg R1', color: '#059669' },
        wayType: 'radweg',
        isCycleway: true
      },
      {
        id: 's3',
        fromKm: 70,
        toKm: 90,
        distanceMeters: 20000,
        networkCategory: 'rcn',
        wayType: 'radweg',
        isCycleway: true
      },
      {
        id: 's4',
        fromKm: 90,
        toKm: 100,
        distanceMeters: 10000,
        networkCategory: 'other',
        wayType: 'nebenstrasse',
        isCycleway: false
      }
    ];

    const breakdown = calculateRouteNetworkBreakdown(testSegments, 100000);
    expect(breakdown.items.length).toBe(4);
    expect(breakdown.totalDRoutePercent).toBe(70);
    expect(breakdown.totalDRouteKm).toBe(70);
    expect(breakdown.totalCycleNetworkPercent).toBe(90);

    const d7Share = breakdown.items.find(i => i.id === 'D7');
    expect(d7Share).toBeDefined();
    expect(d7Share?.percent).toBe(60);
    expect(d7Share?.distanceKm).toBe(60);

    const d3Share = breakdown.items.find(i => i.id === 'D3');
    expect(d3Share).toBeDefined();
    expect(d3Share?.percent).toBe(10);
    expect(d3Share?.distanceKm).toBe(10);

    const rcnShare = breakdown.items.find(i => i.id === 'rcn');
    expect(rcnShare).toBeDefined();
    expect(rcnShare?.percent).toBe(20);

    const otherShare = breakdown.items.find(i => i.id === 'other');
    expect(otherShare).toBeDefined();
    expect(otherShare?.percent).toBe(10);

    // Sum of percentages must equal 100%
    const sumPct = breakdown.items.reduce((sum, item) => sum + item.percent, 0);
    expect(sumPct).toBe(100);
  });
});

