import { getCachedGeocode, setCachedGeocode } from './dataCache';
import { findLocalCities } from '../data/germanCities';

export interface GeocodeResult {
  name: string;
  detail: string;
  lat: number;
  lng: number;
}

export async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 2) return [];

  const localMatches = findLocalCities(query);

  const cached = getCachedGeocode(query);
  if (cached && cached.length > 0) {
    return cached;
  }

  // Germany Bounding Box: lon: 5.866 to 15.042, lat: 47.270 to 55.058
  const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
    query
  )}&limit=6&bbox=5.86,47.27,15.05,55.06&lat=51.16&lon=10.45`;

  try {
    const res = await fetch(photonUrl);
    if (!res.ok) throw new Error('Photon API error');
    const data = await res.json();

    if (data.features && data.features.length > 0) {
      const results: GeocodeResult[] = data.features.map((f: any) => {
        const p = f.properties || {};
        const [lng, lat] = f.geometry.coordinates;

        const mainName = p.name || p.street || p.city || 'Ort';
        const details = [
          p.housenumber ? `${p.street || ''} ${p.housenumber}` : p.street,
          p.postcode,
          p.city || p.locality,
          p.state
        ]
          .filter(Boolean)
          .join(', ');

        return {
          name: mainName,
          detail: details || 'Deutschland',
          lat,
          lng
        };
      });

      // Merge local matches that aren't duplicates
      const existingNames = new Set(results.map(r => r.name.toLowerCase()));
      for (const lm of localMatches) {
        if (!existingNames.has(lm.name.toLowerCase())) {
          results.push({ name: lm.name, detail: lm.detail, lat: lm.lat, lng: lm.lng });
        }
      }

      setCachedGeocode(query, results);
      return results;
    }
  } catch (err) {
    console.warn('Photon geocoding failed, trying Nominatim fallback:', err);
  }

  // Fallback to OSM Nominatim
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&countrycodes=de&limit=5&addressdetails=1`;
    const res = await fetch(nomUrl, {
      headers: {
        'Accept-Language': 'de'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const nomResults = data.map((item: any) => ({
          name: item.name || item.display_name.split(',')[0],
          detail: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
        setCachedGeocode(query, nomResults);
        return nomResults;
      }
    }
  } catch {
    // ignore
  }

  // Final fallback to local offline matches
  if (localMatches.length > 0) {
    return localMatches.map(lm => ({
      name: lm.name,
      detail: lm.detail,
      lat: lm.lat,
      lng: lm.lng
    }));
  }

  return [];
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const photonReverseUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const res = await fetch(photonReverseUrl);
    if (res.ok) {
      const data = await res.json();
      const p = data.features?.[0]?.properties;
      if (p) {
        return [p.name || p.street, p.city || p.locality].filter(Boolean).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    }
  } catch (e) {
    console.warn('Reverse geocoding error:', e);
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
