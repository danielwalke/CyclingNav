import React, { useCallback, useEffect, useState } from 'react';
import type {
  BaseMapId,
  BikePoi,
  BikeProfile,
  BikeRoute,
  NavigationState,
  PoiType,
  PresetTour,
  RouteColorMode,
  RouteCoordinate,
  RouteSegment,
  Waypoint
} from './types';

import { Map } from './components/Map';
import { Sidebar } from './components/Sidebar';
import { ElevationProfile } from './components/ElevationProfile';
import { NavigationHud } from './components/NavigationHud';
import { PoiOverlayControls } from './components/PoiOverlayControls';
import {
  calculateBearing,
  calculateDistance,
  fetchBRouterRoute,
  generateRoundTripWaypoints
} from './services/routing';
import { exportRouteToGpx, parseGpxFile } from './services/gpx';
import { fetchPoisInBounds } from './services/poi';
import { speechService } from './services/speech';
import { reverseGeocode } from './services/geocoding';
import { Menu, X } from 'lucide-react';


const INITIAL_WAYPOINTS: Waypoint[] = [
  {
    id: 'wp-start',
    name: 'Dresden Frauenkirche (Elberadweg)',
    lat: 51.0519,
    lng: 13.7415,
    type: 'start'
  },
  {
    id: 'wp-end',
    name: 'Kurort Rathen (Bastei)',
    lat: 50.9575,
    lng: 14.0784,
    type: 'end'
  }
];

export const App: React.FC = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>(INITIAL_WAYPOINTS);
  const [profile, setProfile] = useState<BikeProfile>('safety');
  const [baseMap, setBaseMap] = useState<BaseMapId>('cyclosm');
  const [showCycleOverlay, setShowCycleOverlay] = useState<boolean>(true);
  const [colorMode, setColorMode] = useState<RouteColorMode>('waytype');
  const [hoveredSegment, setHoveredSegment] = useState<RouteSegment | null>(null);
  const [route, setRoute] = useState<BikeRoute | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [hoveredCoord, setHoveredCoord] = useState<RouteCoordinate | null>(null);


  // POI state
  const [selectedPois, setSelectedPois] = useState<PoiType[]>(['repair', 'water']);
  const [pois, setPois] = useState<BikePoi[]>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Mobile sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Navigation & Simulation state
  const [navState, setNavState] = useState<NavigationState>({
    isActive: false,
    isSimulating: false,
    trackingMode: 'gps',
    gpsAccuracy: undefined,
    simSpeed: 2,
    currentCoordIndex: 0,
    currentPosition: null,
    heading: 0,
    speedKmh: 0,
    remainingDistance: 0,
    remainingDuration: 0,
    currentInstruction: null,
    nextInstructionDistance: 0,
    voiceEnabled: true,
    voiceLang: 'de'
  });

  // Calculate route whenever waypoints or profile change
  const computeRoute = useCallback(async (currentWaypoints: Waypoint[], currentProfile: BikeProfile) => {
    if (currentWaypoints.length < 2) {
      setRoute(null);
      return;
    }

    setIsLoadingRoute(true);
    try {
      const calculatedRoute = await fetchBRouterRoute(currentWaypoints, currentProfile);
      setRoute(calculatedRoute);

      // Fetch nearby bike POIs for the route's midpoint
      if (calculatedRoute.coordinates.length > 0) {
        const midIdx = Math.floor(calculatedRoute.coordinates.length / 2);
        const mid = calculatedRoute.coordinates[midIdx];
        const span = 0.08;
        const fetchedPois = await fetchPoisInBounds(
          mid.lat - span,
          mid.lng - span,
          mid.lat + span,
          mid.lng + span,
          selectedPois
        );
        setPois(fetchedPois);
      }
    } catch (err) {
      console.error('Failed to compute bike route:', err);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [selectedPois]);

  // Initial calculation
  useEffect(() => {
    computeRoute(waypoints, profile);
  }, []);

  // Update Waypoint
  const handleUpdateWaypoint = (index: number, name: string, lat: number, lng: number) => {
    setWaypoints(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], name, lat, lng };
      }
      computeRoute(updated, profile);
      return updated;
    });
  };

  // Move Waypoint on Map Drag
  const handleWaypointMove = async (id: string, lat: number, lng: number) => {
    const revName = await reverseGeocode(lat, lng);
    setWaypoints(prev => {
      const updated = prev.map(w => (w.id === id ? { ...w, lat, lng, name: revName } : w));
      computeRoute(updated, profile);
      return updated;
    });
  };

  // Add Waypoint
  const handleAddWaypoint = () => {
    setWaypoints(prev => {
      const last = prev[prev.length - 1];
      const secondLast = prev.length > 1 ? prev[prev.length - 2] : last;
      const midLat = (last.lat + secondLast.lat) / 2 + 0.01;
      const midLng = (last.lng + secondLast.lng) / 2 + 0.01;

      const newWp: Waypoint = {
        id: `wp-${Date.now()}`,
        name: `Zwischenstopp ${prev.length}`,
        lat: midLat,
        lng: midLng,
        type: 'via'
      };

      const updated = [...prev.slice(0, -1), newWp, last];
      computeRoute(updated, profile);
      return updated;
    });
  };

  // Remove Waypoint
  const handleRemoveWaypoint = (index: number) => {
    if (waypoints.length <= 2) return;
    setWaypoints(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Ensure first is start, last is end
      updated[0].type = 'start';
      updated[updated.length - 1].type = 'end';
      computeRoute(updated, profile);
      return updated;
    });
  };

  // Reverse Route
  const handleReverseRoute = () => {
    setWaypoints(prev => {
      const reversed: Waypoint[] = [...prev].reverse().map((wp, i) => ({
        ...wp,
        type: (i === 0 ? 'start' : i === prev.length - 1 ? 'end' : 'via') as Waypoint['type']
      }));
      computeRoute(reversed, profile);
      return reversed;
    });
  };


  // Clear Route
  const handleClearRoute = () => {
    setWaypoints([
      { id: 'start', name: 'Start', lat: 52.52, lng: 13.405, type: 'start' },
      { id: 'end', name: 'Ziel', lat: 52.51, lng: 13.38, type: 'end' }
    ]);
    setRoute(null);
  };

  // Map Click
  const handleMapClick = async (lat: number, lng: number) => {
    const revName = await reverseGeocode(lat, lng);
    // If fewer than 2 waypoints, set start or end
    if (waypoints.length < 2) {
      const newWps: Waypoint[] = [
        ...waypoints,
        { id: `wp-${Date.now()}`, name: revName, lat, lng, type: waypoints.length === 0 ? 'start' : 'end' }
      ];
      setWaypoints(newWps);
      computeRoute(newWps, profile);
    } else {
      // Append as new stop before destination
      const updated = [...waypoints];
      const last = updated.pop()!;
      updated.push({
        id: `wp-${Date.now()}`,
        name: revName,
        lat,
        lng,
        type: 'via'
      });
      updated.push(last);
      setWaypoints(updated);
      computeRoute(updated, profile);
    }
  };

  // Circular Round Trip Generator
  const handleGenerateRoundTrip = (targetKm: number) => {
    const start = waypoints[0];
    const generated = generateRoundTripWaypoints(start.lat, start.lng, targetKm);
    setWaypoints(generated);
    computeRoute(generated, profile);
  };

  // Load Curated German Preset Tour
  const handleLoadPresetTour = (preset: PresetTour) => {
    const wps: Waypoint[] = preset.waypoints.map((pw, i) => ({
      id: `preset-wp-${i}`,
      name: pw.name,
      lat: pw.lat,
      lng: pw.lng,
      type: i === 0 ? 'start' : i === preset.waypoints.length - 1 ? 'end' : 'via'
    }));
    setProfile(preset.profile);
    setWaypoints(wps);
    computeRoute(wps, preset.profile);
  };

  // POI toggle
  const handleTogglePoi = (type: PoiType) => {
    setSelectedPois(prev => {
      const updated = prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type];
      if (route && route.coordinates.length > 0) {
        const midIdx = Math.floor(route.coordinates.length / 2);
        const mid = route.coordinates[midIdx];
        fetchPoisInBounds(mid.lat - 0.08, mid.lng - 0.08, mid.lat + 0.08, mid.lng + 0.08, updated).then(setPois);
      }
      return updated;
    });
  };

  // Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolokalisierung wird von Ihrem Browser nicht unterstützt.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const name = await reverseGeocode(lat, lng);
        handleUpdateWaypoint(0, `Mein Standort (${name})`, lat, lng);
      },
      err => {
        setIsLocating(false);
        console.warn('Geolocation failed:', err);
        alert('Standort konnte nicht ermittelt werden. Bitte Berechtigung im Browser erteilen.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // GPX Export
  const handleExportGpx = () => {
    if (!route) return;
    exportRouteToGpx(route);
  };

  // GPX Import
  const handleImportGpx = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      if (content) {
        try {
          const parsed = parseGpxFile(content);
          if (parsed.coordinates.length >= 2) {
            setWaypoints(parsed.waypoints);
            const importedRoute: BikeRoute = {
              id: `imported-${Date.now()}`,
              name: parsed.name,
              coordinates: parsed.coordinates,
              distance: parsed.coordinates[parsed.coordinates.length - 1].distanceFromStart || 1000,
              duration: Math.round((parsed.coordinates[parsed.coordinates.length - 1].distanceFromStart || 1000) / 4.5),
              ascent: 50,
              descent: 50,
              cyclingWayPercent: 90,
              surfaceStats: { asphalt: 85, paved: 10, gravel: 5, unpaved: 0, other: 0 },
              wayTypeStats: {
                radwegMeters: Math.round(parsed.coordinates[parsed.coordinates.length - 1].distanceFromStart || 1000),
                nebenstrasseMeters: 0,
                wirtschaftswegMeters: 0,
                landesstrasseMeters: 0,
                bundesstrasseMeters: 0,
                sonstigeMeters: 0
              },
              detailedSurfaceStats: {
                asphaltMeters: Math.round((parsed.coordinates[parsed.coordinates.length - 1].distanceFromStart || 1000) * 0.85),
                pflasterMeters: Math.round((parsed.coordinates[parsed.coordinates.length - 1].distanceFromStart || 1000) * 0.1),
                schotterMeters: Math.round((parsed.coordinates[parsed.coordinates.length - 1].distanceFromStart || 1000) * 0.05),
                naturMeters: 0,
                sonstigeMeters: 0
              },
              segments: [],
              instructions: [],
              profile: 'safety',
              waypoints: parsed.waypoints
            };

            setRoute(importedRoute);
          }
        } catch (err) {
          alert('Fehler beim Einlesen der GPX-Datei.');
        }
      }
    };
    reader.readAsText(file);
  };

  const watchIdRef = React.useRef<number | null>(null);

  // Navigation Start / Stop
  const handleStartNavigation = (mode: 'gps' | 'simulation' = 'gps') => {
    if (!route || route.coordinates.length < 2) return;

    if (mode === 'gps' && !navigator.geolocation) {
      alert('GPS / Geolokalisierung wird von diesem Browser nicht unterstützt. Wechsle auf Simulation.');
      mode = 'simulation';
    }

    setNavState({
      isActive: true,
      isSimulating: mode === 'simulation',
      trackingMode: mode,
      gpsAccuracy: undefined,
      simSpeed: 2,
      currentCoordIndex: 0,
      currentPosition: [route.coordinates[0].lat, route.coordinates[0].lng],
      heading: calculateBearing(
        route.coordinates[0].lat,
        route.coordinates[0].lng,
        route.coordinates[1].lat,
        route.coordinates[1].lng
      ),
      speedKmh: mode === 'simulation' ? 18.0 : 0,
      remainingDistance: route.distance,
      remainingDuration: route.duration,
      currentInstruction: route.instructions[0] || null,
      nextInstructionDistance: route.instructions[0]?.distance || 150,
      voiceEnabled: true,
      voiceLang: 'de'
    });

    speechService.speak(
      `Navigation gestartet im ${mode === 'gps' ? 'Live-GPS' : 'Simulations'}-Modus. ${route.instructions[0]?.text || 'Dem Radweg folgen.'}`,
      'de'
    );
  };

  const handleStopNavigation = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setNavState(prev => ({ ...prev, isActive: false, isSimulating: false }));
    speechService.cancel();
  };

  // Real-time GPS tracking using navigator.geolocation.watchPosition
  useEffect(() => {
    if (!navState.isActive || navState.trackingMode !== 'gps' || !route) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;
        const gpsSpeedKmh = pos.coords.speed !== null && pos.coords.speed >= 0 ? pos.coords.speed * 3.6 : 0;
        const heading = pos.coords.heading !== null && !isNaN(pos.coords.heading) ? pos.coords.heading : 0;

        // Snap to nearest route coordinate
        let minD = Infinity;
        let nearestIdx = 0;
        for (let i = 0; i < route.coordinates.length; i++) {
          const c = route.coordinates[i];
          const dist = calculateDistance(lat, lng, c.lat, c.lng);
          if (dist < minD) {
            minD = dist;
            nearestIdx = i;
          }
        }

        const snappedCoord = route.coordinates[nearestIdx];
        const distFromStart = snappedCoord?.distanceFromStart || 0;
        const remainingDistance = Math.max(0, route.distance - distFromStart);
        const estSpeedKmh = gpsSpeedKmh > 1 ? gpsSpeedKmh : 16;
        const remainingDuration = Math.round(remainingDistance / (estSpeedKmh / 3.6));

        // Find upcoming maneuver
        let currentInstruction = route.instructions[0] || null;
        let nextInstructionDistance = remainingDistance;

        for (let i = 0; i < route.instructions.length; i++) {
          const inst = route.instructions[i];
          const instCoord = route.coordinates[inst.index];
          const instDist = instCoord?.distanceFromStart || 0;
          if (instDist >= distFromStart) {
            currentInstruction = inst;
            nextInstructionDistance = Math.round(instDist - distFromStart);
            break;
          }
        }

        // Voice trigger when approaching turn within 70m
        if (
          navState.voiceEnabled &&
          nextInstructionDistance <= 70 &&
          nextInstructionDistance > 15 &&
          currentInstruction
        ) {
          speechService.speak(
            `In ${nextInstructionDistance} Metern: ${currentInstruction.text}`,
            navState.voiceLang
          );
        }

        setNavState(prev => ({
          ...prev,
          currentPosition: [lat, lng],
          gpsAccuracy: accuracy,
          speedKmh: gpsSpeedKmh,
          heading: heading || prev.heading,
          currentCoordIndex: nearestIdx,
          remainingDistance,
          remainingDuration,
          currentInstruction,
          nextInstructionDistance
        }));
      },
      err => {
        console.warn('GPS watch error:', err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [navState.isActive, navState.trackingMode, route, navState.voiceEnabled, navState.voiceLang]);

  // Navigation simulation loop
  useEffect(() => {
    if (!navState.isActive || !navState.isSimulating || navState.trackingMode !== 'simulation' || !route) return;

    const interval = setInterval(() => {
      setNavState(prev => {
        if (!prev.isActive || !prev.isSimulating || prev.trackingMode !== 'simulation') return prev;

        const nextIdx = prev.currentCoordIndex + prev.simSpeed;
        if (nextIdx >= route.coordinates.length) {
          // Route completed
          speechService.speak('Sie haben Ihr Ziel erreicht. Gute Fahrt!', prev.voiceLang);
          return {
            ...prev,
            isSimulating: false,
            currentCoordIndex: route.coordinates.length - 1,
            remainingDistance: 0,
            remainingDuration: 0,
            speedKmh: 0
          };
        }

        const curr = route.coordinates[nextIdx];
        const nextTarget = route.coordinates[Math.min(nextIdx + 1, route.coordinates.length - 1)];
        const heading = calculateBearing(curr.lat, curr.lng, nextTarget.lat, nextTarget.lng);

        const currentDistFromStart = curr.distanceFromStart || 0;
        const totalDist = route.distance;
        const remainingDistance = Math.max(0, totalDist - currentDistFromStart);
        const speedKmh = 18.0 + (Math.sin(nextIdx / 10) * 3); // realistic bike speed oscillation
        const remainingDuration = Math.round(remainingDistance / (speedKmh / 3.6));

        // Find upcoming maneuver
        let currentInstruction = route.instructions[0] || null;
        let nextInstructionDistance = remainingDistance;

        for (let i = 0; i < route.instructions.length; i++) {
          const inst = route.instructions[i];
          const instCoord = route.coordinates[inst.index];
          const instDist = instCoord?.distanceFromStart || 0;
          if (instDist >= currentDistFromStart) {
            currentInstruction = inst;
            nextInstructionDistance = Math.round(instDist - currentDistFromStart);
            break;
          }
        }

        // Voice trigger when approaching turn within 70m
        if (
          prev.voiceEnabled &&
          nextInstructionDistance <= 70 &&
          nextInstructionDistance > 20 &&
          currentInstruction
        ) {
          speechService.speak(
            `In ${nextInstructionDistance} Metern: ${currentInstruction.text}`,
            prev.voiceLang
          );
        }

        return {
          ...prev,
          currentCoordIndex: nextIdx,
          currentPosition: [curr.lat, curr.lng],
          heading,
          speedKmh,
          remainingDistance,
          remainingDuration,
          currentInstruction,
          nextInstructionDistance
        };
      });
    }, 250);

    return () => clearInterval(interval);
  }, [navState.isActive, navState.isSimulating, navState.trackingMode, route]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden absolute top-4 right-4 z-40 p-2.5 bg-white text-slate-800 rounded-xl shadow-lg border border-slate-200"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Drawer */}
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-300 absolute md:relative z-30 h-full max-w-full`}
      >
        <Sidebar
          waypoints={waypoints}
          route={route}
          profile={profile}
          baseMap={baseMap}
          showCycleOverlay={showCycleOverlay}
          isLoading={isLoadingRoute}
          colorMode={colorMode}
          hoveredSegment={hoveredSegment}
          onSetProfile={newProf => {
            setProfile(newProf);
            computeRoute(waypoints, newProf);
          }}
          onSetBaseMap={setBaseMap}
          onToggleCycleOverlay={() => setShowCycleOverlay(prev => !prev)}
          onSetColorMode={setColorMode}
          onHoverSegment={setHoveredSegment}
          onSelectSegment={seg => setHoveredSegment(seg)}
          onUpdateWaypoint={handleUpdateWaypoint}
          onAddWaypoint={handleAddWaypoint}
          onRemoveWaypoint={handleRemoveWaypoint}
          onReverseRoute={handleReverseRoute}
          onClearRoute={handleClearRoute}
          onGenerateRoundTrip={handleGenerateRoundTrip}
          onLoadPresetTour={handleLoadPresetTour}
          onStartNavigation={handleStartNavigation}
          onExportGpx={handleExportGpx}
          onImportGpx={handleImportGpx}
        />
      </div>

      {/* Main Map View Area */}
      <main className="flex-1 relative h-full">
        {/* POI Controls and Geolocation */}
        <PoiOverlayControls
          selectedPois={selectedPois}
          onTogglePoi={handleTogglePoi}
          onLocateMe={handleLocateMe}
          isLocating={isLocating}
        />

        {/* Turn-by-Turn Navigation HUD */}
        {navState.isActive && (
          <NavigationHud
            navState={navState}
            onTogglePlay={() => setNavState(prev => ({ ...prev, isSimulating: !prev.isSimulating }))}
            onSetSimSpeed={speed => setNavState(prev => ({ ...prev, simSpeed: speed }))}
            onResetNav={() =>
              setNavState(prev => ({
                ...prev,
                currentCoordIndex: 0,
                currentPosition: route ? [route.coordinates[0].lat, route.coordinates[0].lng] : null
              }))
            }
            onToggleVoice={() => {
              const next = !navState.voiceEnabled;
              setNavState(prev => ({ ...prev, voiceEnabled: next }));
              speechService.setMuted(!next);
            }}
            onToggleVoiceLang={() =>
              setNavState(prev => ({ ...prev, voiceLang: prev.voiceLang === 'de' ? 'en' : 'de' }))
            }
            onStopNavigation={handleStopNavigation}
            onSwitchMode={mode => {
              if (mode === 'simulation') {
                setNavState(prev => ({
                  ...prev,
                  trackingMode: 'simulation',
                  isSimulating: true,
                  speedKmh: 18.0
                }));
              } else {
                setNavState(prev => ({
                  ...prev,
                  trackingMode: 'gps',
                  isSimulating: false,
                  speedKmh: 0
                }));
              }
            }}
            instructions={route?.instructions || []}
          />
        )}

        {/* Interactive Leaflet Map */}
        <Map
          baseMap={baseMap}
          showCycleOverlay={showCycleOverlay}
          waypoints={waypoints}
          route={route}
          hoveredCoord={hoveredCoord}
          navigationState={navState}
          pois={pois}
          colorMode={colorMode}
          hoveredSegment={hoveredSegment}
          onMapClick={handleMapClick}
          onWaypointMove={handleWaypointMove}
        />


        {/* Elevation Profile Chart */}
        {route && !navState.isActive && (
          <ElevationProfile
            coordinates={route.coordinates}
            ascent={route.ascent}
            descent={route.descent}
            onHoverCoord={setHoveredCoord}
          />
        )}
      </main>
    </div>
  );
};

export default App;
