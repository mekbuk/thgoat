'use client';

import React from 'react';
import Image from 'next/image';
import { X, Calendar, Layers, Download } from 'lucide-react';
import { DrawingPublicDto } from '@/types/drawing';

interface DrawingModalProps {
  drawing: DrawingPublicDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DrawingModal: React.FC<DrawingModalProps> = ({ drawing, isOpen, onClose }) => {
  if (!isOpen || !drawing) return null;

  const formattedDate = new Date(drawing.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="pr-10">
          <h2 className="text-xl sm:text-2xl font-black text-white font-comic tracking-tight">
            {drawing.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-pink-400" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-yellow-400" />
              {drawing.strokeCount} strokes
            </span>
            <span>•</span>
            <span className="text-slate-500">
              {drawing.width} × {drawing.height} px
            </span>
          </div>
        </div>

        {/* Enlarged Artwork Container */}
        <div className="relative w-full aspect-[4/3] max-h-[60vh] rounded-2xl bg-white overflow-hidden border-2 border-slate-800 flex items-center justify-center shadow-inner">
          <Image
            src={drawing.imageUrl}
            alt={drawing.title}
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <a
            href={drawing.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`${drawing.title.toLowerCase().replace(/\s+/g, '-')}-${drawing.id}.webp`}
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold hover:bg-slate-700 hover:text-white transition-all"
          >
            <Download className="w-4 h-4 text-pink-400" />
            Download
          </a>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-pink-600 text-white text-sm font-bold hover:bg-pink-500 active:scale-95 transition-all shadow-md shadow-pink-600/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
