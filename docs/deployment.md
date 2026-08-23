# Production Deployment Guide: Throat Goat MVP

## 1. Supabase Project Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Execute the migration script in `supabase/migrations/20260823000000_create_drawings.sql` via the Supabase SQL Editor.
3. In **Storage**, create a new bucket named `drawings`.
4. Ensure the `drawings` bucket policy is set to **Public** read access.

## 2. Environment Variables Configuration

Set the following environment variables in your deployment platform (e.g. Vercel, Netlify, Railway):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
STORAGE_BUCKET_NAME=drawings
```

## 3. Vercel Deployment

1. Connect your Git repository to Vercel.
2. Set the framework preset to **Next.js**.
3. Add the environment variables specified above.
4. Click **Deploy**.

## 4. Post-Deployment Verification Checklist

- [ ] Open the production URL and verify the drawing canvas initializes smoothly.
- [ ] Draw a test figure with multiple colors and brush sizes.
- [ ] Submit the drawing and confirm the celebration modal appears.
- [ ] Check the `/gallery` route and verify the uploaded artwork displays properly.
- [ ] Test the interface on a mobile or tablet viewport to confirm responsive touch drawing.
