'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Crown, Trophy, RotateCcw, Home, Sparkles, Flame } from 'lucide-react';
import { LeaderboardEntry } from '@/types/game';

interface FinalLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  isHost: boolean;
  onPlayAgain: () => Promise<void>;
}

export function FinalLeaderboard({
  leaderboard,
  isHost,
  onPlayAgain,
}: FinalLeaderboardProps) {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    try {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (e) {}
  }, []);

  const handlePlayAgain = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      await onPlayAgain();
    } catch (err) {
      setIsResetting(false);
    }
  };

  const champion = leaderboard.find((p) => p.is_champion) || leaderboard[0];

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Crown Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-4 py-1.5 text-xs font-black text-amber-300 shadow-lg animate-bounce">
          <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>MATCH COMPLETE</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-pink-500 font-comic tracking-tight">
          THE ULTIMATE THROAT GOAT
        </h1>

        {champion && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border-2 border-amber-400/60 shadow-2xl space-y-1">
            <div className="text-xs uppercase tracking-widest font-black text-amber-400">
              🏆 Champion of the Game
            </div>
            <div className="text-3xl font-black text-white">{champion.nickname}</div>
            <div className="text-sm font-bold text-amber-300 font-mono">
              {champion.total_score} Total Points
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Final Standings</span>
        </h3>

        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isFirst = entry.rank === 1;
            return (
              <div
                key={entry.player_id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isFirst
                    ? 'bg-amber-950/40 border-amber-500/50 shadow-md font-bold'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                      isFirst
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : entry.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : entry.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{entry.rank}
                  </div>
                  <span className="font-semibold text-slate-100">{entry.nickname}</span>
                </div>

                <div className="font-mono font-black text-base text-amber-300">
                  {entry.total_score} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Rematch or Home Controls */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {isHost ? (
          <button
            onClick={handlePlayAgain}
            disabled={isResetting}
            className="py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-base shadow-xl flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isResetting ? 'Resetting...' : 'Play Again'}</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs font-medium text-slate-400 flex items-center justify-center">
            Waiting for host to decide rematch...
          </div>
        )}

        <button
          onClick={() => router.push('/')}
          className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-base shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          <span>Exit to Home</span>
        </button>
      </div>
    </div>
  );
}
