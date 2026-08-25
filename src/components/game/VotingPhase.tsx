'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  CheckCircle2,
  Sparkles,
  Trophy,
  Clock,
  Swords,
  Flame,
  Crown,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { ImageCard } from '@/components/shared/ImageCard';
import { CurrentMatchupInfo, ActiveStageInfo } from '@/types/game';

interface VotingPhaseProps {
  stage?: ActiveStageInfo | null;
  currentMatchup: CurrentMatchupInfo | null;
  isHost: boolean;
  onCastVote: (matchupId: string, submissionId: string) => Promise<void>;
  onAdvanceMatchup: () => Promise<void>;
}

export function VotingPhase({
  stage,
  currentMatchup,
  isHost,
  onCastVote,
  onAdvanceMatchup,
}: VotingPhaseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger confetti when a matchup is revealed
  useEffect(() => {
    if (currentMatchup?.is_revealed) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.65 },
        });
      } catch (e) {}
    }
  }, [currentMatchup?.is_revealed, currentMatchup?.matchup_id]);

  if (!currentMatchup) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Clock className="w-8 h-8 animate-spin text-purple-400" />
        <p className="text-sm font-semibold text-slate-400">Loading matchup...</p>
      </div>
    );
  }

  const {
    matchup_id,
    order_index,
    total_matchups,
    picture_url,
    picture_description,
    is_author,
    is_revealed,
    voting_options,
    has_voted,
    total_voted,
    total_eligible_voters,
    result,
  } = currentMatchup;

  const handleVote = async () => {
    if (!selectedId || isVoting || has_voted || is_author) return;

    setIsVoting(true);
    setError(null);

    try {
      await onCastVote(matchup_id, selectedId);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleAdvance = async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    try {
      await onAdvanceMatchup();
    } catch (err: any) {
      setError(err?.message || 'Failed to advance matchup');
    } finally {
      setIsAdvancing(false);
    }
  };

  const isLastMatchup = order_index + 1 >= total_matchups;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Matchup Progress Header */}
      <div className="text-center space-y-2 w-full">
        <div className="flex items-center justify-center space-x-2">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-300">
            <Swords className="w-3.5 h-3.5 text-purple-400" />
            <span>
              MATCHUP {order_index + 1} OF {total_matchups}
            </span>
          </div>

          {is_revealed && (
            <div className="inline-flex items-center space-x-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-black text-amber-300">
              <Crown className="w-3 h-3 fill-amber-400" />
              <span>REVEAL</span>
            </div>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {is_revealed
            ? 'Matchup Showdown Results!'
            : is_author
            ? 'Your Title Is in This Battle!'
            : 'Vote for the Funniest Title!'}
        </h2>
        <p className="text-xs text-slate-400">
          {is_revealed
            ? 'Check out the vote split and points awarded for this tattoo.'
            : is_author
            ? 'Two players titled this tattoo. The room is voting on the best one!'
            : 'Pick the title that makes you laugh the most.'}
        </p>
      </div>

      {/* Tattoo Image Artwork */}
      <ImageCard
        imageUrl={picture_url}
        description={picture_description}
        className="w-full max-w-sm shadow-2xl"
      />

      {/* Main Interactive Body: Revealed vs Voting State */}
      <div className="w-full space-y-4">
        {is_revealed && result ? (
          /* REVEALED RESULTS STATE */
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            {result.is_sweep && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-400/50 flex items-center justify-center space-x-2 text-amber-300 text-xs font-black uppercase tracking-wider animate-pulse shadow-lg">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Throat Goat Sweep! +100 Bonus Points!</span>
              </div>
            )}

            {result.is_tie && (
              <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center space-x-2 text-indigo-300 text-xs font-black uppercase tracking-wider shadow-lg">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>It&apos;s a Tie! Both players receive winner bonus!</span>
              </div>
            )}

            <div className="space-y-3">
              {result.options.map((opt) => {
                const percentage =
                  result.total_votes > 0
                    ? Math.round((opt.votes_received / result.total_votes) * 100)
                    : 0;

                return (
                  <div
                    key={opt.submission_id}
                    className={`relative overflow-hidden p-5 rounded-2xl border-2 transition-all shadow-xl ${
                      opt.is_winner
                        ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-rose-950/70 border-amber-400 shadow-amber-500/20 scale-[1.02]'
                        : 'bg-slate-900/90 border-slate-800 opacity-90'
                    }`}
                  >
                    {/* Background vote percentage fill bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-700 opacity-15 pointer-events-none ${
                        opt.is_winner ? 'bg-amber-400' : 'bg-slate-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2">
                          {opt.is_winner && (
                            <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-0.5 text-[11px] font-black">
                              <Crown className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>WINNER</span>
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-300">
                            By <strong className="text-white">{opt.author_nickname}</strong>
                          </span>
                        </div>

                        <p className="text-lg sm:text-xl font-bold font-comic text-white leading-snug">
                          &ldquo;{opt.title}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-lg font-black text-amber-300 font-mono">
                            +{opt.points_awarded} pts
                          </div>
                          <div className="text-xs text-slate-400 font-semibold">
                            {opt.votes_received} {opt.votes_received === 1 ? 'vote' : 'votes'}{' '}
                            ({percentage}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Advance Matchup / Next Round Button */}
            <div className="pt-3">
              {isHost ? (
                <button
                  onClick={handleAdvance}
                  disabled={isAdvancing}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base shadow-xl flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{isLastMatchup ? 'View Stage Standings' : 'Next Matchup'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-xs font-medium text-slate-400 animate-pulse">
                    Waiting for host to proceed to {isLastMatchup ? 'stage standings' : 'next matchup'}...
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : is_author ? (
          /* AUTHOR SPECTATING STATE */
          <div className="w-full rounded-2xl border border-rose-500/40 bg-rose-950/30 p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 text-center shadow-xl animate-in fade-in">
            <Flame className="w-12 h-12 text-rose-400 animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-xl font-black text-rose-200">You Are in This Matchup!</h4>
              <p className="text-xs sm:text-sm text-rose-300/80 font-medium">
                You cannot vote on your own picture. Sit back and watch the room decide!
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 bg-rose-950/60 px-4 py-2 rounded-full border border-rose-500/30">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>
                {total_eligible_voters > 0
                  ? `Votes cast: ${total_voted}/${total_eligible_voters}`
                  : 'Waiting for reveal...'}
              </span>
            </div>

            {/* If room has 0 eligible voters (e.g. 2 player mode), let host reveal */}
            {isHost && total_eligible_voters === 0 && (
              <button
                onClick={handleAdvance}
                className="mt-2 py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Reveal Matchup Results
              </button>
            )}
          </div>
        ) : has_voted ? (
          /* VOTER ALREADY VOTED WAITING STATE */
          <div className="w-full rounded-2xl border border-purple-500/40 bg-purple-950/40 p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 text-center shadow-xl animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-purple-400 animate-bounce" />
            <div className="space-y-1">
              <h4 className="text-xl font-black text-purple-200">Vote Cast!</h4>
              <p className="text-xs sm:text-sm text-purple-300/80 font-medium">
                {total_eligible_voters > 0
                  ? `Waiting for remaining voters... (${total_voted}/${total_eligible_voters} votes)`
                  : 'Waiting for results to be revealed...'}
              </p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-2">
              <Clock className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>Results reveal automatically once all votes are in</span>
            </div>
          </div>
        ) : (
          /* ACTIVE VOTING HEAD-TO-HEAD OPTIONS */
          <div className="space-y-4">
            <div className="space-y-3">
              {voting_options.map((option, idx) => {
                const isSelected = selectedId === option.submission_id;
                return (
                  <button
                    key={option.submission_id}
                    type="button"
                    onClick={() => setSelectedId(option.submission_id)}
                    className={`w-full p-5 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between shadow-lg ${
                      isSelected
                        ? 'bg-purple-950/80 border-purple-400 text-white scale-[1.01] shadow-purple-500/30 ring-2 ring-purple-400/50'
                        : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-start space-x-3 pr-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-[11px] font-black text-slate-400 flex-shrink-0 mt-0.5">
                        {idx === 0 ? 'A' : 'B'}
                      </span>
                      <span className="leading-relaxed font-comic text-base sm:text-lg">
                        &ldquo;{option.title}&rdquo;
                      </span>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-purple-500 border-purple-400 text-white'
                          : 'border-slate-700 bg-slate-950'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleVote}
              disabled={!selectedId || isVoting}
              className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-xl flex items-center justify-center space-x-2 transition-all ${
                selectedId && !isVoting
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>{isVoting ? 'Recording Vote...' : 'Lock in Vote'}</span>
            </button>

            {error && (
              <p className="text-center text-xs font-semibold text-rose-400">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
