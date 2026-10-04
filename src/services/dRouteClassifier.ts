import type {
  DRouteInfo,
  NetworkCategory,
  RouteNetworkBreakdown,
  RouteNetworkShare,
  RouteSegment
} from '../types';

export interface DRouteDefinition extends DRouteInfo {
  description: string;
  // Sequence of corridor waypoints [lat, lng]
  corridor: [number, number][];
  tagKeywords: string[];
}

export const OFFICIAL_D_ROUTES: DRouteDefinition[] = [
  {
    code: 'D1',
    name: 'Nordseeküsten-Radweg (EV12)',
    fullName: 'D-Route 1: Nordseeküsten-Radweg (EuroVelo 12)',
    color: '#0284c7', // Sky Blue
    description: 'Von der niederländischen Grenze über Ostfriesland, Bremerhaven und Hamburg zur dänischen Grenze',
    corridor: [
      [53.18, 7.27], // Leer / Bunde
      [53.36, 7.20], // Emden
      [53.59, 7.20], // Norden
      [53.52, 8.11], // Wilhelmshaven
      [53.54, 8.58], // Bremerhaven
      [53.86, 8.69], // Cuxhaven
      [53.60, 9.47], // Stade
      [53.55, 9.99], // Hamburg
      [53.75, 9.65], // Elmshorn
      [53.89, 9.14], // Brunsbüttel
      [54.48, 9.05], // Husum
      [54.78, 8.83]  // Niebüll
    ],
    tagKeywords: ['d1', 'd-1', 'nordsee', 'north sea', 'ev12', 'eurovelo 12']
  },
  {
    code: 'D2',
    name: 'Ostseeküsten-Radweg (EV10)',
    fullName: 'D-Route 2: Ostseeküsten-Radweg (EuroVelo 10)',
    color: '#2563eb', // Royal Blue
    description: 'Von Flensburg entlang der Ostseeküste über Kiel, Lübeck, Rostock und Rügen nach Usedom',
    corridor: [
      [54.79, 9.43], // Flensburg
      [54.66, 9.93], // Kappeln
      [54.47, 9.83], // Eckernförde
      [54.32, 10.13], // Kiel
      [54.37, 10.97], // Heiligenhafen
      [53.87, 10.68], // Lübeck
      [53.89, 11.46], // Wismar
      [54.09, 12.13], // Rostock
      [54.31, 13.09], // Stralsund
      [54.41, 13.43], // Bergen auf Rügen
      [54.09, 13.38], // Greifswald
      [53.94, 14.19]  // Usedom / Ahlbeck
    ],
    tagKeywords: ['d2', 'd-2', 'ostsee', 'baltic', 'ev10', 'eurovelo 10']
  },
  {
    code: 'D3',
    name: 'Europa-Radweg R1 (EV2)',
    fullName: 'D-Route 3: Europa-Radweg R1 (EuroVelo 2)',
    color: '#059669', // Emerald Green
    description: 'Quer durch Deutschland von der niederländischen Grenze über Münster, Goslar, Dessau und Potsdam nach Berlin',
    corridor: [
      [52.05, 6.70], // Vreden / Zwillbrock
      [51.94, 7.16], // Coesfeld
      [51.96, 7.62], // Münster
      [51.95, 7.99], // Warendorf
      [51.90, 8.38], // Gütersloh
      [51.93, 8.87], // Detmold
      [51.77, 9.38], // Höxter
      [51.81, 9.86], // Einbeck
      [51.90, 10.42], // Goslar
      [51.83, 10.78], // Wernigerode
      [51.78, 11.14], // Quedlinburg
      [51.79, 11.74], // Bernburg
      [51.83, 12.24], // Dessau
      [51.86, 12.64], // Lutherstadt Wittenberg
      [52.40, 13.06], // Potsdam
      [52.52, 13.40], // Berlin
      [52.50, 14.14], // Müncheberg
      [52.58, 14.63]  // Küstrin
    ],
    tagKeywords: ['d3', 'd-3', 'r1', 'euroroute r1', 'europa-radweg', 'ev2', 'eurovelo 2']
  },
  {
    code: 'D4',
    name: 'Mittelland-Route',
    fullName: 'D-Route 4: Mittelland-Route',
    color: '#d97706', // Amber
    description: 'Von Aachen über Bonn, Siegen, Erfurt, Weimar und Jena nach Chemnitz und Zwickau',
    corridor: [
      [50.77, 6.08], // Aachen
      [50.73, 7.10], // Bonn
      [50.87, 8.02], // Siegen
      [50.81, 8.77], // Marburg
      [50.75, 9.27], // Alsfeld
      [50.97, 10.32], // Eisenach
      [50.94, 10.70], // Gotha
      [50.98, 11.03], // Erfurt
      [50.98, 11.32], // Weimar
      [50.92, 11.58], // Jena
      [50.88, 12.08], // Gera
      [50.83, 12.92], // Chemnitz
      [50.71, 12.49]  // Zwickau
    ],
    tagKeywords: ['d4', 'd-4', 'mittelland']
  },
  {
    code: 'D5',
    name: 'Saar-Mosel-Main',
    fullName: 'D-Route 5: Saar-Mosel-Main',
    color: '#7c3aed', // Purple
    description: 'Von Saarbrücken über Trier, Koblenz, Frankfurt und Würzburg nach Bayreuth',
    corridor: [
      [49.23, 6.99], // Saarbrücken
      [49.75, 6.64], // Trier
      [49.91, 7.07], // Bernkastel
      [50.36, 7.60], // Koblenz
      [49.99, 8.27], // Mainz
      [50.11, 8.68], // Frankfurt am Main
      [49.97, 9.14], // Aschaffenburg
      [49.79, 9.93], // Würzburg
      [49.89, 10.89], // Bamberg
      [49.94, 11.57], // Bayreuth
      [50.08, 12.22]  // Schirnding
    ],
    tagKeywords: ['d5', 'd-5', 'saar-mosel-main', 'moselradweg', 'mainradweg']
  },
  {
    code: 'D6',
    name: 'Donauradweg (EV6)',
    fullName: 'D-Route 6: Donauradweg (EuroVelo 6)',
    color: '#0891b2', // Cyan
    description: 'Vom Schwarzwald entlang der jungen Donau über Ulm und Regensburg nach Passau',
    corridor: [
      [47.59, 7.60], // Weil am Rhein
      [47.95, 8.50], // Donaueschingen
      [47.98, 8.81], // Tuttlingen
      [48.08, 9.21], // Sigmaringen
      [48.39, 9.99], // Ulm
      [48.71, 10.77], // Donauwörth
      [48.76, 11.42], // Ingolstadt
      [49.01, 12.09], // Regensburg
      [48.88, 12.57], // Straubing
      [48.57, 13.46]  // Passau
    ],
    tagKeywords: ['d6', 'd-6', 'donau', 'danube', 'ev6', 'eurovelo 6']
  },
  {
    code: 'D7',
    name: 'Pilgerroute (EV3)',
    fullName: 'D-Route 7: Pilgerroute (EuroVelo 3)',
    color: '#6366f1', // Indigo
    description: 'Vom Rheinland über Dortmund, Münster, Osnabrück und Bremen bis nach Flensburg',
    corridor: [
      [50.77, 6.08], // Aachen
      [50.92, 6.36], // Jülich
      [51.22, 6.77], // Düsseldorf
      [51.43, 6.76], // Duisburg
      [51.45, 7.01], // Essen
      [51.51, 7.46], // Dortmund
      [51.61, 7.52], // Lünen
      [51.66, 7.63], // Werne
      [51.78, 7.60], // Drensteinfurt
      [51.96, 7.62], // Münster
      [52.14, 7.74], // Ladbergen
      [52.17, 7.86], // Lengerich
      [52.27, 8.04], // Osnabrück
      [52.36, 8.31], // Bohmte
      [52.60, 8.37], // Diepholz
      [52.79, 8.64], // Twistringen
      [52.84, 8.72], // Bassum
      [53.01, 8.79], // Brinkum
      [53.07, 8.80], // Bremen
      [53.29, 9.27], // Zeven
      [53.47, 9.70], // Buxtehude
      [53.55, 9.99], // Hamburg
      [53.81, 10.37], // Bad Oldesloe
      [53.87, 10.68], // Lübeck
      [54.32, 10.13], // Kiel
      [54.51, 9.56], // Schleswig
      [54.79, 9.43]  // Flensburg
    ],
    tagKeywords: ['d7', 'd-7', 'pilger', 'pilgerroute', 'ev3', 'eurovelo 3', 'pilgrim']
  },
  {
    code: 'D8',
    name: 'Rheinradweg (EV15)',
    fullName: 'D-Route 8: Rheinradweg (EuroVelo 15)',
    color: '#0284c7', // Sky Blue
    description: 'Vom Bodensee über Basel, Karlsruhe, Mainz, Koblenz, Köln und Düsseldorf zur niederländischen Grenze',
    corridor: [
      [47.66, 9.17], // Konstanz
      [47.55, 7.58], // Basel
      [48.02, 7.58], // Breisach
      [48.57, 7.80], // Kehl
      [49.00, 8.40], // Karlsruhe
      [49.31, 8.43], // Speyer
      [49.48, 8.46], // Mannheim
      [49.63, 8.36], // Worms
      [49.99, 8.27], // Mainz
      [49.96, 7.89], // Bingen
      [50.36, 7.60], // Koblenz
      [50.73, 7.10], // Bonn
      [50.93, 6.95], // Köln
      [51.22, 6.77], // Düsseldorf
      [51.43, 6.76], // Duisburg
      [51.65, 6.61], // Wesel
      [51.83, 6.24]  // Emmerich
    ],
    tagKeywords: ['d8', 'd-8', 'rhein', 'rhine', 'ev15', 'eurovelo 15']
  },
  {
    code: 'D9',
    name: 'Weser-Romantische Straße',
    fullName: 'D-Route 9: Weser-Radweg & Romantische Straße',
    color: '#ea580c', // Orange
    description: 'Von der Nordsee über Bremen, Minden, Fulda und Würzburg bis zu den Alpen bei Füssen',
    corridor: [
      [53.86, 8.69], // Cuxhaven
      [53.54, 8.58], // Bremerhaven
      [53.07, 8.80], // Bremen
      [52.92, 9.23], // Verden
      [52.64, 9.20], // Nienburg
      [52.28, 8.91], // Minden
      [52.10, 9.35], // Hameln
      [51.77, 9.38], // Höxter
      [51.41, 9.65], // Hannoversch Münden
      [51.31, 9.49], // Kassel
      [50.55, 9.67], // Fulda
      [49.79, 9.93], // Würzburg
      [49.37, 10.17], // Rothenburg ob der Tauber
      [48.85, 10.48], // Nördlingen
      [48.71, 10.77], // Donauwörth
      [48.37, 10.89], // Augsburg
      [48.05, 10.87], // Landsberg
      [47.56, 10.70]  // Füssen
    ],
    tagKeywords: ['d9', 'd-9', 'weser', 'weserradweg', 'romantische strasse']
  },
  {
    code: 'D10',
    name: 'Elberadweg',
    fullName: 'D-Route 10: Elberadweg',
    color: '#0d9488', // Teal
    description: 'Vom Elbsandsteingebirge über Dresden, Magdeburg und Hamburg bis nach Cuxhaven',
    corridor: [
      [50.91, 14.15], // Schöna / Grenze
      [50.96, 13.94], // Pirna
      [51.05, 13.73], // Dresden
      [51.16, 13.47], // Meißen
      [51.30, 13.30], // Riesa
      [51.55, 13.00], // Torgau
      [51.86, 12.64], // Wittenberg
      [51.83, 12.24], // Dessau
      [52.13, 11.63], // Magdeburg
      [52.54, 11.97], // Tangermünde
      [52.99, 11.75], // Wittenberge
      [53.13, 11.24], // Dömitz
      [53.37, 10.55], // Lauenburg
      [53.55, 9.99], // Hamburg
      [53.86, 8.69]  // Cuxhaven
    ],
    tagKeywords: ['d10', 'd-10', 'elbe', 'elberadweg']
  },
  {
    code: 'D11',
    name: 'Ostsee-Oberbayern',
    fullName: 'D-Route 11: Ostsee-Oberbayern',
    color: '#e11d48', // Rose Red
    description: 'Von Rostock über Berlin, Leipzig, Hof und Regensburg nach München und zu den Alpen',
    corridor: [
      [54.09, 12.13], // Rostock
      [53.79, 12.17], // Güstrow
      [53.51, 12.68], // Waren
      [53.36, 13.06], // Neustrelitz
      [52.52, 13.40], // Berlin
      [51.86, 12.64], // Wittenberg
      [51.33, 12.37], // Leipzig
      [50.71, 12.49], // Zwickau
      [50.31, 11.91], // Hof
      [49.67, 12.16], // Weiden
      [49.01, 12.09], // Regensburg
      [48.53, 12.15], // Landshut
      [48.13, 11.58], // München
      [47.85, 12.12], // Rosenheim
      [47.61, 12.18]  // Kiefersfelden
    ],
    tagKeywords: ['d11', 'd-11', 'ostsee-oberbayern']
  },
  {
    code: 'D12',
    name: 'Oder-Neiße-Radweg',
    fullName: 'D-Route 12: Oder-Neiße-Radweg',
    color: '#16a34a', // Green
    description: 'Entlang der deutsch-polnischen Grenze von Zittau über Görlitz und Frankfurt (Oder) nach Usedom',
    corridor: [
      [50.89, 14.80], // Zittau
      [51.15, 14.98], // Görlitz
      [51.54, 14.71], // Bad Muskau
      [51.74, 14.64], // Forst
      [51.95, 14.71], // Guben
      [52.14, 14.67], // Eisenhüttenstadt
      [52.34, 14.55], // Frankfurt (Oder)
      [52.58, 14.63], // Küstrin
      [53.06, 14.28], // Schwedt
      [53.73, 14.04], // Ueckermünde
      [53.94, 14.19]  // Ahlbeck / Usedom
    ],
    tagKeywords: ['d12', 'd-12', 'oder-neiße', 'oder-neisse', 'oder', 'neisse']
  }
];

/**
 * Computes minimum distance from a point to a line segment in kilometers
 */
function distToSegmentKm(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const toRad = Math.PI / 180;
  const meanLat = ((pLat + ((aLat + bLat) / 2)) / 2) * toRad;
  const cosLat = Math.cos(meanLat);

  // Convert to meters using flat-Earth approximation
  const px = pLng * toRad * 6371 * cosLat;
  const py = pLat * toRad * 6371;

  const ax = aLng * toRad * 6371 * cosLat;
  const ay = aLat * toRad * 6371;

  const bx = bLng * toRad * 6371 * cosLat;
  const by = bLat * toRad * 6371;

  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;

  if (l2 === 0) {
    const dpx = px - ax;
    const dpy = py - ay;
    return Math.sqrt(dpx * dpx + dpy * dpy);
  }

  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = Math.max(0, Math.min(1, t));

  const projX = ax + t * dx;
  const projY = ay + t * dy;

  const resX = px - projX;
  const resY = py - projY;
  return Math.sqrt(resX * resX + resY * resY);
}

/**
 * Calculates distance in km from point to an entire D-Route corridor
 */
export function getDistanceToDRouteKm(lat: number, lng: number, route: DRouteDefinition): number {
  let minDist = Infinity;
  for (let i = 0; i < route.corridor.length - 1; i++) {
    const [aLat, aLng] = route.corridor[i];
    const [bLat, bLng] = route.corridor[i + 1];
    const d = distToSegmentKm(lat, lng, aLat, aLng, bLat, bLng);
    if (d < minDist) {
      minDist = d;
    }
  }
  return minDist;
}

/**
 * Match a specific coordinate / segment to an official D-Route or cycling network category
 */
export function classifyRouteSegmentNetwork(
  coords: [number, number][],
  tags: string = '',
  isCycleway: boolean = false
): {
  category: NetworkCategory;
  dRoute?: DRouteInfo;
  networkName: string;
} {
  const lowerTags = tags.toLowerCase();

  // 1. Check for explicit D-Route or EuroVelo tag keywords
  for (const dDef of OFFICIAL_D_ROUTES) {
    for (const kw of dDef.tagKeywords) {
      if (lowerTags.includes(kw)) {
        return {
          category: 'd-route',
          dRoute: {
            code: dDef.code,
            name: dDef.name,
            fullName: dDef.fullName,
            color: dDef.color
          },
          networkName: dDef.fullName
        };
      }
    }
  }

  // Sample mid-point and ends of segment
  const samplePoints: [number, number][] = [];
  if (coords.length > 0) {
    samplePoints.push(coords[0]);
    if (coords.length > 1) {
      samplePoints.push(coords[Math.floor(coords.length / 2)]);
      samplePoints.push(coords[coords.length - 1]);
    }
  }

  const hasNcn = lowerTags.includes('route_bicycle_ncn=yes') || lowerTags.includes('ncn=yes') || lowerTags.includes('route_bicycle_icn=yes') || lowerTags.includes('icn=yes');
  const hasRcn = lowerTags.includes('route_bicycle_rcn=yes') || lowerTags.includes('rcn=yes');
  const hasLcn = lowerTags.includes('route_bicycle_lcn=yes') || lowerTags.includes('lcn=yes');

  if (samplePoints.length > 0) {
    // Check spatial proximity to all 12 D-Routes
    let bestDRoute: DRouteDefinition | null = null;
    let minDRouteDist = Infinity;

    for (const dDef of OFFICIAL_D_ROUTES) {
      // Average distance across sample points
      let sumDist = 0;
      for (const pt of samplePoints) {
        sumDist += getDistanceToDRouteKm(pt[0], pt[1], dDef);
      }
      const avgDist = sumDist / samplePoints.length;

      if (avgDist < minDRouteDist) {
        minDRouteDist = avgDist;
        bestDRoute = dDef;
      }
    }

    // Match criteria:
    // If it has NCN/ICN tag, allow up to 14 km (corridor matching)
    // If it's a dedicated cycleway along the corridor, allow up to 2.5 km
    // Otherwise allow up to 1.2 km
    const dRouteThresholdKm = hasNcn ? 14.0 : isCycleway ? 2.5 : 1.2;

    if (bestDRoute && minDRouteDist <= dRouteThresholdKm) {
      return {
        category: 'd-route',
        dRoute: {
          code: bestDRoute.code,
          name: bestDRoute.name,
          fullName: bestDRoute.fullName,
          color: bestDRoute.color
        },
        networkName: bestDRoute.fullName
      };
    }
  }

  // 2. Check for Regional Cycle Network (RCN / Radfernwege)
  if (hasRcn || lowerTags.includes('radfernweg') || lowerTags.includes('flussradweg') || lowerTags.includes('theme_route')) {
    return {
      category: 'rcn',
      networkName: 'Regionale Radfernwege & Flussrouten (RCN)'
    };
  }

  // 3. Check for Local Cycle Network (LCN / Fahrradstraßen / Cycleways)
  if (hasLcn || isCycleway || lowerTags.includes('bicycle_road=yes') || lowerTags.includes('highway=cycleway')) {
    return {
      category: 'lcn',
      networkName: 'Kommunales Radnetz & Fahrradstraßen (LCN)'
    };
  }

  // 4. Other streets
  return {
    category: 'other',
    networkName: 'Lokale Verbindungs- & Nebenstraßen'
  };
}

/**
 * Calculates percentage and km breakdown of each official cycling network and D-Route
 * for the entire bike route.
 */
export function calculateRouteNetworkBreakdown(
  segments: RouteSegment[],
  totalDistanceMeters: number
): RouteNetworkBreakdown {
  const shareMap: Map<string, {
    id: string;
    code?: string;
    name: string;
    category: NetworkCategory;
    color: string;
    description: string;
    meters: number;
  }> = new Map();

  // Initialize standard fallback categories
  const rcnKey = 'rcn';
  const lcnKey = 'lcn';
  const otherKey = 'other';

  for (const seg of segments) {
    const dist = seg.distanceMeters || 0;
    if (dist <= 0) continue;

    if (seg.networkCategory === 'd-route' && seg.dRoute) {
      const dCode = seg.dRoute.code;
      if (!shareMap.has(dCode)) {
        shareMap.set(dCode, {
          id: dCode,
          code: dCode,
          name: `${dCode} ${seg.dRoute.name}`,
          category: 'd-route',
          color: seg.dRoute.color,
          description: seg.dRoute.fullName,
          meters: 0
        });
      }
      shareMap.get(dCode)!.meters += dist;
    } else if (seg.networkCategory === 'rcn') {
      if (!shareMap.has(rcnKey)) {
        shareMap.set(rcnKey, {
          id: rcnKey,
          name: 'Regionale Radfernwege (RCN)',
          category: 'rcn',
          color: '#10b981', // Emerald
          description: 'Überregionale Fluss- und Themenradwege der Bundesländer',
          meters: 0
        });
      }
      shareMap.get(rcnKey)!.meters += dist;
    } else if (seg.networkCategory === 'lcn' || seg.isCycleway) {
      if (!shareMap.has(lcnKey)) {
        shareMap.set(lcnKey, {
          id: lcnKey,
          name: 'Kommunales Radnetz (LCN)',
          category: 'lcn',
          color: '#3b82f6', // Blue
          description: 'Fahrradstraßen, Radwege und städtische Radverkehrsnetze',
          meters: 0
        });
      }
      shareMap.get(lcnKey)!.meters += dist;
    } else {
      if (!shareMap.has(otherKey)) {
        shareMap.set(otherKey, {
          id: otherKey,
          name: 'Sonstige Straßen & Wege',
          category: 'other',
          color: '#94a3b8', // Slate gray
          description: 'Ruhige Neben- und Verbindungsstraßen',
          meters: 0
        });
      }
      shareMap.get(otherKey)!.meters += dist;
    }
  }

  const effectiveTotal = Math.max(1, totalDistanceMeters);
  const items: RouteNetworkShare[] = [];

  let totalDRouteMeters = 0;
  let totalCycleNetworkMeters = 0;

  shareMap.forEach(item => {
    const distanceKm = Number((item.meters / 1000).toFixed(1));
    const percent = Math.round((item.meters / effectiveTotal) * 100);

    if (item.category === 'd-route') {
      totalDRouteMeters += item.meters;
      totalCycleNetworkMeters += item.meters;
    } else if (item.category === 'rcn' || item.category === 'lcn') {
      totalCycleNetworkMeters += item.meters;
    }

    items.push({
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      distanceMeters: item.meters,
      distanceKm,
      percent,
      color: item.color,
      description: item.description
    });
  });

  // Sort: D-Routes first (by distance desc), then RCN, LCN, other
  const categoryOrder: Record<NetworkCategory, number> = {
    'd-route': 1,
    'rcn': 2,
    'lcn': 3,
    'other': 4
  };

  items.sort((a, b) => {
    const orderA = categoryOrder[a.category];
    const orderB = categoryOrder[b.category];
    if (orderA !== orderB) return orderA - orderB;
    return b.distanceMeters - a.distanceMeters;
  });

  // Ensure percentages round nicely without drift
  const totalPercentSum = items.reduce((sum, item) => sum + item.percent, 0);
  if (items.length > 0 && totalPercentSum !== 100 && totalPercentSum > 0) {
    const diff = 100 - totalPercentSum;
    // Apply correction to the largest item
    items[0].percent = Math.max(0, items[0].percent + diff);
  }

  const totalDRouteKm = Number((totalDRouteMeters / 1000).toFixed(1));
  const totalDRoutePercent = Math.min(100, Math.round((totalDRouteMeters / effectiveTotal) * 100));

  const totalCycleNetworkKm = Number((totalCycleNetworkMeters / 1000).toFixed(1));
  const totalCycleNetworkPercent = Math.min(100, Math.round((totalCycleNetworkMeters / effectiveTotal) * 100));

  return {
    items,
    totalDRouteKm,
    totalDRoutePercent,
    totalCycleNetworkKm,
    totalCycleNetworkPercent
  };
}
