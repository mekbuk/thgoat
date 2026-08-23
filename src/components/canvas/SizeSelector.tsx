'use client';

import React from 'react';
import { clsx } from 'clsx';

export const BRUSH_PRESETS = [
  { label: 'Fine', size: 3 },
  { label: 'Medium', size: 7 },
  { label: 'Bold', size: 14 },
  { label: 'Thicc', size: 24 },
];

interface SizeSelectorProps {
  currentSize: number;
  onSelectSize: (size: number) => void;
  disabled?: boolean;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  currentSize,
  onSelectSize,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-lg">
      {BRUSH_PRESETS.map((preset) => {
        const isSelected = currentSize === preset.size;
        return (
          <button
            key={preset.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelectSize(preset.size)}
            className={clsx(
              'flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all',
              isSelected
                ? 'bg-pink-600/30 border border-pink-500 text-pink-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            title={`${preset.label} (${preset.size}px)`}
          >
            <span
              className={clsx('rounded-full transition-all', isSelected ? 'bg-pink-400' : 'bg-slate-300')}
              style={{ width: Math.min(22, Math.max(4, preset.size)), height: Math.min(22, Math.max(4, preset.size)) }}
            />
            <span className="text-[10px] mt-0.5 leading-none">{preset.label}</span>
          </button>
        );
      })}
    </div>
  );
};
