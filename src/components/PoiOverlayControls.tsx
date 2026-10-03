import React from 'react';
import type { PoiType } from '../types';
import { Droplets, Locate, Tent, Wrench } from 'lucide-react';

interface PoiOverlayControlsProps {
  selectedPois: PoiType[];
  onTogglePoi: (type: PoiType) => void;
  onLocateMe: () => void;
  isLocating: boolean;
}

export const PoiOverlayControls: React.FC<PoiOverlayControlsProps> = ({
  selectedPois,
  onTogglePoi,
  onLocateMe,
  isLocating
}) => {
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
      {/* Geolocation Button */}
      <button
        onClick={onLocateMe}
        className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 rounded-xl shadow-lg border border-slate-200/80 text-xs font-bold transition-all"
        title="Meinen Standort finden"
      >
        <Locate className={`w-4 h-4 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Mein Standort</span>
      </button>

      {/* POI Filters */}
      <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 p-1 gap-1">
        <button
          onClick={() => onTogglePoi('repair')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedPois.includes('repair')
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Fahrrad-Reparaturstationen & Luftpumpen anzeigen"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Werkzeug & Pumpe</span>
        </button>

        <button
          onClick={() => onTogglePoi('water')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedPois.includes('water')
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Trinkwasserbrunnen anzeigen"
        >
          <Droplets className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Trinkwasser</span>
        </button>

        <button
          onClick={() => onTogglePoi('shelter')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedPois.includes('shelter')
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Rastplätze & Schutzhütten anzeigen"
        >
          <Tent className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Rastplätze</span>
        </button>
      </div>
    </div>
  );
};
