'use client';

import { useState, useCallback } from 'react';
import type Konva from 'konva';
import { exportStageToImage, getOrCreateGuestId } from '@/lib/canvas/export-utils';
import { DrawingPublicDto } from '@/types/drawing';

export interface UseSubmitDrawingOptions {
  onSuccess?: (drawing: DrawingPublicDto) => void;
  onError?: (error: string) => void;
}

export function useSubmitDrawing(options: UseSubmitDrawingOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedDrawing, setSubmittedDrawing] = useState<DrawingPublicDto | null>(null);

  const submitDrawing = useCallback(
    async (stage: Konva.Stage | null, strokeCount: number, title?: string) => {
      if (!stage) {
        setError('Canvas stage is not ready.');
        return null;
      }

      if (strokeCount === 0) {
        setError('Please draw something before submitting!');
        return null;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const exported = await exportStageToImage(stage, 'image/webp', 0.92);
        const creatorId = getOrCreateGuestId();

        const response = await fetch('/api/drawings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: exported.dataUrl,
            format: exported.format,
            width: exported.width,
            height: exported.height,
            strokeCount,
            title: title || 'Untitled Throat Goat',
            creatorId,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorMessage =
            data?.error?.message || `Submission failed with status ${response.status}`;
          throw new Error(errorMessage);
        }

        const drawing: DrawingPublicDto = data.drawing;
        setSubmittedDrawing(drawing);

        if (options.onSuccess) {
          options.onSuccess(drawing);
        }

        return drawing;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMsg);
        if (options.onError) {
          options.onError(errorMsg);
        }
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [options]
  );

  const resetSubmission = useCallback(() => {
    setSubmittedDrawing(null);
    setError(null);
  }, []);

  return {
    isSubmitting,
    error,
    submittedDrawing,
    submitDrawing,
    resetSubmission,
  };
}
