import React, { useRef, useState } from 'react';
import type { RouteCoordinate } from '../types';
import { ChevronDown, ChevronUp, Mountain, TrendingDown, TrendingUp } from 'lucide-react';

interface ElevationProfileProps {
  coordinates: RouteCoordinate[];
  ascent: number;
  descent: number;
  onHoverCoord: (coord: RouteCoordinate | null) => void;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({
  coordinates,
  ascent,
  descent,
  onHoverCoord
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [hoverData, setHoverData] = useState<{
    x: number;
    distKm: number;
    ele: number;
    slope: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  if (coordinates.length < 2) return null;

  // Filter coordinates with valid elevation
  const validCoords = coordinates.filter(c => c.ele !== undefined);
  if (validCoords.length < 2) return null;

  const totalDist = coordinates[coordinates.length - 1].distanceFromStart || 1;
  const elevations = validCoords.map(c => c.ele || 0);
  const minEle = Math.max(0, Math.floor(Math.min(...elevations) - 10));
  const maxEle = Math.ceil(Math.max(...elevations) + 10);
  const eleSpan = Math.max(1, maxEle - minEle);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 90;
  const paddingX = 20;
  const paddingY = 15;

  const points = validCoords.map(c => {
    const dist = c.distanceFromStart || 0;
    const x = paddingX + (dist / totalDist) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - (((c.ele || 0) - minEle) / eleSpan) * (svgHeight - 2 * paddingY);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points[0]} L ${points.join(' L ')}`;
  const areaD = `M ${paddingX},${svgHeight - paddingY} L ${points.join(' L ')} L ${svgWidth - paddingX},${svgHeight - paddingY} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (mouseX - paddingX) / (rect.width - 2 * (paddingX * (rect.width / svgWidth)))));
    const targetDist = ratio * totalDist;

    // Find nearest coordinate
    let nearestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < coordinates.length; i++) {
      const diff = Math.abs((coordinates[i].distanceFromStart || 0) - targetDist);
      if (diff < minDiff) {
        minDiff = diff;
        nearestIdx = i;
      }
    }

    const coord = coordinates[nearestIdx];
    const prevCoord = coordinates[Math.max(0, nearestIdx - 3)];
    const distDelta = (coord.distanceFromStart || 0) - (prevCoord.distanceFromStart || 0);
    const eleDelta = (coord.ele || 0) - (prevCoord.ele || 0);
    const slope = distDelta > 10 ? Math.round((eleDelta / distDelta) * 100) : 0;

    setHoverData({
      x: mouseX,
      distKm: Number(((coord.distanceFromStart || 0) / 1000).toFixed(1)),
      ele: coord.ele || 0,
      slope
    });

    onHoverCoord(coord);
  };

  const handleMouseLeave = () => {
    setHoverData(null);
    onHoverCoord(null);
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-3 transition-all duration-300"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-semibold text-emerald-800">
            <Mountain className="w-4 h-4 text-emerald-600" />
            <span>Höhenprofil</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            <span>+{ascent} m</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
            <span>-{descent} m</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Min: {minEle}m / Max: {maxEle}m</span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            title={collapsed ? 'Einblenden' : 'Ausblenden'}
          >
            {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="relative mt-2">
          {hoverData && (
            <div
              className="chart-tooltip"
              style={{
                left: `${Math.min(hoverData.x, 480)}px`,
                top: '-28px'
              }}
            >
              <div className="flex items-center gap-2 font-medium">
                <span>{hoverData.distKm} km</span>
                <span className="text-emerald-400 font-bold">{hoverData.ele} m</span>
                <span className={`text-[10px] ${hoverData.slope > 0 ? 'text-amber-400' : 'text-blue-300'}`}>
                  {hoverData.slope > 0 ? `+${hoverData.slope}%` : `${hoverData.slope}%`}
                </span>
              </div>
            </div>
          )}

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-20 overflow-visible cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="eleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid baseline */}
            <line
              x1={paddingX}
              y1={svgHeight - paddingY}
              x2={svgWidth - paddingX}
              y2={svgHeight - paddingY}
              stroke="#e2e8f0"
              strokeWidth="1"
            />

            {/* Area fill */}
            <path d={areaD} fill="url(#eleGrad)" />

            {/* Line stroke */}
            <path d={pathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Hover vertical line and point */}
            {hoverData && (
              <>
                <line
                  x1={hoverData.x * (svgWidth / (containerRef.current?.clientWidth || svgWidth))}
                  y1={0}
                  x2={hoverData.x * (svgWidth / (containerRef.current?.clientWidth || svgWidth))}
                  y2={svgHeight - paddingY}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              </>
            )}
          </svg>

          {/* Distance labels */}
          <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-0.5">
            <span>0 km</span>
            <span>{(totalDist / 2000).toFixed(1)} km</span>
            <span>{(totalDist / 1000).toFixed(1)} km</span>
          </div>
        </div>
      )}
    </div>
  );
};
