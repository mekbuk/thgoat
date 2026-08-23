'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Paintbrush, Loader2 } from 'lucide-react';
import { DrawingPublicDto } from '@/types/drawing';
import { DrawingCard } from './DrawingCard';
import { DrawingModal } from './DrawingModal';

interface DrawingGridProps {
  initialDrawings: DrawingPublicDto[];
  hasMore?: boolean;
  nextCursor?: string | null;
}

export const DrawingGrid: React.FC<DrawingGridProps> = ({
  initialDrawings,
  hasMore: initialHasMore = false,
  nextCursor: initialNextCursor = null,
}) => {
  const [drawings, setDrawings] = useState<DrawingPublicDto[]>(initialDrawings);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [selectedDrawing, setSelectedDrawing] = useState<DrawingPublicDto | null>(null);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const res = await fetch(`/api/drawings?limit=20&cursor=${encodeURIComponent(nextCursor)}`);
      const data = await res.json();

      if (res.ok && data.drawings) {
        setDrawings((prev) => [...prev, ...data.drawings]);
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      console.error('Failed to load more drawings:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (drawings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-pink-500/10 border-2 border-pink-500/30 flex items-center justify-center text-4xl animate-bounce">
          🐐
        </div>
        <h3 className="text-xl font-bold text-white font-comic">The Pasture is Empty!</h3>
        <p className="text-sm text-slate-400">
          No drawings have been submitted yet. Be the pioneer who births the first legendary Throat Goat artwork.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-bold hover:from-pink-400 hover:to-yellow-300 active:scale-95 shadow-lg shadow-pink-500/25 transition-all"
        >
          <Paintbrush className="w-5 h-5" />
          <span>Draw the First Goat</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
        {drawings.map((drawing) => (
          <DrawingCard
            key={drawing.id}
            drawing={drawing}
            onSelect={(item) => setSelectedDrawing(item)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8 mb-4">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 py-3 px-8 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 font-bold hover:bg-slate-800 hover:text-white active:scale-95 transition-all shadow-md"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                <span>Fetching More Goats...</span>
              </>
            ) : (
              <span>Load More Art</span>
            )}
          </button>
        </div>
      )}

      {/* Enlarged Modal */}
      <DrawingModal
        drawing={selectedDrawing}
        isOpen={!!selectedDrawing}
        onClose={() => setSelectedDrawing(null)}
      />
    </>
  );
};
