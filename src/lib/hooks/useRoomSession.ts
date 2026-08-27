'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RoomState, RealtimeEventPayload } from '@/types/game';
import { createRoomChannel, broadcastRoomEvent, cleanupRoomChannel } from '@/lib/supabase/realtime';

export function useRoomSession(roomCode: string) {
  const code = roomCode.toUpperCase();
  const [state, setState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionTokenRef = useRef<string | null>(null);
  const stateRef = useRef<RoomState | null>(null);
  stateRef.current = state;

  const isFetchingRef = useRef(false);
  const pendingFetchRef = useRef(false);

  // Fetch complete authoritative room state from server
  const fetchRoomState = useCallback(async (showLoading = false) => {
    const token =
      sessionTokenRef.current ||
      sessionStorage.getItem(`tg_session_${code}`);

    if (!token) {
      setError('No session found. Please join from the home page.');
      setLoading(false);
      return;
    }

    sessionTokenRef.current = token;

    if (isFetchingRef.current) {
      // Mark that another fetch was requested while one was already in flight
      pendingFetchRef.current = true;
      return;
    }

    isFetchingRef.current = true;

    if (showLoading && !stateRef.current) {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/rooms/${code}/state`, {
        headers: { 'x-session-token': token },
        cache: 'no-store',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch room state');
      }

      setState(data);
      setError(null);
    } catch (err: any) {
      // If we already have state, avoid flashing error banner on brief network blips
      if (!stateRef.current) {
        setError(err?.message || 'Failed to sync room state');
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);

      // If a fetch was requested while this one was running, execute it now
      if (pendingFetchRef.current) {
        pendingFetchRef.current = false;
        fetchRoomState(false);
      }
    }
  }, [code]);

  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    fetchRoomState(true);

    // 1. Server-Sent Events (SSE) stream for instant real-time sync
    let eventSource: EventSource | null = null;
    let sseRetryTimeout: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      if (!isMounted) return;
      try {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        eventSource = new EventSource(`/api/rooms/${code}/events`);

        eventSource.onmessage = (_e) => {
          if (isMounted) {
            fetchRoomState(false);
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (isMounted) {
            // Reconnect with 2s backoff
            sseRetryTimeout = setTimeout(connectSSE, 2000);
          }
        };
      } catch (err) {
        console.error('SSE connection failed, relying on adaptive polling:', err);
      }
    };

    connectSSE();

    // 2. High-frequency polling (1.5s interval)
    // Ensures sync across all networks/devices without requiring page reloads
    const pollInterval = setInterval(() => {
      if (isMounted && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchRoomState(false);
      }
    }, 1500);

    // 3. Instant sync on tab visibility/focus
    const handleVisibilityChange = () => {
      if (isMounted && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchRoomState(false);
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // 4. Supabase Realtime channel subscription (parallel broadcast layer)
    try {
      createRoomChannel(code, (_event: RealtimeEventPayload) => {
        if (isMounted) {
          fetchRoomState(false);
        }
      });
    } catch (err) {
      console.warn('Supabase realtime subscription skipped:', err);
    }

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (sseRetryTimeout) clearTimeout(sseRetryTimeout);
      clearInterval(pollInterval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      cleanupRoomChannel(code);
    };
  }, [code, fetchRoomState]);

  const broadcastEvent = async (event: RealtimeEventPayload) => {
    try {
      await broadcastRoomEvent(code, event);
    } catch (err) {
      console.warn('Failed to broadcast room event:', err);
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
