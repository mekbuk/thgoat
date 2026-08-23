'use client';

import React from 'react';
import { Crown, Users } from 'lucide-react';
import { GamePhase } from '@/types/game';

interface GameHeaderProps {
  roomCode: string;
  phase: GamePhase;
  currentStageNumber: number;
  playerCount?: number;
  myNickname?: string;
  isHost?: boolean;
}

export function GameHeader({
  roomCode,
  phase,
  currentStageNumber,
  playerCount = 0,
  myNickname,
  isHost = false,
}: GameHeaderProps) {
  const getPhaseBadge = () => {
    switch (phase) {
      case 'LOBBY':
        return <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">LOBBY</span>;
      case 'SUBMITTING':
        return <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-500/30">STAGE {currentStageNumber} OF 2 • SUBMISSION</span>;
      case 'VOTING':
        return <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/30">STAGE {currentStageNumber} OF 2 • VOTING</span>;
      case 'RESULTS':
        return <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">STAGE {currentStageNumber} • RESULTS</span>;
      case 'FINISHED':
        return <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/30">FINAL LEADERBOARD</span>;
    }
  };

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        {/* Left: Brand & Room Code */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-black text-rose-500 text-lg tracking-tight">
            <span>THROAT</span>
            <span className="text-amber-400">GOAT</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1 rounded-md bg-slate-800 px-2.5 py-1 text-xs font-mono font-bold text-slate-300 border border-slate-700">
            <span className="text-slate-500">ROOM:</span>
            <span className="text-amber-300 tracking-wider">{roomCode}</span>
          </div>
        </div>

        {/* Center: Phase Badge */}
        <div className="flex items-center">{getPhaseBadge()}</div>

        {/* Right: Player Profile Pill */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>{playerCount}</span>
          </div>

          {myNickname && (
            <div className="flex items-center space-x-1.5 rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200">
              {isHost && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              <span className="truncate max-w-[100px]">{myNickname}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
