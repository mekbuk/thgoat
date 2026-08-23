# Implementation Plan: Multiplayer Party Game MVP

**Branch**: `002-multiplayer-game-mvp` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-multiplayer-game-mvp/spec.md`

## Summary

Implement the authoritative, real-time multiplayer party game MVP where players join rooms using 4-character room codes, submit humorous titles for curated tattoo pictures across 2 stages, vote anonymously on peers' submissions with strict self-voting exclusion, and compete on a live server-calculated leaderboard. The implementation utilizes Next.js App Router (Server Actions & Route Handlers), React 19, Supabase PostgreSQL, Supabase Realtime Channels, and Tailwind CSS.

## Technical Context

**Language/Version**: TypeScript 5.7+ (`strict: true`, no implicit `any`)

**Primary Dependencies**: Next.js 15.1 (App Router), React 19, Tailwind CSS 3.4, `@supabase/supabase-js` 2.49, `zod` 3.24, `lucide-react`, `canvas-confetti`

**Storage**: PostgreSQL (via Supabase) with tables `rooms`, `players`, `games`, `stages`, `pictures`, `submissions`, `votes`, `stage_scores`; public/storage URLs for curated tattoo images

**Testing**: Vitest 3.0 (unit & integration), `@testing-library/react` (component tests), Playwright 1.50 (multi-client E2E simulation)

**Target Platform**: Responsive Web Browsers (Mobile, Tablet, Desktop with touch & pointer support)

**Project Type**: Full-Stack Next.js Web Application (Single monolithic codebase with Server Actions, API Handlers, and React Server/Client Components)

**Performance Goals**: < 500ms real-time broadcast latency for game phase transitions; < 2s room creation and join response; smooth 60fps animations

**Constraints**: Server-authoritative state machine; zero-trust client validation; absolute self-voting prevention; no external microservices, Redis, or custom WebSocket servers (Principle VI)

**Scale/Scope**: 3–8 players per room; exactly 2 stages per game session; 2 total title submissions per player; pre-seeded tattoo picture catalog

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Status | Compliance Details |
|:---|:---:|:---|
| **I. Authoritative Server State** | ✅ PASS | All stage advances, submission locks, voting eligibility, vote counts, and scores are resolved exclusively on the server. |
| **II. Real-Time Synchronization** | ✅ PASS | Room state and phase events propagate through Supabase Realtime channels (`room:${room_code}`). |
| **III. Strict Room Isolation** | ✅ PASS | Unguessable 4-character codes; all queries and realtime channels are strictly room-scoped. |
| **IV. Explicit State Machine** | ✅ PASS | Formal transitions: `LOBBY` → `SUBMITTING` → `VOTING` → `RESULTS` → `SUBMITTING` → `VOTING` → `RESULTS` → `FINISHED`. |
| **V. Persistent Data Integrity** | ✅ PASS | Database constraints `uq_stage_player_submission` and `uq_stage_voter_vote` prevent duplicate actions; self-voting is blocked. |
| **VI. Architectural Simplicity** | ✅ PASS | Next.js + Supabase only; no microservices, Kubernetes, Redis, or message queues. |
| **VII. Intuitive UX** | ✅ PASS | Zero-instruction clarity with stage badges, prominent tattoo imagery, character counter, and instant visual feedback. |
| **VIII. Fair Voting** | ✅ PASS | Voter's own submission is filtered out of client options and blocked by server validation checks. |
| **IX. Server-Calculated Scoring** | ✅ PASS | 100 pts/vote + 250 winner bonus computed server-side; shared co-winner bonus on ties. |
| **X. Controlled Extensibility** | ✅ PASS | YAGNI strictly enforced; custom game modes, user accounts, and drawing tools are excluded. |
| **XI. Independent Testability** | ✅ PASS | Game state machine, validation rules, and scoring algorithms decoupled into pure TypeScript modules in `src/lib/game/`. |
| **XII. Robust Security** | ✅ PASS | Zod schema validation on all inputs, session token verification, and host permission checks. |

## Project Structure

### Documentation (this feature)

```text
specs/002-multiplayer-game-mvp/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output: Technical decisions & trade-offs
├── data-model.md        # Phase 1 output: PostgreSQL schema, ER diagram & state transitions
├── contracts/           # Phase 1 output: OpenAPI API specifications
│   └── game-api.yaml
├── quickstart.md        # Phase 1 output: Local testing & multiplayer run guide
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   └── rooms/
│   │       ├── route.ts                     # POST createRoom
│   │       └── [code]/
│   │           ├── join/route.ts            # POST joinRoom
│   │           ├── state/route.ts           # GET getRoomState (hydration & recovery)
│   │           ├── start/route.ts           # POST startGame (host only)
│   │           ├── submit/route.ts          # POST submitTitle
│   │           ├── vote/route.ts            # POST submitVote
│   │           ├── advance/route.ts         # POST advanceStage
│   │           └── reset/route.ts           # POST resetGame (rematch)
│   ├── room/
│   │   └── [code]/
│   │       └── page.tsx                     # Main game room page & state machine controller
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                             # Landing page (Host / Join modals)
├── components/
│   ├── lobby/
│   │   ├── LobbyView.tsx                    # Player roster, room code badge, host start control
│   │   └── PlayerList.tsx                   # Connected players list
│   ├── game/
│   │   ├── SubmissionPhase.tsx              # Tattoo picture, task prompt, title input, lock status
│   │   ├── VotingPhase.tsx                  # Tattoo picture, anonymized title options (self excluded)
│   │   ├── ResultsPhase.tsx                 # Vote counts, author reveals, winner animations
│   │   └── GameHeader.tsx                   # Room code, stage badge ("Stage 1 of 2"), status pill
│   ├── leaderboard/
│   │   └── FinalLeaderboard.tsx             # Podium, ranked scores, Throat Goat victory theme, rematch
│   └── shared/
│       ├── ImageCard.tsx                    # Responsive tattoo image viewer with loading skeleton
│       └── ToastError.tsx                   # User-facing error notifications
├── lib/
│   ├── game/
│   │   ├── state-machine.ts                 # Pure deterministic state machine & phase transitions
│   │   ├── scoring.ts                       # Pure score calculation, vote tallying, tie-breaking
│   │   └── room-code.ts                     # 4-character unguessable room code generator
│   ├── supabase/
│   │   ├── client.ts                        # Browser Supabase client
│   │   ├── server.ts                        # Server-side Supabase client (Service Role / Auth)
│   │   └── realtime.ts                      # Typed Realtime channel subscription manager
│   └── validators/
│       └── game-schemas.ts                  # Zod validation schemas for all inputs & payloads
└── types/
    └── game.ts                              # Shared TypeScript types & interfaces

supabase/
├── migrations/
│   └── 20260823000000_multiplayer_schema.sql # Complete PostgreSQL DDL schema & indexes
└── seed.sql                                 # Curated tattoo images catalog

tests/
├── unit/
│   ├── state-machine.test.ts                # Phase transitions & guard tests
│   ├── scoring.test.ts                      # Score formulas, tie-breakers, leaderboard sorting
│   └── room-code.test.ts                    # Code generation & collision avoidance tests
├── integration/
│   ├── room-lifecycle.test.ts               # Room creation, joining, start, host transfer
│   ├── submission-flow.test.ts              # Single submission constraint & phase advancement
│   └── voting-fairness.test.ts              # Self-voting rejection & duplicate vote tests
└── e2e/
    └── multiplayer-game.spec.ts             # 3-player Playwright full game simulation
```

**Structure Decision**: Single Next.js full-stack monolithic architecture using App Router, TypeScript, React 19, Supabase Realtime, and Tailwind CSS.

## Complexity Tracking

> **Constitution Check**: All 12 principles satisfied. No complexity exceptions or violations needed.

| Item | Status | Justification |
|:---|:---:|:---|
| Single full-stack project | Standard | Matches Next.js App Router conventions |
| Supabase Realtime Channels | Standard | Eliminates dedicated WebSocket server infrastructure |
