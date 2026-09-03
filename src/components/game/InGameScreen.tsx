'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { GamePhase, PlayerSummary, CurrentPlayer, CurrentMatchupInfo } from '@/types/game';
import { GameMascot, getMascotForPlayer } from './GameMascot';
import { Check, X, Shield, Crown, Sparkles, Users } from 'lucide-react';

interface InGameScreenProps {
  roomCode: string;
  phase: GamePhase;
  currentStageNumber: number;
  players: PlayerSummary[];
  me: CurrentPlayer | null;
  isHost: boolean;
  currentMatchup?: CurrentMatchupInfo | null;
  onOpenAdmin?: () => void;
  children: React.ReactNode;
}

export function InGameScreen({
  roomCode,
  phase,
  currentStageNumber,
  players,
  me,
  isHost,
  currentMatchup,
  onOpenAdmin,
  children,
}: InGameScreenProps) {
  // Timer countdown state
  const [timeLeft, setTimeLeft] = useState<number>(53);
  const [isRoomInfoOpen, setIsRoomInfoOpen] = useState(false);
  const [mobileRosterOpen, setMobileRosterOpen] = useState(false);

  // Select round image based on current stage number (defaulting to round1 for 1, round2 for 2, round3 for 3)
  const roundImgSrc =
    currentStageNumber === 2
      ? '/round2.png'
      : currentStageNumber >= 3
      ? '/round3.png'
      : '/round1.png';

  // Reset or restart timer on matchup or phase change
  useEffect(() => {
    // Start countdown at 53 seconds (matching the reference image 53)
    setTimeLeft(53);
  }, [currentMatchup?.matchup_id, phase, currentStageNumber]);

  // Tick down timer every second
  useEffect(() => {
    if (currentMatchup?.is_revealed || phase === 'RESULTS' || phase === 'FINISHED') {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentMatchup?.is_revealed, phase]);

  // Determine top center squiggly banner text
  const getBannerText = () => {
    switch (phase) {
      case 'VOTING':
        return 'vote for one';
      case 'SUBMITTING':
        return 'write your funniest title';
      case 'RESULTS':
        return 'round standings';
      case 'FINISHED':
        return 'final champion';
      default:
        return 'throat goat';
    }
  };

  // Determine right script title
  const getScriptTitle = () => {
    switch (phase) {
      case 'VOTING':
        return 'Voting';
      case 'SUBMITTING':
        return 'Writing';
      case 'RESULTS':
        return 'Results';
      case 'FINISHED':
        return 'Champions';
      default:
        return 'Game';
    }
  };

  // Compute vote/submission tally for the bottom-right counter
  const getTallyText = () => {
    if (phase === 'VOTING' && currentMatchup) {
      return `${currentMatchup.total_voted} of ${currentMatchup.total_eligible_voters || players.length}`;
    }
    if (phase === 'SUBMITTING') {
      const readyCount = players.filter((p) => p.has_submitted).length;
      return `${readyCount} of ${players.length}`;
    }
    return `${players.length} players`;
  };

  // Check if a player has completed their action in current phase
  const isPlayerActionDone = (player: PlayerSummary) => {
    if (phase === 'VOTING') {
      if (player.is_author_in_matchup) return true; // Author is spectating
      return !!player.has_voted;
    }
    if (phase === 'SUBMITTING') {
      return !!player.has_submitted;
    }
    return true;
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#160624] text-white flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Atmosphere Vignette Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_45%,_rgba(65,16,84,0.45)_0%,_rgba(27,8,38,0.85)_60%,_rgba(10,2,15,0.98)_100%)]" />

      {/* Decorative ambient background lighting */}
      <div className="fixed top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/20 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-900/20 blur-[130px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP-LEFT: ROUND ASSET & COUNTDOWN TIMER BADGE                          */}
      {/* ========================================================================= */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-6 z-30 flex flex-col items-start space-y-1 sm:space-y-2 pointer-events-auto select-none">
        {/* Round Image Asset from reference folder */}
        <div className="relative w-28 sm:w-44 md:w-52 lg:w-56 h-12 sm:h-20 md:h-24 -rotate-3 transition-transform hover:scale-105 duration-300 drop-shadow-[0_10px_16px_rgba(0,0,0,0.7)]">
          <Image
            src={roundImgSrc}
            alt={`Round #${currentStageNumber}`}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Jackbox-style Dark Blob Timer Badge */}
        <div className="relative group">
          <div className="px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-[22px] sm:rounded-[26px] bg-[#0c142b]/95 border-2 border-[#1e294b] shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-center space-x-1.5 backdrop-blur-md transition-all group-hover:border-amber-400/60">
            <span
              className={`text-2xl sm:text-3xl md:text-4xl font-black font-mono tracking-wider transition-colors ${
                timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-[#f59e0b]'
              }`}
            >
              {timeLeft}
            </span>
          </div>
          {/* Subtle timer glow */}
          <div
            className={`absolute -inset-1 rounded-[28px] blur-md -z-10 transition-opacity ${
              timeLeft <= 10 ? 'bg-rose-500/40 opacity-100' : 'bg-amber-500/20 opacity-0 group-hover:opacity-100'
            }`}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP-CENTER: MENU BUTTON & SQUIGGLY PHASE BANNER (~ vote for one ~)     */}
      {/* ========================================================================= */}
      <div className="absolute top-2.5 sm:top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto select-none">
        {/* Little circular menu / close / info button matching reference */}
        <button
          type="button"
          onClick={() => setIsRoomInfoOpen(true)}
          title="Room Details & Options"
          aria-label="Room details"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-slate-500 text-slate-400 hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg mb-1 sm:mb-1.5"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
        </button>

        {/* Squiggly Phase Header (~ vote for one ~) */}
        <div className="flex items-center space-x-2 sm:space-x-3 px-3 py-1">
          {/* Left squiggly wavy SVG */}
          <svg
            className="w-6 sm:w-9 h-3 sm:h-4 text-[#2ed573]"
            viewBox="0 0 36 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          >
            <path d="M 2,6 C 6,0 12,0 16,6 C 20,12 26,12 30,6 C 32,3 34,3 35,6" />
          </svg>

          <h1 className="text-base sm:text-xl md:text-2xl font-black font-comic tracking-wide text-[#2ed573] lowercase drop-shadow-[0_2px_8px_rgba(46,213,115,0.4)]">
            {getBannerText()}
          </h1>

          {/* Right squiggly wavy SVG */}
          <svg
            className="w-6 sm:w-9 h-3 sm:h-4 text-[#2ed573]"
            viewBox="0 0 36 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          >
            <path d="M 2,6 C 6,0 12,0 16,6 C 20,12 26,12 30,6 C 32,3 34,3 35,6" />
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RIGHT SIDE: SCRIPT TITLE ("Voting") & PLAYER CHECKLIST COLUMN          */}
      {/* ========================================================================= */}
      {/* Desktop Column: lg and up */}
      <aside className="hidden lg:flex flex-col items-end absolute top-5 right-6 z-30 pointer-events-auto select-none max-w-[240px]">
        {/* Script phase header (e.g. "Voting" in green cursive) */}
        <div className="mb-2 mr-2">
          <span className="font-comic italic font-black text-3xl xl:text-4xl text-[#2ed573] -rotate-6 block drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] tracking-tight">
            {getScriptTitle()}
          </span>
        </div>

        {/* Current user badge (if present, shown at top of player column) */}
        {me && (
          <div className="w-full mb-3 flex items-center justify-end">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg text-xs font-bold text-slate-200">
              <div className="w-6 h-6 rounded-full ring-2 ring-emerald-400 overflow-hidden flex items-center justify-center bg-slate-800">
                <GameMascot type={getMascotForPlayer(me.id || me.nickname)} className="w-5 h-5" />
              </div>
              <span className="truncate max-w-[120px] font-comic font-bold text-white">
                {me.nickname} {isHost && '👑'}
              </span>
            </div>
          </div>
        )}

        {/* Player Roster Cards (angled dark pills with checkmark or dots + mascot) */}
        <div className="flex flex-col space-y-2 w-full">
          {players.map((player, idx) => {
            const isDone = isPlayerActionDone(player);
            const isMe = me?.id === player.id;
            const mascot = getMascotForPlayer(player.id || player.nickname);

            return (
              <div
                key={player.id || idx}
                className={`relative flex items-center justify-between px-3 py-1.5 rounded-2xl transition-all duration-300 shadow-md ${
                  isMe
                    ? 'bg-[#1e1438]/95 border border-purple-500/50 shadow-purple-900/30'
                    : 'bg-[#120b24]/90 border border-slate-800/80 hover:border-slate-700'
                } -rotate-1 hover:rotate-0`}
              >
                {/* Left: Status Icon & Nickname */}
                <div className="flex items-center space-x-2 truncate mr-2">
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-0.5 text-amber-400 font-black text-xs tracking-tighter shrink-0 animate-pulse px-1">
                      <span>•</span>
                      <span>•</span>
                      <span>•</span>
                    </div>
                  )}

                  <span
                    className={`font-comic font-bold text-xs sm:text-sm tracking-wide truncate ${
                      isDone ? 'text-slate-200' : 'text-slate-400'
                    }`}
                  >
                    {player.nickname}
                  </span>
                </div>

                {/* Right: Doodle Mascot Avatar */}
                <div className="w-7 h-7 rounded-full bg-slate-950/60 p-0.5 border border-slate-800 shrink-0 flex items-center justify-center">
                  <GameMascot type={mascot} className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Mobile/Tablet Player Drawer Toggle Button */}
      <div className="lg:hidden absolute top-3 right-3 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={() => setMobileRosterOpen(!mobileRosterOpen)}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/85 border border-slate-700 text-xs font-bold text-slate-300 shadow-lg backdrop-blur-md"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>{players.filter((p) => isPlayerActionDone(p)).length}/{players.length}</span>
        </button>

        {/* Mobile Dropdown Roster */}
        {mobileRosterOpen && (
          <div className="absolute right-0 top-10 w-52 p-3 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl space-y-1.5 z-40 backdrop-blur-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Room Players</span>
              <span className="text-emerald-400 font-comic italic font-bold">{getScriptTitle()}</span>
            </div>
            {players.map((p, idx) => (
              <div
                key={p.id || idx}
                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  {isPlayerActionDone(p) ? (
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  ) : (
                    <span className="text-amber-400 text-xs font-black animate-pulse">•••</span>
                  )}
                  <span className="truncate font-comic font-bold text-slate-200">{p.nickname}</span>
                </div>
                <GameMascot type={getMascotForPlayer(p.id || p.nickname)} className="w-5 h-5" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. CENTER STAGE: MAIN GAMEPLAY CONTENT                                     */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-2 sm:px-6 pt-24 sm:pt-28 pb-20 sm:pb-24 max-w-7xl mx-auto">
        {children}
      </main>

      {/* ========================================================================= */}
      {/* 5. BOTTOM-RIGHT: ROOM CODE, BRAND & VOTE COUNTER                          */}
      {/* ========================================================================= */}
      <footer className="absolute bottom-3 right-3 sm:bottom-5 sm:right-6 z-30 pointer-events-auto select-none flex flex-col items-end space-y-1 text-right">
        {/* Audience / Voter count pill (like reference 12 ... 32) */}
        <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="text-amber-400 font-black">•••</span>
          <span className="text-slate-300 font-bold">{getTallyText()}</span>
        </div>

        {/* Website / Brand Text (JACKBOX.TV style) */}
        <div className="text-[11px] sm:text-xs font-black tracking-widest text-slate-300/90 font-mono uppercase drop-shadow-md">
          THROATGOAT.FUN
        </div>

        {/* Large Room Code (AKHZ style) */}
        <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-widest font-mono text-[#f59e0b] drop-shadow-[0_4px_14px_rgba(245,158,11,0.5)] transition-transform hover:scale-105">
          {roomCode}
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 6. ROOM INFO & ADMIN MODAL (TRIGGERED VIA TOP-CENTER (X) BUTTON)           */}
      {/* ========================================================================= */}
      {isRoomInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg text-white">Room Information</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRoomInfoOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Room Code</span>
                <span className="font-mono font-black text-amber-400 text-lg">{roomCode}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Current Stage</span>
                <span className="font-bold text-white">Stage {currentStageNumber} of 3</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Players Connected</span>
                <span className="font-bold text-emerald-400">{players.length} Players</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRoomInfoOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 border border-slate-700 transition-all"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Admin Controls (Ctrl+Alt+R)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsRoomInfoOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
              >
                Back to Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
