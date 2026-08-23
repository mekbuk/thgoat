'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Play, RotateCcw, FastForward, KeyRound, X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { GamePhase } from '@/types/game';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  currentPhase: GamePhase;
  onActionComplete: (newPhase: GamePhase) => Promise<void>;
}

export function AdminModal({
  isOpen,
  onClose,
  roomCode,
  currentPhase,
  onActionComplete,
}: AdminModalProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Passw0rd_is_zer0') {
      setIsAuthenticated(true);
      setError(null);
      setSuccessMsg('Admin access granted.');
    } else {
      setError('Invalid admin password. Access denied.');
    }
  };

  const handleExecuteAction = async (action: 'force_start' | 'force_reset' | 'force_advance') => {
    setLoadingAction(action);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/rooms/${roomCode}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute admin action');
      }

      setSuccessMsg(
        action === 'force_start'
          ? 'Game force-started successfully!'
          : action === 'force_reset'
          ? 'Lobby restarted from a clean slate!'
          : 'Stage/Phase force-advanced!'
      );

      await onActionComplete(data.phase);
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border-2 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)] overflow-hidden">
        {/* Top Header Banner */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black tracking-wider text-white uppercase font-mono">
                  Admin Control Panel
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[10px] font-mono text-rose-300 border border-rose-500/30">
                  Ctrl+Alt+R
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Room: <span className="text-amber-400 font-bold">{roomCode}</span> • Phase:{' '}
                <span className="text-rose-400 font-bold">{currentPhase}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {!isAuthenticated ? (
            /* Password Authentication Screen */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5 text-center">
                <div className="inline-flex p-3 rounded-full bg-slate-800 border border-slate-700 text-amber-400 mb-1">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Authentication Required</h4>
                <p className="text-xs text-slate-400">
                  Enter the administrator secret password to access emergency controls.
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]"
              >
                Authenticate
              </button>
            </form>
          ) : (
            /* Admin Actions Menu */
            <div className="space-y-4">
              {successMsg && (
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                {/* 1. Force Start */}
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={() => handleExecuteAction('force_start')}
                  className="w-full text-left p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                      {loadingAction === 'force_start' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      ) : (
                        <Play className="w-4 h-4 fill-emerald-400 text-emerald-400 group-hover:scale-110 transition-transform" />
                      )}
                      <span>Force Start Game</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Emergency Start
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 pl-6">
                    Bypasses the 3-player requirement. Starts Stage 1 immediately under any circumstances (even 1 or 2 players).
                  </p>
                </button>

                {/* 2. Restart Game (Clean Slate) */}
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={() => handleExecuteAction('force_reset')}
                  className="w-full text-left p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                      {loadingAction === 'force_reset' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      ) : (
                        <RotateCcw className="w-4 h-4 text-amber-400 group-hover:-rotate-45 transition-transform" />
                      )}
                      <span>Restart Game (Clean Slate)</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Hard Reset
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 pl-6">
                    Wipes all stages, submissions, votes, and scores. Resets the lobby back to Phase 1 from a completely clean slate.
                  </p>
                </button>

                {/* 3. Force Advance */}
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={() => handleExecuteAction('force_advance')}
                  className="w-full text-left p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
                      {loadingAction === 'force_advance' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      ) : (
                        <FastForward className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                      )}
                      <span>Force Advance Phase</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Skip Phase
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 pl-6">
                    Forces the room to immediately advance to the next phase or stage if a player disconnects or gets stuck.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Press ESC or click outside to dismiss</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
