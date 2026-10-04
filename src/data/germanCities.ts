export interface CityEntry {
  name: string;
  detail: string;
  lat: number;
  lng: number;
  aliases?: string[];
}

export const GERMAN_MAJOR_CITIES: CityEntry[] = [
  { name: 'Berlin', detail: 'Berlin, Deutschland', lat: 52.5200, lng: 13.4050 },
  { name: 'Hamburg', detail: 'Hamburg, Deutschland', lat: 53.5511, lng: 9.9937 },
  { name: 'München', detail: 'Bayern, Deutschland', lat: 48.1351, lng: 11.5820, aliases: ['Munchen', 'Munich'] },
  { name: 'Köln', detail: 'Nordrhein-Westfalen, Deutschland', lat: 50.9375, lng: 6.9603, aliases: ['Koln', 'Cologne'] },
  { name: 'Frankfurt am Main', detail: 'Hessen, Deutschland', lat: 50.1109, lng: 8.6821, aliases: ['Frankfurt'] },
  { name: 'Stuttgart', detail: 'Baden-Württemberg, Deutschland', lat: 48.7758, lng: 9.1829 },
  { name: 'Düsseldorf', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.2277, lng: 6.7735, aliases: ['Dusseldorf'] },
  { name: 'Leipzig', detail: 'Sachsen, Deutschland', lat: 51.3397, lng: 12.3731 },
  { name: 'Dortmund', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.5136, lng: 7.4653 },
  { name: 'Essen', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.4556, lng: 7.0116 },
  { name: 'Bremen', detail: 'Bremen, Deutschland', lat: 53.0793, lng: 8.8017 },
  { name: 'Dresden', detail: 'Sachsen, Deutschland', lat: 51.0504, lng: 13.7373 },
  { name: 'Hannover', detail: 'Niedersachsen, Deutschland', lat: 52.3759, lng: 9.7320 },
  { name: 'Nürnberg', detail: 'Bayern, Deutschland', lat: 49.4521, lng: 11.0767, aliases: ['Nurnberg', 'Nuremberg'] },
  { name: 'Duisburg', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.4344, lng: 6.7623 },
  { name: 'Bochum', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.4818, lng: 7.2162 },
  { name: 'Wuppertal', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.2562, lng: 7.1508 },
  { name: 'Bielefeld', detail: 'Nordrhein-Westfalen, Deutschland', lat: 52.0302, lng: 8.5325 },
  { name: 'Bonn', detail: 'Nordrhein-Westfalen, Deutschland', lat: 50.7374, lng: 7.0982 },
  { name: 'Münster', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.9607, lng: 7.6261, aliases: ['Munster'] },
  { name: 'Karlsruhe', detail: 'Baden-Württemberg, Deutschland', lat: 49.0069, lng: 8.4037 },
  { name: 'Mannheim', detail: 'Baden-Württemberg, Deutschland', lat: 49.4875, lng: 8.4660 },
  { name: 'Augsburg', detail: 'Bayern, Deutschland', lat: 48.3705, lng: 10.8978 },
  { name: 'Wiesbaden', detail: 'Hessen, Deutschland', lat: 50.0782, lng: 8.2398 },
  { name: 'Mönchengladbach', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.1805, lng: 6.4428, aliases: ['Monchengladbach'] },
  { name: 'Gelsenkirchen', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.5177, lng: 7.0857 },
  { name: 'Aachen', detail: 'Nordrhein-Westfalen, Deutschland', lat: 50.7753, lng: 6.0839 },
  { name: 'Braunschweig', detail: 'Niedersachsen, Deutschland', lat: 52.2689, lng: 10.5268 },
  { name: 'Chemnitz', detail: 'Sachsen, Deutschland', lat: 50.8278, lng: 12.9214 },
  { name: 'Kiel', detail: 'Schleswig-Holstein, Deutschland', lat: 54.3233, lng: 10.1228 },
  { name: 'Halle (Saale)', detail: 'Sachsen-Anhalt, Deutschland', lat: 51.4828, lng: 11.9698, aliases: ['Halle'] },
  { name: 'Magdeburg', detail: 'Sachsen-Anhalt, Deutschland', lat: 52.1205, lng: 11.6276 },
  { name: 'Freiburg im Breisgau', detail: 'Baden-Württemberg, Deutschland', lat: 47.9990, lng: 7.8421, aliases: ['Freiburg'] },
  { name: 'Krefeld', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.3388, lng: 6.5853 },
  { name: 'Mainz', detail: 'Rheinland-Pfalz, Deutschland', lat: 49.9929, lng: 8.2473 },
  { name: 'Lübeck', detail: 'Schleswig-Holstein, Deutschland', lat: 53.8655, lng: 10.6866, aliases: ['Lubeck'] },
  { name: 'Erfurt', detail: 'Thüringen, Deutschland', lat: 50.9848, lng: 11.0299 },
  { name: 'Oberhausen', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.4700, lng: 6.8517 },
  { name: 'Rostock', detail: 'Mecklenburg-Vorpommern, Deutschland', lat: 54.0924, lng: 12.0991 },
  { name: 'Kassel', detail: 'Hessen, Deutschland', lat: 51.3127, lng: 9.4797 },
  { name: 'Hagen', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.3671, lng: 7.4633 },
  { name: 'Potsdam', detail: 'Brandenburg, Deutschland', lat: 52.3906, lng: 13.0645 },
  { name: 'Saarbrücken', detail: 'Saarland, Deutschland', lat: 49.2402, lng: 6.9969, aliases: ['Saarbrucken'] },
  { name: 'Hamm', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.6813, lng: 7.8189 },
  { name: 'Ludwigshafen', detail: 'Rheinland-Pfalz, Deutschland', lat: 49.4774, lng: 8.4452 },
  { name: 'Mülheim an der Ruhr', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.4273, lng: 6.8828, aliases: ['Mulheim'] },
  { name: 'Oldenburg', detail: 'Niedersachsen, Deutschland', lat: 53.1435, lng: 8.2146 },
  { name: 'Osnabrück', detail: 'Niedersachsen, Deutschland', lat: 52.2799, lng: 8.0472, aliases: ['Osnabruck'] },
  { name: 'Leverkusen', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.0459, lng: 6.9865 },
  { name: 'Heidelberg', detail: 'Baden-Württemberg, Deutschland', lat: 49.3988, lng: 8.6724 },
  { name: 'Darmstadt', detail: 'Hessen, Deutschland', lat: 49.8728, lng: 8.6512 },
  { name: 'Solingen', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.1652, lng: 7.0671 },
  { name: 'Herne', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.5427, lng: 7.2190 },
  { name: 'Regensburg', detail: 'Bayern, Deutschland', lat: 49.0134, lng: 12.1016 },
  { name: 'Paderborn', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.7189, lng: 8.7575 },
  { name: 'Ingolstadt', detail: 'Bayern, Deutschland', lat: 48.7665, lng: 11.4258 },
  { name: 'Würzburg', detail: 'Bayern, Deutschland', lat: 49.7913, lng: 9.9534, aliases: ['Wurzburg'] },
  { name: 'Fürth', detail: 'Bayern, Deutschland', lat: 49.4771, lng: 10.9887, aliases: ['Furth'] },
  { name: 'Wolfsburg', detail: 'Niedersachsen, Deutschland', lat: 52.4227, lng: 10.7865 },
  { name: 'Ulm', detail: 'Baden-Württemberg, Deutschland', lat: 48.4011, lng: 9.9876 },
  { name: 'Heilbronn', detail: 'Baden-Württemberg, Deutschland', lat: 49.1427, lng: 9.2109 },
  { name: 'Pforzheim', detail: 'Baden-Württemberg, Deutschland', lat: 48.8922, lng: 8.6946 },
  { name: 'Göttingen', detail: 'Niedersachsen, Deutschland', lat: 51.5413, lng: 9.9158, aliases: ['Gottingen'] },
  { name: 'Bottrop', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.5216, lng: 6.9288 },
  { name: 'Trier', detail: 'Rheinland-Pfalz, Deutschland', lat: 49.7499, lng: 6.6371 },
  { name: 'Recklinghausen', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.6145, lng: 7.1983 },
  { name: 'Reutlingen', detail: 'Baden-Württemberg, Deutschland', lat: 48.4914, lng: 9.2043 },
  { name: 'Bremerhaven', detail: 'Bremen, Deutschland', lat: 53.5396, lng: 8.5809 },
  { name: 'Koblenz', detail: 'Rheinland-Pfalz, Deutschland', lat: 50.3569, lng: 7.5944 },
  { name: 'Bergisch Gladbach', detail: 'Nordrhein-Westfalen, Deutschland', lat: 50.9929, lng: 7.1292 },
  { name: 'Jena', detail: 'Thüringen, Deutschland', lat: 50.9271, lng: 11.5892 },
  { name: 'Remscheid', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.1799, lng: 7.1925 },
  { name: 'Erlangen', detail: 'Bayern, Deutschland', lat: 49.5897, lng: 11.0039 },
  { name: 'Moers', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.4513, lng: 6.6284 },
  { name: 'Siegen', detail: 'Nordrhein-Westfalen, Deutschland', lat: 50.8744, lng: 8.0243 },
  { name: 'Hildesheim', detail: 'Niedersachsen, Deutschland', lat: 52.1548, lng: 9.9579 },
  { name: 'Salzgitter', detail: 'Niedersachsen, Deutschland', lat: 52.1504, lng: 10.3593 },
  { name: 'Cottbus', detail: 'Brandenburg, Deutschland', lat: 51.7563, lng: 14.3329 },
  { name: 'Kaiserslautern', detail: 'Rheinland-Pfalz, Deutschland', lat: 49.4447, lng: 7.7690 },
  { name: 'Gütersloh', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.9066, lng: 8.3784, aliases: ['Gutersloh'] },
  { name: 'Schwerin', detail: 'Mecklenburg-Vorpommern, Deutschland', lat: 53.6355, lng: 11.4012 },
  { name: 'Witten', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.4422, lng: 7.3364 },
  { name: 'Hanau', detail: 'Hessen, Deutschland', lat: 50.1328, lng: 8.9287 },
  { name: 'Esslingen', detail: 'Baden-Württemberg, Deutschland', lat: 48.7428, lng: 9.3082 },
  { name: 'Ludwigsburg', detail: 'Baden-Württemberg, Deutschland', lat: 48.8974, lng: 9.1918 },
  { name: 'Gera', detail: 'Thüringen, Deutschland', lat: 50.8805, lng: 12.0833 },
  { name: 'Iserlohn', detail: 'Nordrhein-Westfalen, Deutschland', lat: 51.3764, lng: 7.6976 },
  { name: 'Tübingen', detail: 'Baden-Württemberg, Deutschland', lat: 48.5216, lng: 9.0576, aliases: ['Tubingen'] },
  { name: 'Flensburg', detail: 'Schleswig-Holstein, Deutschland', lat: 54.7836, lng: 9.4321 },
  { name: 'Zwickau', detail: 'Sachsen, Deutschland', lat: 50.7189, lng: 12.4962 },
  { name: 'Gießen', detail: 'Hessen, Deutschland', lat: 50.5873, lng: 8.6755, aliases: ['Giessen'] },
  { name: 'Villingen-Schwenningen', detail: 'Baden-Württemberg, Deutschland', lat: 48.0601, lng: 8.4587 },
  { name: 'Konstanz', detail: 'Baden-Württemberg, Deutschland', lat: 47.6779, lng: 9.1732 },
  { name: 'Passau', detail: 'Bayern, Deutschland', lat: 48.5667, lng: 13.4319 },
  { name: 'Bamberg', detail: 'Bayern, Deutschland', lat: 49.8988, lng: 10.9028 },
  { name: 'Cuxhaven', detail: 'Niedersachsen, Deutschland', lat: 53.8617, lng: 8.6942 },
  { name: 'Stralsund', detail: 'Mecklenburg-Vorpommern, Deutschland', lat: 54.3125, lng: 13.0827 },
  { name: 'Bad Schandau', detail: 'Sachsen, Deutschland', lat: 50.9168, lng: 14.1558 },
  { name: 'Kurort Rathen', detail: 'Sächsische Schweiz, Sachsen', lat: 50.9575, lng: 14.0784 }
];

export function findLocalCities(query: string): CityEntry[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();

  const exactMatches: CityEntry[] = [];
  const startsWithMatches: CityEntry[] = [];
  const containsMatches: CityEntry[] = [];

  for (const city of GERMAN_MAJOR_CITIES) {
    const nameLower = city.name.toLowerCase();
    const aliasLower = (city.aliases || []).map(a => a.toLowerCase());

    if (nameLower === q || aliasLower.includes(q)) {
      exactMatches.push(city);
    } else if (nameLower.startsWith(q) || aliasLower.some(a => a.startsWith(q))) {
      startsWithMatches.push(city);
    } else if (nameLower.includes(q) || city.detail.toLowerCase().includes(q)) {
      containsMatches.push(city);
    }
  }

  return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, 5);
}
