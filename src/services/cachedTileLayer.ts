import L from 'leaflet';
import { TILE_CACHE_NAME } from './tileCache';

// Custom Leaflet TileLayer that transparently checks CacheStorage first
export function createCachedTileLayer(
  url: string,
  options: L.TileLayerOptions
): L.TileLayer {
  if (typeof window === 'undefined') {
    return L.tileLayer(url, options);
  }

  const CachedLayerClass = L.TileLayer.extend({
    createTile(coords: { x: number; y: number; z: number }, done: (error?: Error, tile?: HTMLImageElement) => void) {
      const tile = document.createElement('img');
      tile.setAttribute('role', 'presentation');

      const tileUrl = (this as any).getTileUrl(coords);

      // If Cache API not supported, fallback to standard image load
      if (!('caches' in window)) {
        tile.onload = () => done(undefined, tile);
        tile.onerror = () => done(new Error('Tile load error'), tile);
        tile.src = tileUrl;
        return tile;
      }

      // Cache-First strategy with transparent background saving
      caches
        .open(TILE_CACHE_NAME)
        .then(async cache => {
          const cachedResponse = await cache.match(tileUrl);
          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            tile.onload = () => {
              URL.revokeObjectURL(tile.src);
              done(undefined, tile);
            };
            tile.onerror = () => done(new Error('Cached tile load error'), tile);
            tile.src = URL.createObjectURL(blob);
          } else {
            fetch(tileUrl, { mode: 'cors' })
              .then(async response => {
                if (response.ok) {
                  cache.put(tileUrl, response.clone()).catch(() => {});
                  const blob = await response.blob();
                  tile.onload = () => {
                    URL.revokeObjectURL(tile.src);
                    done(undefined, tile);
                  };
                  tile.onerror = () => done(new Error('Tile load error'), tile);
                  tile.src = URL.createObjectURL(blob);
                } else {
                  tile.src = tileUrl;
                  tile.onload = () => done(undefined, tile);
                  tile.onerror = () => done(new Error('Tile load error'), tile);
                }
              })
              .catch(() => {
                tile.src = tileUrl;
                tile.onload = () => done(undefined, tile);
                tile.onerror = () => done(new Error('Tile load error'), tile);
              });
          }
        })
        .catch(() => {
          tile.src = tileUrl;
          tile.onload = () => done(undefined, tile);
          tile.onerror = () => done(new Error('Tile load error'), tile);
        });

      return tile;
    }
  });

  return new (CachedLayerClass as any)(url, options);
}
