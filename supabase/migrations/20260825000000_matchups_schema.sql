-- PostgreSQL Migration: 1v1 Quiplash-Style Matchups Schema

-- 1. Add current_matchup_index to rooms and stages
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_matchup_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stages ADD COLUMN IF NOT EXISTS current_matchup_index INTEGER NOT NULL DEFAULT 0;

-- 2. Stage Matchups Table
CREATE TABLE IF NOT EXISTS stage_matchups (
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

-- 3. Add matchup_id column to submissions and votes
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS matchup_id UUID REFERENCES stage_matchups(id) ON DELETE CASCADE;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS matchup_id UUID REFERENCES stage_matchups(id) ON DELETE CASCADE;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_stage_matchups_stage_id ON stage_matchups(stage_id);
CREATE INDEX IF NOT EXISTS idx_submissions_matchup_id ON submissions(matchup_id);
CREATE INDEX IF NOT EXISTS idx_votes_matchup_id ON votes(matchup_id);

-- 5. RLS
ALTER TABLE stage_matchups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for stage_matchups" ON stage_matchups FOR SELECT USING (true);
