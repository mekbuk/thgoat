import { describe, it, expect } from 'vitest';
import {
  calculateStageResults,
  calculateMatchupResult,
  POINTS_PER_VOTE,
  WINNER_BONUS_POINTS,
  SWEEP_BONUS_POINTS,
} from '@/lib/game/scoring';
import { SubmissionWithAuthor } from '@/lib/game/scoring';
import { Vote, StageMatchup, Submission, Player } from '@/types/game';

describe('Scoring & Stage Resolution Unit Tests', () => {
  const mockSubmissions: SubmissionWithAuthor[] = [
    {
      id: 'sub-1',
      stage_id: 'stage-1',
      matchup_id: 'm-1',
      player_id: 'player-1',
      title: 'Title 1',
      author_nickname: 'Alice',
      created_at: new Date().toISOString(),
    },
    {
      id: 'sub-2',
      stage_id: 'stage-1',
      matchup_id: 'm-1',
      player_id: 'player-2',
      title: 'Title 2',
      author_nickname: 'Bob',
      created_at: new Date().toISOString(),
    },
    {
      id: 'sub-3',
      stage_id: 'stage-1',
      matchup_id: 'm-2',
      player_id: 'player-3',
      title: 'Title 3',
      author_nickname: 'Charlie',
      created_at: new Date().toISOString(),
    },
  ];

  it('correctly calculates points for clear winner', () => {
    const votes: Vote[] = [
      { id: 'v1', stage_id: 'stage-1', matchup_id: 'm-1', voter_player_id: 'player-1', submission_id: 'sub-2', created_at: '' },
      { id: 'v2', stage_id: 'stage-1', matchup_id: 'm-1', voter_player_id: 'player-3', submission_id: 'sub-2', created_at: '' },
      { id: 'v3', stage_id: 'stage-1', matchup_id: 'm-2', voter_player_id: 'player-2', submission_id: 'sub-3', created_at: '' },
    ];

    const { results, playerScoreDeltas } = calculateStageResults(mockSubmissions, votes);

    expect(results).toHaveLength(3);
    expect(results[0].submission_id).toBe('sub-2');
    expect(results[0].votes_received).toBe(2);
    expect(results[0].is_winner).toBe(true);
    expect(results[0].points_awarded).toBe(2 * POINTS_PER_VOTE + WINNER_BONUS_POINTS);

    expect(results[1].submission_id).toBe('sub-3');
    expect(results[1].votes_received).toBe(1);
    expect(results[1].is_winner).toBe(false);
    expect(results[1].points_awarded).toBe(1 * POINTS_PER_VOTE);

    expect(results[2].submission_id).toBe('sub-1');
    expect(results[2].votes_received).toBe(0);
    expect(results[2].is_winner).toBe(false);
    expect(results[2].points_awarded).toBe(0);

    expect(playerScoreDeltas['player-2']).toBe(450);
    expect(playerScoreDeltas['player-3']).toBe(100);
    expect(playerScoreDeltas['player-1']).toBe(0);
  });

  it('awards full winner bonus to all tied submissions', () => {
    const votes: Vote[] = [
      { id: 'v1', stage_id: 'stage-1', matchup_id: 'm-1', voter_player_id: 'player-2', submission_id: 'sub-1', created_at: '' },
      { id: 'v2', stage_id: 'stage-1', matchup_id: 'm-1', voter_player_id: 'player-3', submission_id: 'sub-2', created_at: '' },
    ];

    const { results, playerScoreDeltas } = calculateStageResults(mockSubmissions, votes);

    const winner1 = results.find((r) => r.submission_id === 'sub-1');
    const winner2 = results.find((r) => r.submission_id === 'sub-2');

    expect(winner1?.is_winner).toBe(true);
    expect(winner2?.is_winner).toBe(true);
    expect(winner1?.points_awarded).toBe(1 * POINTS_PER_VOTE + WINNER_BONUS_POINTS);
    expect(winner2?.points_awarded).toBe(1 * POINTS_PER_VOTE + WINNER_BONUS_POINTS);

    expect(playerScoreDeltas['player-1']).toBe(350);
    expect(playerScoreDeltas['player-2']).toBe(350);
  });

  it('calculates 1v1 matchup results with Throat Goat Sweep bonus', () => {
    const matchup: StageMatchup = {
      id: 'm-1',
      stage_id: 'stage-1',
      order_index: 0,
      picture_id: 'pic-1',
      picture: {
        id: 'pic-1',
        image_url: 'https://example.com/pic.jpg',
        description: 'Funny pic',
        is_active: true,
        created_at: '',
      },
      player1_id: 'player-1',
      player2_id: 'player-2',
      is_revealed: false,
      created_at: '',
    };

    const subs: Submission[] = [
      { id: 'sub-1', stage_id: 'stage-1', matchup_id: 'm-1', player_id: 'player-1', title: 'Alice Title', created_at: '' },
      { id: 'sub-2', stage_id: 'stage-1', matchup_id: 'm-1', player_id: 'player-2', title: 'Bob Title', created_at: '' },
    ];

    const players: Player[] = [
      { id: 'player-1', room_id: 'r1', nickname: 'Alice', session_token: 't1', is_host: true, score: 0, is_connected: true, joined_at: '' },
      { id: 'player-2', room_id: 'r1', nickname: 'Bob', session_token: 't2', is_host: false, score: 0, is_connected: true, joined_at: '' },
      { id: 'player-3', room_id: 'r1', nickname: 'Charlie', session_token: 't3', is_host: false, score: 0, is_connected: true, joined_at: '' },
      { id: 'player-4', room_id: 'r1', nickname: 'Diana', session_token: 't4', is_host: false, score: 0, is_connected: true, joined_at: '' },
    ];

    // Both Charlie and Diana vote for Alice (2-0 sweep)
    const votes: Vote[] = [
      { id: 'v1', stage_id: 'stage-1', matchup_id: 'm-1', voter_player_id: 'player-3', submission_id: 'sub-1', created_at: '' },
      { id: 'v2', stage_id: 'stage-1', matchup_id: 'm-1', voter_player_id: 'player-4', submission_id: 'sub-1', created_at: '' },
    ];

    const { result, playerScoreDeltas } = calculateMatchupResult(matchup, subs, votes, players);

    expect(result.is_sweep).toBe(true);
    expect(result.is_tie).toBe(false);
    expect(result.total_votes).toBe(2);

    const winnerOpt = result.options.find((o) => o.submission_id === 'sub-1');
    expect(winnerOpt?.is_winner).toBe(true);
    expect(winnerOpt?.votes_received).toBe(2);
    // 2 * 100 + 250 (winner) + 100 (sweep) = 550 pts
    expect(winnerOpt?.points_awarded).toBe(2 * POINTS_PER_VOTE + WINNER_BONUS_POINTS + SWEEP_BONUS_POINTS);
    expect(playerScoreDeltas['player-1']).toBe(550);
    expect(playerScoreDeltas['player-2']).toBe(0);
  });
});
