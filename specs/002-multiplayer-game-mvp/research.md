# Research & Technical Decisions: Multiplayer Party Game MVP

**Feature**: `002-multiplayer-game-mvp`
**Date**: 2026-08-23

## Phase 0 Research Findings

### 1. State Machine & Real-Time Synchronization Model

- **Decision**: Hybrid Server Actions + Supabase Realtime Channels (Broadcast + Postgres Changes fallback) with client-side optimistic UI disabled in favor of authoritative server state.
- **Rationale**:
  - The project constitution explicitly prohibits client-side authority for game phases, voting eligibility, and score calculation.
  - Server Actions/Route Handlers execute mutations atomically on PostgreSQL.
  - Once database state commits, Supabase Realtime broadcasts discrete lifecycle events to the room channel `room:${room_code}`.
  - Reconnecting clients query the authoritative `/api/rooms/[code]/state` endpoint on reload using their stored session token, ensuring state recovery in < 500ms without desynchronization.
- **Alternatives Considered**:
  - *Custom Node.js WebSocket Server (Socket.io/ws)*: Rejected per Principle VI (Anti-Overengineering). Next.js + Supabase Realtime provides native, serverless-compatible pub/sub without maintaining a dedicated persistent server process.
  - *Pure Polling (SWR/React Query)*: Rejected because polling introduces latency jitter and unnecessary database load during fast-paced party game transitions.

### 2. Picture Catalog & 2-Stage Assignment Strategy

- **Decision**: Pre-seeded relational `pictures` table containing curated, humorous tattoo image URLs with a server-side pseudo-random selection per game session.
- **Rationale**:
  - In MVP, each game session consists of exactly 2 stages (`stage_number` 1 and 2).
  - When the host starts the game, the server picks 2 distinct active pictures from the curated catalog and assigns Picture #1 to Stage 1 and Picture #2 to Stage 2.
  - In Stage 1, all players receive Picture #1 and submit 1 title.
  - In Stage 2, all players receive Picture #2 and submit 1 title.
  - This guarantees every player contributes exactly 2 titles across the game session while keeping the prompt context shared and comedic for all players in the room.
- **Alternatives Considered**:
  - *Split-pair picture assignments (Jackbox Drawful style)*: Assigning different pictures to different pairs of players increases complexity unnecessarily for a 3–8 player MVP. A shared stage picture maximizes audience engagement during the voting and reveal phases.

### 3. Anti-Self-Voting & Fair Voting Architecture

- **Decision**: Multi-layered voting protection:
  1. **Client UI Filtering**: When a player fetches voting choices or receives the `voting_started` broadcast, the server filters out that specific player's submission ID.
  2. **Server-Side Validation Guard**: When `submitVote` executes, the server queries the submission record: if `submission.player_id == caller.player_id`, the vote is rejected with HTTP 400 (`SELF_VOTING_PROHIBITED`).
  3. **Database Unique Constraint**: `UNIQUE(stage_id, voter_player_id)` guarantees a voter can only cast 1 vote per stage.
  4. **Anonymization & Randomization**: Submissions presented in voting are stripped of author nicknames and shuffled using a deterministic Fisher-Yates shuffle seeded per player view.
- **Rationale**: Completely enforces Principle VIII (Fair & Enforced Voting Rules) even against malicious API calls or manipulated browser state.

### 4. Player Session & Guest Identity Model

- **Decision**: Transient, cookie/localStorage session tokens (`session_token` UUID v4) mapped to `players.session_token`.
- **Rationale**:
  - Eliminates user registration / login friction for party game guests.
  - When a user hosts or joins, the server issues a `session_token` stored in the browser's `sessionStorage` (or `localStorage`).
  - If a player refreshes their browser or loses connection, the client sends `session_token` in the request header or payload to resume their exact player session without losing their nickname, score, or submitted votes.
- **Alternatives Considered**:
  - *Full Supabase Auth with Anonymous Logins*: Adds overhead and unnecessary auth tables for guest party gameplay. A lightweight UUID `session_token` with room scoping satisfies all security and recovery requirements.

### 5. Scoring & Deterministic Tie-Breaking Algorithm

- **Decision**:
  - Points formula: `100 * votes_received + (is_winner ? 250 : 0)`.
  - Tie-breaking: If multiple submissions in a stage tie for maximum votes (e.g. 2 submissions both have 2 votes), **both submissions receive the 250-point winner bonus** and are displayed as co-winners in results.
  - Final leaderboard rankings: Players sorted by `score` DESC; players with identical scores share the same numerical rank.
- **Rationale**: Simple, transparent, highly motivating for players, and adheres strictly to the product specification.

### 6. Room Code Generation & Collision Avoidance

- **Decision**: 4-character uppercase alphanumeric string using a base-32 charset excluding ambiguous characters (`A-Z, 2-9` excluding `I, O, 1, 0`).
- **Rationale**: Yields $32^4 = 1,048,576$ active room combinations. The generation helper queries for active room code existence and retries up to 5 times in the rare event of a collision.
