# Production Deployment Guide: Throat Goat

This guide explains how to deploy **Throat Goat** to **Vercel** with **Supabase** backend persistence for the Drawing Canvas, Gallery, and Realtime Multiplayer Game.

---

## 1. Supabase Project Setup

1. Create a new project at [https://supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the following scripts in order:
   - `supabase/migrations/20260823000000_create_drawings.sql` (Creates drawings gallery table)
   - `supabase/migrations/20260823000000_multiplayer_schema.sql` (Creates rooms, players, games, stages, submissions, votes, and scores tables)
   - `supabase/seed.sql` (Inserts initial curated tattoo picture catalog)
3. In **Storage**:
   - Create a new bucket named `drawings`.
   - Set the bucket policy to **Public** read access.
4. In **Project Settings > API**:
   - Copy your **Project URL**.
   - Copy your **anon / public** API key.
   - Copy your **service_role** API key (keep this secret!).

---

## 2. Environment Variables Configuration

Add the following environment variables to your deployment platform (e.g. Vercel, Netlify, Railway) and to your local `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
STORAGE_BUCKET_NAME=drawings
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## 3. Vercel Deployment

1. Push your code to GitHub / GitLab / Bitbucket.
2. Go to [https://vercel.com/new](https://vercel.com/new) and import your repository.
3. Select framework preset: **Next.js**.
4. In the **Environment Variables** section, paste the variables listed above.
5. Click **Deploy**.

---

## 4. Post-Deployment Verification Checklist

### Solo Drawing & Gallery:
- [ ] Open the homepage and verify the drawing canvas initializes smoothly.
- [ ] Draw a test figure with different colors, stroke sizes, and undo/redo.
- [ ] Submit the drawing and confirm the celebration modal appears.
- [ ] Visit `/gallery` and verify the uploaded artwork displays properly.

### Multiplayer Tattoo-Title Game:
- [ ] On device/browser 1 (Host), create a new multiplayer room.
- [ ] On device/browser 2 (Player 2) and device 3 (Player 3), join using the 4-character room code.
- [ ] Verify all 3 players appear live in the lobby across devices.
- [ ] Host clicks **Start Game**; verify all players transition to **Stage 1 Submitting**.
- [ ] Each player submits a funny title; verify the game transitions automatically to **Voting Phase**.
- [ ] Verify players can vote on other players' titles (and cannot vote for their own).
- [ ] When all votes are cast, verify the **Results Phase** displays points and winners correctly.
- [ ] Advance to **Stage 2** and verify Stage 2 submission, voting, and final leaderboard screen.
