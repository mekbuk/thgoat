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
});
