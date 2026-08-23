import { describe, it, expect, beforeEach } from 'vitest';
import { GameService } from '@/lib/services/game-service';

describe('Voting Fairness & Self-Vote Prevention Integration', () => {
  beforeEach(() => {
    GameService._resetMemoryStore();
  });

  async function setupVotingStage() {
    const host = await GameService.createRoom('HostCat');
    const p2 = await GameService.joinRoom(host.room_code, 'PlayerTwo');
    const p3 = await GameService.joinRoom(host.room_code, 'PlayerThree');

    const started = await GameService.startGame(host.room_code, host.session_token);

    await GameService.submitTitle(host.room_code, host.session_token, started.stage_id, 'Title A by Host');
    await GameService.submitTitle(host.room_code, p2.session_token, started.stage_id, 'Title B by P2');
    await GameService.submitTitle(host.room_code, p3.session_token, started.stage_id, 'Title C by P3');

    return { host, p2, p3, stage_id: started.stage_id, room_code: host.room_code };
  }

  it('omits player own submission from their voting options', async () => {
    const { host, p2, room_code } = await setupVotingStage();

    const hostState = await GameService.getRoomState(room_code, host.session_token);
    expect(hostState.voting_options).toHaveLength(2);
    expect(hostState.voting_options.map((o) => o.title)).not.toContain('Title A by Host');
    expect(hostState.voting_options.map((o) => o.title)).toContain('Title B by P2');
    expect(hostState.voting_options.map((o) => o.title)).toContain('Title C by P3');

    const p2State = await GameService.getRoomState(room_code, p2.session_token);
    expect(p2State.voting_options.map((o) => o.title)).not.toContain('Title B by P2');
  });

  it('server strictly rejects malicious self-vote attempt', async () => {
    const { host, p2, room_code, stage_id } = await setupVotingStage();

    // From P2's perspective, find the submission authored by Host
    const p2State = await GameService.getRoomState(room_code, p2.session_token);
    const hostSubmission = p2State.voting_options.find((o) => o.title === 'Title A by Host');

    expect(hostSubmission).toBeDefined();

    // Host attempts to vote for their own submission ID
    await expect(
      GameService.submitVote(
        room_code,
        host.session_token,
        stage_id,
        hostSubmission!.submission_id
      )
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining('SELF_VOTING_PROHIBITED'),
    });
  });

  it('allows valid peer votes and transitions to RESULTS when all vote', async () => {
    const { host, p2, p3, room_code, stage_id } = await setupVotingStage();

    const hostOptions = (await GameService.getRoomState(room_code, host.session_token)).voting_options;
    const p2Options = (await GameService.getRoomState(room_code, p2.session_token)).voting_options;
    const p3Options = (await GameService.getRoomState(room_code, p3.session_token)).voting_options;

    // Host votes for Title B
    await GameService.submitVote(room_code, host.session_token, stage_id, hostOptions[0].submission_id);

    // P2 votes for Title C
    await GameService.submitVote(room_code, p2.session_token, stage_id, p2Options[0].submission_id);

    // P3 votes for Title B (Final vote) -> should transition to RESULTS
    const v3 = await GameService.submitVote(room_code, p3.session_token, stage_id, p3Options[0].submission_id);
    expect(v3.phase).toBe('RESULTS');

    const state = await GameService.getRoomState(room_code, host.session_token);
    expect(state.phase).toBe('RESULTS');
    expect(state.stage_results.length).toBeGreaterThan(0);
  });

  it('rejects duplicate voting by same player in same stage', async () => {
    const { host, room_code, stage_id } = await setupVotingStage();
    const hostOptions = (await GameService.getRoomState(room_code, host.session_token)).voting_options;

    await GameService.submitVote(room_code, host.session_token, stage_id, hostOptions[0].submission_id);

    await expect(
      GameService.submitVote(room_code, host.session_token, stage_id, hostOptions[1].submission_id)
    ).rejects.toMatchObject({
      status: 400,
    });
  });
});
