-- PostgreSQL Schema for Throat Goat Drawings MVP

CREATE TABLE IF NOT EXISTS public.drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    format VARCHAR(10) NOT NULL CHECK (format IN ('image/png', 'image/webp')),
    width INTEGER NOT NULL CHECK (width > 0 AND width <= 4096),
    height INTEGER NOT NULL CHECK (height > 0 AND height <= 4096),
    file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 2097152), -- max 2MB
    stroke_count INTEGER NOT NULL DEFAULT 0 CHECK (stroke_count >= 0),
    title VARCHAR(100) DEFAULT 'Untitled Throat Goat',
    creator_id UUID, -- Anonymous guest session token or future auth user ID
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'flagged', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performant retrieval and ordering
CREATE INDEX IF NOT EXISTS idx_drawings_created_at_desc ON public.drawings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drawings_status_created_at ON public.drawings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drawings_creator_id ON public.drawings (creator_id) WHERE creator_id IS NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published drawings
CREATE POLICY "Allow public read of published drawings"
    ON public.drawings
    FOR SELECT
    USING (status = 'published');

-- Policy: Server-side insertion via service role key bypasses RLS automatically,
-- but we also allow authenticated / anon service actions
CREATE POLICY "Allow server insertion"
    ON public.drawings
    FOR INSERT
    WITH CHECK (true);
