import { describe, it, expect } from 'vitest';
import { getLocalPictures, getAllAvailablePictures, selectPicturesForStage, shuffleArray } from '@/lib/game/pictures';

describe('Pictures & Photos Management', () => {
  it('loads local photos from the photos directory', () => {
    const localPics = getLocalPictures();
    expect(Array.isArray(localPics)).toBe(true);
    // 4 photos exist in the photos folder
    expect(localPics.length).toBeGreaterThanOrEqual(4);
    expect(localPics[0].image_url).toMatch(/^\/api\/photos\//);
    expect(localPics[0].description).toBeDefined();
    expect(localPics[0].is_active).toBe(true);
  });

  it('provides available pictures with local photos prioritized', () => {
    const available = getAllAvailablePictures();
    expect(available.length).toBeGreaterThanOrEqual(4);
    expect(available.some((p) => p.image_url.startsWith('/api/photos/'))).toBe(true);
  });

  it('selects random pictures for a game stage with expected count', () => {
    const count = 3;
    const selected = selectPicturesForStage(1, count);
    expect(selected).toHaveLength(count);
    selected.forEach((pic) => {
      expect(pic.id).toBeDefined();
      expect(pic.image_url).toBeDefined();
    });
  });

  it('handles requests for more pictures than exist in pool by cycling safely', () => {
    const count = 10;
    const selected = selectPicturesForStage(1, count);
    expect(selected).toHaveLength(10);
  });

  it('shuffles arrays without mutating length or dropping items', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffleArray(input);
    expect(shuffled).toHaveLength(input.length);
    expect(new Set(shuffled)).toEqual(new Set(input));
  });
});
