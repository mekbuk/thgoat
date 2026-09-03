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
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  }, [currentMatchup?.is_revealed, currentMatchup?.matchup_id]);

  // Reset local selection and error states when moving to a new matchup
  useEffect(() => {
    setSelectedId(null);
    setIsVoting(false);
    setError(null);
  }, [currentMatchup?.matchup_id]);

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
    voting_options = [],
    has_voted,
    my_vote_submission_id,
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

  // Distribute options for 1v1 side-by-side floating comparison (Title A on left, Title B on right)
  const optionA = voting_options[0] || null;
  const optionB = voting_options[1] || null;

  // Distribute result options for 1v1 revealed showdown (remains in the same place without swapping)
  const resultOptionA = optionA
    ? result?.options?.find((o) => o.submission_id === optionA.submission_id) || result?.options?.[0] || null
    : result?.options?.[0] || null;

  const resultOptionB = optionB
    ? result?.options?.find((o) => o.submission_id === optionB.submission_id) || result?.options?.[1] || null
    : result?.options?.[1] || null;

  const selectedOptionLetter =
    selectedId === optionA?.submission_id
      ? 'A'
      : selectedId === optionB?.submission_id
      ? 'B'
      : '';

  return (
    <div className="flex flex-col items-center justify-center space-y-5 w-full max-w-6xl mx-auto p-2 sm:p-4 lg:p-6 animate-fade-in">
      {/* Matchup Header */}
      <div className="text-center space-y-2 w-full max-w-2xl mx-auto">
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
              <span>REVEALED</span>
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
            ? 'Check out the vote split and bonus points awarded for this tattoo.'
            : is_author
            ? 'Two players titled this tattoo. The room is voting on the best one!'
            : 'Pick the title that makes you laugh the most.'}
        </p>

        {/* Special Sweep / Tie Banner */}
        {is_revealed && result?.is_sweep && (
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-400/50 flex items-center justify-center space-x-2 text-amber-300 text-xs font-black uppercase tracking-wider animate-pulse shadow-lg">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Throat Goat Sweep! +100 Bonus Points!</span>
          </div>
        )}

        {is_revealed && result?.is_tie && (
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center space-x-2 text-indigo-300 text-xs font-black uppercase tracking-wider shadow-lg">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>It&apos;s a Tie! Both players receive bonus points!</span>
          </div>
        )}
      </div>

      {/* SHOWDOWN ARENA: Picture in the middle, titles floating beside it */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-center justify-center my-2">
        {/* ================= LEFT SIDE: TITLE A ================= */}
        <div className="order-2 md:order-1 md:col-span-4 flex flex-col justify-center">
          {is_revealed && resultOptionA ? (
            /* Revealed Result Card A */
            <div
              className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-2xl animate-float-left ${
                resultOptionA.is_winner
                  ? 'bg-gradient-to-br from-amber-950/80 via-slate-900/90 to-rose-950/80 border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-900/85 border-slate-800 opacity-90'
              }`}
            >
              {/* Vote percentage fill */}
              <div
                className={`absolute left-0 top-0 bottom-0 transition-all duration-700 opacity-15 pointer-events-none ${
                  resultOptionA.is_winner ? 'bg-amber-400' : 'bg-slate-400'
                }`}
                style={{
                  width: `${
                    result && result.total_votes > 0
                      ? Math.round((resultOptionA.votes_received / result.total_votes) * 100)
                      : 0
                  }%`,
                }}
              />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-[11px] font-black text-rose-300">
                    <span>TITLE A</span>
                  </span>

                  {resultOptionA.is_winner && (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 text-xs font-black animate-pulse">
                      <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>WINNER</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold font-comic text-white leading-snug">
                    &ldquo;{resultOptionA.title}&rdquo;
                  </p>
                  <p className="text-xs font-bold text-slate-300">
                    By <strong className="text-white">{resultOptionA.author_nickname}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    {resultOptionA.votes_received} {resultOptionA.votes_received === 1 ? 'vote' : 'votes'} (
                    {result && result.total_votes > 0
                      ? Math.round((resultOptionA.votes_received / result.total_votes) * 100)
                      : 0}
                    %)
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                    +{resultOptionA.points_awarded} pts
                  </span>
                </div>
              </div>
            </div>
          ) : optionA ? (
            /* Floating Interactive Voting Card A */
            <div
              onClick={() => !has_voted && !is_author && setSelectedId(optionA.submission_id)}
              className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 shadow-2xl animate-float-left ${
                has_voted || is_author
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-[1.03]'
              } ${
                selectedId === optionA.submission_id
                  ? 'bg-rose-950/80 border-rose-400 text-white ring-4 ring-rose-500/30 shadow-rose-500/30'
                  : my_vote_submission_id === optionA.submission_id
                  ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-400/40 text-white'
                  : optionA.is_mine
                  ? 'bg-[#1a0e2e]/90 border-amber-500/60 ring-2 ring-amber-500/30 shadow-amber-950/40 text-white'
                  : 'bg-slate-900/90 border-slate-800/90 text-slate-200 hover:border-rose-500/50 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-[11px] font-black text-rose-300">
                  <Sparkles className="w-3 h-3 text-rose-400" />
                  <span>TITLE A</span>
                </span>

                {optionA.is_mine && (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 text-[11px] font-black animate-pulse">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>YOUR TITLE</span>
                  </span>
                )}

                {!has_voted && !is_author && (
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedId === optionA.submission_id
                        ? 'bg-rose-500 border-rose-400 text-white scale-110'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  >
                    {selectedId === optionA.submission_id && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </div>
                )}

                {my_vote_submission_id === optionA.submission_id && (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 text-[11px] font-bold">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>YOUR VOTE</span>
                  </span>
                )}
              </div>

              <p className="text-xl sm:text-2xl font-bold font-comic text-white leading-relaxed my-2">
                &ldquo;{optionA.title}&rdquo;
              </p>

              {!has_voted && !is_author ? (
                <div className="pt-2 text-[11px] font-semibold text-rose-300/80 text-right">
                  {selectedId === optionA.submission_id ? '✓ Selected' : 'Click to select'}
                </div>
              ) : is_author ? (
                <div className="pt-2 text-[11px] font-semibold text-slate-400 text-right">
                  {optionA.is_mine ? 'Your title in this battle' : 'Opponent’s title'}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* ================= CENTER: TATTOO ARTWORK IMAGE ================= */}
        <div className="order-1 md:order-2 md:col-span-4 flex flex-col items-center justify-center">
          <div className="relative group w-full max-w-xs sm:max-w-sm">
            {/* Center spotlight glow backdrop */}
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />

            <ImageCard
              imageUrl={picture_url}
              description={picture_description}
              className="relative w-full rounded-3xl shadow-2xl border-2 border-slate-700/80 bg-slate-950"
            />
          </div>
        </div>

        {/* ================= RIGHT SIDE: TITLE B ================= */}
        <div className="order-3 md:order-3 md:col-span-4 flex flex-col justify-center">
          {is_revealed && resultOptionB ? (
            /* Revealed Result Card B */
            <div
              className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-2xl animate-float-right ${
                resultOptionB.is_winner
                  ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-amber-950/80 border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-900/85 border-slate-800 opacity-90'
              }`}
            >
              {/* Vote percentage fill */}
              <div
                className={`absolute left-0 top-0 bottom-0 transition-all duration-700 opacity-15 pointer-events-none ${
                  resultOptionB.is_winner ? 'bg-amber-400' : 'bg-slate-400'
                }`}
                style={{
                  width: `${
                    result && result.total_votes > 0
                      ? Math.round((resultOptionB.votes_received / result.total_votes) * 100)
                      : 0
                  }%`,
                }}
              />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[11px] font-black text-indigo-300">
                    <span>TITLE B</span>
                  </span>

                  {resultOptionB.is_winner && (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 text-xs font-black animate-pulse">
                      <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>WINNER</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold font-comic text-white leading-snug">
                    &ldquo;{resultOptionB.title}&rdquo;
                  </p>
                  <p className="text-xs font-bold text-slate-300">
                    By <strong className="text-white">{resultOptionB.author_nickname}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    {resultOptionB.votes_received} {resultOptionB.votes_received === 1 ? 'vote' : 'votes'} (
                    {result && result.total_votes > 0
                      ? Math.round((resultOptionB.votes_received / result.total_votes) * 100)
                      : 0}
                    %)
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                    +{resultOptionB.points_awarded} pts
                  </span>
                </div>
              </div>
            </div>
          ) : optionB ? (
            /* Floating Interactive Voting Card B */
            <div
              onClick={() => !has_voted && !is_author && setSelectedId(optionB.submission_id)}
              className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 shadow-2xl animate-float-right ${
                has_voted || is_author
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-[1.03]'
              } ${
                selectedId === optionB.submission_id
                  ? 'bg-indigo-950/80 border-indigo-400 text-white ring-4 ring-indigo-500/30 shadow-indigo-500/30'
                  : my_vote_submission_id === optionB.submission_id
                  ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-400/40 text-white'
                  : optionB.is_mine
                  ? 'bg-[#1a0e2e]/90 border-amber-500/60 ring-2 ring-amber-500/30 shadow-amber-950/40 text-white'
                  : 'bg-slate-900/90 border-slate-800/90 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[11px] font-black text-indigo-300">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>TITLE B</span>
                </span>

                {optionB.is_mine && (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 text-[11px] font-black animate-pulse">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>YOUR TITLE</span>
                  </span>
                )}

                {!has_voted && !is_author && (
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedId === optionB.submission_id
                        ? 'bg-indigo-500 border-indigo-400 text-white scale-110'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  >
                    {selectedId === optionB.submission_id && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </div>
                )}

                {my_vote_submission_id === optionB.submission_id && (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 text-[11px] font-bold">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>YOUR VOTE</span>
                  </span>
                )}
              </div>

              <p className="text-xl sm:text-2xl font-bold font-comic text-white leading-relaxed my-2">
                &ldquo;{optionB.title}&rdquo;
              </p>

              {!has_voted && !is_author ? (
                <div className="pt-2 text-[11px] font-semibold text-indigo-300/80 text-right">
                  {selectedId === optionB.submission_id ? '✓ Selected' : 'Click to select'}
                </div>
              ) : is_author ? (
                <div className="pt-2 text-[11px] font-semibold text-slate-400 text-right">
                  {optionB.is_mine ? 'Your title in this battle' : 'Opponent’s title'}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* ================= BOTTOM CONTROL / STATUS PANEL ================= */}
      <div className="w-full max-w-md mx-auto pt-2 space-y-3">
        {is_revealed ? (
          /* Host Advance Button or Player Waiting Message */
          <div>
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
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
                <p className="text-xs font-medium text-slate-400 animate-pulse">
                  Waiting for host to proceed to {isLastMatchup ? 'stage standings' : 'next matchup'}...
                </p>
              </div>
            )}
          </div>
        ) : is_author ? (
          /* Author Spectating Status */
          <div className="space-y-3">
            {/* Disabled Voting Button */}
            <button
              type="button"
              disabled
              className="w-full py-4 px-6 rounded-2xl font-black text-base shadow-xl flex items-center justify-center space-x-2 bg-slate-900/90 text-slate-500 cursor-not-allowed border border-slate-750/70 select-none opacity-60"
              title="You wrote one of these titles and cannot vote on this matchup"
            >
              <Trophy className="w-4 h-4 text-slate-600" />
              <span>Voting Disabled (You Wrote One of These Titles)</span>
            </button>

            {/* Spectating & Live Vote Count Box */}
            <div className="w-full rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-center space-y-2 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-center space-x-2 text-rose-300 text-sm font-bold">
                <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>You Wrote One of These Titles!</span>
              </div>
              <p className="text-xs text-rose-300/70">
                Spectating while the room votes on this matchup.
              </p>
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-rose-400 bg-rose-950/80 px-3 py-1.5 rounded-full border border-rose-500/30">
                <Clock className="w-3 h-3 animate-spin" />
                <span>
                  {total_eligible_voters > 0
                    ? `Votes cast: ${total_voted}/${total_eligible_voters}`
                    : 'Waiting for reveal...'}
                </span>
              </div>
              {isHost && (total_eligible_voters === 0 || total_voted >= total_eligible_voters) && (
                <div className="pt-2">
                  <button
                    onClick={handleAdvance}
                    className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Reveal Matchup Results
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : has_voted ? (
          /* Voter Already Voted Status */
          <div className="w-full rounded-2xl border border-purple-500/40 bg-purple-950/40 p-4 text-center space-y-2 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-center space-x-2 text-purple-300 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4 text-purple-400 animate-bounce" />
              <span>Vote Locked In!</span>
            </div>
            <p className="text-xs text-purple-300/80">
              {total_eligible_voters > 0
                ? `Waiting for remaining voters (${total_voted}/${total_eligible_voters} votes)...`
                : 'Waiting for reveal...'}
            </p>
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 animate-spin text-purple-400" />
              <span>Reveals automatically once all votes are in</span>
            </div>
          </div>
        ) : (
          /* Active Voting Action Button */
          <div className="space-y-2">
            <button
              onClick={handleVote}
              disabled={!selectedId || isVoting}
              className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-xl flex items-center justify-center space-x-2 transition-all ${
                selectedId && !isVoting
                  ? selectedOptionLetter === 'A'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>
                {isVoting
                  ? 'Recording Vote...'
                  : selectedOptionLetter
                  ? `Lock in Vote for Title ${selectedOptionLetter}`
                  : 'Select a Title Above to Vote'}
              </span>
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
