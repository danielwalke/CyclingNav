import type { RouteCoordinate } from '../types';

export const TILE_CACHE_NAME = 'bike-tour-tiles-v1';

export interface TileCacheStats {
  tileCount: number;
  estimatedSizeMb: number;
}

export interface PrecacheProgress {
  total: number;
  cached: number;
  percent: number;
  isComplete: boolean;
}

// Convert Lat/Lng to Slippy Map Tile Coordinates
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number; z: number } {
  const n = Math.pow(2, zoom);
  const rad = (lat * Math.PI) / 180;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n);
  return { x: Math.max(0, Math.min(n - 1, x)), y: Math.max(0, Math.min(n - 1, y)), z: zoom };
}

// Generate unique tile URLs along a bike route for offline pre-caching
export function getTileUrlsForRoute(
  coordinates: RouteCoordinate[],
  tileUrlTemplate: string,
  minZoom = 12,
  maxZoom = 15
): string[] {
  const uniqueTiles = new Set<string>();

  // Sample every few coordinates to cover the corridor without duplicate computation
  const step = Math.max(1, Math.floor(coordinates.length / 250));

  for (let z = minZoom; z <= maxZoom; z++) {
    for (let i = 0; i < coordinates.length; i += step) {
      const coord = coordinates[i];
      const center = latLngToTile(coord.lat, coord.lng, z);

      // Include a 1-tile buffer around the track so panning around the bike track works seamlessly
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const x = center.x + dx;
          const y = center.y + dy;
          const subdomains = ['a', 'b', 'c'];
          const s = subdomains[(x + y) % subdomains.length];

          uniqueTiles.add(
            tileUrlTemplate
              .replace('{s}', s)
              .replace('{z}', z.toString())
              .replace('{x}', x.toString())
              .replace('{y}', y.toString())
          );

        }
      }
    }
  }

  return Array.from(uniqueTiles);
}

// Pre-cache tiles along a route with concurrency limit and live progress
export async function precacheRouteTiles(
  tileUrls: string[],
  onProgress?: (progress: PrecacheProgress) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    throw new Error('Cache API wird in diesem Browser nicht unterstützt.');
  }

  const cache = await caches.open(TILE_CACHE_NAME);
  const total = tileUrls.length;
  let cached = 0;
  const concurrency = 4; // Friendly to public OSM / CyclOSM tile servers

  for (let i = 0; i < tileUrls.length; i += concurrency) {
    if (abortSignal?.aborted) {
      break;
    }

    const batch = tileUrls.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async url => {
        try {
          // Check if already in cache
          const match = await cache.match(url);
          if (!match) {
            const res = await fetch(url, { mode: 'cors' });
            if (res.ok) {
              await cache.put(url, res);
            }
          }
        } catch (err) {
          // Network hiccup or tile missing; continue without breaking whole batch
          console.debug('Tile pre-cache notice:', url, err);
        } finally {
          cached++;
        }
      })
    );

    if (onProgress) {
      onProgress({
        total,
        cached,
        percent: Math.min(100, Math.round((cached / total) * 100)),
        isComplete: cached >= total
      });
    }
  }
}

// Get statistics on cached tiles
export async function getTileCacheStats(): Promise<TileCacheStats> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { tileCount: 0, estimatedSizeMb: 0 };
  }

  try {
    const cache = await caches.open(TILE_CACHE_NAME);
    const keys = await cache.keys();
    const count = keys.length;
    // Average OSM / CyclOSM PNG tile is ~20-25 KB
    const estimatedSizeMb = Number(((count * 22) / 1024).toFixed(1));
    return { tileCount: count, estimatedSizeMb };
  } catch {
    return { tileCount: 0, estimatedSizeMb: 0 };
  }
}

// Clear all cached tiles
export async function clearTileCache(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    return await caches.delete(TILE_CACHE_NAME);
  } catch {
    return false;
  }
}
