'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RoomState, RealtimeEventPayload } from '@/types/game';
import { createRoomChannel, broadcastRoomEvent } from '@/lib/supabase/realtime';

export function useRoomSession(roomCode: string) {
  const code = roomCode.toUpperCase();
  const [state, setState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionTokenRef = useRef<string | null>(null);

  // Fetch complete authoritative room state from server
  const fetchRoomState = useCallback(async () => {
    const token =
      sessionTokenRef.current ||
      sessionStorage.getItem(`tg_session_${code}`);

    if (!token) {
      setError('No session found. Please join from the home page.');
      setLoading(false);
      return;
    }

    sessionTokenRef.current = token;

    try {
      const res = await fetch(`/api/rooms/${code}/state`, {
        headers: { 'x-session-token': token },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch room state');
      }

      setState(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchRoomState();

    // Subscribe to Realtime room events
    const channel = createRoomChannel(code, (event: RealtimeEventPayload) => {
      console.log('⚡ Realtime event received:', event);

      // Re-fetch authoritative state upon phase/state-changing events
      fetchRoomState();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [code, fetchRoomState]);

  const broadcastEvent = async (event: RealtimeEventPayload) => {
    try {
      await broadcastRoomEvent(code, event);
    } catch (err) {
      console.error('Failed to broadcast room event:', err);
    }
  };

  return {
    state,
    loading,
    error,
    sessionToken: sessionTokenRef.current,
    refreshState: fetchRoomState,
    broadcastEvent,
    setError,
  };
}
