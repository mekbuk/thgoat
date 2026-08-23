import { describe, it, expect } from 'vitest';
import { SubmitDrawingRequestSchema } from '../../src/lib/validation/drawing-schemas';

describe('Drawing API Submission Integration Verification', () => {
  it('should validate complete submission payload with all attributes', () => {
    const payload = {
      imageBase64: 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=',
      format: 'image/webp',
      width: 680,
      height: 520,
      strokeCount: 12,
      title: 'Legendary Throat Goat',
      creatorId: '123e4567-e89b-12d3-a456-426614174000',
    };

    const parsed = SubmitDrawingRequestSchema.parse(payload);
    expect(parsed.format).toBe('image/webp');
    expect(parsed.strokeCount).toBe(12);
    expect(parsed.title).toBe('Legendary Throat Goat');
    expect(parsed.creatorId).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('should use default title when title is omitted or empty', () => {
    const payload = {
      imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      format: 'image/png',
      width: 800,
      height: 600,
      strokeCount: 3,
    };

    const parsed = SubmitDrawingRequestSchema.parse(payload);
    expect(parsed.title).toBe('Untitled Throat Goat');
  });
});
