import { describe, it, expect, beforeEach } from 'vitest';
import { GameService } from '@/lib/services/game-service';

describe('Submission Flow Integration', () => {
  beforeEach(() => {
    GameService._resetMemoryStore();
  });

  it('assigns 2 prompts per player and transitions to VOTING when all are submitted', async () => {
    const host = await GameService.createRoom('HostCat');
    const p2 = await GameService.joinRoom(host.room_code, 'PlayerTwo');
    const p3 = await GameService.joinRoom(host.room_code, 'PlayerThree');

    const started = await GameService.startGame(host.room_code, host.session_token);
    expect(started.phase).toBe('SUBMITTING');

    // Check that each player has 2 assigned prompts
    const hostState1 = await GameService.getRoomState(host.room_code, host.session_token);
    expect(hostState1.my_prompts).toHaveLength(2);
    expect(hostState1.me?.has_submitted_all).toBe(false);

    const p2State1 = await GameService.getRoomState(host.room_code, p2.session_token);
    expect(p2State1.my_prompts).toHaveLength(2);

    // Host submits prompt 1
    const subHost1 = await GameService.submitTitle(
      host.room_code,
      host.session_token,
      started.stage_id,
      'Host Title 1',
      hostState1.my_prompts[0].matchup_id
    );
    expect(subHost1.success).toBe(true);
    expect(subHost1.phase).toBe('SUBMITTING');

    // Host submits prompt 2
    const subHost2 = await GameService.submitTitle(
      host.room_code,
      host.session_token,
      started.stage_id,
      'Host Title 2',
      hostState1.my_prompts[1].matchup_id
    );
    expect(subHost2.success).toBe(true);
    expect(subHost2.phase).toBe('SUBMITTING');

    const hostStateAfter = await GameService.getRoomState(host.room_code, host.session_token);
    expect(hostStateAfter.me?.has_submitted_all).toBe(true);

    // Player 2 submits both prompts
    await GameService.submitTitle(
      host.room_code,
      p2.session_token,
      started.stage_id,
      'P2 Title 1',
      p2State1.my_prompts[0].matchup_id
    );
    await GameService.submitTitle(
      host.room_code,
      p2.session_token,
      started.stage_id,
      'P2 Title 2',
      p2State1.my_prompts[1].matchup_id
    );

    const p3State1 = await GameService.getRoomState(host.room_code, p3.session_token);

    // Player 3 submits prompt 1
    await GameService.submitTitle(
      host.room_code,
      p3.session_token,
      started.stage_id,
      'P3 Title 1',
      p3State1.my_prompts[0].matchup_id
    );

    // Player 3 submits prompt 2 (final submission in room) -> should transition to VOTING
    const subP3Final = await GameService.submitTitle(
      host.room_code,
      p3.session_token,
      started.stage_id,
      'P3 Title 2',
      p3State1.my_prompts[1].matchup_id
    );
    expect(subP3Final.success).toBe(true);
    expect(subP3Final.phase).toBe('VOTING');

    const finalState = await GameService.getRoomState(host.room_code, host.session_token);
    expect(finalState.phase).toBe('VOTING');
    expect(finalState.current_matchup).toBeDefined();
    expect(finalState.current_matchup?.total_matchups).toBe(3);
  });

  it('rejects duplicate submission from same player for same matchup', async () => {
    const host = await GameService.createRoom('HostCat');
    await GameService.joinRoom(host.room_code, 'PlayerTwo');
    await GameService.joinRoom(host.room_code, 'PlayerThree');
    const started = await GameService.startGame(host.room_code, host.session_token);

    const state = await GameService.getRoomState(host.room_code, host.session_token);
    const matchupId = state.my_prompts[0].matchup_id;

    await GameService.submitTitle(
      host.room_code,
      host.session_token,
      started.stage_id,
      'First Title',
      matchupId
    );

    await expect(
      GameService.submitTitle(
        host.room_code,
        host.session_token,
        started.stage_id,
        'Duplicate Title',
        matchupId
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
