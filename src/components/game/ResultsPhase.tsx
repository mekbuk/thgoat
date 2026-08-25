'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Crown, Trophy, ArrowRight, Sparkles, Flame, Medal } from 'lucide-react';
import { MatchupResult, PlayerSummary, StageResultItem } from '@/types/game';
import { TOTAL_STAGES } from '@/lib/game/state-machine';

interface ResultsPhaseProps {
  stageNumber: number;
  matchupResults?: MatchupResult[];
  results?: StageResultItem[];
  players?: PlayerSummary[];
  isHost: boolean;
  onAdvanceStage: () => Promise<void>;
}

export function ResultsPhase({
  stageNumber,
  matchupResults = [],
  results = [],
  players = [],
  isHost,
  onAdvanceStage,
}: ResultsPhaseProps) {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const isFinalStage = stageNumber >= TOTAL_STAGES;

  // Sort players for round scoreboard
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  useEffect(() => {
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
          <span>STAGE {stageNumber} ROUND SUMMARY</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Current Standings
        </h2>
        <p className="text-xs text-slate-400">
          {isFinalStage
            ? 'All rounds completed! Ready to crown the ultimate champion.'
            : 'Stage 1 matchups concluded. Here are the standings heading into Stage 2!'}
        </p>
      </div>

      {/* Standings Scoreboard Card */}
      {sortedPlayers.length > 0 && (
        <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Medal className="w-4 h-4 text-amber-400" />
            <span>Player Scores</span>
          </div>

          <div className="space-y-2">
            {sortedPlayers.map((player, index) => {
              const isFirst = index === 0 && player.score > 0;
              return (
                <div
                  key={player.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-500/15 via-slate-800 to-rose-500/15 border-amber-500/50'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-black font-mono w-5 ${isFirst ? 'text-amber-400' : 'text-slate-500'}`}>
                      #{index + 1}
                    </span>
                    <span className="text-sm font-bold text-white flex items-center space-x-1.5">
                      <span>{player.nickname}</span>
                      {isFirst && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    </span>
                  </div>

                  <span className="text-sm font-black font-mono text-amber-300">
                    {player.score} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Matchup Recap Cards */}
      {matchupResults.length > 0 && (
        <div className="w-full space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            Round Matchup Recaps
          </div>

          <div className="space-y-3">
            {matchupResults.map((m, idx) => {
              const winner = m.options.find((o) => o.is_winner);
              return (
                <div
                  key={m.matchup_id || idx}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 font-black border border-purple-500/30">
                      #{idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-comic font-bold text-white text-sm">
                        &ldquo;{winner?.title || m.options[0]?.title}&rdquo;
                      </div>
                      <div className="text-slate-400">
                        Won by <strong className="text-slate-200">{winner?.author_nickname || 'Co-winner'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-black text-amber-300">
                      +{winner?.points_awarded || 0} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Advance Control */}
      <div className="w-full pt-2">
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
            <p className="text-xs font-medium text-slate-400 animate-pulse">
              Waiting for host to proceed to {isFinalStage ? 'final leaderboard' : 'Stage 2'}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
