'use client';

import React from 'react';
import { Crown, User, CheckCircle2 } from 'lucide-react';
import { PlayerSummary } from '@/types/game';

interface PlayerListProps {
  players: PlayerSummary[];
  myPlayerId?: string;
  minPlayers?: number;
  maxPlayers?: number;
}

export function PlayerList({
  players,
  myPlayerId,
  minPlayers = 3,
  maxPlayers = 8,
}: PlayerListProps) {
  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-rose-400" />
          <h3 className="font-bold text-slate-200">
            Players in Lobby ({players.length}/{maxPlayers})
          </h3>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            players.length >= minPlayers
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}
        >
          {players.length >= minPlayers
            ? 'Ready to Start'
            : `Need ${minPlayers - players.length} more`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {players.map((player) => {
          const isMe = player.id === myPlayerId;
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isMe
                  ? 'bg-rose-950/40 border-rose-500/40 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    player.is_host
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {player.nickname.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col truncate">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="font-semibold text-sm text-slate-100 truncate">
                      {player.nickname}
                    </span>
                    {isMe && (
                      <span className="text-[10px] bg-rose-500/30 text-rose-300 px-1.5 py-0.2 rounded font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  {player.is_host && (
                    <span className="text-[11px] text-amber-400 font-medium flex items-center space-x-0.5">
                      <Crown className="w-3 h-3 inline" />
                      <span>Host</span>
                    </span>
                  )}
                </div>
              </div>

              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
