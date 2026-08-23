'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ToastErrorProps {
  message: string | null;
  onDismiss?: () => void;
}

export function ToastError({ message, onDismiss }: ToastErrorProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up rounded-xl border border-rose-500/30 bg-rose-950/90 p-4 text-rose-200 shadow-2xl backdrop-blur-md">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400 mt-0.5" />
        <div className="flex-1 text-sm font-medium">{message}</div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded p-1 text-rose-400 hover:bg-rose-900/50 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
