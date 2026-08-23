import { describe, it, expect } from 'vitest';
import { generateRoomCode, isValidRoomCode } from '@/lib/game/room-code';
import { validatePhaseTransition, MIN_PLAYERS, MAX_PLAYERS } from '@/lib/game/state-machine';

describe('Room Code Generation & Validation', () => {
  it('generates a 4-character uppercase room code', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(4);
    expect(code).toBe(code.toUpperCase());
    expect(isValidRoomCode(code)).toBe(true);
  });

  it('excludes ambiguous characters (I, O, 1, 0)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRoomCode();
      expect(code).not.toMatch(/[IO10]/);
    }
  });

  it('rejects invalid room codes', () => {
    expect(isValidRoomCode('ABC')).toBe(false); // too short
    expect(isValidRoomCode('ABCDE')).toBe(false); // too long
    expect(isValidRoomCode('AB1O')).toBe(false); // contains 1 and O
    expect(isValidRoomCode('')).toBe(false);
  });
});

describe('Lobby State Transitions', () => {
  it('allows transition to SUBMITTING when player count >= MIN_PLAYERS', () => {
    const result = validatePhaseTransition('LOBBY', 'SUBMITTING', {
      playerCount: MIN_PLAYERS,
    });
    expect(result.isValid).toBe(true);
  });

  it('rejects start game when player count < MIN_PLAYERS', () => {
    const result = validatePhaseTransition('LOBBY', 'SUBMITTING', {
      playerCount: 2,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`Need at least ${MIN_PLAYERS} players`);
  });

  it('rejects start game when player count > MAX_PLAYERS', () => {
    const result = validatePhaseTransition('LOBBY', 'SUBMITTING', {
      playerCount: MAX_PLAYERS + 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('capacity exceeded');
  });

  it('rejects invalid transitions from LOBBY directly to VOTING or RESULTS', () => {
    expect(validatePhaseTransition('LOBBY', 'VOTING').isValid).toBe(false);
    expect(validatePhaseTransition('LOBBY', 'RESULTS').isValid).toBe(false);
    expect(validatePhaseTransition('LOBBY', 'FINISHED').isValid).toBe(false);
  });
});
