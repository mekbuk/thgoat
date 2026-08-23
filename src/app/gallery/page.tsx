'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, Paintbrush, RefreshCw, Loader2 } from 'lucide-react';
import { DrawingPublicDto } from '@/types/drawing';
import { DrawingGrid } from '@/components/gallery/DrawingGrid';

export default function GalleryPage() {
  const [drawings, setDrawings] = useState<DrawingPublicDto[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDrawings = useCallback(async () => {
    try {
      const res = await fetch('/api/drawings?limit=20');
      const data = await res.json();

      if (res.ok && data.drawings) {
        setDrawings(data.drawings);
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      console.error('Error fetching gallery drawings:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDrawings();
  };

  return (
    <div className="flex-1 py-8 px-4 max-w-6xl mx-auto w-full space-y-6">
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-yellow-400 font-comic flex items-center gap-2">
            The Goat Gallery <Sparkles className="w-6 h-6 text-yellow-400" />
          </h2>
          <p className="text-sm text-slate-400">
            A permanent archive of internet culture, hand-drawn by creators worldwide.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-pink-400' : ''}`} />
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-pink-600 text-white font-bold text-sm hover:bg-pink-500 active:scale-95 transition-all shadow-lg shadow-pink-600/20"
          >
            <Paintbrush className="w-4 h-4" />
            <span>Draw New Art</span>
          </Link>
        </div>
      </div>

      {/* Gallery Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
          <p className="text-sm font-medium">Gathering Goat Artifacts...</p>
        </div>
      ) : (
        <DrawingGrid
          initialDrawings={drawings}
          hasMore={hasMore}
          nextCursor={nextCursor}
        />
      )}
    </div>
  );
}
