import { randomUUID } from 'crypto';
import { Picture, Player, StageMatchup } from '@/types/game';

/**
 * Generates 1v1 matchups for a stage where:
 * - Each player is assigned to exactly 2 matchups (2 pictures).
 * - Each matchup has exactly 2 distinct players.
 * - Total matchups created = N (for N players, where N >= 3).
 *
 * Ring Algorithm:
 * For N players:
 * Matchup k (0 <= k < N) is assigned Picture k and players [P_k, P_{(k+1)%N}].
 * Player P_k participates in Matchup (k-1+N)%N and Matchup k.
 */
export function generateStageMatchups(
  stageId: string,
  players: Player[],
  pictures: Picture[]
): StageMatchup[] {
  const n = players.length;
  if (n === 0) return [];

  // If 1 player (admin test mode)
  if (n === 1) {
    const pic1 = pictures[0] || pictures[0];
    const pic2 = pictures[1] || pictures[0];
    return [
      {
        id: randomUUID(),
        stage_id: stageId,
        order_index: 0,
        picture_id: pic1.id,
        picture: pic1,
        player1_id: players[0].id,
        player2_id: players[0].id,
        is_revealed: false,
        created_at: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        stage_id: stageId,
        order_index: 1,
        picture_id: pic2.id,
        picture: pic2,
        player1_id: players[0].id,
        player2_id: players[0].id,
        is_revealed: false,
        created_at: new Date().toISOString(),
      },
    ];
  }

  // If 2 players (admin test mode)
  if (n === 2) {
    const pic1 = pictures[0];
    const pic2 = pictures[1] || pictures[0];
    return [
      {
        id: randomUUID(),
        stage_id: stageId,
        order_index: 0,
        picture_id: pic1.id,
        picture: pic1,
        player1_id: players[0].id,
        player2_id: players[1].id,
        is_revealed: false,
        created_at: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        stage_id: stageId,
        order_index: 1,
        picture_id: pic2.id,
        picture: pic2,
        player1_id: players[1].id,
        player2_id: players[0].id,
        is_revealed: false,
        created_at: new Date().toISOString(),
      },
    ];
  }

  // For N >= 3 players: standard Quiplash ring pairing
  const matchups: StageMatchup[] = [];
  for (let k = 0; k < n; k++) {
    const picture = pictures[k % pictures.length];
    const p1 = players[k];
    const p2 = players[(k + 1) % n];

    matchups.push({
      id: randomUUID(),
      stage_id: stageId,
      order_index: k,
      picture_id: picture.id,
      picture: picture,
      player1_id: p1.id,
      player2_id: p2.id,
      is_revealed: false,
      created_at: new Date().toISOString(),
    });
  }

  return matchups;
}
