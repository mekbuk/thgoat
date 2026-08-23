'use client';

import React from 'react';
import { Pen, Eraser, Undo2, Redo2, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { DrawingTool } from '@/types/canvas';
import { ColorPalette } from './ColorPalette';
import { SizeSelector } from './SizeSelector';

interface ToolbarProps {
  tool: DrawingTool;
  onSelectTool: (tool: DrawingTool) => void;
  color: string;
  onSelectColor: (color: string) => void;
  size: number;
  onSelectSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenClearModal: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  onSelectTool,
  color,
  onSelectColor,
  size,
  onSelectSize,
  onUndo,
  onRedo,
  onOpenClearModal,
  canUndo,
  canRedo,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full max-w-4xl mx-auto px-2 py-3">
      {/* Primary Tool Modes & Action Buttons */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg">
        {/* Pen Tool */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectTool('pen')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all',
            tool === 'pen'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title="Pen Tool"
        >
          <Pen className="w-4 h-4" />
          <span className="hidden sm:inline">Pen</span>
        </button>

        {/* Eraser Tool */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectTool('eraser')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all',
            tool === 'eraser'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title="Eraser Tool"
        >
          <Eraser className="w-4 h-4" />
          <span className="hidden sm:inline">Eraser</span>
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1" />

        {/* Undo Button */}
        <button
          type="button"
          disabled={!canUndo || disabled}
          onClick={onUndo}
          className={clsx(
            'p-2 rounded-xl transition-all',
            canUndo && !disabled
              ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
              : 'text-slate-600 cursor-not-allowed'
          )}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-5 h-5" />
        </button>

        {/* Redo Button */}
        <button
          type="button"
          disabled={!canRedo || disabled}
          onClick={onRedo}
          className={clsx(
            'p-2 rounded-xl transition-all',
            canRedo && !disabled
              ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
              : 'text-slate-600 cursor-not-allowed'
          )}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-5 h-5" />
        </button>

        {/* Clear Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={onOpenClearModal}
          className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 active:scale-95 transition-all"
          title="Clear Canvas"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Color Palette (Visible when in Pen mode) */}
      <ColorPalette
        selectedColor={color}
        onSelectColor={(c) => {
          onSelectColor(c);
          if (tool !== 'pen') {
            onSelectTool('pen');
          }
        }}
        disabled={disabled}
      />

      {/* Brush Size Selector */}
      <SizeSelector currentSize={size} onSelectSize={onSelectSize} disabled={disabled} />
    </div>
  );
};
