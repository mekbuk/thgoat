'use client';

import React from 'react';
import Image from 'next/image';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 space-y-1">
        <p className="font-medium text-slate-400 flex items-center justify-center gap-1.5">
          <Image
            src="/icon/image.png"
            alt="Throat Goat Logo"
            width={16}
            height={16}
            className="rounded object-contain inline-block"
          />
          <span className="text-rose-400 font-bold">Throat Goat</span> — The Internet&apos;s Ultimate Multiplayer Tattoo Party Game
        </p>
        <p className="text-[11px] text-slate-600">
          Create hilarious titles for questionable tattoos. Vote with friends. Powered by Next.js & Supabase Realtime.
        </p>
      </div>
    </footer>
  );
};
