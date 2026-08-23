'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { ImageCard } from '@/components/shared/ImageCard';
import { ActiveStageInfo } from '@/types/game';

interface SubmissionPhaseProps {
  stage: ActiveStageInfo;
  hasSubmitted: boolean;
  onSubmitTitle: (title: string) => Promise<void>;
  totalSubmitted?: number;
  totalRequired?: number;
}

export function SubmissionPhase({
  stage,
  hasSubmitted,
  onSubmitTitle,
  totalSubmitted = 0,
  totalRequired = 0,
}: SubmissionPhaseProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting || hasSubmitted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitTitle(title.trim());
    } catch (err: any) {
      setError(err?.message || 'Failed to submit title');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Task Prompt Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>STAGE {stage.stage_number} PROMPT</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {stage.task_prompt}
        </h2>
        <p className="text-xs text-slate-400">
          Be creative, funny, and unhinged. The funniest title wins the round!
        </p>
      </div>

      {/* Tattoo Image Artwork */}
      <ImageCard
        imageUrl={stage.picture_url}
        description={stage.picture_description}
        className="w-full max-w-md shadow-2xl"
      />

      {/* Submission Form or Locked State */}
      <div className="w-full">
        {hasSubmitted ? (
          <div className="w-full rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-6 flex flex-col items-center justify-center space-y-3 text-center shadow-lg animate-in fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            <div className="space-y-1">
              <h4 className="text-lg font-black text-emerald-200">Title Locked In!</h4>
              <p className="text-xs text-emerald-400/80 font-medium">
                {totalRequired > 0
                  ? `Waiting for remaining players... (${totalSubmitted}/${totalRequired} submitted)`
                  : 'Waiting for all players to submit...'}
              </p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-2">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Voting begins automatically once everyone is ready</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
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
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Locking In...' : 'Submit Title'}</span>
            </button>

            {error && (
              <p className="text-center text-xs font-semibold text-rose-400">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
