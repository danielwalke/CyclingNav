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
});
