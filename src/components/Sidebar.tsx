import React, { useState } from 'react';
import {
  Bike,
  Compass,
  Download,
  Loader2,
  MapPin,
  Navigation,
  Plus,
  Repeat,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trees,
  Upload,
  Zap
} from 'lucide-react';
import type { BikeProfile, BikeRoute, BaseMapId, PresetTour, RouteColorMode, RouteSegment, Waypoint } from '../types';
import type { GeocodeResult } from '../services/geocoding';
import { searchPlaces } from '../services/geocoding';
import { PRESET_TOURS } from '../data/presetTours';
import { UndergroundBreakdown } from './UndergroundBreakdown';

interface SidebarProps {
  waypoints: Waypoint[];
  route: BikeRoute | null;
  profile: BikeProfile;
  baseMap: BaseMapId;
  showCycleOverlay: boolean;
  isLoading: boolean;
  colorMode: RouteColorMode;
  hoveredSegment: RouteSegment | null;
  onSetProfile: (profile: BikeProfile) => void;
  onSetBaseMap: (map: BaseMapId) => void;
  onToggleCycleOverlay: () => void;
  onSetColorMode: (mode: RouteColorMode) => void;
  onHoverSegment: (segment: RouteSegment | null) => void;
  onSelectSegment: (segment: RouteSegment) => void;
  onUpdateWaypoint: (index: number, name: string, lat: number, lng: number) => void;
  onAddWaypoint: () => void;
  onRemoveWaypoint: (index: number) => void;
  onReverseRoute: () => void;
  onClearRoute: () => void;
  onGenerateRoundTrip: (distanceKm: number) => void;
  onLoadPresetTour: (tour: PresetTour) => void;
  onStartNavigation: () => void;
  onExportGpx: () => void;
  onImportGpx: (file: File) => void;
}


export const Sidebar: React.FC<SidebarProps> = ({
  waypoints,
  route,
  profile,
  baseMap,
  showCycleOverlay,
  isLoading,
  colorMode,
  hoveredSegment,
  onSetProfile,
  onSetBaseMap,
  onToggleCycleOverlay,
  onSetColorMode,
  onHoverSegment,
  onSelectSegment,
  onUpdateWaypoint,
  onAddWaypoint,
  onRemoveWaypoint,
  onReverseRoute,
  onClearRoute,
  onGenerateRoundTrip,
  onLoadPresetTour,
  onStartNavigation,
  onExportGpx,
  onImportGpx
}) => {
  const [activeTab, setActiveTab] = useState<'planner' | 'underground' | 'tours' | 'steps' | 'layers'>('planner');
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({});
  const [searchResults, setSearchResults] = useState<Record<number, GeocodeResult[]>>({});
  const [roundTripKm, setRoundTripKm] = useState(30);
  const [isSearchingIdx, setIsSearchingIdx] = useState<number | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSearchChange = async (index: number, val: string) => {
    setSearchQueries(prev => ({ ...prev, [index]: val }));
    if (val.trim().length >= 2) {
      setIsSearchingIdx(index);
      const results = await searchPlaces(val);
      setSearchResults(prev => ({ ...prev, [index]: results }));
      setIsSearchingIdx(null);
    } else {
      setSearchResults(prev => ({ ...prev, [index]: [] }));
    }
  };

  const handleSelectResult = (index: number, res: GeocodeResult) => {
    onUpdateWaypoint(index, res.name, res.lat, res.lng);
    setSearchQueries(prev => ({ ...prev, [index]: res.name }));
    setSearchResults(prev => ({ ...prev, [index]: [] }));
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    if (hours > 0) return `${hours} h ${mins} min`;
    return `${mins} min`;
  };

  return (
    <aside className="w-full md:w-96 lg:w-[430px] h-full bg-white flex flex-col shadow-2xl border-r border-slate-200 z-20 shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400/30">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg tracking-tight">RadTour Germany</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  OSM
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 font-medium">Bikes-Only & Maximale Radwege</p>
            </div>
          </div>
        </div>

        {/* Tab switcher with 5 tabs */}
        <div className="grid grid-cols-5 gap-1 mt-4 p-1 bg-black/20 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('planner')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === 'planner' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:text-white'
            }`}
          >
            Planer
          </button>
          <button
            onClick={() => setActiveTab('underground')}
            className={`py-1.5 rounded-lg transition-all text-center relative ${
              activeTab === 'underground' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:text-white'
            }`}
            title="Untergrund & Wegearten (Bundesstraßen, Radwege, Belag)"
          >
            <span>Wege</span>
            {route && route.wayTypeStats.bundesstrasseMeters > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 absolute top-1 right-1"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tours')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === 'tours' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:text-white'
            }`}
          >
            Touren
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === 'steps' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:text-white'
            }`}
          >
            Hinweise
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === 'layers' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:text-white'
            }`}
          >
            Karten
          </button>
        </div>
      </div>


      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-4">
            {/* Routing Profiles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Fahrrad-Routing Profil
                </label>
                {isLoading && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Berechne...</span>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSetProfile('safety')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    profile === 'safety'
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Max. Radwege</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    Sicherste Route, getrennte Radwege & autofreie Pfade
                  </p>
                </button>

                <button
                  onClick={() => onSetProfile('trekking')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    profile === 'trekking'
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                    <Compass className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Radfernwege</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    D-Netz, Flussradwege & touristische Touren
                  </p>
                </button>

                <button
                  onClick={() => onSetProfile('gravel')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    profile === 'gravel'
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                    <Trees className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Gravel & Wald</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    Schotter, Wald- & Naturwege abseits von Straßen
                  </p>
                </button>

                <button
                  onClick={() => onSetProfile('fastbike')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    profile === 'fastbike'
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                    <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Schnelles Rad</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    Schnellster Asphalt, Pendler & Rennrad-Tauglich
                  </p>
                </button>
              </div>
            </div>

            {/* Waypoints List with Geocoding */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Wegpunkte & Stopps
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={onReverseRoute}
                    className="p-1 text-slate-400 hover:text-emerald-700 rounded hover:bg-slate-100 transition-colors"
                    title="Richtung umkehren"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onClearRoute}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                    title="Route löschen"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 relative">
                {waypoints.map((wp, idx) => {
                  const isStart = idx === 0;
                  const isEnd = idx === waypoints.length - 1 && waypoints.length > 1;
                  const query = searchQueries[idx] ?? wp.name;
                  const results = searchResults[idx] || [];

                  return (
                    <div key={wp.id} className="relative">
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                            isStart ? 'bg-emerald-600' : isEnd ? 'bg-rose-600' : 'bg-sky-600'
                          }`}
                        >
                          {isStart ? 'A' : isEnd ? 'B' : idx}
                        </div>

                        <input
                          type="text"
                          placeholder={isStart ? 'Startort in Deutschland...' : isEnd ? 'Zielort...' : `Zwischenstopp ${idx}...`}
                          value={query}
                          onChange={e => handleSearchChange(idx, e.target.value)}
                          className="flex-1 text-xs bg-transparent border-none outline-none font-medium text-slate-800 placeholder-slate-400"
                        />

                        {isSearchingIdx === idx && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        )}

                        {waypoints.length > 2 && (
                          <button
                            onClick={() => onRemoveWaypoint(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Entfernen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Autocomplete Dropdown */}
                      {results.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                          {results.map((r, rIdx) => (
                            <button
                              key={rIdx}
                              onClick={() => handleSelectResult(idx, r)}
                              className="w-full px-3 py-2 text-left hover:bg-emerald-50/70 transition-colors flex items-start gap-2"
                            >
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-800 truncate">{r.name}</div>
                                <div className="text-[11px] text-slate-500 truncate">{r.detail}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={onAddWaypoint}
                  className="w-full py-2 border border-dashed border-slate-300 hover:border-emerald-500 hover:text-emerald-700 rounded-xl text-xs font-semibold text-slate-500 flex items-center justify-center gap-1.5 transition-all bg-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Weiteren Zwischenstopp hinzufügen</span>
                </button>
              </div>
            </div>

            {/* Circular Tour Generator */}
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rundtour-Generator</span>
                </span>
                <span className="text-xs font-bold text-emerald-700">{roundTripKm} km</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={roundTripKm}
                onChange={e => setRoundTripKm(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <button
                onClick={() => onGenerateRoundTrip(roundTripKm)}
                className="w-full py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                {roundTripKm} km Rundtour ab Start generieren
              </button>
            </div>

            {/* Route Analytics & Summary */}
            {route && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Routendaten
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    {route.cyclingWayPercent}% Radwege / ruhig
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-800/60 rounded-xl p-2.5">
                    <span className="text-[11px] text-slate-400">Strecke</span>
                    <div className="text-lg font-extrabold text-white mt-0.5">
                      {(route.distance / 1000).toFixed(1)} km
                    </div>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-2.5">
                    <span className="text-[11px] text-slate-400">Fahrzeit (~18 km/h)</span>
                    <div className="text-lg font-extrabold text-white mt-0.5">
                      {formatDuration(route.duration)}
                    </div>
                  </div>
                </div>

                {/* Surface breakdown */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                    <span>Oberfläche</span>
                    <span>Asphalt {route.surfaceStats.asphalt}% | Kies/Pflaster {route.surfaceStats.paved + route.surfaceStats.gravel}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-800">
                    <div
                      style={{ width: `${route.surfaceStats.asphalt}%` }}
                      className="bg-emerald-400 h-full"
                      title={`Asphalt: ${route.surfaceStats.asphalt}%`}
                    />
                    <div
                      style={{ width: `${route.surfaceStats.paved}%` }}
                      className="bg-sky-400 h-full"
                      title={`Pflaster: ${route.surfaceStats.paved}%`}
                    />
                    <div
                      style={{ width: `${route.surfaceStats.gravel}%` }}
                      className="bg-amber-400 h-full"
                      title={`Kies/Schotter: ${route.surfaceStats.gravel}%`}
                    />
                    <div
                      style={{ width: `${route.surfaceStats.unpaved}%` }}
                      className="bg-orange-500 h-full"
                      title={`Naturpfad: ${route.surfaceStats.unpaved}%`}
                    />
                  </div>
                </div>

                {/* Underground & Bundesstraße quick banner */}
                <button
                  onClick={() => setActiveTab('underground')}
                  className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      Wege- & Oberflächen-Details
                    </span>
                    {route.wayTypeStats.bundesstrasseMeters > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                        {(route.wayTypeStats.bundesstrasseMeters / 1000).toFixed(1)} km Bundesstr.
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        0% Bundesstr.
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-emerald-400 group-hover:translate-x-0.5 transition-transform font-bold">
                    Öffnen →
                  </span>
                </button>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={onStartNavigation}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                  >
                    <Navigation className="w-4 h-4 fill-white" />
                    <span>Navigation & Tour starten</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={onExportGpx}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                      title="GPX-Datei für Garmin/Wahoo/Komoot herunterladen"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>GPX Export</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                      title="GPX-Track hochladen und anzeigen"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>GPX Import</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".gpx"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) onImportGpx(file);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UNDERGROUND & ROAD COMPOSITION */}
        {activeTab === 'underground' && (
          <div className="space-y-4">
            {!route ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Bitte berechne zuerst eine Route im Planer.
              </div>
            ) : (
              <UndergroundBreakdown
                totalDistanceMeters={route.distance}
                wayTypeStats={route.wayTypeStats}
                detailedSurfaceStats={route.detailedSurfaceStats}
                segments={route.segments}
                colorMode={colorMode}
                onSetColorMode={onSetColorMode}
                hoveredSegment={hoveredSegment}
                onHoverSegment={onHoverSegment}
                onSelectSegment={onSelectSegment}
              />
            )}
          </div>
        )}

        {/* TAB 3: CURATED GERMAN BIKE TOURS */}
        {activeTab === 'tours' && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Kuratierte Radfernwege:</span> Ausgeschilderte Premium-Radtouren in Deutschland mit hohem Anteil an autofreien Uferradwegen und Radinfrastruktur.
            </div>


            <div className="space-y-3">
              {PRESET_TOURS.map(tour => (
                <div
                  key={tour.id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md bg-white transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {tour.region}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-1">{tour.title}</h3>
                    </div>
                    <span className="text-xs font-extrabold text-slate-700 shrink-0">
                      {tour.distanceKm} km
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {tour.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {tour.highlights.map((h, i) => (
                      <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {h}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      onLoadPresetTour(tour);
                      setActiveTab('planner');
                    }}
                    className="w-full mt-3 py-2 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Tour in Planer laden</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TURN-BY-TURN INSTRUCTIONS */}
        {activeTab === 'steps' && (
          <div className="space-y-3">
            {!route || route.instructions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Bitte berechne zuerst eine Route im Planer.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {route.instructions.map((inst, idx) => (
                  <div key={idx} className="py-2.5 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800">{inst.text}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {inst.distance > 0 && <span>{inst.distance} m</span>}
                        {inst.streetName && <span className="text-emerald-700 font-medium">{inst.streetName}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MAP LAYERS & BIKE OVERLAYS */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Basiskarte
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => onSetBaseMap('cyclosm')}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    baseMap === 'cyclosm'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-emerald-600 text-white font-bold text-xs">
                    🚴
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">CyclOSM (Fahrradkarte)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Spezielle Radwegekarte: Hervorhebung von Radwegen, Spuren, Oberflächen und Fahrrad-Infrastruktur
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onSetBaseMap('osm')}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    baseMap === 'osm'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-sky-600 text-white font-bold text-xs">
                    🗺️
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">OpenStreetMap Standard</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Universelle OSM-Karte mit vollständiger Straßen- und Geländedarstellung
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onSetBaseMap('opentopo')}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    baseMap === 'opentopo'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-amber-600 text-white font-bold text-xs">
                    ⛰️
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">OpenTopoMap (Höhenlinien)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Topografische Karte mit Höhenlinien und Schummerung für bergige Radtouren
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Radnetz Deutschland Overlay */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Radnetz Deutschland Overlay</div>
                  <div className="text-[11px] text-slate-500">Waymarked Trails Fahrradnetz (D-Routen, EuroVelo)</div>
                </div>
                <input
                  type="checkbox"
                  checked={showCycleOverlay}
                  onChange={onToggleCycleOverlay}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer status */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
        <span>BRouter + FOSSGIS DE Server</span>
        <span>Deutschland OSM</span>
      </div>
    </aside>
  );
};
