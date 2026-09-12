'use client';

import React from 'react';
import Image from 'next/image';
import { ThroatBox } from '@/types/game';

interface ThroatTattooOverlayProps {
  celebrityImageUrl: string;
  celebrityName?: string;
  tattooImageUrl?: string | null;
  throatBox?: ThroatBox;
  className?: string;
  showThroatTarget?: boolean; // Highlight the neck zone when drawing
}

const DEFAULT_THROAT_BOX: ThroatBox = {
  top: 60,
  left: 34,
  width: 32,
  height: 20,
  rotation: 0,
  curvature: 0.1,
};

export function ThroatTattooOverlay({
  celebrityImageUrl,
  celebrityName,
  tattooImageUrl,
  throatBox = DEFAULT_THROAT_BOX,
  className = '',
  showThroatTarget = false,
}: ThroatTattooOverlayProps) {
  const box = throatBox || DEFAULT_THROAT_BOX;

  return (
    <div
      className={`relative w-full max-w-md mx-auto aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-950 select-none ${className}`}
    >
      {/* Celebrity Base Image */}
      <img
        src={celebrityImageUrl}
        alt={celebrityName || 'Celebrity'}
        className="w-full h-full object-cover object-center pointer-events-none"
      />

      {/* Target indicator guide (visible during drawing mode to show throat area) */}
      {showThroatTarget && !tattooImageUrl && (
        <div
          className="absolute border-2 border-dashed border-rose-500/60 bg-rose-500/10 rounded-2xl pointer-events-none flex items-center justify-center animate-pulse"
          style={{
            top: `${box.top}%`,
            left: `${box.left}%`,
            width: `${box.width}%`,
            height: `${box.height}%`,
            transform: `rotate(${box.rotation || 0}deg)`,
          }}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 bg-slate-900/80 px-2 py-0.5 rounded-full border border-rose-500/30">
            Throat Zone
          </span>
        </div>
      )}

      {/* Stretched Throat Tattoo Ink Overlay */}
      {tattooImageUrl && (
        <div
          className="absolute pointer-events-none flex items-center justify-center transition-all duration-500 ease-out"
          style={{
            top: `${box.top}%`,
            left: `${box.left}%`,
            width: `${box.width}%`,
            height: `${box.height}%`,
            transform: `rotate(${box.rotation || 0}deg) scale(1.08)`,
          }}
        >
          {/* Multiply blend mode maps dark tattoo lines onto skin while making white fully transparent */}
          <div className="relative w-full h-full flex items-center justify-center filter contrast-125 saturate-110">
            <img
              src={tattooImageUrl}
              alt="Throat Tattoo"
              className="w-full h-full object-contain mix-blend-multiply opacity-90 transition-transform duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
              style={{
                // Slight curvature styling to simulate contour over the throat
                borderRadius: '20% / 15%',
                transform: 'scaleX(1.1) scaleY(0.95)',
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom celebrity name badge */}
      {celebrityName && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 truncate">{celebrityName}</span>
          <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            Target
          </span>
        </div>
      )}
    </div>
  );
}
