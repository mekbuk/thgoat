'use client';

import React, { useState, useRef } from 'react';
import type Konva from 'konva';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useDrawingState } from '@/hooks/useDrawingState';
import { useSubmitDrawing } from '@/hooks/useSubmitDrawing';
import { DrawingCanvas } from '@/components/canvas/DrawingCanvas';
import { Toolbar } from '@/components/canvas/Toolbar';
import { ClearModal } from '@/components/canvas/ClearModal';
import { SubmitButton } from '@/components/submission/SubmitButton';
import { SuccessModal } from '@/components/submission/SuccessModal';

export default function DrawingStudioPage() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const {
    strokes,
    tool,
    setTool,
    color,
    setColor,
    size,
    setSize,
    startStroke,
    appendPoint,
    endStroke,
    undo,
    redo,
    clearCanvas,
    canUndo,
    canRedo,
    strokeCount,
  } = useDrawingState();

  const {
    isSubmitting,
    error: submitError,
    submittedDrawing,
    submitDrawing,
    resetSubmission,
  } = useSubmitDrawing();

  const handleSubmit = async () => {
    await submitDrawing(stageRef.current, strokeCount, 'Untitled Throat Goat');
  };

  const handleConfirmClear = () => {
    clearCanvas();
    setIsClearModalOpen(false);
  };

  const handleDrawAnother = () => {
    clearCanvas();
    resetSubmission();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between py-4 px-2 sm:px-4 max-w-6xl mx-auto w-full">
      {/* Studio Header Banner */}
      <div className="text-center space-y-1 my-2">
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-yellow-400 font-comic tracking-tight">
          Draw Your Ultimate Meme Goat 🐐
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Pick your brush, unleash your creativity, and publish directly to the meme gallery.
        </p>
      </div>

      {/* Non-destructive Error Banner */}
      {submitError && (
        <div className="w-full max-w-2xl mb-3 p-3 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200 text-sm shadow-lg animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Submission Error</p>
            <p className="text-xs text-red-300">{submitError}</p>
          </div>
        </div>
      )}

      {/* Centered Drawing Canvas */}
      <div className="w-full flex-1 flex items-center justify-center my-2">
        <DrawingCanvas
          strokes={strokes}
          onStartStroke={startStroke}
          onAppendPoint={appendPoint}
          onEndStroke={endStroke}
          onStageReady={(stage) => {
            stageRef.current = stage;
          }}
        />
      </div>

      {/* Toolbar Controls */}
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

      {/* Submit Action Area */}
      <div className="mt-3 flex items-center justify-center">
        <SubmitButton
          onClick={handleSubmit}
          isLoading={isSubmitting}
          strokeCount={strokeCount}
          disabled={isSubmitting}
        />
      </div>

      {/* Safeguarded Clear Modal */}
      <ClearModal
        isOpen={isClearModalOpen}
        onConfirm={handleConfirmClear}
        onCancel={() => setIsClearModalOpen(false)}
      />

      {/* Submission Success Modal */}
      <SuccessModal
        drawing={submittedDrawing}
        isOpen={!!submittedDrawing}
        onDrawAnother={handleDrawAnother}
      />
    </div>
  );
}
