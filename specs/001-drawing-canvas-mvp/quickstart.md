# Quickstart & Validation Guide: Drawing Canvas MVP

**Feature Branch**: `001-drawing-canvas-mvp`  
**Date**: 2026-08-23  

This guide provides the step-by-step procedure to set up, run, and validate the Drawing Canvas MVP end-to-end.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or higher
- **Package Manager**: `pnpm` or `npm`
- **Supabase Account / Local Instance**: Active project with PostgreSQL database and a public storage bucket named `drawings`.

---

## 2. Environment Setup

Create a `.env.local` file in the project root:

```env
# Next.js Public Config
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Server-Only Secret (Never exposed to browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
STORAGE_BUCKET_NAME=drawings
```

---

## 3. Database & Storage Initialization

1. Open your Supabase SQL Editor and execute the schema definition from [`data-model.md`](file:///C:/Users/musa/Desktop/throatgoat/specs/001-drawing-canvas-mvp/data-model.md#1-relational-database-schema-postgresql).
2. In Supabase Storage, create a bucket named `drawings` and set its access policy to **Public** read.

---

## 4. Install & Run Development Server

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Navigate to `http://localhost:3000`.

---

## 5. End-to-End Validation Scenarios

### Scenario 1: Interactive Canvas Drawing & Tool Verification
1. Open `http://localhost:3000`.
2. Draw a line using the mouse or touch. Verify continuous, smooth 60fps rendering.
3. Select a different color from the palette and adjust the brush size slider. Draw additional strokes and verify color and thickness reflect settings.
4. Switch to the **Eraser** tool and drag over drawn strokes; verify the underlying stroke is erased to white.
5. Click **Undo** and verify the previous stroke disappears.
6. Click **Clear**, cancel the confirmation dialog (strokes remain), then trigger Clear and confirm (canvas is cleared).

### Scenario 2: Drawing Submission & Persistence
1. Draw a test figure on the canvas.
2. Click the **Submit** button.
3. Verify the loading spinner appears on the submit button and prevents duplicate clicks.
4. Verify a success confirmation modal appears with a preview of the submitted image.
5. In Supabase Dashboard:
   - Verify a new file exists in Storage (`drawings/YYYY/MM/...webp`).
   - Verify a new row exists in the `drawings` table with matching metadata.

### Scenario 3: Gallery & Drawing Retrieval
1. Navigate to the Gallery section or view.
2. Verify the submitted drawing appears at the top of the grid with its timestamp.
3. Refresh the browser page (`F5`). Verify the drawing remains visible and loads properly.
4. Click on the drawing card to view the enlarged modal.

### Scenario 4: Automated Testing
```bash
# Run unit and contract tests
npm run test

# Run build verification
npm run build
```
