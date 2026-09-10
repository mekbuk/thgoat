'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Sparkles, Users } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();

  // Hide the branding header on room/lobby pages
  if (pathname?.startsWith('/room')) {
    return null;
  }

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Branding */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform hover:scale-105"
        >
          <div className="relative flex items-center justify-center w-10 h-10">
            {/* Ambient backlight glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/30 to-amber-400/20 rounded-full blur-md pointer-events-none" />
            <Image
              src="/icon.png"
              alt="Throat Goat Logo"
              width={40}
              height={40}
              className="relative w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(244,63,94,0.4)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] select-none"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-white flex items-center gap-1.5 font-title">
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
