import { LeaderboardEntry, StageResultItem, Submission, Vote, Player } from '@/types/game';

export const POINTS_PER_VOTE = 100;
export const WINNER_BONUS_POINTS = 250;

export interface SubmissionWithAuthor extends Submission {
  author_nickname: string;
}

/**
 * Tallies votes for each submission, awards points, and marks winners (including ties).
 */
export function calculateStageResults(
  submissions: SubmissionWithAuthor[],
  votes: Vote[]
): {
  results: StageResultItem[];
  playerScoreDeltas: Record<string, number>;
} {
  // Count votes per submission
  const voteCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    voteCounts[s.id] = 0;
  });

  votes.forEach((v) => {
    if (voteCounts[v.submission_id] !== undefined) {
      voteCounts[v.submission_id] += 1;
    }
  });

  // Determine max vote count
  let maxVotes = 0;
  Object.values(voteCounts).forEach((count) => {
    if (count > maxVotes) {
      maxVotes = count;
    }
  });

  const results: StageResultItem[] = [];
  const playerScoreDeltas: Record<string, number> = {};

  submissions.forEach((sub) => {
    const count = voteCounts[sub.id] || 0;
    // A submission is a winner if it has the max votes and maxVotes > 0
    const isWinner = maxVotes > 0 && count === maxVotes;
    const pointsAwarded = count * POINTS_PER_VOTE + (isWinner ? WINNER_BONUS_POINTS : 0);

    results.push({
      submission_id: sub.id,
      title: sub.title,
      author_nickname: sub.author_nickname,
      votes_received: count,
      is_winner: isWinner,
      points_awarded: pointsAwarded,
    });

    playerScoreDeltas[sub.player_id] = pointsAwarded;
  });

  // Sort results descending by votes received
  results.sort((a, b) => b.votes_received - a.votes_received);

  return { results, playerScoreDeltas };
}

/**
 * Computes sorted leaderboard rankings from player scores with proper tie handling.
 */
export function computeLeaderboard(players: Pick<Player, 'id' | 'nickname' | 'score'>[]): LeaderboardEntry[] {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const highestScore = sorted.length > 0 ? sorted[0].score : 0;

  let currentRank = 1;
  return sorted.map((p, index) => {
    if (index > 0 && p.score < sorted[index - 1].score) {
      currentRank = index + 1;
    }

    return {
      rank: currentRank,
      player_id: p.id,
      nickname: p.nickname,
      total_score: p.score,
      is_champion: p.score > 0 && p.score === highestScore,
    };
  });
}
