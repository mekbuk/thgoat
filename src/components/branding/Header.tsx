'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Flame, Users } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Branding */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform hover:scale-105"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-rose-500/20 flex items-center justify-center">
            <span className="text-xl select-none">🐐</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-comic">
              THROAT GOAT <Sparkles className="w-4 h-4 text-rose-400 animate-spin" />
            </h1>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest leading-none">
              Multiplayer Tattoo Party Game
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-900 transition-all"
          >
            <Users className="w-4 h-4 text-rose-400" />
            <span>Play Game</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
