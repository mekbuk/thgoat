'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRoomSession } from '@/lib/hooks/useRoomSession';
import { GameHeader } from '@/components/shared/GameHeader';
import { LobbyView } from '@/components/lobby/LobbyView';
import { SubmissionPhase } from '@/components/game/SubmissionPhase';
import { VotingPhase } from '@/components/game/VotingPhase';
import { ResultsPhase } from '@/components/game/ResultsPhase';
import { FinalLeaderboard } from '@/components/leaderboard/FinalLeaderboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ToastError } from '@/components/shared/ToastError';
import { AdminModal } from '@/components/admin/AdminModal';
import { GamePhase } from '@/types/game';

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const {
    state,
    loading,
    error,
    sessionToken,
    refreshState,
    broadcastEvent,
    setError,
  } = useRoomSession(code);

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Listen for Ctrl+Alt+R keyboard shortcut for admin modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'r' || e.key === 'R' || e.code === 'KeyR')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[80vh]">
        <LoadingSpinner message="Connecting to room..." size="lg" />
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[80vh]">
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 max-w-md">
          <p className="font-bold mb-1">Room Error</p>
          <p className="text-xs text-rose-300">{error}</p>
        </div>
        <Link
          href="/"
          className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  if (!state) return null;

  const isHost = state.me?.is_host || false;

  // Actions
  const handleStartGame = async () => {
    if (!sessionToken) return;
    const res = await fetch(`/api/rooms/${code}/start`, {
      method: 'POST',
      headers: { 'x-session-token': sessionToken },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to start game');

    await broadcastEvent({
      type: 'room_phase_changed',
      payload: { phase: 'SUBMITTING', current_stage_number: 1 },
    });
    await refreshState();
  };

  const handleSubmitTitle = async (matchupId: string, title: string) => {
    if (!sessionToken || !state.current_stage) return;
    const res = await fetch(`/api/rooms/${code}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-token': sessionToken,
      },
      body: JSON.stringify({
        stage_id: state.current_stage.stage_id,
        matchup_id: matchupId,
        title,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit title');

    if (data.phase === 'VOTING') {
      await broadcastEvent({
        type: 'room_phase_changed',
        payload: { phase: 'VOTING', current_stage_number: state.current_stage_number },
      });
    }
    await refreshState();
  };

  const handleCastVote = async (matchupId: string, submissionId: string) => {
    if (!sessionToken || !state.current_stage) return;
    const res = await fetch(`/api/rooms/${code}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-token': sessionToken,
      },
      body: JSON.stringify({
        stage_id: state.current_stage.stage_id,
        matchup_id: matchupId,
        submission_id: submissionId,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit vote');

    if (data.is_revealed && data.result) {
      await broadcastEvent({
        type: 'matchup_revealed',
        payload: { matchup_id: matchupId, result: data.result },
      });
    }
    await refreshState();
  };

  const handleAdvanceMatchup = async () => {
    if (!sessionToken) return;
    const res = await fetch(`/api/rooms/${code}/advance-matchup`, {
      method: 'POST',
      headers: { 'x-session-token': sessionToken },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to advance matchup');

    if (data.phase === 'RESULTS') {
      await broadcastEvent({
        type: 'room_phase_changed',
        payload: { phase: 'RESULTS', current_stage_number: state.current_stage_number },
      });
    } else {
      await broadcastEvent({
        type: 'matchup_advanced',
        payload: {
          current_matchup_index: data.current_matchup_index,
          total_matchups: data.total_matchups,
        },
      });
    }
    await refreshState();
  };

  const handleAdvanceStage = async () => {
    if (!sessionToken) return;
    const res = await fetch(`/api/rooms/${code}/advance`, {
      method: 'POST',
      headers: { 'x-session-token': sessionToken },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to advance stage');

    await broadcastEvent({
      type: 'room_phase_changed',
      payload: { phase: data.phase, current_stage_number: data.stage_number || 2 },
    });
    await refreshState();
  };

  const handlePlayAgain = async () => {
    if (!sessionToken) return;
    const res = await fetch(`/api/rooms/${code}/reset`, {
      method: 'POST',
      headers: { 'x-session-token': sessionToken },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset game');

    await broadcastEvent({
      type: 'room_phase_changed',
      payload: { phase: 'LOBBY', current_stage_number: 1 },
    });
    await refreshState();
  };

  const handleAdminActionComplete = async (newPhase: GamePhase) => {
    await broadcastEvent({
      type: 'room_phase_changed',
      payload: {
        phase: newPhase,
        current_stage_number: newPhase === 'LOBBY' ? 1 : state.current_stage_number,
      },
    });
    await refreshState();
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-[90vh]">
      <GameHeader
        roomCode={state.room_code}
        phase={state.phase}
        currentStageNumber={state.current_stage_number}
        playerCount={state.players.length}
        myNickname={state.me?.nickname}
        isHost={isHost}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full">
        {state.phase === 'LOBBY' && (
          <LobbyView
            roomCode={state.room_code}
            players={state.players}
            isHost={isHost}
            myPlayerId={state.me?.id}
            onStartGame={handleStartGame}
          />
        )}

        {state.phase === 'SUBMITTING' && state.current_stage && (
          <SubmissionPhase
            stage={state.current_stage}
            prompts={state.my_prompts}
            hasSubmitted={state.me?.has_submitted || false}
            onSubmitTitle={handleSubmitTitle}
            totalSubmitted={state.players.reduce((acc, p) => acc + (p.is_connected ? 1 : 0), 0)}
            totalRequired={state.players.filter((p) => p.is_connected).length}
          />
        )}

        {state.phase === 'VOTING' && (
          <VotingPhase
            stage={state.current_stage}
            currentMatchup={state.current_matchup}
            isHost={isHost}
            onCastVote={handleCastVote}
            onAdvanceMatchup={handleAdvanceMatchup}
          />
        )}

        {state.phase === 'RESULTS' && (
          <ResultsPhase
            stageNumber={state.current_stage_number}
            matchupResults={state.stage_matchup_results}
            results={state.stage_results}
            players={state.players}
            isHost={isHost}
            onAdvanceStage={handleAdvanceStage}
          />
        )}

        {state.phase === 'FINISHED' && (
          <FinalLeaderboard
            leaderboard={state.final_leaderboard}
            isHost={isHost}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>

      {/* Admin Emergency Control Panel (Ctrl+Alt+R) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        roomCode={code}
        currentPhase={state.phase}
        onActionComplete={handleAdminActionComplete}
      />

      <ToastError message={error} onDismiss={() => setError(null)} />
    </div>
  );
}
