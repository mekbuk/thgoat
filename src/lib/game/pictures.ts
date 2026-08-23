import { Picture } from '@/types/game';

export const CURATED_PICTURES: Picture[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    image_url: 'https://images.unsplash.com/photo-1590246814883-5783515fb27c?auto=format&fit=crop&w=800&q=80',
    description: 'A terrifyingly wonky dragon with cross-eyes and uneven wings',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    description: 'A misspelled inspirational quote that says "No Ragrets Ever"',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    image_url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80',
    description: 'A portrait of a celebrity that ended up looking like a melting potato',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    image_url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=800&q=80',
    description: 'A hyper-realistic taco with human legs and sunglasses',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

/**
 * Selects pictures for Stage 1 and Stage 2 from the curated catalog.
 */
export function selectGamePictures(totalStages: number = 2): Picture[] {
  const active = CURATED_PICTURES.filter((p) => p.is_active);
  if (active.length < totalStages) {
    return active;
  }
  // Return distinct pictures for each stage
  return [active[0], active[1]];
}
