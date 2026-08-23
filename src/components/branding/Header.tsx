'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Image as ImageIcon, Paintbrush } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Branding */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform hover:scale-105"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-400 p-0.5 shadow-lg shadow-pink-500/20 flex items-center justify-center">
            <span className="text-xl select-none">🐐</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-comic">
              THROAT GOAT <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
            </h1>
            <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest leading-none">
              Meme Drawing Studio
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-900 transition-all"
          >
            <Paintbrush className="w-4 h-4 text-pink-400" />
            <span>Studio</span>
          </Link>
          <Link
            href="/gallery"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-900 transition-all"
          >
            <ImageIcon className="w-4 h-4 text-yellow-400" />
            <span>Gallery</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
