# Quickstart Validation Guide: Multiplayer Party Game MVP

**Feature**: `002-multiplayer-game-mvp`
**Date**: 2026-08-23

## 1. Prerequisites & Environment Setup

### Required Environment Variables

Create `.env.local` with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Migration & Seeding

1. Run database migrations to apply the schema defined in [data-model.md](./data-model.md).
2. Seed initial curated tattoo pictures into the `pictures` table:
   ```bash
   npm run db:seed
   ```

---

## 2. Running Local Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. End-to-End Local Multiplayer Walkthrough (3-Player Simulation)

To validate all gameplay phases without external devices, open 3 separate browser sessions (e.g., Chrome Normal, Chrome Incognito, Firefox / Edge):

### Step 1: Create Room as Host (Browser 1)
1. Go to `http://localhost:3000`.
2. Click **Host Game**, enter nickname `HostKing`, and click **Create Room**.
3. Observe the generated 4-character room code (e.g., `TG88`).
4. Verify the UI renders the `Lobby` screen with 1 player and a disabled "Start Game" button (explaining "Need at least 3 players").

### Step 2: Join as Players 2 and 3 (Browser 2 & Browser 3)
1. In Browser 2, go to `http://localhost:3000`, enter room code `TG88` and nickname `PlayerTwo`, then click **Join Game**.
2. In Browser 3, enter room code `TG88` and nickname `PlayerThree`, then click **Join Game**.
3. Verify that all 3 browsers immediately update in real time to show all 3 players in the lobby.
4. Verify the Host's "Start Game" button is now enabled.

### Step 3: Start Game & Submit Titles (Stage 1)
1. Browser 1 (Host) clicks **Start Game**.
2. Verify all 3 browsers automatically transition to **Stage 1 (Submission Phase)** showing:
   - "Stage 1 of 2" badge
   - Curated Tattoo Image #1
   - Prompt: "Give this tattoo your funniest title."
   - Character-counted title input.
3. Browser 1 enters title `"Regret in Ink"` and clicks **Submit**.
   - Verify Browser 1 shows locked state: "Title locked in! Waiting for 2 players...".
4. Browser 2 enters title `"Tribal Dolphin Fail"` and clicks **Submit**.
5. Browser 3 enters title `"My Cousin Did It Cheap"` and clicks **Submit**.
6. Verify that upon the 3rd submission, all 3 browsers automatically transition to the **Voting Phase**.

### Step 4: Fair Anonymized Voting
1. Inspect Browser 1 (HostKing):
   - Verify only titles `"Tribal Dolphin Fail"` and `"My Cousin Did It Cheap"` appear.
   - Verify `"Regret in Ink"` (HostKing's own submission) **is omitted**.
2. Inspect Browser 2:
   - Verify `"Tribal Dolphin Fail"` is omitted.
3. Cast votes:
   - Browser 1 votes for `"Tribal Dolphin Fail"`.
   - Browser 2 votes for `"My Cousin Did It Cheap"`.
   - Browser 3 votes for `"Tribal Dolphin Fail"`.
4. Verify all 3 browsers automatically transition to the **Results Phase**.

### Step 5: Results & Score Verification
1. Verify the Results screen shows:
   - Winning title: `"Tribal Dolphin Fail"` by `PlayerTwo` (2 votes).
   - `PlayerTwo` earns `2 * 100 + 250 = 450` points.
   - `PlayerThree` earns `1 * 100 = 100` points.
   - `HostKing` earns `0` points.
2. Click **Continue to Stage 2** (or wait for the timer).

### Step 6: Stage 2 & Final Leaderboard
1. Verify Stage 2 displays a **different curated tattoo image** (Picture #2).
2. Submit titles and cast votes for Stage 2.
3. Verify the game concludes and transitions to the **Final Leaderboard**.
4. Verify all players are sorted by cumulative points, the winner is highlighted with celebration animations, and the host can click **Play Again** to return the room to the lobby.

---

## 4. Automated Test Validation

Run the complete test suite:

```bash
# Run unit & state machine tests
npm run test

# Run integration & contract tests
npm run test:coverage

# Run Playwright E2E multiplayer simulation
npm run test:e2e
```
