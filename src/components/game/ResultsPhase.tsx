'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Crown, Trophy, ArrowRight, Award, Sparkles } from 'lucide-react';
import { StageResultItem } from '@/types/game';
import { TOTAL_STAGES } from '@/lib/game/state-machine';

interface ResultsPhaseProps {
  stageNumber: number;
  results: StageResultItem[];
  isHost: boolean;
  onAdvanceStage: () => Promise<void>;
}

export function ResultsPhase({
  stageNumber,
  results,
  isHost,
  onAdvanceStage,
}: ResultsPhaseProps) {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const isFinalStage = stageNumber >= TOTAL_STAGES;

  useEffect(() => {
    // Fire confetti on results reveal
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  }, []);

  const handleAdvance = async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    try {
      await onAdvanceStage();
    } catch (err) {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
          <Trophy className="w-3.5 h-3.5" />
          <span>STAGE {stageNumber} RESULTS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Round Winners & Scores
        </h2>
        <p className="text-xs text-slate-400">
          {isFinalStage
            ? 'That was the final round! Check out the final scores.'
            : 'Get ready for Stage 2!'}
        </p>
      </div>

      {/* Results Cards */}
      <div className="w-full space-y-3.5">
        {results.map((item, index) => {
          return (
            <div
              key={item.submission_id || index}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl ${
                item.is_winner
                  ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-rose-950/60 border-amber-400/80 shadow-amber-500/10 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  {item.is_winner && (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 text-[11px] font-bold">
                      <Crown className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>ROUND WINNER</span>
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-400">
                    By <strong className="text-slate-200">{item.author_nickname}</strong>
                  </span>
                </div>

                <p className="text-lg sm:text-xl font-bold font-comic text-white leading-snug">
                  &ldquo;{item.title}&rdquo;
                </p>
              </div>

              {/* Vote Count & Points */}
              <div className="flex items-center space-x-3 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
                    +{item.points_awarded} pts
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {item.votes_received} {item.votes_received === 1 ? 'vote' : 'votes'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance Control */}
      <div className="w-full pt-4">
        {isHost ? (
          <button
            onClick={handleAdvance}
            disabled={isAdvancing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base shadow-xl flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{isFinalStage ? 'View Final Leaderboard' : 'Continue to Stage 2'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-sm font-medium text-slate-400 animate-pulse">
              Waiting for host to proceed...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
