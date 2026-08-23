# Research & Technical Decisions: Drawing Canvas MVP

**Feature Branch**: `001-drawing-canvas-mvp`  
**Date**: 2026-08-23  
**Status**: Completed  

---

## 1. Full-Stack Application Framework

### Decision
Use **Next.js 15 (App Router)** with **TypeScript** and **Tailwind CSS**.

### Rationale
- Next.js App Router provides a unified architecture for React 19 UI components, client-side drawing state, and secure server-side Route Handlers / Server Actions in a single repository.
- Eliminates the need for a separate backend server (e.g., Express/NestJS), simplifying local development, CI/CD, and serverless edge or Node.js deployment.
- Native TypeScript integration enables end-to-end type safety between client forms, Zod validation schemas, and database DTOs.
- Tailwind CSS enables rapid styling for the humorous "Throat Goat" meme aesthetic with responsive mobile/tablet breakpoints.

### Alternatives Considered
- **Vite SPA + Separate Express Backend**: Rejected due to additional operational overhead (managing two distinct build pipelines, CORS configurations, and dual hosting setups).
- **Remix / React Router 7**: Viable alternative, but Next.js has broader community adoption and seamless integration with Vercel and Supabase SDKs.

---

## 2. Canvas & In-Browser Drawing Engine

### Decision
Use **Konva.js** via **`react-konva`** (loaded dynamically with `next/dynamic` to prevent SSR evaluation errors) combined with HTML5 2D Canvas export utilities.

### Rationale
- **Declarative React Model**: `react-konva` allows strokes and canvas layers to be managed as declarative React state (`Stage`, `Layer`, `Line`, `Rect`), keeping UI logic clean and predictable.
- **Smooth Line Rendering**: Konva provides built-in stroke smoothing using Bézier tension (`tension: 0.5`, `lineCap: 'round'`, `lineJoin: 'round'`), ensuring fast pointer movements yield smooth continuous lines instead of jagged polygons.
- **Eraser Support**: Konva supports `globalCompositeOperation="destination-out"` on eraser lines, seamlessly revealing the background without destructive vector mutations.
- **High-DPI / Retina Crispness**: Konva automatically handles window `devicePixelRatio` scaling so drawings remain sharp on Retina screens and mobile displays.
- **Serializable Vector Representation**: Each stroke is modeled as a lightweight serializable object:
  ```typescript
  export interface DrawingStroke {
    id: string;
    tool: 'pen' | 'eraser';
    color: string;
    size: number;
    points: number[]; // Flat array of [x0, y0, x1, y1, ...]
  }
  ```
  This cleanly decouples drawing logic from storage and provides the exact vector payload format required for future multiplayer WebSocket synchronization.

### Alternatives Considered
- **Raw HTML5 Canvas 2D API**: Simpler for trivial prototypes, but requires extensive boilerplate for undo/redo stacks, device pixel scaling, touch event normalization, and layer composites.
- **Fabric.js**: Heavier object-oriented canvas library with bloated bundle size; less idiomatic React bindings.

---

## 3. Data Persistence & Object Storage Architecture

### Decision
Use **Supabase (PostgreSQL + Supabase Storage)** governed by an abstracted **Storage Provider Interface**.

### Rationale
- **Two-Tier Separation**:
  1. **PostgreSQL**: Stores structured metadata (`id`, `storage_path`, `width`, `height`, `file_size_bytes`, `created_at`, `status`, `creator_id`).
  2. **Object Storage**: Stores compressed image files (`drawings` bucket).
- **Zero Raw Binaries in DB**: Adheres strictly to Constitution Principle IV, ensuring PostgreSQL remains performant and lightweight.
- **Pluggable Storage Adapter**: The storage layer is accessed via a typed TypeScript adapter interface (`IStorageProvider`), allowing Supabase Storage to be swapped with AWS S3, Cloudflare R2, or MinIO with zero changes to application code.

### Alternatives Considered
- **Direct Base64 in PostgreSQL**: Strictly forbidden by Constitution Principle IV (causes severe database bloat and memory pressure).
- **Local File System Storage**: Not cloud-compatible or resilient on serverless hosting platforms.

---

## 4. Secure Submission & Validation Workflow (Zero-Trust)

### Decision
Client exports an optimized **WebP / PNG image with an opaque solid white background**, then submits via a server-side Route Handler (`POST /api/drawings`) authenticated with the Supabase Service Role key.

### Rationale
- **Zero-Trust Enforcement**: The client never writes directly to the database or storage bucket. All inputs are validated on the server using **Zod**:
  - Payload size under 2MB.
  - MIME type restricted to `image/webp` or `image/png`.
  - Dimensions validated within bounds (e.g., 300x300 to 2048x2048).
  - Magic byte verification of binary buffer before storage upload.
- **Solid White Background Composite**: To prevent dark-mode transparency display bugs in gallery views, the export process composites an opaque white background rectangle (`#FFFFFF`) behind all strokes.
- **Non-Destructive Error Handling**: If the upload fails, the server returns a typed error response; the client maintains the in-memory stroke history intact, allowing the user to retry without losing artwork.

### Alternatives Considered
- **Client Direct Upload via Presigned URL**: Requires two separate client calls (get presigned URL -> upload to S3 -> call DB insert), increasing complexity and creating risk of orphaned files if the DB insert step fails. Server-side orchestration ensures atomic execution.

---

## 5. Future Multiplayer Extensibility Pathway

### Decision
Isolate the MVP Drawing Engine behind a clear state interface and exportable stroke model so future real-time multiplayer features can be attached without rewriting canvas code.

### Extensibility Mapping:
- **Stroke Streaming**: `DrawingStroke` point events can be broadcast incrementally over WebSockets or Supabase Realtime channels.
- **Multiplayer Rooms & Game State**: A future `rooms` table and Redis/WebSocket coordinator will sit above the drawing engine, triggering round timers, prompt distribution, and turn rotations.
- **Player Roles**: Guest sessions in MVP use anonymous UUID tokens, easily upgradeable to Supabase Auth user profiles in subsequent phases.
