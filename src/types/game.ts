export type GamePhase = 'LOBBY' | 'SUBMITTING' | 'VOTING' | 'RESULTS' | 'FINISHED';
export type StagePhase = 'SUBMITTING' | 'VOTING' | 'RESULTS';
export type GameStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface Picture {
  id: string;
  image_url: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Room {
  id: string;
  room_code: string;
  host_player_id: string | null;
  phase: GamePhase;
  current_stage_number: number;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  nickname: string;
  session_token: string;
  is_host: boolean;
  score: number;
  is_connected: boolean;
  joined_at: string;
}

export interface GameSession {
  id: string;
  room_id: string;
  total_stages: number;
  status: GameStatus;
  created_at: string;
  completed_at: string | null;
}

export interface Stage {
  id: string;
  game_id: string;
  room_id: string;
  stage_number: number;
  picture_id: string;
  phase: StagePhase;
  started_at: string;
  completed_at: string | null;
}

export interface Submission {
  id: string;
  stage_id: string;
  player_id: string;
  title: string;
  created_at: string;
}

export interface Vote {
  id: string;
  stage_id: string;
  voter_player_id: string;
  submission_id: string;
  created_at: string;
}

export interface StageScore {
  id: string;
  stage_id: string;
  player_id: string;
  submission_id: string;
  votes_received: number;
  is_winner: boolean;
  points_awarded: number;
  created_at: string;
}

export interface PlayerSummary {
  id: string;
  nickname: string;
  is_host: boolean;
  score: number;
  is_connected: boolean;
}

export interface CurrentPlayer {
  id: string;
  nickname: string;
  is_host: boolean;
  score: number;
  has_submitted: boolean;
  has_voted: boolean;
}

export interface ActiveStageInfo {
  stage_id: string;
  stage_number: number;
  picture_url: string;
  picture_description: string | null;
  task_prompt: string;
}

export interface VotingOption {
  submission_id: string;
  title: string;
}

export interface StageResultItem {
  submission_id: string;
  title: string;
  author_nickname: string;
  votes_received: number;
  is_winner: boolean;
  points_awarded: number;
}

export interface LeaderboardEntry {
  rank: number;
  player_id: string;
  nickname: string;
  total_score: number;
  is_champion: boolean;
}

export interface RoomState {
  room_id: string;
  room_code: string;
  phase: GamePhase;
  current_stage_number: number;
  host_player_id: string | null;
  players: PlayerSummary[];
  me: CurrentPlayer | null;
  current_stage: ActiveStageInfo | null;
  voting_options: VotingOption[];
  stage_results: StageResultItem[];
  final_leaderboard: LeaderboardEntry[];
}

export type RealtimeEventPayload =
  | { type: 'room_phase_changed'; payload: { phase: GamePhase; current_stage_number: number; stage_id?: string; picture_url?: string } }
  | { type: 'player_joined'; payload: PlayerSummary }
  | { type: 'player_left'; payload: { player_id: string; new_host_id: string | null } }
  | { type: 'submission_received'; payload: { player_id: string; total_submitted: number; total_required: number } }
  | { type: 'voting_started'; payload: { stage_id: string } }
  | { type: 'vote_received'; payload: { total_voted: number; total_required: number } }
  | { type: 'results_revealed'; payload: { results: StageResultItem[]; updated_scores: { player_id: string; score: number }[] } }
  | { type: 'game_finished'; payload: { final_leaderboard: LeaderboardEntry[] } };
