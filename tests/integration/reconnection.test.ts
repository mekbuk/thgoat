import { describe, it, expect, beforeEach } from 'vitest';
import { GameService } from '@/lib/services/game-service';

describe('Reconnection & Lifecycle Integration', () => {
  beforeEach(() => {
    GameService._resetMemoryStore();
  });

  it('restores complete room state for reconnecting player with session token', async () => {
    const host = await GameService.createRoom('HostCat');
    const p2 = await GameService.joinRoom(host.room_code, 'PlayerTwo');
    const p3 = await GameService.joinRoom(host.room_code, 'PlayerThree');

    const started = await GameService.startGame(host.room_code, host.session_token);

    // Player 2 submits title
    await GameService.submitTitle(
      host.room_code,
      p2.session_token,
      started.stage_id,
      'My Cool Title'
    );

    // Simulate browser refresh for Player 2: fetch room state using session token
    const rehydrated = await GameService.getRoomState(host.room_code, p2.session_token);
    expect(rehydrated.phase).toBe('SUBMITTING');
    expect(rehydrated.me?.has_submitted).toBe(true);
    expect(rehydrated.me?.nickname).toBe('PlayerTwo');
    expect(rehydrated.current_stage?.stage_id).toBe(started.stage_id);
  });

  it('transfers host role to next player when host leaves', async () => {
    const host = await GameService.createRoom('HostCat');
    const p2 = await GameService.joinRoom(host.room_code, 'PlayerTwo');

    const leaveResult = await GameService.leaveRoom(host.room_code, host.session_token);
    expect(leaveResult.success).toBe(true);
    expect(leaveResult.new_host_id).toBe(p2.player_id);

    const p2State = await GameService.getRoomState(host.room_code, p2.session_token);
    expect(p2State.me?.is_host).toBe(true);
    expect(p2State.players[0].is_host).toBe(true);
  });
});
