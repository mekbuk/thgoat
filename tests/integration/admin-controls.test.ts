import { describe, it, expect, beforeEach } from 'vitest';
import { GameService } from '@/lib/services/game-service';

describe('Admin Controls Integration', () => {
  beforeEach(() => {
    GameService._resetMemoryStore();
  });

  it('rejects force actions with invalid admin password', async () => {
    const host = await GameService.createRoom('HostCat');

    await expect(
      GameService.forceStartGame(host.room_code, 'wrong_password')
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid admin password',
    });

    await expect(
      GameService.forceResetLobby(host.room_code, 'wrong_password')
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid admin password',
    });
  });

  it('allows force start with only 1 player (bypassing MIN_PLAYERS requirement)', async () => {
    const host = await GameService.createRoom('SoloPlayer');

    // Normally standard start fails with fewer than 3 players
    await expect(
      GameService.startGame(host.room_code, host.session_token)
    ).rejects.toMatchObject({ status: 400 });

    // Admin force start succeeds
    const forceResult = await GameService.forceStartGame(
      host.room_code,
      'Passw0rd_is_zer0'
    );
    expect(forceResult.phase).toBe('SUBMITTING');
    expect(forceResult.stage_number).toBe(1);

    const state = await GameService.getRoomState(host.room_code, host.session_token);
    expect(state.phase).toBe('SUBMITTING');
    expect(state.current_stage_number).toBe(1);
  });

  it('force resets the lobby to a clean slate', async () => {
    const host = await GameService.createRoom('HostCat');
    const p2 = await GameService.joinRoom(host.room_code, 'PlayerTwo');

    await GameService.forceStartGame(host.room_code, 'Passw0rd_is_zer0');

    // Submit title
    const state = await GameService.getRoomState(host.room_code, host.session_token);
    await GameService.submitTitle(
      host.room_code,
      host.session_token,
      state.current_stage!.stage_id,
      'Admin Title'
    );

    // Force reset lobby
    const resetResult = await GameService.forceResetLobby(
      host.room_code,
      'Passw0rd_is_zer0'
    );
    expect(resetResult.phase).toBe('LOBBY');
    expect(resetResult.current_stage_number).toBe(1);

    const cleanState = await GameService.getRoomState(host.room_code, host.session_token);
    expect(cleanState.phase).toBe('LOBBY');
    expect(cleanState.current_stage).toBeNull();
    expect(cleanState.players[0].score).toBe(0);
  });
});
