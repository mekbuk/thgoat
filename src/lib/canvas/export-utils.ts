import type Konva from 'konva';

export interface ExportedImageResult {
  dataUrl: string;
  base64: string;
  format: 'image/webp' | 'image/png';
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Exports a Konva Stage to a WebP or PNG data URL with solid white background
 */
export async function exportStageToImage(
  stage: Konva.Stage,
  format: 'image/webp' | 'image/png' = 'image/webp',
  quality: number = 0.92
): Promise<ExportedImageResult> {
  const width = stage.width();
  const height = stage.height();

  // Export stage with pixelRatio 1 or 2 for high quality
  const dataUrl = stage.toDataURL({
    mimeType: format,
    quality,
    pixelRatio: 1,
  });

  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');

  // Calculate approximate byte size from base64 string
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  const sizeBytes = Math.floor((base64.length * 3) / 4) - padding;

  return {
    dataUrl,
    base64,
    format,
    width,
    height,
    sizeBytes,
  };
}

/**
 * Retrieves or generates a persistent anonymous guest ID in localStorage
 */
export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') {
    return '00000000-0000-0000-0000-000000000000';
  }

  const STORAGE_KEY = 'throatgoat_guest_id';
  let guestId = localStorage.getItem(STORAGE_KEY);

  if (!guestId) {
    // Generate UUID v4
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      guestId = crypto.randomUUID();
    } else {
      guestId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    localStorage.setItem(STORAGE_KEY, guestId);
  }

  return guestId;
}
