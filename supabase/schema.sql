-- ============================================================================
-- FULL SUPABASE SCHEMA & SEED FOR THROAT GOAT
-- Run this entire script in Supabase SQL Editor in a single run.
-- ============================================================================

-- 1. UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drawings Table (Single Player Canvas & Gallery)
CREATE TABLE IF NOT EXISTS public.drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    format VARCHAR(10) NOT NULL CHECK (format IN ('image/png', 'image/webp')),
    width INTEGER NOT NULL CHECK (width > 0 AND width <= 4096),
    height INTEGER NOT NULL CHECK (height > 0 AND height <= 4096),
    file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 2097152),
    stroke_count INTEGER NOT NULL DEFAULT 0 CHECK (stroke_count >= 0),
    title VARCHAR(100) DEFAULT 'Untitled Throat Goat',
    creator_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'flagged', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_drawings_created_at_desc ON public.drawings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drawings_status_created_at ON public.drawings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drawings_creator_id ON public.drawings (creator_id) WHERE creator_id IS NOT NULL;

ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drawings' AND policyname = 'Allow public read of published drawings') THEN
        CREATE POLICY "Allow public read of published drawings" ON public.drawings FOR SELECT USING (status = 'published');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drawings' AND policyname = 'Allow server insertion') THEN
        CREATE POLICY "Allow server insertion" ON public.drawings FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 3. Pictures Catalog (Multiplayer Tattoo Picture Prompts)
CREATE TABLE IF NOT EXISTS public.pictures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Rooms
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(4) NOT NULL UNIQUE,
    host_player_id UUID,
    phase VARCHAR(20) NOT NULL DEFAULT 'LOBBY' CHECK (phase IN ('LOBBY', 'SUBMITTING', 'VOTING', 'RESULTS', 'FINISHED')),
    current_stage_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Players
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    nickname VARCHAR(16) NOT NULL,
    session_token VARCHAR(64) NOT NULL UNIQUE,
    is_host BOOLEAN NOT NULL DEFAULT FALSE,
    score INTEGER NOT NULL DEFAULT 0,
    is_connected BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe FK constraint on rooms for host_player_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_rooms_host_player'
    ) THEN
        ALTER TABLE public.rooms
        ADD CONSTRAINT fk_rooms_host_player
        FOREIGN KEY (host_player_id) REFERENCES public.players(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Games
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    total_stages INTEGER NOT NULL DEFAULT 2,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 7. Stages
CREATE TABLE IF NOT EXISTS public.stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL CHECK (stage_number IN (1, 2)),
    picture_id UUID NOT NULL REFERENCES public.pictures(id),
    phase VARCHAR(20) NOT NULL DEFAULT 'SUBMITTING' CHECK (phase IN ('SUBMITTING', 'VOTING', 'RESULTS')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT uq_game_stage_number UNIQUE (game_id, stage_number)
);

-- 8. Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_stage_player_submission UNIQUE (stage_id, player_id)
);

-- 9. Votes
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
    voter_player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_stage_voter_vote UNIQUE (stage_id, voter_player_id)
);

-- 10. Stage Scores
CREATE TABLE IF NOT EXISTS public.stage_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    votes_received INTEGER NOT NULL DEFAULT 0,
    is_winner BOOLEAN NOT NULL DEFAULT FALSE,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_stage_player_score UNIQUE (stage_id, player_id)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_players_room_id ON public.players(room_id);
CREATE INDEX IF NOT EXISTS idx_players_session_token ON public.players(session_token);
CREATE INDEX IF NOT EXISTS idx_stages_room_id ON public.stages(room_id);
CREATE INDEX IF NOT EXISTS idx_submissions_stage_id ON public.submissions(stage_id);
CREATE INDEX IF NOT EXISTS idx_votes_stage_id ON public.votes(stage_id);
CREATE INDEX IF NOT EXISTS idx_votes_submission_id ON public.votes(submission_id);
CREATE INDEX IF NOT EXISTS idx_stage_scores_stage_id ON public.stage_scores(stage_id);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pictures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'Public read for rooms') THEN
        CREATE POLICY "Public read for rooms" ON public.rooms FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'players' AND policyname = 'Public read for players') THEN
        CREATE POLICY "Public read for players" ON public.players FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pictures' AND policyname = 'Public read for pictures') THEN
        CREATE POLICY "Public read for pictures" ON public.pictures FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'games' AND policyname = 'Public read for games') THEN
        CREATE POLICY "Public read for games" ON public.games FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stages' AND policyname = 'Public read for stages') THEN
        CREATE POLICY "Public read for stages" ON public.stages FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Public read for submissions') THEN
        CREATE POLICY "Public read for submissions" ON public.submissions FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'votes' AND policyname = 'Public read for votes') THEN
        CREATE POLICY "Public read for votes" ON public.votes FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stage_scores' AND policyname = 'Public read for stage_scores') THEN
        CREATE POLICY "Public read for stage_scores" ON public.stage_scores FOR SELECT USING (true);
    END IF;
END $$;

-- 11. Initial Picture Catalog Seed
INSERT INTO public.pictures (id, image_url, description, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1590246814883-5783515fb27c?auto=format&fit=crop&w=800&q=80', 'A terrifyingly wonky dragon with cross-eyes and uneven wings', TRUE),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80', 'A mispelled inspirational quote that says "No Ragrets Ever"', TRUE),
('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80', 'A portrait of a celebrity that ended up looking like a melting potato', TRUE),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=800&q=80', 'A hyper-realistic taco with human legs and sunglasses', TRUE),
('55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=800&q=80', 'A tribal dolphin giving a thumbs up wearing a top hat', TRUE)
ON CONFLICT (id) DO NOTHING;
