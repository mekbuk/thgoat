'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, RotateCcw, ExternalLink } from 'lucide-react';
import { DrawingPublicDto } from '@/types/drawing';

interface SuccessModalProps {
  drawing: DrawingPublicDto | null;
  isOpen: boolean;
  onDrawAnother: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  drawing,
  isOpen,
  onDrawAnother,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger meme celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EC4899', '#EAB308', '#A855F7', '#3B82F6', '#22C55E'],
        });
      } catch {
        // Fallback gracefully if confetti fails
      }
    }
  }, [isOpen]);

  if (!isOpen || !drawing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 bg-slate-900 border-2 border-pink-500 rounded-3xl shadow-2xl text-center space-y-5">
        {/* Celebration Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-500/50 text-pink-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Masterpiece Immortalized!
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight font-comic">
            🐐 Throat Goat Published!
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Your art has been securely stored and added to the community gallery.
          </p>
        </div>

        {/* Artwork Preview Card */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-700 bg-white shadow-inner flex items-center justify-center">
          {drawing.imageUrl ? (
            <Image
              src={drawing.imageUrl}
              alt={drawing.title}
              fill
              className="object-contain"
              unoptimized
            />
          ) : (
            <div className="text-slate-400 text-sm">Preview Unavailable</div>
          )}
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-between px-2">
          <span>Strokes: {drawing.strokeCount}</span>
          <span>{new Date(drawing.createdAt).toLocaleTimeString()}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onDrawAnother}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-pink-400" />
            Draw Another
          </button>

          <Link
            href="/gallery"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-bold hover:from-pink-400 hover:to-yellow-300 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>View Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
