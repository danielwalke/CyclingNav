import type { PresetTour } from '../types';

export const PRESET_TOURS: PresetTour[] = [
  {
    id: 'elberadweg',
    title: 'Elberadweg – Sächsische Schweiz',
    region: 'Sachsen',
    description: 'Einer der beliebtesten Flussradwege Europas. Verläuft auf flachen, asphaltierten Radwegen entlang der Elbe vorbei an Sandsteinfelsen und Festungen.',
    highlights: ['Dresden Frauenkirche', 'Schloss Pillnitz', 'Basteibrücke Rathen', 'Festung Königstein'],
    distanceKm: 42,
    profile: 'safety',
    waypoints: [
      { name: 'Dresden Frauenkirche', lat: 51.0519, lng: 13.7415 },
      { name: 'Schloss Pillnitz', lat: 51.0093, lng: 13.8703 },
      { name: 'Kurort Rathen (Bastei)', lat: 50.9575, lng: 14.0784 },
      { name: 'Festung Königstein', lat: 50.9192, lng: 14.0567 },
      { name: 'Bad Schandau Marktplatz', lat: 50.9173, lng: 14.1537 }
    ]
  },
  {
    id: 'berlin-wall',
    title: 'Berliner Mauerradweg (Mitte & Kreuzberg)',
    region: 'Berlin',
    description: 'Geschichtsträchtige, autofreie Tour auf dem ehemaligen Grenzstreifen mit Fahrradstraßen und parkähnlichen Wegen mitten durch die Hauptstadt.',
    highlights: ['Brandenburger Tor', 'Checkpoint Charlie', 'East Side Gallery', 'Tempelhofer Feld'],
    distanceKm: 24,
    profile: 'safety',
    waypoints: [
      { name: 'Brandenburger Tor', lat: 52.5163, lng: 13.3777 },
      { name: 'Checkpoint Charlie', lat: 52.5074, lng: 13.3904 },
      { name: 'East Side Gallery', lat: 52.5053, lng: 13.4396 },
      { name: 'Tempelhofer Feld', lat: 52.4735, lng: 13.4042 },
      { name: 'Potsdamer Platz', lat: 52.5096, lng: 13.3761 }
    ]
  },
  {
    id: 'isar-radweg',
    title: 'Münchner Isarradweg ins Voralpenland',
    region: 'Bayern',
    description: 'Traumhafte Flussroute direkt von der Münchner Innenstadt durch die Isarauen und das Naturschutzgebiet Pupplinger Au.',
    highlights: ['Englischer Garten', 'Flaucher', 'Großhesseloher Brücke', 'Pupplinger Au'],
    distanceKm: 38,
    profile: 'trekking',
    waypoints: [
      { name: 'München Odeonsplatz', lat: 48.1428, lng: 11.5776 },
      { name: 'Flauchersteg Isar', lat: 48.1121, lng: 11.5562 },
      { name: 'Großhesseloher Brücke', lat: 48.0772, lng: 11.5414 },
      { name: 'Kloster Schäftlarn', lat: 47.9784, lng: 11.4651 },
      { name: 'Wolfratshausen Altstadt', lat: 47.9137, lng: 11.4178 }
    ]
  },
  {
    id: 'bodensee-radweg',
    title: 'Bodensee-Radweg (Konstanz bis Lindau)',
    region: 'Baden-Württemberg & Bayern',
    description: 'Klassiker am Dreiländereck. Ausgeschilderte Uferradwege mit Panoramablick auf die Schweizer Alpen.',
    highlights: ['Konstanz Münster', 'Blumeninsel Mainau', 'Burg Meersburg', 'Lindau Inselhafen'],
    distanceKm: 48,
    profile: 'safety',
    waypoints: [
      { name: 'Konstanz Hafen', lat: 47.6601, lng: 9.1783 },
      { name: 'Insel Mainau', lat: 47.7051, lng: 9.1956 },
      { name: 'Meersburg Altstadt', lat: 47.6942, lng: 9.2717 },
      { name: 'Friedrichshafen Promenade', lat: 47.6508, lng: 9.4795 },
      { name: 'Lindau Insel', lat: 47.5457, lng: 9.6841 }
    ]
  },
  {
    id: 'rhein-mittelrhein',
    title: 'Rheinradweg – Romantischer Mittelrhein',
    region: 'Rheinland-Pfalz',
    description: 'UNESCO-Welterbe Oberes Mittelrheintal: Ebener Radweg entlang des Rheins vorbei an Burgen und Steillagenweinbergen.',
    highlights: ['Deutsches Eck Koblenz', 'Schloss Stolzenfels', 'Bopparder Hamm', 'Loreley-Felsen'],
    distanceKm: 36,
    profile: 'safety',
    waypoints: [
      { name: 'Koblenz Deutsches Eck', lat: 50.3644, lng: 7.6061 },
      { name: 'Schloss Stolzenfels', lat: 50.3039, lng: 7.5925 },
      { name: 'Boppard Rheinallee', lat: 50.2319, lng: 7.5901 },
      { name: 'St. Goar (Burg Rheinfels)', lat: 50.1509, lng: 7.7135 }
    ]
  },
  {
    id: 'mosel-radweg',
    title: 'Mosel-Radweg (Traben-Trarbach bis Cochem)',
    region: 'Rheinland-Pfalz',
    description: 'Entspannte Flussradtour durch die berühmtesten Moselschleifen, vorbei am steilsten Weinberg Europas (Calmont).',
    highlights: ['Jugendstilstadt Traben-Trarbach', 'Zeller Schwarze Katz', 'Calmont Klettersteig-Blick', 'Reichsburg Cochem'],
    distanceKm: 52,
    profile: 'safety',
    waypoints: [
      { name: 'Traben-Trarbach Brückentor', lat: 49.9514, lng: 7.1147 },
      { name: 'Zell (Mosel)', lat: 50.0268, lng: 7.1824 },
      { name: 'Bremm am Calmont', lat: 50.1009, lng: 7.1218 },
      { name: 'Cochem Reichsburg', lat: 50.1422, lng: 7.1666 }
    ]
  },
  {
    id: 'hamburg-alster-elbe',
    title: 'Hamburg Alster & Elberadweg',
    region: 'Hamburg',
    description: 'Hafenflair, grüne Uferwege um die Alster und Radeln an den Elbstränden bis nach Blankenese.',
    highlights: ['Landungsbrücken', 'Elbphilharmonie', 'Außenalster', 'Treppenviertel Blankenese'],
    distanceKm: 28,
    profile: 'safety',
    waypoints: [
      { name: 'Landungsbrücken', lat: 53.5458, lng: 9.9678 },
      { name: 'Elbphilharmonie HafenCity', lat: 53.5413, lng: 9.9842 },
      { name: 'Außenalster Westufer', lat: 53.5658, lng: 10.0012 },
      { name: 'Museumshafen Oevelgönne', lat: 53.5442, lng: 9.9142 },
      { name: 'Blankenese Treppenviertel', lat: 53.5583, lng: 9.8136 }
    ]
  }
];
