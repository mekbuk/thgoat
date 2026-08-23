<!--
Sync Impact Report
Version change: 1.0.0 → 2.0.0
List of modified principles:
  - Redefined project foundation from single-player drawing canvas to multiplayer room-based party game.
  - Replaced former principles I-VIII with 12 comprehensive multiplayer architecture principles:
    * Principle I: Authoritative Server Game State (replaces client-side / decoupled canvas assumptions)
    * Principle II: Real-Time Multiplayer Synchronization (replaces passive storage viewing)
    * Principle III: Strict Room Isolation (replaces global single-player persistence)
    * Principle IV: Explicit Game State Machine & Phases (formalizes LOBBY, SUBMITTING, VOTING, RESULTS, FINISHED)
    * Principle V: Persistent Data Integrity & Mutation Guards (adds server guards against duplicates & self-voting)
    * Principle VI: Architectural Simplicity & Stack Discipline (standardizes Next.js, TS, React, Supabase/Postgres)
    * Principle VII: Intuitive & Transparent User Experience (replaces drawing UI with multiplayer picture-title prompt UX)
    * Principle VIII: Fair & Enforced Voting Rules (mandates self-vote UI omission and server-level blocking)
    * Principle IX: Server-Calculated Scoring & Resolution (mandates server-side winner & score tabulation)
    * Principle X: Controlled Extensibility (defines YAGNI guardrails and future extension paths)
    * Principle XI: Independent Testability of Game Logic (ensures headless state machine & scoring testability)
    * Principle XII: Robust Room & Action Security (mandates room code entropy, player token validation, and host role checks)
Added sections:
  - Explicit State Machine Specification (LOBBY, SUBMITTING, VOTING, RESULTS, FINISHED)
  - Real-Time Synchronization & Room Isolation Architecture
  - Anti-Self-Voting and Fair Scoring Guarantees
  - Room & Action Security Policies
Removed sections:
  - Single-player canvas drawing engine details (Konva.js stroke stacks, undo/redo buffers)
  - Binary image object storage two-tier architecture
Templates requiring updates:
  - .specify/templates/plan-template.md (✅ aligned)
  - .specify/templates/spec-template.md (✅ aligned)
  - .specify/templates/tasks-template.md (✅ aligned)
Follow-up TODOs:
  - None
-->

# Throat Goat Constitution

## Core Principles

### I. Authoritative Server Game State
- The client MUST NEVER be trusted to determine, compute, or mutate game state directly.
- The server MUST be the sole authoritative source of truth for:
  1. Current game stage (MVP consists of exactly 2 stages) and active game phase.
  2. Game initiation, stage progression, and game completion.
  3. Player submission eligibility and whether a player has submitted for the active stage.
  4. Player voting eligibility and options presented.
  5. Absolute prevention of self-voting under all network or client conditions.
  6. Vote tallying and tie-breaking.
  7. Round winners and score increments.
  8. Final leaderboard standings.
- All game-state transitions, submissions, and votes MUST be validated on the server before mutating database state.

### II. Real-Time Multiplayer Synchronization
- All players in a room MUST receive live game-state updates automatically without requiring manual page reloads or polling.
- The real-time messaging layer (Supabase Realtime / Postgres Changes / Broadcast / Presence) MUST reliably propagate:
  1. Player join and leave events.
  2. Host initiating the game start.
  3. Stage and phase transitions (`LOBBY` → `SUBMITTING` → `VOTING` → `RESULTS` → `FINISHED`).
  4. Submission progress indicators (e.g., "3/5 players submitted") without leaking submission content prematurely.
  5. Transition into the voting phase with sanitized voting choices.
  6. Vote completion and round results reveals.
  7. Live score updates and final leaderboard presentation.

### III. Strict Room Isolation
- Players MUST only be able to view, receive events for, and interact with the specific game room they have joined.
- Every room MUST maintain complete isolation of its domain data:
  1. Unique, unguessable room code.
  2. Designated host player with administrative control (e.g., starting game, advancing stages).
  3. Active player roster (player ID, display name, connection status, cumulative score).
  4. Active game phase and stage index (Stage 1 and Stage 2 in MVP).
  5. Stage-specific prompt picture and task description.
  6. Room-specific player submissions.
  7. Room-specific votes.
  8. Room-specific leaderboard and score totals.
- Cross-room data leakage or event broadcasting across room boundaries is strictly prohibited.

### IV. Explicit Game State Machine & Phases
- The game lifecycle MUST be modeled as a strict, deterministic finite state machine rather than arbitrary client booleans or ad-hoc flags.
- The room MUST transition through explicit, discrete states:
  - `LOBBY`: Players assemble via room code; host waits for sufficient players and triggers start.
  - `SUBMITTING`: Players view the stage picture and task, then submit their humorous title.
  - `VOTING`: All submitted titles (excluding each player's own submission) are presented for voting.
  - `RESULTS`: Server reveals vote distribution, awards points to winning title(s), and displays stage standings.
  - `FINISHED`: Concludes after Stage 2; displays final leaderboard and crowns the overall winner.
- Invalid state transitions (e.g., submitting during `VOTING`, voting during `RESULTS`, starting from `SUBMITTING`) MUST be rejected immediately by the server.

### V. Persistent Data Integrity & Mutation Guards
- All rooms, player records, submissions, votes, and scores MUST be persistently stored in PostgreSQL / Supabase.
- The server and database layer MUST enforce strict integrity constraints:
  1. **Single Submission Guard**: Exactly one submission per player per stage. Duplicate submissions must be rejected.
  2. **Single Vote Guard**: Exactly one vote per player per stage. Duplicate votes must be rejected.
  3. **Self-Voting Prohibition**: Votes casting for a submission authored by the voting player must be blocked with an error.
  4. **Phase Guard**: Submissions are strictly prohibited outside `SUBMITTING`; votes are strictly prohibited outside `VOTING`.
  5. **Host Authorization Guard**: Non-host players attempting host actions (start game, advance phase) must be denied.
  6. **Atomic Transitions**: Round completion checks and score increments must execute atomically to prevent race conditions when multiple players submit/vote simultaneously.

### VI. Architectural Simplicity & Stack Discipline
- The architecture for the MVP MUST remain minimal, direct, and free of overengineering.
- The mandatory technology stack is:
  - **Framework**: Next.js (App Router, Server Actions / Route Handlers, React Server Components)
  - **Language**: TypeScript with strict mode enabled (`noImplicitAny`, strict null checks)
  - **Frontend UI**: React 19, Tailwind CSS
  - **Database & Realtime**: PostgreSQL via Supabase (Database, Supabase Realtime, Row-Level Security / Server APIs)
  - **Runtime Validation**: Zod for all client inputs, API payloads, and database boundary validation
  - **Testing**: Vitest (unit/integration), React Testing Library (components), Playwright (E2E)
- Microservices, Kubernetes, Redis caches, Kafka/RabbitMQ message queues, GraphQL layers, or separate custom WebSocket servers MUST NOT be introduced for the MVP.

### VII. Intuitive & Transparent User Experience
- The game MUST be instantly playable and understandable without an instructional manual or onboarding tutorial.
- Players MUST always have visual clarity on:
  1. Current stage indicator (e.g., "Stage 1 of 2").
  2. Active game phase with clear task guidance (e.g., "Write the funniest title for this picture!").
  3. High-visibility prompt picture centered and responsive across desktop and mobile devices.
  4. Submission and voting countdown/status indicators.
  5. Available voting options formatted cleanly for fast scanning.
  6. Clear score changes, winner highlights, and celebratory final leaderboard presentation.
- The visual presentation MUST embody a humorous, tongue-in-cheek meme aesthetic while preserving high contrast, accessibility, and mobile-friendly touch targets.

### VIII. Fair & Enforced Voting Rules
- A player's own submission MUST NEVER be displayed as a selectable option in that player's voting view.
- Submissions displayed during the voting phase MUST be presented anonymously and in randomized order to eliminate ordering or creator bias.
- The server MUST enforce self-voting prevention independently of client behavior; if a modified client attempts to vote for the player's own submission ID, the server MUST reject the transaction.

### IX. Server-Calculated Scoring & Resolution
- The server MUST calculate vote totals, handle ties, assign points, and compute cumulative player rankings.
- Client applications act solely as presentation layers and MUST NOT calculate, modify, or predict scores.
- Scoring rules:
  1. The title receiving the most votes in each stage wins the round.
  2. Points are awarded to winning player(s) authoritatively on the server.
  3. Updated scores and stage winners are committed to PostgreSQL and broadcast simultaneously to all room participants.

### X. Controlled Extensibility (YAGNI & Feature Gating)
- The codebase architecture MUST be designed cleanly to allow future modular enhancements without breaking existing flows, BUT features outside the MVP scope MUST NOT be implemented prematurely.
- Future capabilities reserved for subsequent specifications:
  - Configurable stage counts (> 2 stages).
  - Dynamic / user-uploaded picture sets.
  - Custom game modes and timed prompt countdowns.
  - Player avatar generation and customization.
  - Persistent user authentication and player profiles.
  - Spectator mode for non-player participants.
  - Weighted or multi-tier voting mechanics.
  - Global leaderboards and match history replays.
- Developers MUST NOT build abstractions or database columns for these features until explicitly required by an active feature specification.

### XI. Independent Testability of Game Logic
- Core game state transitions, voting validation rules, scoring logic, and room lifecycle MUST be decoupled from UI components and testable independently.
- Automated tests MUST cover:
  1. State machine progression across all phases (`LOBBY` → `SUBMITTING` → `VOTING` → `RESULTS` → `FINISHED`).
  2. Submission uniqueness, vote uniqueness, and rejection of self-votes.
  3. Tie-breaking and score calculation under varied voting distributions.
  4. Room code entropy and isolation verification.
  5. Unauthorized action prevention (non-host start, out-of-phase mutations).

### XII. Robust Room & Action Security
- Room codes MUST be generated with sufficient entropy to prevent brute-force guessing or enumeration attacks.
- Every server endpoint, Server Action, and database mutation MUST validate:
  1. Room membership (verifying the player is a registered member of the target room).
  2. Player identity and session token validity.
  3. Host permissions for administrative room actions.
  4. Phase validity (verifying the action is permitted in the current room phase).
  5. Submission and voting eligibility.
- Database access MUST enforce strict security boundaries using Supabase Row-Level Security (RLS) policies and/or authenticated server-side handlers.

## Technology Stack & Runtime Standards

- **Language**: TypeScript 5.x (`strict: true`, no implicit `any`)
- **Web Framework**: Next.js (App Router, Server Actions, Route Handlers, React Server Components)
- **UI & Styling**: React 19, Tailwind CSS, Lucide icons
- **Database & Storage**: PostgreSQL (hosted via Supabase)
- **Real-Time Communication**: Supabase Realtime (Channels, Broadcast, Presence, Database Changes)
- **Validation**: Zod runtime schema validation for all API inputs, client forms, and environment variables
- **Testing**: Vitest, React Testing Library, Playwright
- **Runtime Constraints**: Node.js LTS; no external microservices, container orchestrators, or distributed caching layers.

## Security & Data Handling Standards

1. **Zero-Trust Input Sanitization**: All player nicknames, submitted titles, and room codes must be sanitized against XSS, SQL injection, and payload tampering via Zod schemas.
2. **Session & Identity Isolation**: Player sessions must be tracked via secure, server-validated session tokens or cookies scoped strictly to the player's active room.
3. **Phase-Gated Access Control**: Mutations must explicitly check room phase before accepting submissions or votes.
4. **Data Minimization**: Collect only essential game data (room code, player name/session, stage submissions, votes, scores). No unnecessary PII collection in MVP.
5. **Graceful Error Handling & Reconnection**: Clients must handle transient network disconnects gracefully and resynchronize with the authoritative server game state upon reconnection.

## Governance

- This Constitution is the authoritative single source of architectural truth for the Throat Goat project.
- Every feature specification (`spec.md`), implementation plan (`plan.md`), and task breakdown (`tasks.md`) MUST strictly adhere to these principles.
- Any pull request or feature implementation that violates these principles MUST be rejected or amended with explicit justification in the Implementation Plan's Complexity Tracking section.
- **Amendment Procedure**:
  1. Proposed changes to principles, tech stack, or governance must be documented in a dedicated RFC or PR.
  2. Amendments require maintainer consensus and approval.
  3. Semantic versioning rules apply to Constitution updates:
     - **MAJOR (X.0.0)**: Removal, fundamental alteration, or backward-incompatible redefinition of core principles (such as game paradigm shifts).
     - **MINOR (1.X.0)**: Addition of new principles, tech stack expansions, or structural workflow changes.
     - **PATCH (1.0.X)**: Minor wording adjustments, typo fixes, or non-semantic clarifications.

**Version**: 2.0.0 | **Ratified**: 2026-08-23 | **Last Amended**: 2026-08-23
