'use client';

import React, { useState } from 'react';
import { Check, CheckCircle2, Sparkles, Trophy, Clock } from 'lucide-react';
import { ImageCard } from '@/components/shared/ImageCard';
import { ActiveStageInfo, VotingOption } from '@/types/game';

interface VotingPhaseProps {
  stage: ActiveStageInfo;
  votingOptions: VotingOption[];
  hasVoted: boolean;
  onCastVote: (submissionId: string) => Promise<void>;
  totalVoted?: number;
  totalRequired?: number;
}

export function VotingPhase({
  stage,
  votingOptions,
  hasVoted,
  onCastVote,
  totalVoted = 0,
  totalRequired = 0,
}: VotingPhaseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    if (!selectedId || isVoting || hasVoted) return;

    setIsVoting(true);
    setError(null);

    try {
      await onCastVote(selectedId);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit vote');
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Voting Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VOTING TIME</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Vote for the Funniest Title!
        </h2>
        <p className="text-xs text-slate-400">
          Select the best title below. You cannot vote for your own submission.
        </p>
      </div>

      {/* Picture Preview */}
      <ImageCard
        imageUrl={stage.picture_url}
        description={stage.picture_description}
        className="w-full max-w-sm shadow-xl"
      />

      {/* Voting Options List */}
      <div className="w-full space-y-3">
        {hasVoted ? (
          <div className="w-full rounded-2xl border border-purple-500/40 bg-purple-950/40 p-6 flex flex-col items-center justify-center space-y-3 text-center shadow-lg animate-in fade-in">
            <CheckCircle2 className="w-10 h-10 text-purple-400 animate-bounce" />
            <div className="space-y-1">
              <h4 className="text-lg font-black text-purple-200">Vote Cast!</h4>
              <p className="text-xs text-purple-400/80 font-medium">
                {totalRequired > 0
                  ? `Waiting for others to vote... (${totalVoted}/${totalRequired} votes)`
                  : 'Waiting for all votes to be recorded...'}
              </p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-2">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Results will be revealed momentarily</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {votingOptions.map((option) => {
                const isSelected = selectedId === option.submission_id;
                return (
                  <button
                    key={option.submission_id}
                    type="button"
                    onClick={() => setSelectedId(option.submission_id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between shadow-md ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-400 text-white scale-[1.01] shadow-purple-500/20'
                        : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <span className="pr-3 leading-relaxed font-comic text-base sm:text-lg">
                      &ldquo;{option.title}&rdquo;
                    </span>
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
