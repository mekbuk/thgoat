import fs from 'fs';
import path from 'path';
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
  {
    id: '55555555-5555-5555-5555-555555555555',
    image_url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&w=800&q=80',
    description: 'A cat with six arms holding cups of coffee and crying',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    image_url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80',
    description: 'A majestic lion tattoo that looks surprisingly like Nicholas Cage',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    image_url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
    description: 'An anatomically questionable skull wearing propeller beanie',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    image_url: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=800&q=80',
    description: 'A butterfly tattoo that accidentally looks like a juicy steak',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    image_url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=800&q=80',
    description: 'A barcode on a neck that actually scans as a pack of celery',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    image_url: 'https://images.unsplash.com/photo-1590246814883-5783515fb27c?auto=format&fit=crop&w=800&q=80',
    description: 'A dolphin jumping through a fiery ring of flaming donuts',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    description: 'A portrait of an ex-partner covered up with a crude giant raven',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    image_url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80',
    description: 'A flaming eight-ball that looks suspiciously like a bowling ball on fire',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    image_url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&w=800&q=80',
    description: 'A screaming pigeon with biceps flexing in a tank top',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    image_url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80',
    description: 'A rose tattoo where the stem spells out "Only God Can Fudge Me"',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    image_url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
    description: 'A giant grim reaper riding a tandem bicycle with a rubber duck',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-aaaa-bbbb-cccc-000000000001',
    image_url: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=800&q=80',
    description: 'A tiny smiley face tattooed on an elbow that looks very confused',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif', '.bmp']);

function cleanDescriptionFromFilename(filename: string): string {
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  const cleaned = nameWithoutExt.replace(/[-_]+/g, ' ').trim();
  return cleaned
    .split(' ')
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');
}

/**
 * Scans the local `photos/` folder and returns Picture models for all found image files.
 */
export function getLocalPictures(): Picture[] {
  try {
    const photosDir = path.join(process.cwd(), 'photos');
    if (!fs.existsSync(photosDir)) {
      return [];
    }

    const files = fs.readdirSync(photosDir);
    const imageFiles = files.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ALLOWED_IMAGE_EXTS.has(ext);
    });

    return imageFiles.map((file, idx) => ({
      id: `photo-${encodeURIComponent(file)}`,
      image_url: `/api/photos/${encodeURIComponent(file)}`,
      description: cleanDescriptionFromFilename(file) || `Wild Tattoo #${idx + 1}`,
      is_active: true,
      created_at: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Error reading photos folder:', err);
    return [];
  }
}

/**
 * Returns available pictures, prioritizing the user's `photos/` folder.
 */
export function getAllAvailablePictures(): Picture[] {
  const localPics = getLocalPictures();
  if (localPics.length > 0) {
    return localPics;
  }
  return CURATED_PICTURES.filter((p) => p.is_active);
}

/**
 * Shuffles an array randomly using the Fisher-Yates algorithm.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Selects randomly chosen pictures for a game stage from the available photo catalog.
 * Shuffles pictures randomly so each game round gets a fresh surprise.
 */
export function selectPicturesForStage(stageNumber: number, count: number): Picture[] {
  const pool = getAllAvailablePictures();
  if (count <= 0 || pool.length === 0) return [];

  const shuffled = shuffleArray(pool);
  const selected: Picture[] = [];

  for (let i = 0; i < count; i++) {
    selected.push(shuffled[i % shuffled.length]);
  }

  return selected;
}

/**
 * Selects random game pictures across stages.
 */
export function selectGamePictures(totalStages: number = 2): Picture[] {
  const pool = getAllAvailablePictures();
  if (pool.length === 0) return [];
  const shuffled = shuffleArray(pool);
  const selected: Picture[] = [];
  for (let i = 0; i < totalStages; i++) {
    selected.push(shuffled[i % shuffled.length]);
  }
  return selected;
}
