'use client';

import React, { forwardRef, useCallback } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import type Konva from 'konva';
import { DrawingStroke } from '@/types/canvas';

export interface KonvaStageProps {
  width: number;
  height: number;
  strokes: DrawingStroke[];
  onStartStroke: (x: number, y: number) => void;
  onAppendPoint: (x: number, y: number) => void;
  onEndStroke: () => void;
}

export const KonvaStage = forwardRef<Konva.Stage, KonvaStageProps>(
  ({ width, height, strokes, onStartStroke, onAppendPoint, onEndStroke }, ref) => {
    const handlePointerDown = useCallback(
      (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (pos) {
          onStartStroke(pos.x, pos.y);
        }
      },
      [onStartStroke]
    );

    const handlePointerMove = useCallback(
      (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (pos) {
          onAppendPoint(pos.x, pos.y);
        }
      },
      [onAppendPoint]
    );

    const handlePointerUp = useCallback(() => {
      onEndStroke();
    }, [onEndStroke]);

    return (
      <div className="relative touch-none select-none rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-white">
        <Stage
          ref={ref}
          width={width}
          height={height}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="cursor-crosshair"
        >
          {/* Background Layer with explicit white rect */}
          <Layer id="background-layer">
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="#FFFFFF"
              listening={false}
            />
          </Layer>

          {/* Drawing Strokes Layer */}
          <Layer id="drawing-layer">
            {strokes.map((stroke) => (
              <Line
                key={stroke.id}
                points={stroke.points}
                stroke={stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color}
                strokeWidth={stroke.size}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
    );
  }
);

KonvaStage.displayName = 'KonvaStage';
