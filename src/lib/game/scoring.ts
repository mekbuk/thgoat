import {
  LeaderboardEntry,
  StageResultItem,
  Submission,
  Vote,
  Player,
  StageMatchup,
  MatchupResult,
  MatchupResultOption,
} from '@/types/game';

export const POINTS_PER_VOTE = 100;
export const WINNER_BONUS_POINTS = 250;
export const SWEEP_BONUS_POINTS = 100;

export interface SubmissionWithAuthor extends Submission {
  author_nickname: string;
}

/**
 * Calculates results and scores for a specific 1v1 matchup.
 */
export function calculateMatchupResult(
  matchup: StageMatchup,
  submissions: Submission[],
  votes: Vote[],
  players: Player[]
): {
  result: MatchupResult;
  playerScoreDeltas: Record<string, number>;
} {
  // Find submissions for this matchup
  const matchupSubmissions = submissions.filter((s) => s.matchup_id === matchup.id);
  const matchupVotes = votes.filter((v) => v.matchup_id === matchup.id);

  const voteCounts: Record<string, number> = {};
  matchupSubmissions.forEach((s) => {
    voteCounts[s.id] = 0;
  });

  matchupVotes.forEach((v) => {
    if (voteCounts[v.submission_id] !== undefined) {
      voteCounts[v.submission_id] += 1;
    }
  });

  const totalVotes = matchupVotes.length;
  let maxVotes = -1;
  matchupSubmissions.forEach((s) => {
    const count = voteCounts[s.id] || 0;
    if (count > maxVotes) {
      maxVotes = count;
    }
  });

  const winners = matchupSubmissions.filter((s) => (voteCounts[s.id] || 0) === maxVotes && maxVotes > 0);
  const isTie = winners.length > 1;
  const isSweep = !isTie && maxVotes === totalVotes && totalVotes >= 2;

  const options: MatchupResultOption[] = [];
  const playerScoreDeltas: Record<string, number> = {};

  matchupSubmissions.forEach((sub) => {
    const author = players.find((p) => p.id === sub.player_id);
    const votesReceived = voteCounts[sub.id] || 0;
    const isWinner = maxVotes > 0 && votesReceived === maxVotes;

    let points = votesReceived * POINTS_PER_VOTE;
    if (isWinner) {
      points += WINNER_BONUS_POINTS;
      if (isSweep) {
        points += SWEEP_BONUS_POINTS;
      }
    }

    options.push({
      submission_id: sub.id,
      title: sub.title,
      author_id: sub.player_id,
      author_nickname: author ? author.nickname : 'Unknown Player',
      votes_received: votesReceived,
      is_winner: isWinner,
      points_awarded: points,
    });

    playerScoreDeltas[sub.player_id] = (playerScoreDeltas[sub.player_id] || 0) + points;
  });

  // Sort options descending by votes received
  options.sort((a, b) => b.votes_received - a.votes_received);

  const result: MatchupResult = {
    matchup_id: matchup.id,
    order_index: matchup.order_index,
    picture_url: matchup.picture.image_url,
    picture_description: matchup.picture.description,
    options,
    is_tie: isTie,
    is_sweep: isSweep,
    total_votes: totalVotes,
  };

  return { result, playerScoreDeltas };
}

/**
 * Tallies votes for each submission, awards points, and marks winners (including ties).
 * Maintained for general stage result calculations and backwards compatibility.
 */
export function calculateStageResults(
  submissions: SubmissionWithAuthor[],
  votes: Vote[]
): {
  results: StageResultItem[];
  playerScoreDeltas: Record<string, number>;
} {
  const voteCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    voteCounts[s.id] = 0;
  });

  votes.forEach((v) => {
    if (voteCounts[v.submission_id] !== undefined) {
      voteCounts[v.submission_id] += 1;
    }
  });

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

    playerScoreDeltas[sub.player_id] = (playerScoreDeltas[sub.player_id] || 0) + pointsAwarded;
  });

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
