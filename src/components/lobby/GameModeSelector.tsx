'use client';

import React, { useState } from 'react';
import { GameMode } from '@/types/game';
import { Sparkles, Palette, Type, Check, Shield } from 'lucide-react';

interface GameModeSelectorProps {
  currentMode: GameMode;
  isHost: boolean;
  onSelectMode: (mode: GameMode) => Promise<void> | void;
}

interface ModeOption {
  id: GameMode;
  name: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
}

const MODES: ModeOption[] = [
  {
    id: 'CLASSIC',
    name: 'Classic Mode',
    tagline: 'Title the Tattoo',
    description: 'View wild real-world tattoos and compete head-to-head to write the funniest title.',
    icon: Type,
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  },
  {
    id: 'CELEBRITY',
    name: 'Celebrity Mode',
    tagline: 'Ink the Throat',
    description: 'Draw a custom tattoo directly on the canvas and stretch it onto a celebrity’s neck!',
    icon: Palette,
    badgeColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  },
];

export function GameModeSelector({
  currentMode = 'CLASSIC',
  isHost,
  onSelectMode,
}: GameModeSelectorProps) {
  const [loadingMode, setLoadingMode] = useState<GameMode | null>(null);

  const handleSelect = async (mode: GameMode) => {
    if (!isHost || mode === currentMode || loadingMode) return;
    setLoadingMode(mode);
    try {
      await onSelectMode(mode);
    } catch (err) {
      console.error('Failed to change mode:', err);
    } finally {
      setLoadingMode(null);
    }
  };

  const activeModeOption = MODES.find((m) => m.id === currentMode) || MODES[0];

  return (
    <div className="w-full max-w-xl mx-auto mb-2">
      {isHost ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              Select Game Mode (Host Only)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Click to switch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MODES.map((mode) => {
              const isSelected = currentMode === mode.id;
              const Icon = mode.icon;

              return (
                <button
                  key={mode.id}
                  onClick={() => handleSelect(mode.id)}
                  disabled={loadingMode !== null}
                  type="button"
                  className={`relative text-left p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-rose-500 bg-gradient-to-br from-rose-500/15 to-slate-900 shadow-lg shadow-rose-500/10'
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/40 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-1.5 rounded-lg border ${
                            isSelected
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-black text-sm text-white tracking-wide">
                          {mode.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-rose-300/90 mb-1">
                      {mode.tagline}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {mode.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Non-host spectator badge */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <activeModeOption.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Game Mode:
                </span>
                <span className="text-xs font-bold text-white">
                  {activeModeOption.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeModeOption.tagline} • Host controls game mode
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeModeOption.badgeColor}`}>
            {activeModeOption.id}
          </span>
        </div>
      )}
    </div>
  );
}
