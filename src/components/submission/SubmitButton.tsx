'use client';

import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  strokeCount: number;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  onClick,
  isLoading,
  disabled = false,
  strokeCount,
}) => {
  const isDisabled = disabled || isLoading || strokeCount === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        'relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all transform',
        isDisabled
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          : 'bg-gradient-to-r from-pink-500 via-rose-500 to-yellow-400 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 border border-pink-400/30'
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Submitting...</span>
        </>
      ) : (
        <>
          <Send className="w-5 h-5" />
          <span>Publish Goat ({strokeCount})</span>
        </>
      )}
    </button>
  );
};
