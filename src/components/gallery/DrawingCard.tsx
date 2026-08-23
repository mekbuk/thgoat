'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Calendar, Layers } from 'lucide-react';
import { DrawingPublicDto } from '@/types/drawing';

interface DrawingCardProps {
  drawing: DrawingPublicDto;
  onSelect: (drawing: DrawingPublicDto) => void;
}

export const DrawingCard: React.FC<DrawingCardProps> = ({ drawing, onSelect }) => {
  const [hasError, setHasError] = useState(false);

  const formattedDate = new Date(drawing.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={() => onSelect(drawing)}
      className="group relative bg-slate-900/80 backdrop-blur-sm border-2 border-slate-800 hover:border-pink-500/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-pink-500/20 cursor-pointer transition-all transform hover:-translate-y-1"
    >
      {/* Image Thumbnail Container */}
      <div className="relative w-full aspect-[4/3] bg-white overflow-hidden flex items-center justify-center">
        {hasError ? (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <span className="text-3xl mb-1">🐐</span>
            <span className="text-xs font-semibold text-slate-500">Goat in hiding...</span>
          </div>
        ) : (
          <Image
            src={drawing.imageUrl}
            alt={drawing.title}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-200"
            onError={() => setHasError(true)}
            unoptimized
          />
        )}

        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-pink-300 flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {drawing.strokeCount}
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3.5 space-y-1.5">
        <h3 className="font-bold text-sm text-white truncate group-hover:text-pink-400 transition-colors">
          {drawing.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            {formattedDate}
          </span>
          <span className="text-yellow-400 font-bold flex items-center gap-0.5">
            <Sparkles className="w-3 h-3" />
            Goat
          </span>
        </div>
      </div>
    </div>
  );
};
