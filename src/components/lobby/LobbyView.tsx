'use client';

import React, { useState } from 'react';
import { Copy, Check, Play, Share2, Sparkles } from 'lucide-react';
import { PlayerList } from './PlayerList';
import { PlayerSummary } from '@/types/game';
import { MIN_PLAYERS, MAX_PLAYERS } from '@/lib/game/state-machine';

interface LobbyViewProps {
  roomCode: string;
  players: PlayerSummary[];
  isHost: boolean;
  myPlayerId?: string;
  onStartGame: () => Promise<void>;
}

export function LobbyView({
  roomCode,
  players,
  isHost,
  myPlayerId,
  onStartGame,
}: LobbyViewProps) {
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = players.length >= MIN_PLAYERS && players.length <= MAX_PLAYERS;

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code', err);
    }
  };

  const handleStart = async () => {
    if (!canStart || isStarting) return;
    setIsStarting(true);
    setError(null);
    try {
      await onStartGame();
    } catch (err: any) {
      setError(err?.message || 'Failed to start game');
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Title & Badge */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MULTIPLAYER LOBBY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Waiting for Players
        </h1>
        <p className="text-sm text-slate-400 max-w-md">
          Share your room code with friends. Once at least {MIN_PLAYERS} players join, the host can start the game!
        </p>
      </div>

      {/* Room Code Card */}
      <div className="w-full rounded-2xl border-2 border-dashed border-rose-500/40 bg-slate-900/90 p-6 flex flex-col items-center justify-center space-y-3 shadow-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          ROOM CODE
        </span>
        <div className="text-5xl sm:text-6xl font-black tracking-widest font-mono text-amber-300 drop-shadow-md">
          {roomCode}
        </div>
        <button
          onClick={copyRoomCode}
          className="flex items-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition-all hover:scale-105 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Code Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Copy Room Code</span>
            </>
          )}
        </button>
      </div>

      {/* Player Roster */}
      <PlayerList
        players={players}
        myPlayerId={myPlayerId}
        minPlayers={MIN_PLAYERS}
        maxPlayers={MAX_PLAYERS}
      />

      {/* Host Controls or Waiting State */}
      <div className="w-full pt-2">
        {isHost ? (
          <div className="space-y-3">
            <button
              onClick={handleStart}
              disabled={!canStart || isStarting}
              className={`w-full py-4 px-6 rounded-2xl font-black text-lg flex items-center justify-center space-x-2.5 shadow-xl transition-all ${
                canStart && !isStarting
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isStarting ? 'Starting Game...' : 'Start Game'}</span>
            </button>
            {!canStart && (
              <p className="text-center text-xs text-amber-400/90 font-medium">
                ⚠️ Need at least {MIN_PLAYERS} players to start (currently {players.length})
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-sm font-medium text-slate-400 animate-pulse">
              Waiting for the host to start the game...
            </p>
          </div>
        )}

        {error && (
          <p className="mt-3 text-center text-xs font-semibold text-rose-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
