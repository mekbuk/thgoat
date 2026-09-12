'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type Konva from 'konva';
import { Send, CheckCircle2, Sparkles, Clock, ArrowRight, Check, Eye, Palette } from 'lucide-react';
import { ActiveStageInfo, PlayerPromptInfo } from '@/types/game';
import { useGameTimer } from './InGameScreen';
import { DrawingCanvas } from '@/components/canvas/DrawingCanvas';
import { Toolbar } from '@/components/canvas/Toolbar';
import { ClearModal } from '@/components/canvas/ClearModal';
import { useDrawingState } from '@/hooks/useDrawingState';
import { exportStageTransparent } from '@/lib/canvas/export-utils';
import { ThroatTattooOverlay } from './ThroatTattooOverlay';

interface CelebrityDrawingPhaseProps {
  stage: ActiveStageInfo;
  prompts?: PlayerPromptInfo[];
  hasSubmitted: boolean;
  onSubmitDrawing: (matchupId: string, title: string, drawingUrl: string) => Promise<void>;
  totalSubmitted?: number;
  totalRequired?: number;
}

export function CelebrityDrawingPhase({
  stage,
  prompts = [],
  hasSubmitted,
  onSubmitDrawing,
  totalSubmitted = 0,
  totalRequired = 0,
}: CelebrityDrawingPhaseProps) {
  // Find first unsubmitted prompt index
  const firstUnsubmittedIndex = prompts.findIndex((p) => !p.has_submitted);
  const [activeStep, setActiveStep] = useState<number>(
    firstUnsubmittedIndex !== -1 ? firstUnsubmittedIndex : 0
  );

  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Live preview image dataUrl of the tattoo
  const [previewTattooUrl, setPreviewTattooUrl] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const autoSubmittedRef = useRef(false);
  const { timeLeft } = useGameTimer();

  // Drawing state
  const {
    strokes,
    tool,
    color,
    size,
    startStroke,
    appendPoint,
    endStroke,
    setTool,
    setColor,
    setSize,
    undo,
    redo,
    clearCanvas,
    canUndo,
    canRedo,
  } = useDrawingState({ initialColor: '#0f172a', initialSize: 6 });

  // Update live throat preview when a stroke ends
  const handleEndStrokeWithPreview = useCallback(async () => {
    endStroke();
    if (stageRef.current) {
      try {
        const dataUrl = await exportStageTransparent(stageRef.current);
        setPreviewTattooUrl(dataUrl);
      } catch (err) {
        console.warn('Could not generate preview:', err);
      }
    }
  }, [endStroke]);

  // Track previous submission status to avoid wiping on background poll
  const prevSubmittedKey = useRef<string>('');

  useEffect(() => {
    const submittedKey = prompts.map((p) => `${p.matchup_id}:${p.has_submitted}`).join('|');
    if (prevSubmittedKey.current !== submittedKey) {
      prevSubmittedKey.current = submittedKey;
      const unsubmitted = prompts.findIndex((p) => !p.has_submitted);
      if (unsubmitted !== -1 && unsubmitted !== activeStep) {
        setActiveStep(unsubmitted);
        clearCanvas();
        setPreviewTattooUrl(null);
        setTitle('');
      }
    }
  }, [prompts, activeStep, clearCanvas]);

  const currentPrompt = prompts[activeStep] || {
    matchup_id: stage.stage_id,
    prompt_index: 1,
    picture_id: 'default',
    picture_url: stage.picture_url,
    picture_description: stage.picture_description,
    celebrity_name: stage.celebrity_name,
    throat_box: stage.throat_box,
    task_prompt: stage.task_prompt,
    has_submitted: hasSubmitted,
  };

  const totalPrompts = prompts.length || 2;
  const allCompleted = prompts.length > 0 ? prompts.every((p) => p.has_submitted) : hasSubmitted;

  // Auto-submit on timer expiry
  const handleAutoSubmit = useCallback(async () => {
    if (autoSubmittedRef.current || allCompleted) return;
    autoSubmittedRef.current = true;

    try {
      let drawingData = previewTattooUrl || '';
      if (!drawingData && stageRef.current) {
        drawingData = await exportStageTransparent(stageRef.current);
      }
      for (const p of prompts) {
        if (!p.has_submitted) {
          await onSubmitDrawing(p.matchup_id, title.trim() || 'Throat Masterpiece', drawingData);
        }
      }
    } catch (err) {
      console.error('Auto-submit on timeout failed:', err);
    }
  }, [allCompleted, previewTattooUrl, prompts, title, onSubmitDrawing]);

  useEffect(() => {
    if (timeLeft === 0 && !hasSubmitted && !allCompleted) {
      handleAutoSubmit();
    }
  }, [timeLeft, hasSubmitted, allCompleted, handleAutoSubmit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || currentPrompt.has_submitted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let drawingData = previewTattooUrl;
      if (!drawingData && stageRef.current) {
        drawingData = await exportStageTransparent(stageRef.current);
      }

      if (!drawingData && strokes.length === 0) {
        throw new Error('Please draw something for the tattoo before submitting!');
      }

      await onSubmitDrawing(
        currentPrompt.matchup_id,
        title.trim() || `${currentPrompt.celebrity_name || 'Celebrity'} Throat Ink`,
        drawingData || ''
      );

      // Move to next unsubmitted prompt if available
      const nextUnsubmitted = prompts.findIndex((p, idx) => idx > activeStep && !p.has_submitted);
      if (nextUnsubmitted !== -1) {
        setActiveStep(nextUnsubmitted);
        clearCanvas();
        setPreviewTattooUrl(null);
        setTitle('');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit tattoo drawing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. All submissions completed waiting state
  if (allCompleted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl mx-auto p-4 sm:p-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>ALL THROAT TATTOOS INKED & LOCKED IN</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Waiting for Other Inkers...
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You finished your custom throat tattoos! Once everyone submits, we will begin the head-to-head throat tattoo battles!
          </p>
        </div>

        {/* Preview of player's submitted tattoos */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prompts.map((p, idx) => (
            <div
              key={p.matchup_id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col items-center shadow-xl space-y-2"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Tattoo #{idx + 1}: {p.celebrity_name || 'Celebrity'}
              </span>
              <ThroatTattooOverlay
                celebrityImageUrl={p.picture_url}
                celebrityName={p.celebrity_name}
                tattooImageUrl={p.submitted_drawing_url}
                throatBox={p.throat_box}
                className="max-h-56"
              />
              {p.submitted_title && (
                <span className="text-xs font-bold text-slate-300 italic">
                  "{p.submitted_title}"
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Clock className="w-4 h-4 animate-spin" />
          <span>{totalSubmitted} of {totalRequired} inking sessions submitted</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-2 sm:p-4 space-y-4 animate-fade-in">
      {/* Header & Prompt Steps Navigation */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                Celebrity Mode
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-bold text-slate-300">
                Prompt {activeStep + 1} of {totalPrompts}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white">
              Draw a Throat Tattoo for{' '}
              <span className="text-amber-300">
                {currentPrompt.celebrity_name || 'This Celebrity'}
              </span>
            </h1>
          </div>
        </div>

        {/* Step Indicator Badges */}
        <div className="flex items-center space-x-2">
          {prompts.map((p, idx) => {
            const isCompleted = p.has_submitted;
            const isCurrent = idx === activeStep;
            return (
              <div
                key={p.matchup_id}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : isCurrent
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-md'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span>#{idx + 1}</span>}
                <span>{p.celebrity_name || `Celeb ${idx + 1}`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Studio: Canvas + Live Throat Preview Side-by-Side */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left / Main: Drawing Studio */}
        <div className="lg:col-span-8 flex flex-col items-center space-y-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-2xl">
          {/* Drawing Canvas */}
          <DrawingCanvas
            strokes={strokes}
            onStartStroke={startStroke}
            onAppendPoint={appendPoint}
            onEndStroke={handleEndStrokeWithPreview}
            onStageReady={(stage) => {
              stageRef.current = stage;
            }}
          />

          {/* Canvas Toolbar */}
          <Toolbar
            tool={tool}
            onSelectTool={setTool}
            color={color}
            onSelectColor={setColor}
            size={size}
            onSelectSize={setSize}
            onUndo={undo}
            onRedo={redo}
            onOpenClearModal={() => setIsClearModalOpen(true)}
            canUndo={canUndo}
            canRedo={canRedo}
            disabled={isSubmitting}
          />
        </div>

        {/* Right: Live Celebrity Throat Preview */}
        <div className="lg:col-span-4 flex flex-col space-y-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-rose-400" />
              Live Throat Stretch
            </span>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
              Preview
            </span>
          </div>

          <ThroatTattooOverlay
            celebrityImageUrl={currentPrompt.picture_url}
            celebrityName={currentPrompt.celebrity_name}
            tattooImageUrl={previewTattooUrl}
            throatBox={currentPrompt.throat_box}
            showThroatTarget={!previewTattooUrl}
          />

          <p className="text-[11px] text-slate-400 text-center">
            {previewTattooUrl
              ? 'Your tattoo stretches automatically across the neck!'
              : 'Draw on the canvas to see your tattoo stretch on the throat!'}
          </p>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">
                Tattoo Name / Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
                placeholder="e.g. Flaming Throat Dragon"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || strokes.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95"
            >
              {isSubmitting ? (
                <span>Locking In Ink...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    Lock In Tattoo ({activeStep + 1}/{totalPrompts})
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Clear Modal */}
      <ClearModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => {
          clearCanvas();
          setPreviewTattooUrl(null);
          setIsClearModalOpen(false);
        }}
      />
    </div>
  );
}
