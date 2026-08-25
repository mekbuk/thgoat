# Data Model & Schema Specification: Multiplayer Party Game MVP (1v1 Matchups)

**Feature**: `002-multiplayer-game-mvp`
**Date**: 2026-08-25

## 1. Relational Entities & Attributes

```mermaid
erDiagram
    ROOMS ||--o{ PLAYERS : contains
    ROOMS ||--o{ GAMES : hosts
    GAMES ||--|{ STAGES : contains
    STAGES ||--o{ STAGE_MATCHUPS : pairs
    PICTURES ||--o{ STAGE_MATCHUPS : prompts
    STAGE_MATCHUPS ||--o{ SUBMISSIONS : receives
    PLAYERS ||--o{ SUBMISSIONS : creates
    STAGE_MATCHUPS ||--o{ VOTES : receives
    PLAYERS ||--o{ VOTES : casts
    SUBMISSIONS ||--o{ VOTES : receives_votes
    STAGES ||--o{ STAGE_SCORES : tabulates
    PLAYERS ||--o{ STAGE_SCORES : earns

    ROOMS {
        uuid id PK
        varchar(4) room_code UK
        uuid host_player_id
        varchar(20) phase
        integer current_stage_number
        integer current_matchup_index
        timestamptz created_at
        timestamptz updated_at
    }

    PLAYERS {
        uuid id PK
        uuid room_id FK
        varchar(16) nickname
        varchar(64) session_token UK
        boolean is_host
        integer score
        boolean is_connected
        timestamptz joined_at
    }

    GAMES {
        uuid id PK
        uuid room_id FK
        integer total_stages
        varchar(20) status
        timestamptz created_at
        timestamptz completed_at
    }

    PICTURES {
        uuid id PK
        text image_url
        text description
        boolean is_active
        timestamptz created_at
    }

    STAGES {
        uuid id PK
        uuid game_id FK
        uuid room_id FK
        integer stage_number
        varchar(20) phase
        integer current_matchup_index
        timestamptz started_at
        timestamptz completed_at
    }

    STAGE_MATCHUPS {
        uuid id PK
        uuid stage_id FK
        integer order_index
        uuid picture_id FK
        uuid player1_id FK
        uuid player2_id FK
        boolean is_revealed
        timestamptz created_at
    }

    SUBMISSIONS {
        uuid id PK
        uuid stage_id FK
        uuid matchup_id FK
        uuid player_id FK
        varchar(100) title
        timestamptz created_at
    }

    VOTES {
        uuid id PK
        uuid stage_id FK
        uuid matchup_id FK
        uuid voter_player_id FK
        uuid submission_id FK
        timestamptz created_at
    }

    STAGE_SCORES {
        uuid id PK
        uuid stage_id FK
        uuid player_id FK
        uuid submission_id FK
        integer votes_received
        boolean is_winner
        integer points_awarded
        timestamptz created_at
    }
```

---

## 2. PostgreSQL DDL Schema

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Pictures Catalog
CREATE TABLE pictures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Rooms
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(4) NOT NULL UNIQUE,
    host_player_id UUID,
    phase VARCHAR(20) NOT NULL DEFAULT 'LOBBY' CHECK (phase IN ('LOBBY', 'SUBMITTING', 'VOTING', 'RESULTS', 'FINISHED')),
    current_stage_number INTEGER NOT NULL DEFAULT 1,
    current_matchup_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Players
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    nickname VARCHAR(16) NOT NULL,
    session_token VARCHAR(64) NOT NULL UNIQUE,
    is_host BOOLEAN NOT NULL DEFAULT FALSE,
    score INTEGER NOT NULL DEFAULT 0,
    is_connected BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Stages & 1v1 Matchups
CREATE TABLE stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL CHECK (stage_number IN (1, 2)),
    phase VARCHAR(20) NOT NULL DEFAULT 'SUBMITTING' CHECK (phase IN ('SUBMITTING', 'VOTING', 'RESULTS')),
    current_matchup_index INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT uq_game_stage_number UNIQUE (game_id, stage_number)
);

CREATE TABLE stage_matchups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    picture_id UUID NOT NULL REFERENCES pictures(id),
    player1_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    player2_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    is_revealed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_stage_matchup_order UNIQUE (stage_id, order_index)
);

-- 5. Submissions & Votes
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    matchup_id UUID REFERENCES stage_matchups(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    matchup_id UUID REFERENCES stage_matchups(id) ON DELETE CASCADE,
    voter_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
