import { describe, it, expect } from 'vitest';

export function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid data URL format');
  }
  return {
    mimeType: match[1],
    base64: match[2],
  };
}

describe('Canvas Export & MIME Conversion Utilities', () => {
  it('should parse valid base64 PNG data URL', () => {
    const fakeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const parsed = parseDataUrl(fakeDataUrl);
    expect(parsed.mimeType).toBe('image/png');
    expect(parsed.base64).toBeDefined();
    expect(parsed.base64.length).toBeGreaterThan(0);
  });

  it('should parse valid base64 WebP data URL', () => {
    const fakeDataUrl = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    const parsed = parseDataUrl(fakeDataUrl);
    expect(parsed.mimeType).toBe('image/webp');
    expect(parsed.base64).toBeDefined();
  });

  it('should reject invalid data URLs', () => {
    expect(() => parseDataUrl('not-a-data-url')).toThrow('Invalid data URL format');
  });
});
