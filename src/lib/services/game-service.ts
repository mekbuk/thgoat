import { randomUUID } from 'crypto';
import { supabaseServer } from '@/lib/supabase/server';
import { generateRoomCode } from '@/lib/game/room-code';
import { MIN_PLAYERS, MAX_PLAYERS, validatePhaseTransition, TOTAL_STAGES } from '@/lib/game/state-machine';
import { calculateStageResults, computeLeaderboard, SubmissionWithAuthor } from '@/lib/game/scoring';
import { CURATED_PICTURES } from '@/lib/game/pictures';
import { GamePhase, RoomState, Player, Room, Stage, Picture, Submission, Vote, StageResultItem } from '@/types/game';

// Check if live Supabase instance is configured with valid non-mock credentials
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (
    url.includes('mock.supabase.co') ||
    url.includes('placeholder.supabase.co') ||
    key.includes('mock') ||
    key.includes('placeholder')
  ) {
    return false;
  }
  return true;
}

// In-memory cache/mock store for unit tests and local mock development
const memoryStore = {
  rooms: new Map<string, Room>(),
  players: new Map<string, Player[]>(),
  stages: new Map<string, Stage[]>(),
  pictures: CURATED_PICTURES,
  submissions: new Map<string, Submission[]>(),
  votes: new Map<string, Vote[]>(),
  stageScores: new Map<string, StageResultItem[]>(),
};

export class GameService {
  /**
   * Creates a new game room and designates the creator as host.
   */
  static async createRoom(nickname: string) {
    const roomId = randomUUID();
    const playerId = randomUUID();
    const sessionToken = randomUUID();
    const roomCode = generateRoomCode();

    const newRoom: Room = {
      id: roomId,
      room_code: roomCode,
      host_player_id: playerId,
      phase: 'LOBBY',
      current_stage_number: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const hostPlayer: Player = {
      id: playerId,
      room_id: roomId,
      nickname,
      session_token: sessionToken,
      is_host: true,
      score: 0,
      is_connected: true,
      joined_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { error: roomErr } = await supabaseServer.from('rooms').insert({
          id: roomId,
          room_code: roomCode,
          phase: 'LOBBY',
          current_stage_number: 1,
        });
        if (roomErr) throw roomErr;

        const { error: playerErr } = await supabaseServer.from('players').insert({
          id: playerId,
          room_id: roomId,
          nickname,
          session_token: sessionToken,
          is_host: true,
          score: 0,
          is_connected: true,
        });
        if (playerErr) throw playerErr;

        await supabaseServer.from('rooms').update({ host_player_id: playerId }).eq('id', roomId);
      } catch (err: any) {
        console.error('Supabase createRoom failed, falling back to memory store:', err?.message || err);
      }
    }

    // Keep memoryStore updated for fast lookup & fallback
    memoryStore.rooms.set(roomCode, newRoom);
    memoryStore.players.set(roomCode, [hostPlayer]);

    return {
      room_id: roomId,
      room_code: roomCode,
      player_id: playerId,
      session_token: sessionToken,
      phase: newRoom.phase,
    };
  }

  /**
   * Joins an existing game room.
   */
  static async joinRoom(roomCode: string, nickname: string) {
    const code = roomCode.toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: room, error: roomErr } = await supabaseServer
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (roomErr || !room) {
          throw { status: 404, message: 'Room not found. Check your room code!' };
        }

        if (room.phase !== 'LOBBY') {
          throw { status: 409, message: 'Game is already in progress. Cannot join now.' };
        }

        const { data: currentPlayers } = await supabaseServer
          .from('players')
          .select('*')
          .eq('room_id', room.id)
          .eq('is_connected', true);

        if ((currentPlayers?.length || 0) >= MAX_PLAYERS) {
          throw { status: 409, message: `Room is at maximum capacity (${MAX_PLAYERS} players).` };
        }

        const playerId = randomUUID();
        const sessionToken = randomUUID();

        const { error: playerErr } = await supabaseServer.from('players').insert({
          id: playerId,
          room_id: room.id,
          nickname,
          session_token: sessionToken,
          is_host: false,
          score: 0,
          is_connected: true,
        });

        if (playerErr) throw playerErr;

        return {
          room_id: room.id,
          room_code: room.room_code,
          player_id: playerId,
          session_token: sessionToken,
          phase: room.phase,
        };
      } catch (err: any) {
        if (err?.status) throw err;
        console.error('Supabase joinRoom error:', err?.message || err);
      }
    }

    // In-memory fallback
    const room = memoryStore.rooms.get(code);
    if (!room) {
      throw { status: 404, message: 'Room not found. Check your room code!' };
    }

    if (room.phase !== 'LOBBY') {
      throw { status: 409, message: 'Game is already in progress. Cannot join now.' };
    }

    const currentPlayers = memoryStore.players.get(code) || [];
    if (currentPlayers.length >= MAX_PLAYERS) {
      throw { status: 409, message: `Room is at maximum capacity (${MAX_PLAYERS} players).` };
    }

    const playerId = randomUUID();
    const sessionToken = randomUUID();

    const newPlayer: Player = {
      id: playerId,
      room_id: room.id,
      nickname,
      session_token: sessionToken,
      is_host: false,
      score: 0,
      is_connected: true,
      joined_at: new Date().toISOString(),
    };

    currentPlayers.push(newPlayer);
    memoryStore.players.set(code, currentPlayers);

    return {
      room_id: room.id,
      room_code: room.room_code,
      player_id: playerId,
      session_token: sessionToken,
      phase: room.phase,
    };
  }

  /**
   * Host starts the game from Lobby.
   */
  static async startGame(roomCode: string, sessionToken: string) {
    const code = roomCode.toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: room } = await supabaseServer
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (!room) {
          throw { status: 404, message: 'Room not found' };
        }

        const { data: players } = await supabaseServer
          .from('players')
          .select('*')
          .eq('room_id', room.id);

        const caller = (players || []).find((p) => p.session_token === sessionToken);
        if (!caller || !caller.is_host) {
          throw { status: 403, message: 'Only the host can start the game' };
        }

        const activePlayers = (players || []).filter((p) => p.is_connected);
        const validation = validatePhaseTransition(room.phase, 'SUBMITTING', {
          playerCount: activePlayers.length,
        });

        if (!validation.isValid) {
          throw { status: 400, message: validation.error || 'Cannot start game' };
        }

        // Ensure picture is seeded
        await supabaseServer.from('pictures').upsert(
          CURATED_PICTURES.map((p) => ({
            id: p.id,
            image_url: p.image_url,
            description: p.description,
            is_active: p.is_active,
          })),
          { onConflict: 'id' }
        );

        const picture = CURATED_PICTURES[0];
        const stageId = randomUUID();
        const gameId = randomUUID();

        await supabaseServer.from('games').insert({
          id: gameId,
          room_id: room.id,
          total_stages: TOTAL_STAGES,
          status: 'IN_PROGRESS',
        });

        await supabaseServer.from('stages').insert({
          id: stageId,
          game_id: gameId,
          room_id: room.id,
          stage_number: 1,
          picture_id: picture.id,
          phase: 'SUBMITTING',
          started_at: new Date().toISOString(),
        });

        await supabaseServer.from('rooms').update({
          phase: 'SUBMITTING',
          current_stage_number: 1,
          updated_at: new Date().toISOString(),
        }).eq('id', room.id);

        return {
          phase: 'SUBMITTING' as GamePhase,
          stage_number: 1,
          stage_id: stageId,
          picture_url: picture.image_url,
          picture_description: picture.description,
        };
      } catch (err: any) {
        if (err?.status) throw err;
        console.error('Supabase startGame error:', err?.message || err);
      }
    }

    // In-memory fallback
    const room = memoryStore.rooms.get(code);
    if (!room) {
      throw { status: 404, message: 'Room not found' };
    }

    const players = memoryStore.players.get(code) || [];
    const caller = players.find((p) => p.session_token === sessionToken);

    if (!caller || !caller.is_host) {
      throw { status: 403, message: 'Only the host can start the game' };
    }

    const validation = validatePhaseTransition(room.phase, 'SUBMITTING', {
      playerCount: players.length,
    });

    if (!validation.isValid) {
      throw { status: 400, message: validation.error || 'Cannot start game' };
    }

    const stageId = randomUUID();
    const picture = memoryStore.pictures[0];

    const stage1: Stage = {
      id: stageId,
      game_id: randomUUID(),
      room_id: room.id,
      stage_number: 1,
      picture_id: picture.id,
      phase: 'SUBMITTING',
      started_at: new Date().toISOString(),
      completed_at: null,
    };

    room.phase = 'SUBMITTING';
    room.current_stage_number = 1;
    room.updated_at = new Date().toISOString();

    memoryStore.stages.set(code, [stage1]);
    memoryStore.submissions.set(stageId, []);
    memoryStore.votes.set(stageId, []);

    return {
      phase: room.phase,
      stage_number: 1,
      stage_id: stageId,
      picture_url: picture.image_url,
      picture_description: picture.description,
    };
  }

  /**
   * Submits a title for the active stage picture.
   */
  static async submitTitle(roomCode: string, sessionToken: string, stageId: string, title: string) {
    const code = roomCode.toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: room } = await supabaseServer
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (!room) {
          throw { status: 404, message: 'Room not found' };
        }

        if (room.phase !== 'SUBMITTING') {
          throw { status: 409, message: 'Room is not in SUBMITTING phase' };
        }

        const { data: players } = await supabaseServer
          .from('players')
          .select('*')
          .eq('room_id', room.id);

        const caller = (players || []).find((p) => p.session_token === sessionToken);
        if (!caller) {
          throw { status: 401, message: 'Invalid session token' };
        }

        const { data: existing } = await supabaseServer
          .from('submissions')
          .select('id')
          .eq('stage_id', stageId)
          .eq('player_id', caller.id)
          .maybeSingle();

        if (existing) {
          throw { status: 400, message: 'You have already submitted a title for this stage' };
        }

        await supabaseServer.from('submissions').insert({
          id: randomUUID(),
          stage_id: stageId,
          player_id: caller.id,
          title: title.trim(),
          created_at: new Date().toISOString(),
        });

        const { data: stageSubmissions } = await supabaseServer
          .from('submissions')
          .select('*')
          .eq('stage_id', stageId);

        const activePlayers = (players || []).filter((p) => p.is_connected);
        const allSubmitted = (stageSubmissions?.length || 0) >= activePlayers.length;

        let nextPhase: GamePhase = room.phase;

        if (allSubmitted && activePlayers.length > 0) {
          nextPhase = 'VOTING';
          await supabaseServer.from('rooms').update({
            phase: 'VOTING',
            updated_at: new Date().toISOString(),
          }).eq('id', room.id);

          await supabaseServer.from('stages').update({
            phase: 'VOTING',
          }).eq('id', stageId);
        }

        return {
          success: true,
          total_submitted: stageSubmissions?.length || 0,
          total_required: activePlayers.length,
          phase: nextPhase,
        };
      } catch (err: any) {
        if (err?.status) throw err;
        console.error('Supabase submitTitle error:', err?.message || err);
      }
    }

    // In-memory fallback
    const room = memoryStore.rooms.get(code);
    if (!room) {
      throw { status: 404, message: 'Room not found' };
    }

    if (room.phase !== 'SUBMITTING') {
      throw { status: 409, message: 'Room is not in SUBMITTING phase' };
    }

    const players = memoryStore.players.get(code) || [];
    const caller = players.find((p) => p.session_token === sessionToken);

    if (!caller) {
      throw { status: 401, message: 'Invalid session token' };
    }

    const stageSubmissions = memoryStore.submissions.get(stageId) || [];
    const existing = stageSubmissions.find((s) => s.player_id === caller.id);
    if (existing) {
      throw { status: 400, message: 'You have already submitted a title for this stage' };
    }

    const newSubmission: Submission = {
      id: randomUUID(),
      stage_id: stageId,
      player_id: caller.id,
      title: title.trim(),
      created_at: new Date().toISOString(),
    };

    stageSubmissions.push(newSubmission);
    memoryStore.submissions.set(stageId, stageSubmissions);

    const activePlayers = players.filter((p) => p.is_connected);
    const allSubmitted = stageSubmissions.length >= activePlayers.length;

    if (allSubmitted) {
      room.phase = 'VOTING';
      room.updated_at = new Date().toISOString();

      const stages = memoryStore.stages.get(code) || [];
      const currentStage = stages.find((s) => s.id === stageId);
      if (currentStage) {
        currentStage.phase = 'VOTING';
      }
    }

    return {
      success: true,
      total_submitted: stageSubmissions.length,
      total_required: activePlayers.length,
      phase: room.phase,
    };
  }

  /**
   * Casts a vote for a title in the active stage.
   * Enforces self-voting prohibition and single-vote constraint.
   */
  static async submitVote(roomCode: string, sessionToken: string, stageId: string, submissionId: string) {
    const code = roomCode.toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: room } = await supabaseServer
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (!room) {
          throw { status: 404, message: 'Room not found' };
        }

        if (room.phase !== 'VOTING') {
          throw { status: 409, message: 'Room is not in VOTING phase' };
        }

        const { data: players } = await supabaseServer
          .from('players')
          .select('*')
          .eq('room_id', room.id);

        const caller = (players || []).find((p) => p.session_token === sessionToken);
        if (!caller) {
          throw { status: 401, message: 'Invalid session token' };
        }

        const { data: targetSubmission } = await supabaseServer
          .from('submissions')
          .select('*')
          .eq('id', submissionId)
          .eq('stage_id', stageId)
          .maybeSingle();

        if (!targetSubmission) {
          throw { status: 400, message: 'Submission not found in this stage' };
        }

        // Strict Anti-Self-Voting Rule (Principle VIII)
        if (targetSubmission.player_id === caller.id) {
          throw { status: 400, message: 'SELF_VOTING_PROHIBITED: You cannot vote for your own title!' };
        }

        const { data: existingVote } = await supabaseServer
          .from('votes')
          .select('id')
          .eq('stage_id', stageId)
          .eq('voter_player_id', caller.id)
          .maybeSingle();

        if (existingVote) {
          throw { status: 400, message: 'You have already voted in this stage' };
        }

        await supabaseServer.from('votes').insert({
          id: randomUUID(),
          stage_id: stageId,
          voter_player_id: caller.id,
          submission_id: submissionId,
          created_at: new Date().toISOString(),
        });

        const { data: stageVotes } = await supabaseServer
          .from('votes')
          .select('*')
          .eq('stage_id', stageId);

        const activePlayers = (players || []).filter((p) => p.is_connected);
        const allVoted = (stageVotes?.length || 0) >= activePlayers.length;

        let nextPhase: GamePhase = room.phase;

        if (allVoted && activePlayers.length > 0) {
          const { data: allSubmissions } = await supabaseServer
            .from('submissions')
            .select('*')
            .eq('stage_id', stageId);

          const submissionsWithAuthors: SubmissionWithAuthor[] = (allSubmissions || []).map((s) => {
            const author = (players || []).find((p) => p.id === s.player_id);
            return {
              ...s,
              author_nickname: author ? author.nickname : 'Unknown Player',
            };
          });

          const { results, playerScoreDeltas } = calculateStageResults(
            submissionsWithAuthors,
            stageVotes || []
          );

          for (const res of results) {
            const subRecord = (allSubmissions || []).find((s) => s.id === res.submission_id);
            if (subRecord) {
              await supabaseServer.from('stage_scores').upsert(
                {
                  id: randomUUID(),
                  stage_id: stageId,
                  player_id: subRecord.player_id,
                  submission_id: res.submission_id,
                  votes_received: res.votes_received,
                  is_winner: res.is_winner,
                  points_awarded: res.points_awarded,
                },
                { onConflict: 'stage_id,player_id' }
              );
            }
          }

          for (const [playerId, delta] of Object.entries(playerScoreDeltas)) {
            const p = (players || []).find((x) => x.id === playerId);
            if (p) {
              await supabaseServer
                .from('players')
                .update({ score: p.score + delta })
                .eq('id', playerId);
            }
          }

          nextPhase = 'RESULTS';
          await supabaseServer.from('rooms').update({
            phase: 'RESULTS',
            updated_at: new Date().toISOString(),
          }).eq('id', room.id);

          await supabaseServer.from('stages').update({
            phase: 'RESULTS',
            completed_at: new Date().toISOString(),
          }).eq('id', stageId);
        }

        return {
          success: true,
          total_voted: stageVotes?.length || 0,
          total_required: activePlayers.length,
          phase: nextPhase,
        };
      } catch (err: any) {
        if (err?.status) throw err;
        console.error('Supabase submitVote error:', err?.message || err);
      }
    }

    // In-memory fallback
    const room = memoryStore.rooms.get(code);
    if (!room) {
      throw { status: 404, message: 'Room not found' };
    }

    if (room.phase !== 'VOTING') {
      throw { status: 409, message: 'Room is not in VOTING phase' };
    }

    const players = memoryStore.players.get(code) || [];
    const caller = players.find((p) => p.session_token === sessionToken);

    if (!caller) {
      throw { status: 401, message: 'Invalid session token' };
    }

    const stageSubmissions = memoryStore.submissions.get(stageId) || [];
    const targetSubmission = stageSubmissions.find((s) => s.id === submissionId);

    if (!targetSubmission) {
      throw { status: 400, message: 'Submission not found in this stage' };
    }

    // Strict Anti-Self-Voting Rule (Principle VIII)
    if (targetSubmission.player_id === caller.id) {
      throw { status: 400, message: 'SELF_VOTING_PROHIBITED: You cannot vote for your own title!' };
    }

    const stageVotes = memoryStore.votes.get(stageId) || [];
    const existingVote = stageVotes.find((v) => v.voter_player_id === caller.id);
    if (existingVote) {
      throw { status: 400, message: 'You have already voted in this stage' };
    }

    const newVote: Vote = {
      id: randomUUID(),
      stage_id: stageId,
      voter_player_id: caller.id,
      submission_id: submissionId,
      created_at: new Date().toISOString(),
    };

    stageVotes.push(newVote);
    memoryStore.votes.set(stageId, stageVotes);

    const activePlayers = players.filter((p) => p.is_connected);
    const allVoted = stageVotes.length >= activePlayers.length;

    if (allVoted) {
      const submissionsWithAuthors: SubmissionWithAuthor[] = stageSubmissions.map((s) => {
        const author = players.find((p) => p.id === s.player_id);
        return {
          ...s,
          author_nickname: author ? author.nickname : 'Unknown Player',
        };
      });

      const { results, playerScoreDeltas } = calculateStageResults(submissionsWithAuthors, stageVotes);

      memoryStore.stageScores.set(stageId, results);

      players.forEach((p) => {
        if (playerScoreDeltas[p.id]) {
          p.score += playerScoreDeltas[p.id];
        }
      });

      room.phase = 'RESULTS';
      room.updated_at = new Date().toISOString();

      const stages = memoryStore.stages.get(code) || [];
      const currentStage = stages.find((s) => s.id === stageId);
      if (currentStage) {
        currentStage.phase = 'RESULTS';
        currentStage.completed_at = new Date().toISOString();
      }
    }

    return {
      success: true,
      total_voted: stageVotes.length,
      total_required: activePlayers.length,
      phase: room.phase,
    };
  }

  /**
   * Advances from RESULTS to Stage 2 SUBMITTING or to FINISHED (Leaderboard).
   */
  static async advanceStage(roomCode: string, sessionToken: string) {
    const code = roomCode.toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: room } = await supabaseServer
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (!room) {
          throw { status: 404, message: 'Room not found' };
        }

        if (room.phase !== 'RESULTS') {
          throw { status: 409, message: 'Room is not in RESULTS phase' };
        }

        if (room.current_stage_number < TOTAL_STAGES) {
          const nextStageNumber = room.current_stage_number + 1;
          const stageId = randomUUID();
          const picture = CURATED_PICTURES[1] || CURATED_PICTURES[0];

          const { data: game } = await supabaseServer
            .from('games')
            .select('*')
            .eq('room_id', room.id)
            .eq('status', 'IN_PROGRESS')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          await supabaseServer.from('stages').insert({
            id: stageId,
            game_id: game?.id || randomUUID(),
            room_id: room.id,
            stage_number: nextStageNumber,
            picture_id: picture.id,
            phase: 'SUBMITTING',
            started_at: new Date().toISOString(),
          });

          await supabaseServer.from('rooms').update({
            current_stage_number: nextStageNumber,
            phase: 'SUBMITTING',
            updated_at: new Date().toISOString(),
          }).eq('id', room.id);

          return {
            phase: 'SUBMITTING' as GamePhase,
            stage_number: nextStageNumber,
            stage_id: stageId,
          };
        } else {
          await supabaseServer.from('rooms').update({
            phase: 'FINISHED',
            updated_at: new Date().toISOString(),
          }).eq('id', room.id);

          await supabaseServer.from('games').update({
            status: 'COMPLETED',
            completed_at: new Date().toISOString(),
          }).eq('room_id', room.id);

          const { data: players } = await supabaseServer
            .from('players')
            .select('*')
            .eq('room_id', room.id);

          const leaderboard = computeLeaderboard(players || []);

          return {
            phase: 'FINISHED' as GamePhase,
            final_leaderboard: leaderboard,
          };
        }
      } catch (err: any) {
        if (err?.status) throw err;
        console.error('Supabase advanceStage error:', err?.message || err);
      }
    }

    // In-memory fallback
    const room = memoryStore.rooms.get(code);
    if (!room) {
      throw { status: 404, message: 'Room not found' };
    }

    if (room.phase !== 'RESULTS') {
      throw { status: 409, message: 'Room is not in RESULTS phase' };
    }

    if (room.current_stage_number < TOTAL_STAGES) {
      const nextStageNumber = room.current_stage_number + 1;
      const stageId = randomUUID();
      const picture = memoryStore.pictures[1] || memoryStore.pictures[0];

      const stage2: Stage = {
        id: stageId,
        game_id: randomUUID(),
        room_id: room.id,
        stage_number: nextStageNumber,
        picture_id: picture.id,
        phase: 'SUBMITTING',
        started_at: new Date().toISOString(),
        completed_at: null,
      };

      const stages = memoryStore.stages.get(code) || [];
      stages.push(stage2);
      memoryStore.stages.set(code, stages);

      memoryStore.submissions.set(stageId, []);
      memoryStore.votes.set(stageId, []);

      room.current_stage_number = nextStageNumber;
      room.phase = 'SUBMITTING';
      room.updated_at = new Date().toISOString();

      return {
        phase: room.phase,
        stage_number: nextStageNumber,
        stage_id: stageId,
      };
    } else {
      room.phase = 'FINISHED';
      room.updated_at = new Date().toISOString();

      const players = memoryStore.players.get(code) || [];
      const leaderboard = computeLeaderboard(players);

      return {
        phase: 'FINISHED',
        final_leaderboard: leaderboard,
      };
    }
  }

  /**
   * Resets game back to LOBBY for a rematch with the same players.
   */
  static async resetGame(roomCode: string, sessionToken: string) {
    const code = roomCode.toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: room } = await supabaseServer
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (!room) {
          throw { status: 404, message: 'Room not found' };
        }

        const { data: players } = await supabaseServer
          .from('players')
          .select('*')
          .eq('room_id', room.id);

        const caller = (players || []).find((p) => p.session_token === sessionToken);
        if (!caller || !caller.is_host) {
          throw { status: 403, message: 'Only the host can reset the game' };
        }

        await supabaseServer
          .from('players')
          .update({ score: 0 })
          .eq('room_id', room.id);

        await supabaseServer.from('rooms').update({
          phase: 'LOBBY',
          current_stage_number: 1,
          updated_at: new Date().toISOString(),
        }).eq('id', room.id);

        return {
          phase: 'LOBBY' as GamePhase,
          current_stage_number: 1,
        };
      } catch (err: any) {
        if (err?.status) throw err;
        console.error('Supabase resetGame error:', err?.message || err);
      }
    }

    // In-memory fallback
    const room = memoryStore.rooms.get(code);
    if (!room) {
      throw { status: 404, message: 'Room not found' };
    }

    const players = memoryStore.players.get(code) || [];
    const caller = players.find((p) => p.session_token === sessionToken);

    if (!caller || !caller.is_host) {
      throw { status: 403, message: 'Only the host can reset the game' };
    }

    players.forEach((p) => {
      p.score = 0;
    });

    room.phase = 'LOBBY';
    room.current_stage_number = 1;
    room.updated_at = new Date().toISOString();

    memoryStore.stages.set(code, []);
    memoryStore.stageScores.clear();

    return {
      phase: 'LOBBY',
      current_stage_number: 1,
    };
  }

  /**
   * Handles player leaving and host reassignment.
   */
  static async leaveRoom(roomCode: string, sessionToken: string) {
    const code = roomCode.toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: room } = await supabaseServer
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (!room) {
          throw { status: 404, message: 'Room not found' };
        }

        const { data: players } = await supabaseServer
          .from('players')
          .select('*')
          .eq('room_id', room.id)
          .order('joined_at', { ascending: true });

        const leavingPlayer = (players || []).find((p) => p.session_token === sessionToken);
        if (!leavingPlayer) {
          return { success: true };
        }

        await supabaseServer.from('players').delete().eq('id', leavingPlayer.id);

        const remainingPlayers = (players || []).filter((p) => p.id !== leavingPlayer.id);
        let newHostId = room.host_player_id;

        if (leavingPlayer.is_host && remainingPlayers.length > 0) {
          newHostId = remainingPlayers[0].id;
          await supabaseServer.from('players').update({ is_host: true }).eq('id', newHostId);
          await supabaseServer.from('rooms').update({ host_player_id: newHostId }).eq('id', room.id);
        }

        return {
          success: true,
          remaining_players: remainingPlayers.length,
          new_host_id: newHostId,
        };
      } catch (err: any) {
        if (err?.status) throw err;
        console.error('Supabase leaveRoom error:', err?.message || err);
      }
    }

    // In-memory fallback
    const room = memoryStore.rooms.get(code);
    if (!room) {
      throw { status: 404, message: 'Room not found' };
    }

    let players = memoryStore.players.get(code) || [];
    const leavingPlayer = players.find((p) => p.session_token === sessionToken);

    if (!leavingPlayer) {
      return { success: true };
    }

    players = players.filter((p) => p.id !== leavingPlayer.id);
    memoryStore.players.set(code, players);

    if (leavingPlayer.is_host && players.length > 0) {
      players[0].is_host = true;
      room.host_player_id = players[0].id;
    }

    return {
      success: true,
      remaining_players: players.length,
      new_host_id: room.host_player_id,
    };
  }

  /**
   * Retrieves full authoritative room state for a player (hydration/reconnect).
   */
  static async getRoomState(roomCode: string, sessionToken: string): Promise<RoomState> {
    const code = roomCode.toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: room } = await supabaseServer
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (!room) {
          throw { status: 404, message: 'Room not found' };
        }

        const { data: players } = await supabaseServer
          .from('players')
          .select('*')
          .eq('room_id', room.id)
          .order('joined_at', { ascending: true });

        const me = (players || []).find((p) => p.session_token === sessionToken);
        if (!me) {
          throw { status: 401, message: 'Invalid session token for this room' };
        }

        const { data: stages } = await supabaseServer
          .from('stages')
          .select('*')
          .eq('room_id', room.id)
          .eq('stage_number', room.current_stage_number)
          .order('started_at', { ascending: false })
          .limit(1);

        const currentStage = stages && stages.length > 0 ? stages[0] : null;
        const picture = currentStage
          ? CURATED_PICTURES.find((p) => p.id === currentStage.picture_id) || CURATED_PICTURES[0]
          : null;

        const { data: submissions } = currentStage
          ? await supabaseServer.from('submissions').select('*').eq('stage_id', currentStage.id)
          : { data: [] };

        const { data: votes } = currentStage
          ? await supabaseServer.from('votes').select('*').eq('stage_id', currentStage.id)
          : { data: [] };

        const { data: dbStageScores } = currentStage
          ? await supabaseServer.from('stage_scores').select('*').eq('stage_id', currentStage.id)
          : { data: [] };

        const hasSubmitted = currentStage
          ? (submissions || []).some((s) => s.player_id === me.id)
          : false;

        const hasVoted = currentStage
          ? (votes || []).some((v) => v.voter_player_id === me.id)
          : false;

        const votingOptions = currentStage
          ? (submissions || [])
              .filter((s) => s.player_id !== me.id)
              .map((s) => ({ submission_id: s.id, title: s.title }))
          : [];

        let stageResults: StageResultItem[] = [];
        if (dbStageScores && dbStageScores.length > 0) {
          stageResults = dbStageScores.map((sc) => {
            const sub = (submissions || []).find((s) => s.id === sc.submission_id);
            const author = (players || []).find((p) => p.id === sc.player_id);
            return {
              submission_id: sc.submission_id,
              title: sub?.title || 'Untitled',
              author_nickname: author?.nickname || 'Unknown Player',
              votes_received: sc.votes_received,
              is_winner: sc.is_winner,
              points_awarded: sc.points_awarded,
            };
          });
          stageResults.sort((a, b) => b.votes_received - a.votes_received);
        } else if (room.phase === 'RESULTS' && submissions && votes) {
          const submissionsWithAuthors: SubmissionWithAuthor[] = submissions.map((s) => {
            const author = (players || []).find((p) => p.id === s.player_id);
            return { ...s, author_nickname: author ? author.nickname : 'Unknown Player' };
          });
          const computed = calculateStageResults(submissionsWithAuthors, votes);
          stageResults = computed.results;
        }

        const finalLeaderboard = computeLeaderboard(players || []);

        return {
          room_id: room.id,
          room_code: room.room_code,
          phase: room.phase,
          current_stage_number: room.current_stage_number,
          host_player_id: room.host_player_id,
          players: (players || []).map((p) => ({
            id: p.id,
            nickname: p.nickname,
            is_host: p.is_host,
            score: p.score,
            is_connected: p.is_connected,
          })),
          me: {
            id: me.id,
            nickname: me.nickname,
            is_host: me.is_host,
            score: me.score,
            has_submitted: hasSubmitted,
            has_voted: hasVoted,
          },
          current_stage:
            currentStage && picture
              ? {
                  stage_id: currentStage.id,
                  stage_number: currentStage.stage_number,
                  picture_url: picture.image_url,
                  picture_description: picture.description,
                  task_prompt: 'Give this tattoo your funniest title.',
                }
              : null,
          voting_options: votingOptions,
          stage_results: stageResults,
          final_leaderboard: finalLeaderboard,
        };
      } catch (err: any) {
        if (err?.status) throw err;
        console.error('Supabase getRoomState error:', err?.message || err);
      }
    }

    // In-memory fallback
    const room = memoryStore.rooms.get(code);
    if (!room) {
      throw { status: 404, message: 'Room not found' };
    }

    const players = memoryStore.players.get(code) || [];
    const me = players.find((p) => p.session_token === sessionToken);

    if (!me) {
      throw { status: 401, message: 'Invalid session token for this room' };
    }

    const stages = memoryStore.stages.get(code) || [];
    const currentStage = stages.find((s) => s.stage_number === room.current_stage_number);
    const picture = currentStage ? memoryStore.pictures.find((p) => p.id === currentStage.picture_id) || memoryStore.pictures[0] : null;

    const submissions = currentStage ? memoryStore.submissions.get(currentStage.id) || [] : [];
    const votes = currentStage ? memoryStore.votes.get(currentStage.id) || [] : [];

    const hasSubmitted = currentStage ? submissions.some((s) => s.player_id === me.id) : false;
    const hasVoted = currentStage ? votes.some((v) => v.voter_player_id === me.id) : false;

    // Strict self-omission from voting options (Principle VIII)
    const votingOptions = currentStage
      ? submissions
          .filter((s) => s.player_id !== me.id)
          .map((s) => ({ submission_id: s.id, title: s.title }))
      : [];

    const stageResults = currentStage ? (memoryStore.stageScores.get(currentStage.id) || []) : [];
    const finalLeaderboard = computeLeaderboard(players);

    return {
      room_id: room.id,
      room_code: room.room_code,
      phase: room.phase,
      current_stage_number: room.current_stage_number,
      host_player_id: room.host_player_id,
      players: players.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        is_host: p.is_host,
        score: p.score,
        is_connected: p.is_connected,
      })),
      me: {
        id: me.id,
        nickname: me.nickname,
        is_host: me.is_host,
        score: me.score,
        has_submitted: hasSubmitted,
        has_voted: hasVoted,
      },
      current_stage: currentStage && picture
        ? {
            stage_id: currentStage.id,
            stage_number: currentStage.stage_number,
            picture_url: picture.image_url,
            picture_description: picture.description,
            task_prompt: 'Give this tattoo your funniest title.',
          }
        : null,
      voting_options: votingOptions,
      stage_results: stageResults,
      final_leaderboard: finalLeaderboard,
    };
  }

  /**
   * Admin: Force start the game under any conditions (with any number of players).
   */
  static async forceStartGame(roomCode: string, password: string) {
    if (password !== 'Passw0rd_is_zer0') {
      throw { status: 401, message: 'Invalid admin password' };
    }

    const code = roomCode.toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: room } = await supabaseServer
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (!room) {
          throw { status: 404, message: 'Room not found' };
        }

        // Ensure pictures catalog is seeded
        await supabaseServer.from('pictures').upsert(
          CURATED_PICTURES.map((p) => ({
            id: p.id,
            image_url: p.image_url,
            description: p.description,
            is_active: p.is_active,
          })),
          { onConflict: 'id' }
        );

        const picture = CURATED_PICTURES[0];
        const stageId = randomUUID();
        const gameId = randomUUID();

        await supabaseServer.from('games').insert({
          id: gameId,
          room_id: room.id,
          total_stages: TOTAL_STAGES,
          status: 'IN_PROGRESS',
        });

        await supabaseServer.from('stages').insert({
          id: stageId,
          game_id: gameId,
          room_id: room.id,
          stage_number: 1,
          picture_id: picture.id,
          phase: 'SUBMITTING',
          started_at: new Date().toISOString(),
        });

        await supabaseServer
          .from('rooms')
          .update({
            phase: 'SUBMITTING',
            current_stage_number: 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', room.id);

        return {
          phase: 'SUBMITTING' as GamePhase,
          stage_number: 1,
          stage_id: stageId,
          picture_url: picture.image_url,
          picture_description: picture.description,
        };
      } catch (err: any) {
        if (err?.status) throw err;
        console.error('Supabase forceStartGame error:', err?.message || err);
      }
    }

    // In-memory fallback
    const room = memoryStore.rooms.get(code);
    if (!room) {
      throw { status: 404, message: 'Room not found' };
    }

    const stageId = randomUUID();
    const picture = memoryStore.pictures[0];

    const stage1: Stage = {
      id: stageId,
      game_id: randomUUID(),
      room_id: room.id,
      stage_number: 1,
      picture_id: picture.id,
      phase: 'SUBMITTING',
      started_at: new Date().toISOString(),
      completed_at: null,
    };

    room.phase = 'SUBMITTING';
    room.current_stage_number = 1;
    room.updated_at = new Date().toISOString();

    memoryStore.stages.set(code, [stage1]);
    memoryStore.submissions.set(stageId, []);
    memoryStore.votes.set(stageId, []);

    return {
      phase: room.phase,
      stage_number: 1,
      stage_id: stageId,
      picture_url: picture.image_url,
      picture_description: picture.description,
    };
  }

  /**
   * Admin: Restart lobby to a clean slate (reset all scores, phases, and submissions).
   */
  static async forceResetLobby(roomCode: string, password: string) {
    if (password !== 'Passw0rd_is_zer0') {
      throw { status: 401, message: 'Invalid admin password' };
    }

    const code = roomCode.toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: room } = await supabaseServer
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (!room) {
          throw { status: 404, message: 'Room not found' };
        }

        // Delete all stage data and scores for this room
        const { data: roomStages } = await supabaseServer
          .from('stages')
          .select('id')
          .eq('room_id', room.id);

        if (roomStages && roomStages.length > 0) {
          const stageIds = roomStages.map((s) => s.id);
          await supabaseServer.from('stage_scores').delete().in('stage_id', stageIds);
          await supabaseServer.from('votes').delete().in('stage_id', stageIds);
          await supabaseServer.from('submissions').delete().in('stage_id', stageIds);
          await supabaseServer.from('stages').delete().eq('room_id', room.id);
        }

        await supabaseServer.from('games').delete().eq('room_id', room.id);

        // Reset player scores
        await supabaseServer
          .from('players')
          .update({ score: 0 })
          .eq('room_id', room.id);

        // Reset room to LOBBY
        await supabaseServer
          .from('rooms')
          .update({
            phase: 'LOBBY',
            current_stage_number: 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', room.id);

        return {
          phase: 'LOBBY' as GamePhase,
          current_stage_number: 1,
        };
      } catch (err: any) {
        if (err?.status) throw err;
        console.error('Supabase forceResetLobby error:', err?.message || err);
      }
    }

    // In-memory fallback
    const room = memoryStore.rooms.get(code);
    if (!room) {
      throw { status: 404, message: 'Room not found' };
    }

    const players = memoryStore.players.get(code) || [];
    players.forEach((p) => {
      p.score = 0;
    });

    room.phase = 'LOBBY';
    room.current_stage_number = 1;
    room.updated_at = new Date().toISOString();

    memoryStore.stages.set(code, []);
    memoryStore.stageScores.clear();

    return {
      phase: 'LOBBY' as GamePhase,
      current_stage_number: 1,
    };
  }

  /**
   * Admin: Force advance stage or phase.
   */
  static async forceAdvance(roomCode: string, password: string) {
    if (password !== 'Passw0rd_is_zer0') {
      throw { status: 401, message: 'Invalid admin password' };
    }

    const code = roomCode.toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: room } = await supabaseServer
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (!room) {
          throw { status: 404, message: 'Room not found' };
        }

        if (room.phase === 'LOBBY') {
          return this.forceStartGame(code, password);
        } else if (room.phase === 'SUBMITTING') {
          await supabaseServer
            .from('rooms')
            .update({ phase: 'VOTING', updated_at: new Date().toISOString() })
            .eq('id', room.id);
          return { phase: 'VOTING' as GamePhase, current_stage_number: room.current_stage_number };
        } else if (room.phase === 'VOTING') {
          await supabaseServer
            .from('rooms')
            .update({ phase: 'RESULTS', updated_at: new Date().toISOString() })
            .eq('id', room.id);
          return { phase: 'RESULTS' as GamePhase, current_stage_number: room.current_stage_number };
        } else if (room.phase === 'RESULTS') {
          if (room.current_stage_number < TOTAL_STAGES) {
            const nextStage = room.current_stage_number + 1;
            const stageId = randomUUID();
            const picture = CURATED_PICTURES[1] || CURATED_PICTURES[0];

            await supabaseServer.from('stages').insert({
              id: stageId,
              game_id: randomUUID(),
              room_id: room.id,
              stage_number: nextStage,
              picture_id: picture.id,
              phase: 'SUBMITTING',
              started_at: new Date().toISOString(),
            });

            await supabaseServer
              .from('rooms')
              .update({
                phase: 'SUBMITTING',
                current_stage_number: nextStage,
                updated_at: new Date().toISOString(),
              })
              .eq('id', room.id);

            return { phase: 'SUBMITTING' as GamePhase, current_stage_number: nextStage };
          } else {
            await supabaseServer
              .from('rooms')
              .update({ phase: 'FINISHED', updated_at: new Date().toISOString() })
              .eq('id', room.id);
            return { phase: 'FINISHED' as GamePhase, current_stage_number: 2 };
          }
        } else {
          return this.forceResetLobby(code, password);
        }
      } catch (err: any) {
        if (err?.status) throw err;
        console.error('Supabase forceAdvance error:', err?.message || err);
      }
    }

    // In-memory fallback
    const room = memoryStore.rooms.get(code);
    if (!room) {
      throw { status: 404, message: 'Room not found' };
    }

    if (room.phase === 'LOBBY') {
      return this.forceStartGame(code, password);
    } else if (room.phase === 'SUBMITTING') {
      room.phase = 'VOTING';
      room.updated_at = new Date().toISOString();
      return { phase: 'VOTING' as GamePhase, current_stage_number: room.current_stage_number };
    } else if (room.phase === 'VOTING') {
      room.phase = 'RESULTS';
      room.updated_at = new Date().toISOString();
      return { phase: 'RESULTS' as GamePhase, current_stage_number: room.current_stage_number };
    } else if (room.phase === 'RESULTS') {
      if (room.current_stage_number < TOTAL_STAGES) {
        room.current_stage_number += 1;
        room.phase = 'SUBMITTING';
        room.updated_at = new Date().toISOString();
        return { phase: 'SUBMITTING' as GamePhase, current_stage_number: room.current_stage_number };
      } else {
        room.phase = 'FINISHED';
        room.updated_at = new Date().toISOString();
        return { phase: 'FINISHED' as GamePhase, current_stage_number: 2 };
      }
    } else {
      return this.forceResetLobby(code, password);
    }
  }

  static _resetMemoryStore() {
    memoryStore.rooms.clear();
    memoryStore.players.clear();
    memoryStore.stages.clear();
    memoryStore.submissions.clear();
    memoryStore.votes.clear();
    memoryStore.stageScores.clear();
  }
}
