'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type Konva from 'konva';
import { DrawingStroke } from '@/types/canvas';

// Dynamically import KonvaStage with SSR disabled
const KonvaStage = dynamic(
  () => import('./KonvaStage').then((mod) => mod.KonvaStage),
  {
    ssr: false,
    loading: () => (
      <div className="w-[600px] h-[500px] max-w-full max-h-[70vh] bg-slate-900/60 rounded-2xl border-4 border-slate-800 flex items-center justify-center text-slate-400 font-medium animate-pulse">
        <span className="flex items-center gap-2 text-pink-400 font-bold">
          🎨 Loading Drawing Studio...
        </span>
      </div>
    ),
  }
);

export interface DrawingCanvasProps {
  strokes: DrawingStroke[];
  onStartStroke: (x: number, y: number) => void;
  onAppendPoint: (x: number, y: number) => void;
  onEndStroke: () => void;
  onStageReady?: (stage: Konva.Stage | null) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  strokes,
  onStartStroke,
  onAppendPoint,
  onEndStroke,
  onStageReady,
}) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 680,
    height: 520,
  });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const maxWidth = Math.min(window.innerWidth - 32, 720);
        const calcWidth = Math.max(320, maxWidth);
        // Maintain roughly 4:3 or responsive aspect ratio
        const calcHeight = Math.min(Math.round(calcWidth * 0.75), window.innerHeight - 300);
        setDimensions({
          width: calcWidth,
          height: Math.max(340, calcHeight),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (onStageReady) {
      onStageReady(stageRef.current);
    }
  });

  return (
    <div ref={containerRef} className="flex justify-center items-center w-full max-w-4xl mx-auto px-2">
      <KonvaStage
        ref={(stage) => {
          stageRef.current = stage;
          if (onStageReady) {
            onStageReady(stage);
          }
        }}
        width={dimensions.width}
        height={dimensions.height}
        strokes={strokes}
        onStartStroke={onStartStroke}
        onAppendPoint={onAppendPoint}
        onEndStroke={onEndStroke}
      />
    </div>
  );
};
