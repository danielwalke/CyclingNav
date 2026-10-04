import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BaseMapId, BikePoi, BikeRoute, NavigationState, RouteColorMode, RouteCoordinate, RouteSegment, Waypoint } from '../types';
import { createCachedTileLayer } from '../services/cachedTileLayer';



interface MapProps {
  baseMap: BaseMapId;
  showCycleOverlay: boolean;
  waypoints: Waypoint[];
  route: BikeRoute | null;
  hoveredCoord: RouteCoordinate | null;
  navigationState: NavigationState;
  pois: BikePoi[];
  colorMode: RouteColorMode;
  hoveredSegment: RouteSegment | null;
  onMapClick: (lat: number, lng: number) => void;
  onWaypointMove?: (id: string, lat: number, lng: number) => void;
}


const TILE_LAYERS: Record<BaseMapId, { url: string; attr: string; maxZoom: number }> = {
  cyclosm: {
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attr: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> | Style &copy; <a href="https://www.cyclosm.org">CyclOSM</a>',
    maxZoom: 19
  },
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  opentopo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attr: 'Kartendaten: &copy; OpenStreetMap-Mitwirkende, SRTM | Kartendarstellung: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17
  }
};

const WAYMARKED_TRAILS_URL = 'https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png';

export const Map: React.FC<MapProps> = ({
  baseMap,
  showCycleOverlay,
  waypoints,
  route,
  hoveredCoord,
  navigationState,
  pois,
  colorMode,
  hoveredSegment,
  onMapClick,
  onWaypointMove
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayTileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer groups for markers, routes, POIs, segment highlight
  const routeLayerGroup = useRef<L.LayerGroup | null>(null);
  const segmentHighlightGroup = useRef<L.LayerGroup | null>(null);
  const markerLayerGroup = useRef<L.LayerGroup | null>(null);
  const poiLayerGroup = useRef<L.LayerGroup | null>(null);
  const liveRiderMarkerRef = useRef<L.Marker | null>(null);
  const scrubberMarkerRef = useRef<L.Marker | null>(null);


  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Germany Center: Lat 51.1657, Lng 10.4515
    const map = L.map(mapContainerRef.current, {
      center: [51.1657, 10.4515],
      zoom: 7,
      zoomControl: false // custom position
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial base tile layer
    const config = TILE_LAYERS[baseMap];
    baseTileLayerRef.current = createCachedTileLayer(config.url, {
      attribution: config.attr,
      maxZoom: config.maxZoom,
      subdomains: 'abc'
    }).addTo(map);

    // Layer groups
    routeLayerGroup.current = L.layerGroup().addTo(map);
    segmentHighlightGroup.current = L.layerGroup().addTo(map);
    markerLayerGroup.current = L.layerGroup().addTo(map);
    poiLayerGroup.current = L.layerGroup().addTo(map);

    // Click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    (window as any).leafletMap = map;

    return () => {
      delete (window as any).leafletMap;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Base Map Switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    const config = TILE_LAYERS[baseMap];
    baseTileLayerRef.current = createCachedTileLayer(config.url, {
      attribution: config.attr,
      maxZoom: config.maxZoom,
      subdomains: 'abc'
    }).addTo(map);
  }, [baseMap]);

  // Handle Cycleway Overlay (Waymarked Trails)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (showCycleOverlay) {
      if (!overlayTileLayerRef.current) {
        overlayTileLayerRef.current = createCachedTileLayer(WAYMARKED_TRAILS_URL, {
          opacity: 0.8,
          maxZoom: 18,
          attribution: 'Radnetz &copy; <a href="https://cycling.waymarkedtrails.org">Waymarked Trails</a>'
        }).addTo(map);
      }
    } else {
      if (overlayTileLayerRef.current) {
        map.removeLayer(overlayTileLayerRef.current);
        overlayTileLayerRef.current = null;
      }
    }
  }, [showCycleOverlay]);


  // Render Waypoints
  useEffect(() => {
    const group = markerLayerGroup.current;
    if (!group) return;
    group.clearLayers();

    waypoints.forEach((wp, index) => {
      const isStart = index === 0;
      const isEnd = index === waypoints.length - 1 && waypoints.length > 1;

      let iconHtml = '';
      if (isStart) {
        iconHtml = `
          <div class="custom-pin flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-200 border-2 border-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
          </div>
        `;
      } else if (isEnd) {
        iconHtml = `
          <div class="custom-pin flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white shadow-lg ring-4 ring-rose-200 border-2 border-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
          </div>
        `;
      } else {
        iconHtml = `
          <div class="custom-pin flex items-center justify-center w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs shadow-lg ring-3 ring-sky-200 border-2 border-white">
            ${index}
          </div>
        `;
      }

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([wp.lat, wp.lng], {
        icon: customIcon,
        draggable: true
      });

      marker.bindPopup(`
        <div class="p-1">
          <div class="text-xs uppercase tracking-wider font-semibold text-slate-500">${isStart ? 'Startpunkt' : isEnd ? 'Zielpunkt' : `Zwischenziel ${index}`}</div>
          <div class="font-bold text-slate-800 text-sm mt-0.5">${wp.name}</div>
          <div class="text-xs text-slate-500 mt-1">${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</div>
        </div>
      `);

      marker.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng();
        if (onWaypointMove) {
          onWaypointMove(wp.id, newPos.lat, newPos.lng);
        }
      });

      group.addLayer(marker);
    });
  }, [waypoints, onWaypointMove]);

  // Render Bike Route Polyline (supports standard, way type colors, or surface colors)
  useEffect(() => {
    const group = routeLayerGroup.current;
    const map = mapRef.current;
    if (!group || !map) return;
    group.clearLayers();

    if (!route || route.coordinates.length < 2) return;

    const latlngs: L.LatLngExpression[] = route.coordinates.map(c => [c.lat, c.lng]);

    // Outer casing for contrast
    const casingPolyline = L.polyline(latlngs, {
      color: '#0f172a',
      weight: 8,
      opacity: 0.75,
      lineCap: 'round',
      lineJoin: 'round'
    });
    group.addLayer(casingPolyline);

    if (colorMode === 'default' || !route.segments || route.segments.length === 0) {
      // Standard vibrant emerald cycling line
      const corePolyline = L.polyline(latlngs, {
        color: '#10b981',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      });
      group.addLayer(corePolyline);
    } else {
      // Color code by Wegeart (Way Type), Untergrund (Surface), or D-Route / Radnetz
      route.segments.forEach(seg => {
        if (!seg.coordinates || seg.coordinates.length < 2) return;

        let segColor = '#10b981';
        if (colorMode === 'waytype') {
          if (seg.wayType === 'bundesstrasse') segColor = '#e11d48'; // Bright Red/Rose for Bundesstraße!
          else if (seg.wayType === 'radweg') segColor = '#10b981'; // Emerald for separate cycleway
          else if (seg.wayType === 'radfahrstreifen') segColor = '#06b6d4'; // Cyan for on-road bike lane
          else if (seg.wayType === 'nebenstrasse') segColor = '#0284c7'; // Sky Blue
          else if (seg.wayType === 'wirtschaftsweg') segColor = '#d97706'; // Amber
          else if (seg.wayType === 'landesstrasse') segColor = '#9333ea'; // Purple
          else segColor = '#64748b';
        } else if (colorMode === 'surface') {
          if (seg.surface === 'asphalt') segColor = '#475569'; // Slate
          else if (seg.surface === 'pflaster') segColor = '#0284c7'; // Blue
          else if (seg.surface === 'schotter') segColor = '#d97706'; // Orange/Amber
          else if (seg.surface === 'natur') segColor = '#15803d'; // Green/Nature
          else segColor = '#64748b';
        } else if (colorMode === 'droute') {
          if (seg.networkCategory === 'd-route' && seg.dRoute) {
            segColor = seg.dRoute.color;
          } else if (seg.networkCategory === 'rcn') {
            segColor = '#10b981'; // Emerald for regional cycle network
          } else if (seg.networkCategory === 'lcn' || seg.isCycleway) {
            segColor = '#3b82f6'; // Blue for local cycle paths
          } else {
            segColor = '#94a3b8'; // Slate for other roads
          }
        }

        const segPolyline = L.polyline(seg.coordinates, {
          color: segColor,
          weight: 5.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        });

        const dRouteLabel = seg.dRoute ? `<div class="text-[10px] font-extrabold text-indigo-600">${seg.dRoute.fullName}</div>` : '';
        segPolyline.bindTooltip(
          `<div class="text-xs font-bold">${seg.wayTypeName}</div>${dRouteLabel}<div class="text-[11px] text-slate-500">${seg.surfaceName} (km ${seg.fromKm}-${seg.toKm})</div>`,
          { sticky: true }
        );

        group.addLayer(segPolyline);
      });
    }

    if (!navigationState.isActive) {
      map.fitBounds(casingPolyline.getBounds(), { padding: [50, 50], maxZoom: 16 });
    }
  }, [route, colorMode]);

  // Segment Hover/Select Highlight Layer
  useEffect(() => {
    const group = segmentHighlightGroup.current;
    const map = mapRef.current;
    if (!group || !map) return;
    group.clearLayers();

    if (hoveredSegment && hoveredSegment.coordinates && hoveredSegment.coordinates.length >= 2) {
      const highlight = L.polyline(hoveredSegment.coordinates, {
        color: '#fbbf24', // Glowing amber/yellow
        weight: 12,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      });
      group.addLayer(highlight);

      const inner = L.polyline(hoveredSegment.coordinates, {
        color: hoveredSegment.isBundesstrasse ? '#e11d48' : '#059669',
        weight: 6,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      });
      group.addLayer(inner);
    }
  }, [hoveredSegment]);


  // Elevation Chart Scrubber Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (hoveredCoord) {
      if (!scrubberMarkerRef.current) {
        const scrubberIcon = L.divIcon({
          html: `
            <div class="w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-xl animate-ping opacity-75"></div>
            <div class="w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-xl absolute top-0 left-0 flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          `,
          className: 'scrubber-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        scrubberMarkerRef.current = L.marker([hoveredCoord.lat, hoveredCoord.lng], {
          icon: scrubberIcon,
          zIndexOffset: 1000
        }).addTo(map);
      } else {
        scrubberMarkerRef.current.setLatLng([hoveredCoord.lat, hoveredCoord.lng]);
      }
    } else {
      if (scrubberMarkerRef.current) {
        map.removeLayer(scrubberMarkerRef.current);
        scrubberMarkerRef.current = null;
      }
    }
  }, [hoveredCoord]);

  // Live Navigation / Simulated Rider Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (navigationState.isActive && navigationState.currentPosition) {
      const [lat, lng] = navigationState.currentPosition;
      const heading = navigationState.heading || 0;

      const riderHtml = `
        <div class="relative flex items-center justify-center w-10 h-10">
          <div class="gps-pulse"></div>
          <div class="w-9 h-9 rounded-full bg-emerald-600 border-2 border-white shadow-2xl flex items-center justify-center text-white transform transition-transform duration-200" style="transform: rotate(${heading}deg);">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        </div>
      `;

      const riderIcon = L.divIcon({
        html: riderHtml,
        className: 'rider-gps-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      if (!liveRiderMarkerRef.current) {
        liveRiderMarkerRef.current = L.marker([lat, lng], {
          icon: riderIcon,
          zIndexOffset: 2000
        }).addTo(map);
      } else {
        liveRiderMarkerRef.current.setLatLng([lat, lng]);
        liveRiderMarkerRef.current.setIcon(riderIcon);
      }

      // Smoothly pan map along rider
      map.panTo([lat, lng], { animate: true, duration: 0.5 });
    } else {
      if (liveRiderMarkerRef.current) {
        map.removeLayer(liveRiderMarkerRef.current);
        liveRiderMarkerRef.current = null;
      }
    }
  }, [navigationState.isActive, navigationState.currentPosition, navigationState.heading]);

  // Render Bike POIs
  useEffect(() => {
    const group = poiLayerGroup.current;
    if (!group) return;
    group.clearLayers();

    pois.forEach(poi => {
      let bg = 'bg-amber-600';
      let icon = '🔧';
      if (poi.type === 'water') {
        bg = 'bg-blue-600';
        icon = '💧';
      } else if (poi.type === 'shelter') {
        bg = 'bg-emerald-700';
        icon = '⛺';
      } else if (poi.type === 'parking') {
        bg = 'bg-indigo-600';
        icon = '🚲';
      }

      const poiIcon = L.divIcon({
        html: `
          <div class="flex items-center justify-center w-6 h-6 rounded-full ${bg} text-white shadow-md ring-2 ring-white text-xs">
            ${icon}
          </div>
        `,
        className: 'poi-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([poi.lat, poi.lng], { icon: poiIcon });
      marker.bindPopup(`
        <div class="p-1">
          <div class="font-bold text-xs text-slate-800">${poi.name}</div>
          ${poi.description ? `<div class="text-xs text-slate-600 mt-1">${poi.description}</div>` : ''}
          <div class="text-[10px] text-slate-400 mt-1">${poi.lat.toFixed(5)}, ${poi.lng.toFixed(5)}</div>
        </div>
      `);
      group.addLayer(marker);
    });
  }, [pois]);

  return <div ref={mapContainerRef} className="w-full h-full relative" id="bike-map" />;
};
