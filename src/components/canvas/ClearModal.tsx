'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ClearModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ClearModal: React.FC<ClearModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm p-6 bg-slate-900 border-2 border-pink-500/50 rounded-3xl shadow-2xl text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white tracking-wide">
          Clear Entire Canvas?
        </h3>

        <p className="text-sm text-slate-300">
          Are you sure you want to wipe your glorious masterpiece? This will erase all strokes on screen!
        </p>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold hover:from-red-500 hover:to-pink-500 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Wipe It
          </button>
        </div>
      </div>
    </div>
  );
};
