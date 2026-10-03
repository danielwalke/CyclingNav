import type { BikePoi, BikeRoute } from '../types';
import type { GeocodeResult } from './geocoding';

const ROUTE_CACHE_PREFIX = 'biketour_route_';
const GEOCODE_CACHE_PREFIX = 'biketour_geo_';
const POI_CACHE_PREFIX = 'biketour_poi_';

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const envelope: CacheEnvelope<T> = JSON.parse(raw);
    const now = Date.now();
    if (now - envelope.timestamp > envelope.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return envelope.data;
  } catch {
    return null;
  }
}

function setToStorage<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const envelope: CacheEnvelope<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch (err) {
    // If quota exceeded, clear older biketour cache items
    console.warn('LocalStorage quota notice, cleaning old cache:', err);
    cleanOldCache();
  }
}

function cleanOldCache(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith(ROUTE_CACHE_PREFIX) ||
          key.startsWith(GEOCODE_CACHE_PREFIX) ||
          key.startsWith(POI_CACHE_PREFIX))
      ) {
        keysToRemove.push(key);
      }
    }
    // Delete oldest 50%
    keysToRemove.slice(0, Math.ceil(keysToRemove.length / 2)).forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

// Routes
export function getRouteCacheKey(waypoints: Array<{ lat: number; lng: number }>, profile: string): string {
  const coordStr = waypoints.map(w => `${w.lng.toFixed(5)},${w.lat.toFixed(5)}`).join(';');
  return `${ROUTE_CACHE_PREFIX}${profile}_${coordStr}`;
}

export function getCachedRoute(key: string): BikeRoute | null {
  return getFromStorage<BikeRoute>(key);
}

export function setCachedRoute(key: string, route: BikeRoute): void {
  setToStorage(key, route, DEFAULT_TTL_MS);
}

// Geocoding
export function getCachedGeocode(query: string): GeocodeResult[] | null {
  const clean = query.trim().toLowerCase();
  return getFromStorage<GeocodeResult[]>(`${GEOCODE_CACHE_PREFIX}${clean}`);
}

export function setCachedGeocode(query: string, results: GeocodeResult[]): void {
  const clean = query.trim().toLowerCase();
  setToStorage(`${GEOCODE_CACHE_PREFIX}${clean}`, results, DEFAULT_TTL_MS * 7); // 7 days for geocoding
}

// POIs (Overpass)
export function getCachedPois(boundsKey: string): BikePoi[] | null {
  return getFromStorage<BikePoi[]>(`${POI_CACHE_PREFIX}${boundsKey}`);
}

export function setCachedPois(boundsKey: string, pois: BikePoi[]): void {
  setToStorage(`${POI_CACHE_PREFIX}${boundsKey}`, pois, 1000 * 60 * 60 * 6); // 6 hours
}

// Cache Stats & Cleanup
export function getDataCacheStats(): { routeCount: number; geocodeCount: number; poiCount: number; sizeKb: number } {
  let routeCount = 0;
  let geocodeCount = 0;
  let poiCount = 0;
  let totalChars = 0;

  if (typeof window === 'undefined' || !window.localStorage) {
    return { routeCount: 0, geocodeCount: 0, poiCount: 0, sizeKb: 0 };
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith(ROUTE_CACHE_PREFIX)) {
        routeCount++;
        totalChars += (localStorage.getItem(key) || '').length;
      } else if (key.startsWith(GEOCODE_CACHE_PREFIX)) {
        geocodeCount++;
        totalChars += (localStorage.getItem(key) || '').length;
      } else if (key.startsWith(POI_CACHE_PREFIX)) {
        poiCount++;
        totalChars += (localStorage.getItem(key) || '').length;
      }
    }
  } catch {
    // ignore
  }

  return {
    routeCount,
    geocodeCount,
    poiCount,
    sizeKb: Math.round((totalChars * 2) / 1024) // UTF-16 approx 2 bytes/char
  };
}

export function clearDataCache(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.startsWith(ROUTE_CACHE_PREFIX) ||
        key.startsWith(GEOCODE_CACHE_PREFIX) ||
        key.startsWith(POI_CACHE_PREFIX))
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}
