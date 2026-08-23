'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Users, Play, LogIn, Flame, Trophy } from 'lucide-react';
import { ToastError } from '@/components/shared/ToastError';

export default function LandingPage() {
  const router = useRouter();

  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [hostNickname, setHostNickname] = useState('');
  const [joinNickname, setJoinNickname] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostNickname.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: hostNickname.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      // Store player session in sessionStorage
      sessionStorage.setItem(`tg_session_${data.room_code}`, data.session_token);
      sessionStorage.setItem(`tg_player_id_${data.room_code}`, data.player_id);

      router.push(`/room/${data.room_code}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinNickname.trim() || !joinRoomCode.trim() || loading) return;

    setLoading(true);
    setError(null);

    const cleanCode = joinRoomCode.trim().toUpperCase();

    try {
      const res = await fetch(`/api/rooms/${cleanCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: joinNickname.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join room');
      }

      // Store player session in sessionStorage
      sessionStorage.setItem(`tg_session_${cleanCode}`, data.session_token);
      sessionStorage.setItem(`tg_player_id_${cleanCode}`, data.player_id);

      router.push(`/room/${cleanCode}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full min-h-[85vh]">
      {/* Hero Header */}
      <div className="text-center space-y-4 my-6 animate-fade-in">
        <div className="inline-flex items-center space-x-2 rounded-full bg-rose-500/10 border border-rose-500/30 px-4 py-1.5 text-xs sm:text-sm font-bold text-rose-400">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>MULTIPLAYER TATTOO TITLE CONTEST</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 font-comic tracking-tight drop-shadow-lg">
          THROAT GOAT
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto">
          Look at the world&apos;s most questionable tattoos. Create the funniest title. Vote on your friends&apos; submissions and claim the crown!
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl my-4">
        {/* Host Card */}
        <div className="flex flex-col justify-between p-6 rounded-3xl border-2 border-rose-500/30 bg-slate-900/90 shadow-2xl hover:border-rose-500/60 transition-all hover:scale-[1.02]">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-xl font-black text-white">Host a Game</h3>
            <p className="text-xs text-slate-400">
              Create a room, get a 4-letter room code, and invite 3–8 friends.
            </p>
          </div>
          <button
            onClick={() => {
              setIsHostModalOpen(true);
              setIsJoinModalOpen(false);
            }}
            className="mt-6 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Room</span>
          </button>
        </div>

        {/* Join Card */}
        <div className="flex flex-col justify-between p-6 rounded-3xl border-2 border-amber-500/30 bg-slate-900/90 shadow-2xl hover:border-amber-500/60 transition-all hover:scale-[1.02]">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">Join Room</h3>
            <p className="text-xs text-slate-400">
              Enter your friend&apos;s 4-character room code and jump into the lobby.
            </p>
          </div>
          <button
            onClick={() => {
              setIsJoinModalOpen(true);
              setIsHostModalOpen(false);
            }}
            className="mt-6 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Enter Room Code</span>
          </button>
        </div>
      </div>

      {/* Host Modal */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border-2 border-rose-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-xl font-black text-white">Host a New Game</h3>
              <button
                onClick={() => setIsHostModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Your Nickname</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="e.g. Inkmaster99"
                  value={hostNickname}
                  onChange={(e) => setHostNickname(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                  autoFocus
                  required
                />
                <span className="text-[11px] text-slate-500">Max 16 characters</span>
              </div>

              <button
                type="submit"
                disabled={loading || !hostNickname.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Generating Room...' : 'Enter Lobby as Host'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border-2 border-amber-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-xl font-black text-white">Join Game Room</h3>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Room Code (4 Letters)</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. TG88"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-lg font-mono text-amber-300 text-center tracking-widest uppercase focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-black"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Your Nickname</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="e.g. GoatVoter"
                  value={joinNickname}
                  onChange={(e) => setJoinNickname(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !joinRoomCode.trim() || !joinNickname.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Joining Room...' : 'Join Game Lobby'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Error Toast */}
      <ToastError message={error} onDismiss={() => setError(null)} />
    </div>
  );
}
