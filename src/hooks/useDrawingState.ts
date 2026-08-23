'use client';

import { useState, useCallback, useRef } from 'react';
import { DrawingStroke, DrawingTool } from '@/types/canvas';

export interface UseDrawingStateOptions {
  initialColor?: string;
  initialSize?: number;
}

export function useDrawingState(options: UseDrawingStateOptions = {}) {
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [tool, setTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState<string>(options.initialColor || '#111827');
  const [size, setSize] = useState<number>(options.initialSize || 6);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Undo / Redo history stacks
  const undoStackRef = useRef<DrawingStroke[][]>([]);
  const redoStackRef = useRef<DrawingStroke[][]>([]);

  const startStroke = useCallback(
    (x: number, y: number) => {
      // Push current strokes snapshot to undo stack
      undoStackRef.current.push([...strokes]);
      // Clear redo stack on new action
      redoStackRef.current = [];

      const newStroke: DrawingStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        tool,
        color,
        size,
        points: [x, y],
      };

      setStrokes((prev) => [...prev, newStroke]);
      setIsDrawing(true);
    },
    [strokes, tool, color, size]
  );

  const appendPoint = useCallback(
    (x: number, y: number) => {
      if (!isDrawing) return;

      setStrokes((prevStrokes) => {
        if (prevStrokes.length === 0) return prevStrokes;
        const lastStroke = prevStrokes[prevStrokes.length - 1];
        const lastPoints = lastStroke.points;

        // Skip if identical to last point (micro-movements)
        const lastX = lastPoints[lastPoints.length - 2];
        const lastY = lastPoints[lastPoints.length - 1];
        if (lastX === x && lastY === y) return prevStrokes;

        const updatedStroke: DrawingStroke = {
          ...lastStroke,
          points: [...lastPoints, x, y],
        };

        return [...prevStrokes.slice(0, -1), updatedStroke];
      });
    },
    [isDrawing]
  );

  const endStroke = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0 && strokes.length === 0) return;

    if (undoStackRef.current.length > 0) {
      const previousState = undoStackRef.current.pop()!;
      redoStackRef.current.push([...strokes]);
      setStrokes(previousState);
    } else {
      // Only 1 stroke left
      redoStackRef.current.push([...strokes]);
      setStrokes([]);
    }
  }, [strokes]);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;

    const nextState = redoStackRef.current.pop()!;
    undoStackRef.current.push([...strokes]);
    setStrokes(nextState);
  }, [strokes]);

  const clearCanvas = useCallback(() => {
    if (strokes.length === 0) return;
    undoStackRef.current.push([...strokes]);
    redoStackRef.current = [];
    setStrokes([]);
  }, [strokes]);

  const canUndo = undoStackRef.current.length > 0 || strokes.length > 0;
  const canRedo = redoStackRef.current.length > 0;
  const strokeCount = strokes.length;

  return {
    strokes,
    setStrokes,
    tool,
    setTool,
    color,
    setColor,
    size,
    setSize,
    isDrawing,
    startStroke,
    appendPoint,
    endStroke,
    undo,
    redo,
    clearCanvas,
    canUndo,
    canRedo,
    strokeCount,
  };
}
