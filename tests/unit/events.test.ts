import { describe, it, expect, vi } from 'vitest';
import { emitRoomEvent, subscribeToRoomEvents } from '@/lib/game/events';

describe('Room Real-Time Events Emitter', () => {
  it('subscribes and receives events for a room code', () => {
    const roomCode = 'TEST';
    const callback = vi.fn();

    const unsubscribe = subscribeToRoomEvents(roomCode, callback);

    emitRoomEvent(roomCode, {
      type: 'room_phase_changed',
      payload: { phase: 'VOTING', current_stage_number: 1 },
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      type: 'room_phase_changed',
      payload: { phase: 'VOTING', current_stage_number: 1 },
    });

    unsubscribe();

    emitRoomEvent(roomCode, {
      type: 'room_phase_changed',
      payload: { phase: 'RESULTS', current_stage_number: 1 },
    });

    // Should not be called after unsubscribing
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('isolates events between different room codes', () => {
    const roomA = 'ROMA';
    const roomB = 'ROMB';
    const callbackA = vi.fn();
    const callbackB = vi.fn();

    const unsubA = subscribeToRoomEvents(roomA, callbackA);
    const unsubB = subscribeToRoomEvents(roomB, callbackB);

    emitRoomEvent(roomA, {
      type: 'player_joined',
      payload: { id: 'p1', nickname: 'Alice' },
    });

    expect(callbackA).toHaveBeenCalledTimes(1);
    expect(callbackB).not.toHaveBeenCalled();

    emitRoomEvent(roomB, {
      type: 'submission_received',
      payload: { total_submitted: 1, total_required: 2 },
    });

    expect(callbackA).toHaveBeenCalledTimes(1);
    expect(callbackB).toHaveBeenCalledTimes(1);

    unsubA();
    unsubB();
  });

  it('is case-insensitive for room codes', () => {
    const callback = vi.fn();
    const unsub = subscribeToRoomEvents('testcode', callback);

    emitRoomEvent('TESTCODE', {
      type: 'room_phase_changed',
      payload: { phase: 'RESULTS' },
    });

    expect(callback).toHaveBeenCalledTimes(1);
    unsub();
  });
});
