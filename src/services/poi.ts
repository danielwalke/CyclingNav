import type { BikePoi, PoiType } from '../types';
import { getCachedPois, setCachedPois } from './dataCache';

export async function fetchPoisInBounds(
  south: number,
  west: number,
  north: number,
  east: number,
  selectedTypes: PoiType[]
): Promise<BikePoi[]> {
  // If bounds too large (e.g. whole Germany), skip to avoid Overpass rate limit
  if (Math.abs(north - south) > 0.6 || Math.abs(east - west) > 0.6) {
    return [];
  }

  const sortedTypes = [...selectedTypes].sort().join(',');
  const cacheKey = `${south.toFixed(3)},${west.toFixed(3)},${north.toFixed(3)},${east.toFixed(3)}_${sortedTypes}`;
  const cached = getCachedPois(cacheKey);
  if (cached) {
    return cached;
  }

  const queries: string[] = [];
  if (selectedTypes.includes('repair')) {
    queries.push(`node["amenity"="bicycle_repair_station"](${south},${west},${north},${east});`);
  }
  if (selectedTypes.includes('water')) {
    queries.push(`node["amenity"="drinking_water"](${south},${west},${north},${east});`);
  }
  if (selectedTypes.includes('shelter')) {
    queries.push(`node["amenity"="shelter"](${south},${west},${north},${east});`);
  }
  if (selectedTypes.includes('parking')) {
    queries.push(`node["amenity"="bicycle_parking"]["bicycle_parking"="shed"](${south},${west},${north},${east});`);
  }

  if (queries.length === 0) return [];

  const overpassQuery = `
    [out:json][timeout:10];
    (
      ${queries.join('\n')}
    );
    out body 40;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    });

    if (!res.ok) throw new Error(`Overpass status ${res.status}`);
    const data = await res.json();

    const pois: BikePoi[] = [];
    (data.elements || []).forEach((el: any) => {
      const tags = el.tags || {};
      let type: PoiType = 'parking';
      let defaultName = 'Fahrrad-Station';

      if (tags.amenity === 'bicycle_repair_station') {
        type = 'repair';
        defaultName = 'Fahrrad-Reparaturstation (Werkzeug & Pumpe)';
      } else if (tags.amenity === 'drinking_water') {
        type = 'water';
        defaultName = 'Trinkwasserbrunnen';
      } else if (tags.amenity === 'shelter') {
        type = 'shelter';
        defaultName = 'Rastplatz & Schutzhütte';
      } else if (tags.amenity === 'bicycle_parking') {
        type = 'parking';
        defaultName = 'Sicherer Fahrradstellplatz';
      }

      pois.push({
        id: `osm-poi-${el.id}`,
        lat: el.lat,
        lng: el.lon,
        type,
        name: tags.name || tags.operator || defaultName,
        description: tags.description || (tags.opening_hours ? `Öffnungszeiten: ${tags.opening_hours}` : undefined)
      });
    });

    setCachedPois(cacheKey, pois);
    return pois;
  } catch (err) {
    console.warn('Overpass POI fetch failed or timed out:', err);
    return [];
  }
}
