import { describe, it, expect, beforeEach } from 'vitest';
import { GameService } from '@/lib/services/game-service';

describe('Submission Flow Integration', () => {
  beforeEach(() => {
    GameService._resetMemoryStore();
  });

  it('allows players to submit titles in SUBMITTING phase', async () => {
    const host = await GameService.createRoom('HostCat');
    const p2 = await GameService.joinRoom(host.room_code, 'PlayerTwo');
    const p3 = await GameService.joinRoom(host.room_code, 'PlayerThree');

    const started = await GameService.startGame(host.room_code, host.session_token);
    expect(started.phase).toBe('SUBMITTING');

    // Host submits title
    const sub1 = await GameService.submitTitle(
      host.room_code,
      host.session_token,
      started.stage_id,
      'A dragon that sneezed too hard'
    );
    expect(sub1.success).toBe(true);
    expect(sub1.phase).toBe('SUBMITTING');

    // Player 2 submits
    const sub2 = await GameService.submitTitle(
      host.room_code,
      p2.session_token,
      started.stage_id,
      'When your tattoo artist is legally blind'
    );
    expect(sub2.success).toBe(true);
    expect(sub2.phase).toBe('SUBMITTING');

    // Player 3 submits (final player) -> Should automatically transition to VOTING
    const sub3 = await GameService.submitTitle(
      host.room_code,
      p3.session_token,
      started.stage_id,
      'Dragon from Wish.com'
    );
    expect(sub3.success).toBe(true);
    expect(sub3.phase).toBe('VOTING');

    const state = await GameService.getRoomState(host.room_code, host.session_token);
    expect(state.phase).toBe('VOTING');
  });

  it('rejects duplicate submission from same player in same stage', async () => {
    const host = await GameService.createRoom('HostCat');
    await GameService.joinRoom(host.room_code, 'PlayerTwo');
    await GameService.joinRoom(host.room_code, 'PlayerThree');
    const started = await GameService.startGame(host.room_code, host.session_token);

    await GameService.submitTitle(
      host.room_code,
      host.session_token,
      started.stage_id,
      'First Title'
    );

    await expect(
      GameService.submitTitle(
        host.room_code,
        host.session_token,
        started.stage_id,
        'Second Title'
      )
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it('rejects submission outside of SUBMITTING phase', async () => {
    const host = await GameService.createRoom('HostCat');
    await expect(
      GameService.submitTitle(
        host.room_code,
        host.session_token,
        '00000000-0000-0000-0000-000000000000',
        'Early submission'
      )
    ).rejects.toMatchObject({
      status: 409,
    });
  });
});
