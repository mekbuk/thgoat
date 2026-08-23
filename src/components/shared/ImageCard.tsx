'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

interface ImageCardProps {
  imageUrl: string;
  altText?: string;
  description?: string | null;
  className?: string;
}

export function ImageCard({ imageUrl, altText = 'Tattoo Prompt', description, className = '' }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 border-rose-500/20 bg-slate-900 shadow-xl ${className}`}>
      {/* Glow highlight */}
      <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 rounded-full bg-rose-500/80 px-2 py-0.5 text-xs font-bold text-white shadow">
        <Sparkles className="w-3 h-3" />
        <span>TATTOO PROMPT</span>
      </div>

      <div className="relative aspect-square max-h-[380px] w-full flex items-center justify-center bg-slate-950">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-slate-900 animate-pulse text-slate-500">
            <ImageIcon className="w-10 h-10 animate-bounce text-rose-400" />
            <span className="text-xs font-medium">Loading Tattoo Artwork...</span>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={altText}
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      {description && (
        <div className="border-t border-slate-800 bg-slate-900/90 p-2.5 text-center text-xs italic text-slate-400">
          &ldquo;{description}&rdquo;
        </div>
      )}
    </div>
  );
}
