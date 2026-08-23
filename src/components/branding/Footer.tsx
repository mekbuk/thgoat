'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 space-y-1">
        <p className="font-medium text-slate-400">
          🐐 <span className="text-pink-400 font-bold">Throat Goat</span> — The Internet&apos;s Ultimate Meme Drawing Hub
        </p>
        <p className="text-[11px] text-slate-600">
          Draw freely. Submit your masterpieces. Built with Next.js, Konva & Supabase.
        </p>
      </div>
    </footer>
  );
};
