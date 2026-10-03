import type { BikeRoute, RouteCoordinate, Waypoint } from '../types';
import { calculateDistance } from './routing';

export function exportRouteToGpx(route: BikeRoute, filename?: string): void {
  const name = filename || route.name || 'Fahrradtour';
  const cleanName = name.replace(/[^a-zA-Z0-9_\-äöüÄÖÜß ]/g, '').trim();

  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BikeVelo Germany - Radtourenplaner"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(name)}</name>
    <desc>Geplante Fahrradtour mit maximalen Radwegen in Deutschland</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
`;

  // Add waypoints
  route.waypoints.forEach(wp => {
    gpx += `  <wpt lat="${wp.lat.toFixed(6)}" lon="${wp.lng.toFixed(6)}">
    <name>${escapeXml(wp.name)}</name>
    <type>${wp.type}</type>
  </wpt>\n`;
  });

  // Add track
  gpx += `  <trk>
    <name>${escapeXml(name)}</name>
    <type>Cycling</type>
    <trkseg>\n`;

  const baseTime = Date.now();
  route.coordinates.forEach((coord, i) => {
    // estimate 4.5 m/s (~16 km/h) for timestamps
    const seconds = (coord.distanceFromStart || i * 10) / 4.5;
    const timeStr = new Date(baseTime + seconds * 1000).toISOString();
    const eleTag = coord.ele !== undefined ? `\n        <ele>${coord.ele}</ele>` : '';
    gpx += `      <trkpt lat="${coord.lat.toFixed(6)}" lon="${coord.lng.toFixed(6)}">${eleTag}
        <time>${timeStr}</time>
      </trkpt>\n`;
  });

  gpx += `    </trkseg>
  </trk>
</gpx>`;

  const blob = new Blob([gpx], { type: 'application/gpx+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${cleanName || 'bike-tour'}.gpx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseGpxFile(gpxString: string): { coordinates: RouteCoordinate[]; waypoints: Waypoint[]; name: string } {
  let tourName = 'Importierte GPX-Tour';
  const waypoints: Waypoint[] = [];
  const coordinates: RouteCoordinate[] = [];
  let cumDist = 0;

  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const xml = parser.parseFromString(gpxString, 'application/xml');

    tourName = xml.querySelector('metadata > name, trk > name')?.textContent || 'Importierte GPX-Tour';

    const wptNodes = xml.querySelectorAll('wpt');
    wptNodes.forEach((node, i) => {
      const lat = parseFloat(node.getAttribute('lat') || '0');
      const lon = parseFloat(node.getAttribute('lon') || '0');
      const name = node.querySelector('name')?.textContent || `Zwischenstopp ${i + 1}`;
      if (lat && lon) {
        waypoints.push({
          id: `imported-wpt-${i}`,
          name,
          lat,
          lng: lon,
          type: i === 0 ? 'start' : i === wptNodes.length - 1 ? 'end' : 'via'
        });
      }
    });

    const trkptNodes = xml.querySelectorAll('trkpt');
    trkptNodes.forEach(node => {
      const lat = parseFloat(node.getAttribute('lat') || '0');
      const lon = parseFloat(node.getAttribute('lon') || '0');
      const eleNode = node.querySelector('ele');
      const ele = eleNode ? parseFloat(eleNode.textContent || '0') : undefined;

      if (lat && lon) {
        if (coordinates.length > 0) {
          const prev = coordinates[coordinates.length - 1];
          cumDist += calculateDistance(prev.lat, prev.lng, lat, lon);
        }
        coordinates.push({
          lat,
          lng: lon,
          ele: ele !== undefined && !isNaN(ele) ? Math.round(ele) : undefined,
          distanceFromStart: Math.round(cumDist)
        });
      }
    });
  } else {
    // Regex parsing fallback for SSR/Testing environments without DOMParser
    const nameMatch = gpxString.match(/<name>([^<]+)<\/name>/);
    if (nameMatch) tourName = nameMatch[1];

    const wptRegex = /<wpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>(?:[\s\S]*?<name>([^<]+)<\/name>)?/g;
    let wMatch;
    let wIdx = 0;
    while ((wMatch = wptRegex.exec(gpxString)) !== null) {
      const lat = parseFloat(wMatch[1]);
      const lng = parseFloat(wMatch[2]);
      const name = wMatch[3] || `Zwischenstopp ${wIdx + 1}`;
      waypoints.push({
        id: `imported-wpt-${wIdx}`,
        name,
        lat,
        lng,
        type: wIdx === 0 ? 'start' : 'via'
      });
      wIdx++;
    }
    if (waypoints.length > 1) {
      waypoints[waypoints.length - 1].type = 'end';
    }

    const trkptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>(?:[\s\S]*?<ele>([^<]+)<\/ele>)?/g;
    let tMatch;
    while ((tMatch = trkptRegex.exec(gpxString)) !== null) {
      const lat = parseFloat(tMatch[1]);
      const lng = parseFloat(tMatch[2]);
      const ele = tMatch[3] ? parseFloat(tMatch[3]) : undefined;
      if (coordinates.length > 0) {
        const prev = coordinates[coordinates.length - 1];
        cumDist += calculateDistance(prev.lat, prev.lng, lat, lng);
      }
      coordinates.push({
        lat,
        lng,
        ele: ele !== undefined && !isNaN(ele) ? Math.round(ele) : undefined,
        distanceFromStart: Math.round(cumDist)
      });
    }
  }


  // If no waypoints were explicitly declared in GPX, build them from start and end points
  if (waypoints.length === 0 && coordinates.length >= 2) {
    waypoints.push({
      id: 'gpx-start',
      name: 'GPX Start',
      lat: coordinates[0].lat,
      lng: coordinates[0].lng,
      type: 'start'
    });
    waypoints.push({
      id: 'gpx-end',
      name: 'GPX Ziel',
      lat: coordinates[coordinates.length - 1].lat,
      lng: coordinates[coordinates.length - 1].lng,
      type: 'end'
    });
  }

  return { coordinates, waypoints, name: tourName };
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
