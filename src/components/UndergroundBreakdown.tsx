import React from 'react';
import type {
  DetailedSurfaceStats,
  RouteColorMode,
  RouteNetworkBreakdown,
  RouteSegment,
  WayTypeStats
} from '../types';
import {
  AlertTriangle,
  Award,
  Eye,
  Layers,
  MapPin,
  Route,
  ShieldCheck,
  Trees
} from 'lucide-react';

interface UndergroundBreakdownProps {
  totalDistanceMeters: number;
  wayTypeStats: WayTypeStats;
  detailedSurfaceStats: DetailedSurfaceStats;
  networkBreakdown?: RouteNetworkBreakdown;
  segments: RouteSegment[];
  colorMode: RouteColorMode;
  onSetColorMode: (mode: RouteColorMode) => void;
  hoveredSegment: RouteSegment | null;
  onHoverSegment: (segment: RouteSegment | null) => void;
  onSelectSegment: (segment: RouteSegment) => void;
}

export const UndergroundBreakdown: React.FC<UndergroundBreakdownProps> = ({
  totalDistanceMeters,
  wayTypeStats,
  detailedSurfaceStats,
  networkBreakdown,
  segments,
  colorMode,
  onSetColorMode,
  hoveredSegment,
  onHoverSegment,
  onSelectSegment
}) => {
  const total = Math.max(1, totalDistanceMeters);

  const getPercent = (meters: number) => {
    return Math.round((meters / total) * 100);
  };

  const formatKm = (meters: number) => {
    return (meters / 1000).toFixed(1);
  };

  const hasBundesstrasse = wayTypeStats.bundesstrasseMeters > 0;
  const bundesstrasseKm = formatKm(wayTypeStats.bundesstrasseMeters);
  const bundesstrassePercent = getPercent(wayTypeStats.bundesstrasseMeters);

  return (
    <div className="space-y-4">
      {/* Bundesstraße Alert / Safety Badge */}
      {hasBundesstrasse ? (
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-amber-900">
                Bundesstraße auf der Route: {bundesstrasseKm} km ({bundesstrassePercent}%)
              </div>
              <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                Diese Tour führt abschnittsweise über oder entlang einer Bundesstraße (B-Straße).
                Siehe die Segmente unten, um die genaue Lage auf der Karte zu prüfen.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-950 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="font-extrabold text-emerald-900">
              0% Bundesstraßen – 100% verkehrsberuhigt & radfreundlich!
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
            Keine Abschnitte auf Bundesstraßen. Die Route nutzt ausschließlich Radwege, ruhige Nebenstraßen und autofreie Wege.
          </p>
        </div>
      )}

      {/* Map Coloring Mode Selector */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Routenlinie auf Karte einfärben</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onSetColorMode('default')}
            className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
              colorMode === 'default'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            Standard-Radlinie
          </button>
          <button
            onClick={() => onSetColorMode('droute')}
            className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
              colorMode === 'droute'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50/50'
            }`}
            title="D-Routen (D1-D12), regionale Radfernwege und lokale Netze"
          >
            🚴 Nach D-Route / Netz
          </button>
          <button
            onClick={() => onSetColorMode('waytype')}
            className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
              colorMode === 'waytype'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
            title="Radweg (Grün), Bundesstraße (Rot), Nebenstraße (Blau)"
          >
            Nach Wegeart
          </button>
          <button
            onClick={() => onSetColorMode('surface')}
            className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
              colorMode === 'surface'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
            title="Asphalt (Grau), Pflaster (Blau), Schotter (Orange)"
          >
            Nach Belag
          </button>
        </div>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>Streckenverlauf (Gesamt {formatKm(total)} km)</span>
          <span className="text-[11px] font-normal text-slate-500">
            {colorMode === 'droute' ? 'Farben: D-Routen & Netze' : 'Fahre mit Maus über Segmente'}
          </span>
        </div>
        <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-200 shadow-inner">
          {segments.map((seg, idx) => {
            const widthPct = Math.max(0.8, (seg.distanceMeters / total) * 100);
            let bgClass = 'bg-emerald-500'; // radweg
            let customBg = '';

            if (colorMode === 'droute') {
              if (seg.networkCategory === 'd-route' && seg.dRoute) {
                customBg = seg.dRoute.color;
              } else if (seg.networkCategory === 'rcn') {
                customBg = '#10b981';
              } else if (seg.networkCategory === 'lcn' || seg.isCycleway) {
                customBg = '#3b82f6';
              } else {
                customBg = '#94a3b8';
              }
            } else if (colorMode === 'surface') {
              if (seg.surface === 'asphalt') bgClass = 'bg-slate-600';
              else if (seg.surface === 'pflaster') bgClass = 'bg-sky-500';
              else if (seg.surface === 'schotter') bgClass = 'bg-amber-600';
              else if (seg.surface === 'natur') bgClass = 'bg-emerald-700';
            } else {
              if (seg.wayType === 'bundesstrasse') bgClass = 'bg-rose-600';
              else if (seg.wayType === 'radweg') bgClass = 'bg-emerald-500';
              else if (seg.wayType === 'radfahrstreifen') bgClass = 'bg-cyan-500';
              else if (seg.wayType === 'landesstrasse') bgClass = 'bg-purple-500';
              else if (seg.wayType === 'nebenstrasse') bgClass = 'bg-sky-500';
              else if (seg.wayType === 'wirtschaftsweg') bgClass = 'bg-amber-600';
            }

            const isHovered = hoveredSegment?.id === seg.id;

            return (
              <div
                key={seg.id || idx}
                style={{ width: `${widthPct}%`, backgroundColor: customBg || undefined }}
                onMouseEnter={() => onHoverSegment(seg)}
                onMouseLeave={() => onHoverSegment(null)}
                onClick={() => onSelectSegment(seg)}
                className={`${customBg ? '' : bgClass} h-full cursor-pointer transition-opacity ${
                  isHovered ? 'ring-2 ring-white opacity-100 z-10 scale-y-125' : 'opacity-90 hover:opacity-100'
                }`}
                title={`km ${seg.fromKm} - ${seg.toKm}: ${seg.dRoute ? seg.dRoute.fullName : seg.wayTypeName} (${seg.surfaceName})`}
              />
            );
          })}
        </div>
      </div>

      {/* SECTION 1: RADNETZ DEUTSCHLAND & D-ROUTEN ANTEIL */}
      {networkBreakdown && networkBreakdown.items.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Radnetz Deutschland & D-Routen</span>
            </label>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200">
              {networkBreakdown.totalDRoutePercent}% D-Netz Anteil
            </span>
          </div>

          {/* D-Route Multi-Bar */}
          <div className="space-y-1">
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 shadow-inner">
              {networkBreakdown.items.map(item => (
                <div
                  key={item.id}
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  className="h-full"
                  title={`${item.name}: ${item.distanceKm} km (${item.percent}%)`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>{networkBreakdown.totalDRouteKm} km auf D-Routen</span>
              <span className="font-semibold text-emerald-700">
                {networkBreakdown.totalCycleNetworkPercent}% im Radverkehrsnetz
              </span>
            </div>
          </div>

          {/* Detailed Network Breakdown Cards */}
          <div className="space-y-2">
            {networkBreakdown.items.map(item => {
              const isDRoute = item.category === 'd-route';

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isDRoute
                      ? 'border-indigo-200 bg-indigo-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={isDRoute ? 'text-indigo-950 font-extrabold' : 'text-slate-900'}>
                        {item.name}
                      </span>
                      {isDRoute && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-600 text-white">
                          D-Netz
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-slate-900 font-extrabold">{item.distanceKm} km</span>{' '}
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: item.color }}
                      >
                        ({item.percent}%)
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Wegearten & Straßenklassen (Way Types) */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-emerald-600" />
            <span>Wegearten & Straßenklassen</span>
          </label>
        </div>

        <div className="space-y-2">
          {/* Baulich getrennte Radwege & Fahrradstraßen */}
          <div className="p-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/30">
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                <div>
                  <span className="text-slate-900">Baulich getrennter Radweg & Fahrradstraße</span>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Physisch abgetrennt, autofrei oder Fahrradstraße mit Radvorrang
                  </div>
                </div>
              </div>
              <div className="text-slate-800 text-right shrink-0 ml-2">
                {formatKm(wayTypeStats.radwegMeters)} km{' '}
                <span className="text-emerald-700 font-semibold text-[11px]">
                  ({getPercent(wayTypeStats.radwegMeters)}%)
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${getPercent(wayTypeStats.radwegMeters)}%` }}
              />
            </div>
          </div>

          {/* Radfahrstreifen & Schutzstreifen auf Fahrbahn */}
          <div className="p-2.5 rounded-xl border border-cyan-200/80 bg-cyan-50/30">
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0"></span>
                <div>
                  <span className="text-slate-900">Radfahrstreifen & Schutzstreifen</span>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Aufgemalte Markierung auf der Straße (Präsenz von Kfz-Verkehr)
                  </div>
                </div>
              </div>
              <div className="text-slate-800 text-right shrink-0 ml-2">
                {formatKm(wayTypeStats.radfahrstreifenMeters)} km{' '}
                <span className="text-cyan-700 font-semibold text-[11px]">
                  ({getPercent(wayTypeStats.radfahrstreifenMeters)}%)
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full"
                style={{ width: `${getPercent(wayTypeStats.radfahrstreifenMeters)}%` }}
              />
            </div>
          </div>

          {/* Nebenstraßen / Wohnstraßen */}
          <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                <span className="text-slate-900">Fahrradstraße & Nebenstraße</span>
              </div>
              <div className="text-slate-800">
                {formatKm(wayTypeStats.nebenstrasseMeters)} km{' '}
                <span className="text-sky-700 font-semibold text-[11px]">
                  ({getPercent(wayTypeStats.nebenstrasseMeters)}%)
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full"
                style={{ width: `${getPercent(wayTypeStats.nebenstrasseMeters)}%` }}
              />
            </div>
          </div>

          {/* Wald- & Wirtschaftswege */}
          <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-600"></span>
                <span className="text-slate-900">Wald-, Feld- & Wirtschaftsweg</span>
              </div>
              <div className="text-slate-800">
                {formatKm(wayTypeStats.wirtschaftswegMeters)} km{' '}
                <span className="text-amber-700 font-semibold text-[11px]">
                  ({getPercent(wayTypeStats.wirtschaftswegMeters)}%)
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full"
                style={{ width: `${getPercent(wayTypeStats.wirtschaftswegMeters)}%` }}
              />
            </div>
          </div>

          {/* Landes- & Kreisstraßen */}
          <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-slate-900">Landes- & Kreisstraße</span>
              </div>
              <div className="text-slate-800">
                {formatKm(wayTypeStats.landesstrasseMeters)} km{' '}
                <span className="text-purple-700 font-semibold text-[11px]">
                  ({getPercent(wayTypeStats.landesstrasseMeters)}%)
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${getPercent(wayTypeStats.landesstrasseMeters)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Untergrund & Oberflächenbelag */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Trees className="w-3.5 h-3.5 text-emerald-600" />
          <span>Untergrund & Oberflächenbelag</span>
        </label>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
            <div className="text-[11px] font-semibold text-slate-500">⬛ Asphalt & Beton</div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              {formatKm(detailedSurfaceStats.asphaltMeters)} km
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {getPercent(detailedSurfaceStats.asphaltMeters)}% der Strecke
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
            <div className="text-[11px] font-semibold text-slate-500">🧱 Pflastersteine</div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              {formatKm(detailedSurfaceStats.pflasterMeters)} km
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {getPercent(detailedSurfaceStats.pflasterMeters)}% der Strecke
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
            <div className="text-[11px] font-semibold text-slate-500">🪨 Schotter & Feinkies</div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              {formatKm(detailedSurfaceStats.schotterMeters)} km
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {getPercent(detailedSurfaceStats.schotterMeters)}% der Strecke
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
            <div className="text-[11px] font-semibold text-slate-500">🌿 Natur- & Erdwege</div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              {formatKm(detailedSurfaceStats.naturMeters)} km
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {getPercent(detailedSurfaceStats.naturMeters)}% der Strecke
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Wo verläuft was? Chronologische Streckenabschnitte */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Wo verläuft was? ({segments.length} Abschnitte)</span>
          </label>
        </div>

        <p className="text-[11px] text-slate-500">
          Klicke oder berühre einen Abschnitt, um ihn direkt auf der Karte hervorzuheben.
        </p>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {segments.map((seg, idx) => {
            const isHovered = hoveredSegment?.id === seg.id;
            let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (seg.wayType === 'bundesstrasse') badgeBg = 'bg-rose-50 text-rose-700 border-rose-300 font-extrabold';
            else if (seg.wayType === 'radfahrstreifen') badgeBg = 'bg-cyan-50 text-cyan-800 border-cyan-300 font-medium';
            else if (seg.wayType === 'landesstrasse') badgeBg = 'bg-purple-50 text-purple-700 border-purple-200';
            else if (seg.wayType === 'nebenstrasse') badgeBg = 'bg-sky-50 text-sky-700 border-sky-200';
            else if (seg.wayType === 'wirtschaftsweg') badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div
                key={seg.id || idx}
                onMouseEnter={() => onHoverSegment(seg)}
                onMouseLeave={() => onHoverSegment(null)}
                onClick={() => onSelectSegment(seg)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isHovered
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                    : seg.isBundesstrasse
                    ? 'border-rose-200 bg-rose-50/30 hover:border-rose-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">
                      km {seg.fromKm} – {seg.toKm}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ({formatKm(seg.distanceMeters)} km)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {seg.dRoute && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-extrabold text-white"
                        style={{ backgroundColor: seg.dRoute.color }}
                      >
                        {seg.dRoute.code}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border ${badgeBg}`}>
                      {seg.wayTypeName}
                    </span>
                  </div>
                </div>

                {seg.dRoute && (
                  <div className="mt-1 text-[11px] font-semibold text-indigo-700">
                    {seg.dRoute.fullName}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Belag:</span>
                    <span>{seg.surfaceName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 font-bold hover:underline">
                    <Eye className="w-3 h-3" />
                    <span>Auf Karte</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
