# Data Model: Drawing Canvas MVP

**Feature Branch**: `001-drawing-canvas-mvp`  
**Date**: 2026-08-23  
**Status**: Completed  

---

## 1. Relational Database Schema (PostgreSQL)

### Table: `drawings`

Stores metadata for finalized and submitted drawings. Binary image assets are never stored in this table.

```sql
CREATE TABLE public.drawings (
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
CREATE INDEX idx_drawings_created_at_desc ON public.drawings (created_at DESC);
CREATE INDEX idx_drawings_status_created_at ON public.drawings (status, created_at DESC);
CREATE INDEX idx_drawings_creator_id ON public.drawings (creator_id) WHERE creator_id IS NOT NULL;
```

### TypeScript Data Transfer Objects (DTOs)

```typescript
export interface DrawingEntity {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  format: 'image/png' | 'image/webp';
  width: number;
  height: number;
  file_size_bytes: number;
  stroke_count: number;
  title: string | null;
  creator_id: string | null;
  status: 'published' | 'flagged' | 'archived';
  created_at: string; // ISO 8601 string
  updated_at: string;
}

export interface DrawingPublicDto {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  width: number;
  height: number;
  strokeCount: number;
  createdAt: string;
}
```

---

## 2. Object Storage Architecture

### Bucket Configuration: `drawings`
- **Visibility**: Public read (read-only for generated artwork URLs).
- **Access Control**: Write operations restricted to backend server actions / API endpoints using the service role key.
- **File Naming Convention**:
  ```text
  drawings/{YYYY}/{MM}/{drawing_id}.webp
  drawings/thumbnails/{YYYY}/{MM}/{drawing_id}_thumb.webp
  ```
- **MIME Types**: `image/webp` (preferred for compression), `image/png`.
- **Max File Size**: 2MB (2,097,152 bytes).

---

## 3. Client In-Memory State Models

### Drawing Canvas State
Represents transient interactive drawing state in the React/Konva layer.

```typescript
export type DrawingTool = 'pen' | 'eraser';

export interface DrawingStroke {
  id: string;
  tool: DrawingTool;
  color: string;
  size: number;
  points: number[]; // Flattened coordinate array: [x0, y0, x1, y1, ...]
}

export interface DrawingCanvasConfig {
  width: number;
  height: number;
  backgroundColor: string; // Default: '#FFFFFF' (solid opaque white)
  defaultColor: string;    // Default: '#111827'
  defaultSize: number;     // Default: 6
}

export interface CanvasHistoryState {
  strokes: DrawingStroke[];
  undoStack: DrawingStroke[][]; // Prior stroke snapshots
  redoStack: DrawingStroke[][]; // Future stroke snapshots
  isDirty: boolean;             // True if unsaved changes exist
}
```

---

## 4. Server Validation Schema (Zod)

```typescript
import { z } from 'zod';

export const SubmitDrawingRequestSchema = z.object({
  imageBase64: z.string().min(1, 'Image data is required'),
  format: z.enum(['image/png', 'image/webp']).default('image/webp'),
  width: z.number().int().min(300).max(4096),
  height: z.number().int().min(300).max(4096),
  strokeCount: z.number().int().min(1, 'Drawing must contain at least one stroke'),
  title: z.string().trim().max(100).optional().default('Untitled Throat Goat'),
  creatorId: z.string().uuid().optional(),
});

export type SubmitDrawingRequest = z.infer<typeof SubmitDrawingRequestSchema>;

export const GetDrawingsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().datetime().optional(), // ISO timestamp cursor for pagination
});

export type GetDrawingsQuery = z.infer<typeof GetDrawingsQuerySchema>;
```

---

## 5. Future Multiplayer Data Extension (Advisory Reference)

These models are **out of scope for MVP** but referenced to guarantee non-breaking forward compatibility:

```sql
-- FUTURE EXTENSION (Phase 2+): Multiplayer Rooms & Rounds
-- CREATE TABLE public.rooms (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     code VARCHAR(6) UNIQUE NOT NULL,
--     status VARCHAR(20) NOT NULL DEFAULT 'lobby',
--     created_at TIMESTAMPTZ DEFAULT now()
-- );
-- CREATE TABLE public.room_players (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
--     nickname VARCHAR(50) NOT NULL,
--     is_host BOOLEAN DEFAULT false
-- );
-- CREATE TABLE public.game_rounds (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
--     prompt TEXT NOT NULL,
--     drawing_id UUID REFERENCES public.drawings(id),
--     round_number INTEGER NOT NULL
-- );
```
