'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

export const CURATED_COLORS = [
  { name: 'Goat Black', hex: '#111827' },
  { name: 'Meme White', hex: '#F9FAFB' },
  { name: 'Neon Pink', hex: '#EC4899' },
  { name: 'Goat Yellow', hex: '#EAB308' },
  { name: 'Cyber Blue', hex: '#3B82F6' },
  { name: 'Toxic Green', hex: '#22C55E' },
  { name: 'Spicy Orange', hex: '#F97316' },
  { name: 'Deep Purple', hex: '#A855F7' },
  { name: 'Blood Red', hex: '#EF4444' },
  { name: 'Chocolate', hex: '#78350F' },
];

interface ColorPaletteProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  disabled?: boolean;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onSelectColor,
  disabled = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg">
      {CURATED_COLORS.map((c) => {
        const isSelected = selectedColor.toLowerCase() === c.hex.toLowerCase();
        const isLight = c.hex === '#F9FAFB' || c.hex === '#EAB308';

        return (
          <button
            key={c.hex}
            type="button"
            title={c.name}
            disabled={disabled}
            onClick={() => onSelectColor(c.hex)}
            className={clsx(
              'relative w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-500',
              isSelected ? 'scale-110 ring-2 ring-pink-500 shadow-md' : 'hover:scale-105 opacity-90 hover:opacity-100',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{ backgroundColor: c.hex }}
          >
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check
                  className={clsx(
                    'w-4 h-4 stroke-[3]',
                    isLight ? 'text-slate-900' : 'text-white'
                  )}
                />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
