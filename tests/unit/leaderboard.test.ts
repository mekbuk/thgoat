import { describe, it, expect } from 'vitest';
import { computeLeaderboard } from '@/lib/game/scoring';

describe('Leaderboard Ranking Unit Tests', () => {
  it('ranks players in descending order of total score', () => {
    const players = [
      { id: 'p1', nickname: 'Alice', score: 300 },
      { id: 'p2', nickname: 'Bob', score: 750 },
      { id: 'p3', nickname: 'Charlie', score: 100 },
    ];

    const leaderboard = computeLeaderboard(players);

    expect(leaderboard).toHaveLength(3);
    expect(leaderboard[0].nickname).toBe('Bob');
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].is_champion).toBe(true);

    expect(leaderboard[1].nickname).toBe('Alice');
    expect(leaderboard[1].rank).toBe(2);
    expect(leaderboard[1].is_champion).toBe(false);

    expect(leaderboard[2].nickname).toBe('Charlie');
    expect(leaderboard[2].rank).toBe(3);
  });

  it('handles ties for first place by marking both as champions', () => {
    const players = [
      { id: 'p1', nickname: 'Alice', score: 500 },
      { id: 'p2', nickname: 'Bob', score: 500 },
      { id: 'p3', nickname: 'Charlie', score: 200 },
    ];

    const leaderboard = computeLeaderboard(players);

    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].is_champion).toBe(true);

    expect(leaderboard[1].rank).toBe(1);
    expect(leaderboard[1].is_champion).toBe(true);

    expect(leaderboard[2].rank).toBe(3);
    expect(leaderboard[2].is_champion).toBe(false);
  });
});
