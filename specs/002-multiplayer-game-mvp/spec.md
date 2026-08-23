# Feature Specification: Multiplayer Party Game MVP

**Feature Branch**: `002-multiplayer-game-mvp`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "A humorous multiplayer browser game inspired by the 'Throat Goat' social-media meme revolving around showing players pictures of tattoos and asking them to create funny titles for those tattoos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Room Hosting, Joining, and Lobby Coordination (Priority: P1)

A player visits the landing page, either creates a new room as host or enters an existing 4-character uppercase room code with a nickname to join an active room. All connected players in the room see live lobby updates as new players arrive. When at least 3 players (minimum required for competitive self-excluding voting) have gathered, the host clicks "Start Game" to begin Stage 1.

**Why this priority**: Without room creation, player discovery, and host-initiated game startup, no multiplayer game session can exist.

**Independent Test**:
- Create a room as Player 1 (Host).
- Join the room using the room code as Player 2 and Player 3.
- Verify all 3 players appear on each client in real time.
- Verify only the Host sees the active "Start Game" button once player count reaches 3.
- Verify game transitions into Stage 1 for all connected players upon host click.

**Acceptance Scenarios**:
1. **Given** a user on the landing page, **When** they click "Host Game" and enter nickname "HostCat", **Then** a unique 4-character room code is generated, the player is designated as Host, and they are placed in the Lobby.
2. **Given** an open room in `LOBBY` phase, **When** a user enters a valid room code and nickname "PlayerTwo", **Then** they join the room and all lobby participants immediately see "PlayerTwo" added to the roster without page refresh.
3. **Given** a lobby with 2 players (< minimum threshold of 3), **When** the host views the lobby, **Then** the "Start Game" button is disabled with an explanatory tooltip ("Need at least 3 players to start").
4. **Given** a lobby with 3 to 8 players, **When** the host clicks "Start Game", **Then** the server initializes a new game session with 2 stages and transitions all players to the Stage 1 Submission screen.

---

### User Story 2 - Picture-Title Submission Flow across 2 Stages (Priority: P1)

Upon entering each stage (Stage 1 and Stage 2), all players are presented with a curated tattoo picture and prompt task ("Give this tattoo your funniest title."). Each player types their creative title into a text field (max 100 characters) and submits it. Once submitted, the player sees a "Waiting for other players..." status indicator, and cannot edit their submission. When all active players have submitted, the room automatically advances to the voting phase.

**Why this priority**: Title submissions are the core creative gameplay mechanic and the necessary prerequisite for voting and scoring.

**Independent Test**:
- Transition room to Stage 1 `SUBMITTING`.
- Verify the stage tattoo image is displayed prominently on all clients with the prompt task.
- Submit titles from Player 1, Player 2, and Player 3.
- Verify each player sees submission confirmation and cannot edit or resubmit.
- Verify the server advances the room to `VOTING` as soon as the final player submits.

**Acceptance Scenarios**:
1. **Given** a room entering `SUBMITTING`, **When** a player views the screen, **Then** they see the stage number ("Stage 1 of 2"), the curated tattoo picture, the task text, a character-counted input field, and a submit button.
2. **Given** an empty title input, **When** the player clicks "Submit", **Then** the UI prevents submission and prompts the user to type a title.
3. **Given** a player enters a valid title and submits, **When** the server accepts the submission, **Then** the player's UI transitions to a pending state ("Title locked in! Waiting for [N] players...") and input controls are disabled.
4. **Given** 3 players in the room, **When** the 3rd and final player submits their title, **Then** the room phase atomically transitions to `VOTING` and broadcasts the transition to all players.

---

### User Story 3 - Anonymized, Self-Excluding Voting Phase (Priority: P1)

Once all submissions for the stage are received, the game enters the `VOTING` phase. Each player sees the tattoo picture and a randomized list of all submitted titles **excluding their own submission**. Each player selects one title they find funniest and submits their vote. A player cannot vote for themselves, cannot vote more than once, and cannot change their vote once submitted. When all eligible votes are cast, the room advances to results.

**Why this priority**: Fair voting guarantees player engagement and round integrity; strict self-vote exclusion prevents malicious or collusive vote farming.

**Independent Test**:
- Transition room with 3 players (A, B, C) into `VOTING`.
- Verify Player A sees only titles from B and C (Player A's title is excluded).
- Verify Player B sees only titles from A and C.
- Cast votes for each player.
- Verify server blocks any injected payload attempting to vote for one's own submission ID.
- Verify room automatically transitions to `RESULTS` once all active voters have voted.

**Acceptance Scenarios**:
1. **Given** a player in `VOTING` phase, **When** the voting list renders, **Then** all peer submissions are displayed anonymously in randomized order, and the player's own submission is omitted from their options.
2. **Given** a voting player selects an option and clicks "Vote", **When** the server validates the vote, **Then** the choice is locked, the UI displays "Vote recorded! Waiting for others...", and cannot be modified.
3. **Given** a malicious client attempts to send a vote for their own submission ID, **When** the server receives the request, **Then** the server rejects the vote with HTTP 400 / validation error and does not record the vote.
4. **Given** all players have voted, **When** the last vote is registered, **Then** the server triggers stage resolution and transitions to `RESULTS`.

---

### User Story 4 - Stage Results, Vote Breakdown, and Scoring (Priority: P1)

In the `RESULTS` phase, the system reveals the vote tally for each submission along with the author's identity. The title(s) receiving the highest number of votes is declared the stage winner. Scores are updated authoritatively (+100 points per vote received + 250 bonus points for winning the stage). If multiple submissions tie for the highest votes, all tied authors are awarded the round winner bonus. After an 8-second viewing timer or when the host clicks "Next", Stage 1 advances to Stage 2, or Stage 2 advances to the Final Leaderboard.

**Why this priority**: Instant feedback and score accumulation create the core comedic payoff and competitive momentum of the game.

**Independent Test**:
- Trigger stage completion with known vote counts (e.g., Submission B: 2 votes, Submission C: 1 vote, Submission A: 0 votes).
- Verify Submission B is highlighted as round winner.
- Verify player score increments (Player B: 2*100 + 250 = 450 pts, Player C: 1*100 = 100 pts, Player A: 0 pts).
- Verify all clients receive the updated score breakdown and author reveals.

**Acceptance Scenarios**:
1. **Given** a stage transitioning to `RESULTS`, **When** the results screen renders, **Then** each title is shown with its author's nickname and total votes received, with the top-voted title highlighted with winning animations.
2. **Given** a tie for highest votes (e.g., two titles with 1 vote each), **When** results are computed, **Then** both players are designated co-winners and both receive the 250-point winner bonus in addition to their vote points.
3. **Given** results for Stage 1 are displayed, **When** the stage timer elapses or the host clicks "Continue to Stage 2", **Then** the game advances to Stage 2 with a new curated tattoo picture.
4. **Given** results for Stage 2 are displayed, **When** the stage concludes, **Then** the game transitions to `FINISHED` (Final Leaderboard).

---

### User Story 5 - Final Leaderboard and Game Completion (Priority: P1)

After Stage 2 results are concluded, all players view the Final Leaderboard. The screen presents all players ranked in descending order of cumulative score, with the overall champion prominently highlighted and crowned with humorous "Throat Goat" themed victory fanfare. The host is provided with options to "Play Again" (returns room to lobby with same players) or "Exit to Home".

**Why this priority**: The final leaderboard provides the climax and resolution of the 2-stage game, crowning the winner and completing the session loop.

**Independent Test**:
- Complete Stage 2 results.
- Verify transition to `FINISHED` screen.
- Verify leaderboard displays all players sorted from highest to lowest cumulative score.
- Verify first-place player is highlighted as the ultimate winner.
- Verify host "Play Again" resets the game state back to `LOBBY` for a new match.

**Acceptance Scenarios**:
1. **Given** Stage 2 results complete, **When** the room enters `FINISHED`, **Then** all connected players view the final leaderboard sorted by total score descending.
2. **Given** a tie for 1st place in the final leaderboard, **When** the leaderboard renders, **Then** both players share rank #1 and are celebrated as co-champions.
3. **Given** the host clicks "Play Again", **When** the server processes the reset, **Then** player scores reset to 0, stage index resets to 1, and the room returns to `LOBBY` retaining the existing player roster.

---

### User Story 6 - Room Lifecycle, Reconnection, and Disconnect Resilience (Priority: P2)

Players experience network drops, accidental tab closures, or page reloads without losing their place in the game. Upon reloading, the client re-authenticates with their stored session token and immediately renders the current authoritative game phase. If a player permanently disconnects, the server adjusts submission and voting completion thresholds so remaining players are not permanently blocked.

**Why this priority**: In real-time web games, transient network hiccups and refreshes are frequent; the game must not freeze or trap players.

**Independent Test**:
- Refresh browser during `SUBMITTING` or `VOTING`.
- Verify player seamlessly re-enters active phase with previous input/vote intact.
- Simulate player disconnect and verify remaining players can advance past phase threshold.

**Acceptance Scenarios**:
1. **Given** a player in an active stage reloads the page, **When** the page loads, **Then** the client reconnects using their stored session token and restores the exact current room phase.
2. **Given** 4 players in `SUBMITTING` and 1 player disconnects/leaves, **When** the remaining 3 active players submit, **Then** the server detects all active players have submitted and advances to `VOTING`.
3. **Given** the room host disconnects in `LOBBY`, **When** the disconnect is confirmed, **Then** host status is transferred to the next oldest connected player.
4. **Given** a player attempts to join a room where game phase is already `SUBMITTING` or `VOTING`, **When** join is requested, **Then** the server rejects the request with "Game already in progress".

---

### Edge Cases

- **Ties in Voting**: When two or more submissions receive an equal top number of votes in a stage, all top submissions share 1st place, and all tied authors receive the full winner bonus (250 pts).
- **All Zero Votes**: If in an extreme case no votes are cast before a timeout, all submissions receive 0 points and the stage proceeds without a round bonus.
- **Single Vote Casting**: A player cannot retract or alter their vote once cast.
- **Profanity / Input Length**: Submissions are constrained to a minimum of 1 character and a maximum of 100 characters, trimmed of leading/trailing whitespace.
- **Room Code Collisions**: Room codes are 4-character uppercase alphanumeric strings excluding easily confused characters (e.g., excluding O, 0, I, 1) generated with collision retry logic.
- **Maximum Player Capacity**: A room accepts a maximum of 8 players. Attempts to join a full room are rejected with "Room is at maximum capacity (8 players)".
- **Minimum Player Capacity**: A game requires at least 3 players to start.
- **Double Submit Race Condition**: Submissions and votes use unique database constraints `(stage_id, player_id)` and `(stage_id, voter_id)` to atomically reject duplicate submissions/votes.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Room Management & Lobby
- **FR-001**: System MUST allow any user to create a new game room, assigning the creator as Room Host and generating a unique 4-character room code.
- **FR-002**: System MUST allow users to join an existing room by providing a valid room code and nickname (1–16 characters).
- **FR-003**: System MUST enforce room capacity between 3 (minimum) and 8 (maximum) players for MVP.
- **FR-004**: System MUST display real-time player list updates in the lobby as players join, leave, or disconnect.
- **FR-005**: System MUST only enable the "Start Game" control for the designated Room Host when connected players >= 3.
- **FR-006**: System MUST transfer host status to another connected player if the active host leaves the lobby.

#### Game Structure & Stages
- **FR-007**: System MUST enforce exactly 2 stages per game session in the MVP (`stage_number` = 1 and `stage_number` = 2).
- **FR-008**: System MUST select a unique curated tattoo picture for Stage 1 and a different curated tattoo picture for Stage 2 from the pre-seeded picture catalog.
- **FR-009**: System MUST require every active player to submit exactly 1 title per stage (totaling 2 submissions per player across the game).

#### Submission Phase
- **FR-010**: System MUST present all players in `SUBMITTING` phase with the stage tattoo picture, task description ("Give this tattoo your funniest title."), and an input field.
- **FR-011**: System MUST validate submitted titles (length between 1 and 100 characters, trimmed of whitespace).
- **FR-012**: System MUST prevent duplicate submissions from the same player in the same stage.
- **FR-013**: System MUST prevent submission edits once submitted.
- **FR-014**: System MUST automatically transition the room from `SUBMITTING` to `VOTING` once all connected players have submitted their titles.

#### Voting Phase & Fair Voting
- **FR-015**: System MUST display all stage submissions anonymously and in randomized order to voting players.
- **FR-016**: System MUST filter out a player's own submission from their voting options so they cannot see or select their own title.
- **FR-017**: System MUST validate on the server that a player cannot vote for their own submission ID, returning a rejection error if attempted.
- **FR-018**: System MUST enforce exactly 1 vote per player per stage.
- **FR-019**: System MUST prevent players from changing their vote after submission.
- **FR-020**: System MUST automatically advance the room from `VOTING` to `RESULTS` once all eligible active players have cast their vote.

#### Results, Scoring & Leaderboard
- **FR-021**: System MUST calculate score rewards server-side: 100 points per vote received, plus a 250-point bonus for winning the stage (highest vote tally).
- **FR-022**: System MUST award the 250-point winner bonus to all tied players if multiple submissions receive the equal highest vote count.
- **FR-023**: System MUST reveal author nicknames and vote counts for all submissions during the `RESULTS` phase.
- **FR-024**: System MUST persist and accumulate player scores across Stage 1 and Stage 2.
- **FR-025**: System MUST advance from Stage 1 `RESULTS` to Stage 2 `SUBMITTING`, and from Stage 2 `RESULTS` to `FINISHED` (Final Leaderboard).
- **FR-026**: System MUST display the final leaderboard sorted by total score descending, highlighting the top-scoring player(s) as the champion.
- **FR-027**: System MUST allow the host to trigger "Play Again" from the leaderboard, resetting stage index to 1 and scores to 0 while keeping players in the room.

#### Real-Time & Security
- **FR-028**: System MUST broadcast room state transitions, player status, and results to all connected room clients via Supabase Realtime without manual browser refreshing.
- **FR-029**: System MUST reject actions (submissions, votes, stage starts) that do not match the room's authoritative current game phase.
- **FR-030**: System MUST maintain guest player sessions using securely generated client tokens stored in browser local/session storage to survive page reloads.

---

### Key Entities

- **Room**: Represents an isolated multiplayer game room.
  - *Attributes*: `id`, `room_code` (unique 4-char string), `host_player_id`, `phase` (`LOBBY`, `SUBMITTING`, `VOTING`, `RESULTS`, `FINISHED`), `current_stage_index` (1 or 2), `created_at`, `updated_at`.
- **Player**: Represents a participant in a room session.
  - *Attributes*: `id`, `room_id`, `nickname` (1–16 chars), `session_token` (secure UUID), `is_host` (boolean), `score` (integer, default 0), `is_connected` (boolean), `joined_at`.
- **GameSession**: Represents an active game instance played within a room.
  - *Attributes*: `id`, `room_id`, `total_stages` (default 2), `status` (`IN_PROGRESS`, `COMPLETED`), `created_at`.
- **Picture**: Represents a curated tattoo image prompt.
  - *Attributes*: `id`, `image_url`, `description`, `is_active` (boolean).
- **Stage**: Represents a single round within a game session.
  - *Attributes*: `id`, `game_id`, `stage_number` (1 or 2), `picture_id`, `phase` (`SUBMITTING`, `VOTING`, `RESULTS`), `started_at`, `completed_at`.
- **Submission**: Represents a title submitted by a player for a specific stage picture.
  - *Attributes*: `id`, `stage_id`, `player_id`, `title` (string, max 100 chars), `submitted_at`. (Unique constraint on `stage_id` + `player_id`).
- **Vote**: Represents a vote cast by a player for a submission.
  - *Attributes*: `id`, `stage_id`, `voter_player_id`, `submission_id`, `voted_at`. (Unique constraint on `stage_id` + `voter_player_id`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Room creation and join flows complete in under 2 seconds from form submission to lobby rendering.
- **SC-002**: 100% of game-state transitions (Lobby → Stage 1 → Voting → Results → Stage 2 → Leaderboard) propagate to all connected clients in < 500ms over broadband/mobile connections.
- **SC-003**: 0% incidence of self-voting: Server successfully rejects 100% of unauthorized self-vote attempts across all clients.
- **SC-004**: Players can complete a full 2-stage game session (from lobby start to final leaderboard) in under 5 minutes without encountering unrecoverable state desyncs.
- **SC-005**: 100% of player page reloads or brief disconnects successfully restore the player's active room phase and submission/vote state.
- **SC-006**: 100% of client viewports (mobile 360px width to desktop 4K) display legible prompt pictures, inputs, and voting cards without horizontal overflow or clipped buttons.
- **SC-007**: 95%+ of first-time players successfully submit a title and cast a vote on their first attempt without requiring instructions or help text.
- **SC-008**: System cleanly prevents duplicate submissions and duplicate votes across 100% of concurrent race condition test scenarios.

---

## Assumptions

1. **Player Thresholds**: Minimum 3 players and maximum 8 players per room is optimal for competitive party-game voting dynamics while keeping mobile UI cards readable.
2. **Scoring Model**: 100 points per vote received + 250 points for winning the round provides satisfying score progression and clear differentiation.
3. **Stage Configuration**: MVP is fixed at exactly 2 stages per game session with 1 shared curated tattoo image per stage (2 pictures total per game).
4. **Curated Picture Asset Seeding**: A pre-seeded catalog of high-quality, humorous tattoo images (hosted in Supabase Storage or public asset directory) will be provided at launch. User image uploads are explicitly out of scope for MVP.
5. **Session Persistence**: Player identities are transient and tracked via browser-stored session tokens per room; persistent accounts and passwords are not required for MVP.
6. **Tie-Breaking Rule**: Shared victories (co-winners both receiving 250 bonus points) are standard, fair, and fun for party games.
