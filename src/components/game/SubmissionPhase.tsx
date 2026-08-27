'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Sparkles, Clock, ArrowRight, Check } from 'lucide-react';
import { ImageCard } from '@/components/shared/ImageCard';
import { ActiveStageInfo, PlayerPromptInfo } from '@/types/game';

interface SubmissionPhaseProps {
  stage: ActiveStageInfo;
  prompts?: PlayerPromptInfo[];
  hasSubmitted: boolean;
  onSubmitTitle: (matchupId: string, title: string) => Promise<void>;
  totalSubmitted?: number;
  totalRequired?: number;
}

export function SubmissionPhase({
  stage,
  prompts = [],
  hasSubmitted,
  onSubmitTitle,
  totalSubmitted = 0,
  totalRequired = 0,
}: SubmissionPhaseProps) {
  // Find first unsubmitted prompt index
  const firstUnsubmittedIndex = prompts.findIndex((p) => !p.has_submitted);
  const [activeStep, setActiveStep] = useState<number>(
    firstUnsubmittedIndex !== -1 ? firstUnsubmittedIndex : 0
  );

  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track previous submission status to avoid wiping user's typed title on periodic background polling
  const prevSubmittedKey = React.useRef<string>('');

  useEffect(() => {
    const submittedKey = prompts.map((p) => `${p.matchup_id}:${p.has_submitted}`).join('|');
    if (prevSubmittedKey.current !== submittedKey) {
      prevSubmittedKey.current = submittedKey;
      const unsubmitted = prompts.findIndex((p) => !p.has_submitted);
      if (unsubmitted !== -1 && unsubmitted !== activeStep) {
        setActiveStep(unsubmitted);
        setTitle('');
      }
    }
  }, [prompts, activeStep]);

  const currentPrompt = prompts[activeStep] || {
    matchup_id: stage.stage_id,
    prompt_index: 1,
    picture_id: 'default',
    picture_url: stage.picture_url,
    picture_description: stage.picture_description,
    task_prompt: stage.task_prompt,
    has_submitted: hasSubmitted,
  };

  const totalPrompts = prompts.length || 2;
  const allCompleted = prompts.length > 0 ? prompts.every((p) => p.has_submitted) : hasSubmitted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting || currentPrompt.has_submitted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitTitle(currentPrompt.matchup_id, title.trim());
      setTitle('');
      // Advance to next prompt if available
      if (activeStep + 1 < totalPrompts) {
        setActiveStep(activeStep + 1);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit title');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Progress & Header */}
      <div className="text-center space-y-3 w-full">
        <div className="flex items-center justify-center space-x-2">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STAGE {stage.stage_number} PROMPTS</span>
          </div>

          {!allCompleted && totalPrompts > 1 && (
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-300">
              <span>PROMPT {activeStep + 1} OF {totalPrompts}</span>
            </div>
          )}
        </div>

        {/* Step Indicator Pills */}
        {!allCompleted && totalPrompts > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-1">
            {prompts.map((p, idx) => (
              <button
                key={p.matchup_id || idx}
                type="button"
                onClick={() => !p.has_submitted && setActiveStep(idx)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  p.has_submitted
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                    : idx === activeStep
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
              >
                {p.has_submitted ? (
                  <>
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Prompt {idx + 1} Done</span>
                  </>
                ) : (
                  <span>Picture #{idx + 1}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {allCompleted ? 'All Set for Voting!' : 'Give this tattoo your funniest title.'}
        </h2>
        <p className="text-xs text-slate-400">
          {allCompleted
            ? 'Your titles are locked in. Two players wrote titles for each tattoo — head-to-head voting begins soon!'
            : 'Another random player in the room is also titling this exact picture. Make yours funnier!'}
        </p>
      </div>

      {allCompleted ? (
        /* Waiting / Completed Card */
        <div className="w-full space-y-4">
          <div className="w-full rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 text-center shadow-2xl animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            <div className="space-y-1.5">
              <h4 className="text-xl font-black text-emerald-200">Both Titles Locked In!</h4>
              <p className="text-xs sm:text-sm text-emerald-400/90 font-medium">
                {totalRequired > 0
                  ? `Waiting for remaining players... (${totalSubmitted}/${totalRequired} titles submitted)`
                  : 'Waiting for all players to complete their titles...'}
              </p>
            </div>

            {/* Submitted Titles Preview */}
            {prompts.length > 0 && (
              <div className="w-full space-y-2 pt-2 text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/70">
                  Your Locked In Submissions:
                </div>
                {prompts.map((p, idx) => (
                  <div
                    key={p.matchup_id || idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-300">Picture #{idx + 1}</span>
                    <span className="font-comic font-bold text-emerald-300">
                      &ldquo;{p.submitted_title || 'Submitted'}&rdquo;
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-3">
              <Clock className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Voting begins automatically when everyone is finished</span>
            </div>
          </div>
        </div>
      ) : (
        /* Active Prompt Artwork and Input Form */
        <div className="w-full space-y-6">
          <ImageCard
            imageUrl={currentPrompt.picture_url}
            description={currentPrompt.picture_description}
            className="w-full max-w-md mx-auto shadow-2xl"
          />

          <form onSubmit={handleSubmit} className="space-y-3 w-full">
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="text"
                  maxLength={100}
                  placeholder="Type your funniest title here..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl bg-slate-900 border-2 border-slate-700 px-4 py-4 text-base font-semibold text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-inner"
                  autoFocus
                  required
                />
                <span className="absolute right-3.5 bottom-3.5 text-[11px] font-mono font-bold text-slate-500">
                  {title.length}/100
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-base shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <span>
                {isSubmitting
                  ? 'Locking In...'
                  : activeStep + 1 < totalPrompts
                  ? 'Submit Title & Next Picture'
                  : 'Submit Final Title'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {error && (
              <p className="text-center text-xs font-semibold text-rose-400">
                {error}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
