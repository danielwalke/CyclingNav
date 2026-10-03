import React from 'react';
import type { ManeuverType, NavigationState, RouteInstruction } from '../types';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  Compass,
  FastForward,
  Flag,
  Gauge,
  Maximize2,
  Minimize2,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

interface NavigationHudProps {
  navState: NavigationState;
  onTogglePlay: () => void;
  onSetSimSpeed: (speed: number) => void;
  onResetNav: () => void;
  onToggleVoice: () => void;
  onToggleVoiceLang: () => void;
  onStopNavigation: () => void;
  onSwitchMode?: (mode: 'gps' | 'simulation') => void;
  instructions: RouteInstruction[];
}

function getManeuverIcon(type?: ManeuverType) {
  const iconClass = 'w-10 h-10 text-white';
  switch (type) {
    case 'turn-slight-right':
      return <ArrowUpRight className={iconClass} />;
    case 'turn-right':
      case 'turn-sharp-right':
      return <ArrowRight className={iconClass} />;
    case 'turn-slight-left':
      return <ArrowUpLeft className={iconClass} />;
    case 'turn-left':
    case 'turn-sharp-left':
      return <ArrowLeft className={iconClass} />;
    case 'arrive':
      return <Flag className={iconClass} />;
    case 'u-turn':
      return <ArrowDownLeft className={iconClass} />;
    default:
      return <ArrowUp className={iconClass} />;
  }
}

export const NavigationHud: React.FC<NavigationHudProps> = ({
  navState,
  onTogglePlay,
  onSetSimSpeed,
  onResetNav,
  onToggleVoice,
  onToggleVoiceLang,
  onStopNavigation,
  onSwitchMode,
  instructions
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentInstr = navState.currentInstruction || instructions[0];
  const distToNext = navState.nextInstructionDistance;
  const etaMinutes = Math.round(navState.remainingDuration / 60);

  return (
    <div className="absolute top-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-30 flex flex-col gap-3">
      {/* Primary Turn-by-Turn Card */}
      <div className="bg-slate-900/95 backdrop-blur-xl text-white rounded-3xl shadow-2xl border border-slate-700/80 p-5 overflow-hidden">
        {/* Top bar with audio, speed, and close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
                {navState.trackingMode === 'gps' ? (
                  <>
                    <Navigation className="w-3 h-3 fill-emerald-400" />
                    <span>Live GPS Navigation</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Virtuelle Simulation</span>
                  </>
                )}
              </span>
              {navState.trackingMode === 'gps' && navState.gpsAccuracy && (
                <span className="text-[10px] text-slate-400">
                  Genauigkeit: ±{Math.round(navState.gpsAccuracy)}m
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onSwitchMode && (
              <button
                onClick={() => onSwitchMode(navState.trackingMode === 'gps' ? 'simulation' : 'gps')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 transition-colors"
                title={navState.trackingMode === 'gps' ? 'Auf Simulation wechseln' : 'Auf Live-GPS wechseln'}
              >
                {navState.trackingMode === 'gps' ? 'Sim' : 'GPS'}
              </button>
            )}
            <button
              onClick={onToggleVoiceLang}
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 uppercase transition-colors"
              title="Sprache wechseln"
            >
              {navState.voiceLang}
            </button>
            <button
              onClick={onToggleVoice}
              className={`p-1.5 rounded-lg transition-colors ${
                navState.voiceEnabled ? 'bg-emerald-600/30 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
              title={navState.voiceEnabled ? 'Sprachausgabe an' : 'Stumm'}
            >
              {navState.voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Vollbild"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onStopNavigation}
              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 transition-colors ml-1"
              title="Navigation beenden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Turn Direction & Distance */}
        <div className="flex items-center gap-4 my-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shrink-0 ring-4 ring-emerald-500/20">
            {getManeuverIcon(currentInstr?.type)}
          </div>
          <div className="min-w-0">
            <div className="text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1">
              <span>{distToNext > 1000 ? (distToNext / 1000).toFixed(1) : distToNext}</span>
              <span className="text-base font-medium text-emerald-400">{distToNext > 1000 ? 'km' : 'm'}</span>
            </div>
            <div className="text-sm font-semibold text-slate-200 truncate mt-0.5" title={currentInstr?.text}>
              {currentInstr?.text || 'Dem Radweg folgen'}
            </div>
            {currentInstr?.streetName && (
              <div className="text-xs text-emerald-400/90 font-medium truncate mt-0.5">
                {currentInstr.streetName}
              </div>
            )}
          </div>
        </div>

        {/* Live Cockpit Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
          <div className="bg-slate-800/50 rounded-xl p-2">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              <span>Tempo</span>
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {navState.speedKmh.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">km/h</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-2">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Rest</span>
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {(navState.remainingDistance / 1000).toFixed(1)}{' '}
              <span className="text-[10px] font-normal text-slate-400">km</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-2">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <span>ETA</span>
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {etaMinutes} <span className="text-[10px] font-normal text-slate-400">min</span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Controls: Simulation Player OR Live GPS Status */}
        {navState.trackingMode === 'simulation' ? (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={onTogglePlay}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-900/40"
              >
                {navState.isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{navState.isSimulating ? 'Pause' : 'Start'}</span>
              </button>
              <button
                onClick={onResetNav}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Zum Start zurücksetzen"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Speed multiplier selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 rounded-xl p-1">
              <FastForward className="w-3.5 h-3.5 text-slate-400 ml-1" />
              {[1, 2, 5, 10].map(speed => (
                <button
                  key={speed}
                  onClick={() => onSetSimSpeed(speed)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                    navState.simSpeed === speed
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-medium text-emerald-300">
                Echtzeit-GPS aktiv (Auto-Zentrierung & Routing-Snap)
              </span>
            </div>
            {onSwitchMode && (
              <button
                onClick={() => onSwitchMode('simulation')}
                className="text-[10px] text-slate-400 hover:text-emerald-400 underline cursor-pointer"
              >
                Simulation testen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
