import fs from 'fs';
import path from 'path';
import { Picture, ThroatBox } from '@/types/game';

export interface CelebrityItem extends Picture {
  celebrity_name: string;
  throat_box: ThroatBox;
}

export const CURATED_CELEBRITIES: CelebrityItem[] = [
  {
    id: 'celeb-1',
    celebrity_name: 'The Action Hero',
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    description: 'A rugged action hero staring intensely into the camera',
    is_active: true,
    created_at: new Date().toISOString(),
    throat_box: {
      top: 62,
      left: 35,
      width: 30,
      height: 18,
      rotation: 0,
      curvature: 0.1,
    },
  },
  {
    id: 'celeb-2',
    celebrity_name: 'The Tech Visionary',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    description: 'A turtleneck-wearing tech founder giving a visionary keynote gaze',
    is_active: true,
    created_at: new Date().toISOString(),
    throat_box: {
      top: 60,
      left: 36,
      width: 28,
      height: 16,
      rotation: 0,
      curvature: 0.05,
    },
  },
  {
    id: 'celeb-3',
    celebrity_name: 'The Pop Icon',
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    description: 'A glamorous pop diva posing at a red carpet event',
    is_active: true,
    created_at: new Date().toISOString(),
    throat_box: {
      top: 58,
      left: 38,
      width: 24,
      height: 18,
      rotation: -3,
      curvature: 0.15,
    },
  },
  {
    id: 'celeb-4',
    celebrity_name: 'The Celebrity Chef',
    image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    description: 'A fiery celebrity chef ready to critique your culinary skills',
    is_active: true,
    created_at: new Date().toISOString(),
    throat_box: {
      top: 64,
      left: 34,
      width: 32,
      height: 19,
      rotation: 1,
      curvature: 0.1,
    },
  },
  {
    id: 'celeb-5',
    celebrity_name: 'The Dramatic Thespian',
    image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    description: 'An Oscar-winning method actor in deep existential thought',
    is_active: true,
    created_at: new Date().toISOString(),
    throat_box: {
      top: 61,
      left: 36,
      width: 28,
      height: 17,
      rotation: 2,
      curvature: 0.12,
    },
  },
  {
    id: 'celeb-6',
    celebrity_name: 'The Rock Star',
    image_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    description: 'A stadium rock frontman looking ready for a wild world tour',
    is_active: true,
    created_at: new Date().toISOString(),
    throat_box: {
      top: 59,
      left: 35,
      width: 30,
      height: 20,
      rotation: -2,
      curvature: 0.08,
    },
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
 * Scans the local `photos/celebrities` folder and returns Picture models for all found celebrity images.
 */
export function getLocalCelebrities(): Picture[] {
  try {
    const celebDir = path.join(process.cwd(), 'photos', 'celebrities');
    if (!fs.existsSync(celebDir)) {
      return [];
    }

    const files = fs.readdirSync(celebDir);
    const imageFiles = files.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ALLOWED_IMAGE_EXTS.has(ext);
    });

    return imageFiles.map((file, idx) => {
      const name = cleanDescriptionFromFilename(file) || `Celebrity #${idx + 1}`;
      return {
        id: `celeb-${encodeURIComponent(file)}`,
        image_url: `/api/photos/${encodeURIComponent(file)}`,
        celebrity_name: name,
        description: `Photo of ${name}`,
        is_active: true,
        created_at: new Date().toISOString(),
        throat_box: {
          top: 60,
          left: 35,
          width: 30,
          height: 20,
          rotation: 0,
          curvature: 0.1,
        },
      };
    });
  } catch (err) {
    console.error('Error reading celebrities folder:', err);
    return [];
  }
}

/**
 * Returns available celebrity pictures, prioritizing local folder.
 */
export function getAllAvailableCelebrities(): Picture[] {
  const localCelebs = getLocalCelebrities();
  if (localCelebs.length > 0) {
    return localCelebs;
  }
  return CURATED_CELEBRITIES.filter((c) => c.is_active);
}

/**
 * Selects random celebrity pictures for a game stage.
 */
export function selectCelebritiesForStage(stageNumber: number, count: number): Picture[] {
  const pool = getAllAvailableCelebrities();
  if (count <= 0 || pool.length === 0) return [];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected: Picture[] = [];

  for (let i = 0; i < count; i++) {
    selected.push(shuffled[i % shuffled.length]);
  }

  return selected;
}
