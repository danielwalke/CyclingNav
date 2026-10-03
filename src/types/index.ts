export type BikeProfile = 'safety' | 'trekking' | 'gravel' | 'fastbike';

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'start' | 'via' | 'end';
}

export type ManeuverType =
  | 'straight'
  | 'turn-slight-right'
  | 'turn-right'
  | 'turn-sharp-right'
  | 'turn-slight-left'
  | 'turn-left'
  | 'turn-sharp-left'
  | 'u-turn'
  | 'roundabout'
  | 'arrive'
  | 'depart';

export interface RouteInstruction {
  text: string;
  distance: number; // meters
  time: number; // seconds
  type: ManeuverType;
  location: [number, number]; // [lat, lng]
  index: number;
  streetName?: string;
}

export interface RouteCoordinate {
  lat: number;
  lng: number;
  ele?: number; // meters
  distanceFromStart?: number; // meters
}

export interface SurfaceStats {
  asphalt: number; // percentage (0-100)
  paved: number;
  unpaved: number;
  gravel: number;
  other: number;
}

export interface BikeRoute {
  id: string;
  name: string;
  coordinates: RouteCoordinate[];
  distance: number; // in meters
  duration: number; // in seconds
  ascent: number; // in meters
  descent: number; // in meters
  cyclingWayPercent: number; // percentage on dedicated cycleways / quiet tracks
  surfaceStats: SurfaceStats;
  instructions: RouteInstruction[];
  profile: BikeProfile;
  waypoints: Waypoint[];
}

export type BaseMapId = 'cyclosm' | 'osm' | 'opentopo';

export interface MapLayerConfig {
  id: BaseMapId;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export type PoiType = 'repair' | 'water' | 'shelter' | 'parking';

export interface BikePoi {
  id: string;
  lat: number;
  lng: number;
  type: PoiType;
  name: string;
  description?: string;
}

export interface PresetTour {
  id: string;
  title: string;
  region: string;
  description: string;
  highlights: string[];
  distanceKm: number;
  profile: BikeProfile;
  waypoints: Array<{ name: string; lat: number; lng: number }>;
}

export interface NavigationState {
  isActive: boolean;
  isSimulating: boolean;
  simSpeed: number; // multiplier e.g. 1x, 2x, 5x
  currentCoordIndex: number;
  currentPosition: [number, number] | null;
  heading: number; // degrees 0-360
  speedKmh: number;
  remainingDistance: number; // meters
  remainingDuration: number; // seconds
  currentInstruction: RouteInstruction | null;
  nextInstructionDistance: number; // meters
  voiceEnabled: boolean;
  voiceLang: 'de' | 'en';
}
