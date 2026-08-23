import { describe, it, expect } from 'vitest';
import { calculateStageResults, POINTS_PER_VOTE, WINNER_BONUS_POINTS } from '@/lib/game/scoring';
import { SubmissionWithAuthor } from '@/lib/game/scoring';
import { Vote } from '@/types/game';

describe('Scoring & Stage Resolution Unit Tests', () => {
  const mockSubmissions: SubmissionWithAuthor[] = [
    {
      id: 'sub-1',
      stage_id: 'stage-1',
      player_id: 'player-1',
      title: 'Title 1',
      author_nickname: 'Alice',
      created_at: new Date().toISOString(),
    },
    {
      id: 'sub-2',
      stage_id: 'stage-1',
      player_id: 'player-2',
      title: 'Title 2',
      author_nickname: 'Bob',
      created_at: new Date().toISOString(),
    },
    {
      id: 'sub-3',
      stage_id: 'stage-1',
      player_id: 'player-3',
      title: 'Title 3',
      author_nickname: 'Charlie',
      created_at: new Date().toISOString(),
    },
  ];

  it('correctly calculates points for clear winner', () => {
    // sub-2 receives 2 votes, sub-3 receives 1 vote, sub-1 receives 0 votes
    const votes: Vote[] = [
      { id: 'v1', stage_id: 'stage-1', voter_player_id: 'player-1', submission_id: 'sub-2', created_at: '' },
      { id: 'v2', stage_id: 'stage-1', voter_player_id: 'player-3', submission_id: 'sub-2', created_at: '' },
      { id: 'v3', stage_id: 'stage-1', voter_player_id: 'player-2', submission_id: 'sub-3', created_at: '' },
    ];

    const { results, playerScoreDeltas } = calculateStageResults(mockSubmissions, votes);

    expect(results).toHaveLength(3);
    // Highest votes first
    expect(results[0].submission_id).toBe('sub-2');
    expect(results[0].votes_received).toBe(2);
    expect(results[0].is_winner).toBe(true);
    expect(results[0].points_awarded).toBe(2 * POINTS_PER_VOTE + WINNER_BONUS_POINTS); // 450 pts

    expect(results[1].submission_id).toBe('sub-3');
    expect(results[1].votes_received).toBe(1);
    expect(results[1].is_winner).toBe(false);
    expect(results[1].points_awarded).toBe(1 * POINTS_PER_VOTE); // 100 pts

    expect(results[2].submission_id).toBe('sub-1');
    expect(results[2].votes_received).toBe(0);
    expect(results[2].is_winner).toBe(false);
    expect(results[2].points_awarded).toBe(0);

    expect(playerScoreDeltas['player-2']).toBe(450);
    expect(playerScoreDeltas['player-3']).toBe(100);
    expect(playerScoreDeltas['player-1']).toBe(0);
  });

  it('awards full winner bonus to all tied submissions', () => {
    // sub-1 receives 1 vote, sub-2 receives 1 vote, sub-3 receives 0 votes
    const votes: Vote[] = [
      { id: 'v1', stage_id: 'stage-1', voter_player_id: 'player-2', submission_id: 'sub-1', created_at: '' },
      { id: 'v2', stage_id: 'stage-1', voter_player_id: 'player-3', submission_id: 'sub-2', created_at: '' },
    ];

    const { results, playerScoreDeltas } = calculateStageResults(mockSubmissions, votes);

    const winner1 = results.find((r) => r.submission_id === 'sub-1');
    const winner2 = results.find((r) => r.submission_id === 'sub-2');

    expect(winner1?.is_winner).toBe(true);
    expect(winner2?.is_winner).toBe(true);
    expect(winner1?.points_awarded).toBe(1 * POINTS_PER_VOTE + WINNER_BONUS_POINTS); // 350 pts
    expect(winner2?.points_awarded).toBe(1 * POINTS_PER_VOTE + WINNER_BONUS_POINTS); // 350 pts

    expect(playerScoreDeltas['player-1']).toBe(350);
    expect(playerScoreDeltas['player-2']).toBe(350);
  });
});
