import { describe, it, expect } from 'vitest';
import { SubmitDrawingRequestSchema, GetDrawingsQuerySchema } from '../../src/lib/validation/drawing-schemas';

describe('Zod Submission & Query Validation Schemas', () => {
  it('should accept valid submission payload', () => {
    const validPayload = {
      imageBase64: 'data:image/webp;base64,AAAA...',
      format: 'image/webp',
      width: 800,
      height: 600,
      strokeCount: 5,
      title: 'Majestic Throat Goat',
    };

    const result = SubmitDrawingRequestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should reject payload with zero strokes', () => {
    const invalidPayload = {
      imageBase64: 'data:image/webp;base64,AAAA...',
      format: 'image/webp',
      width: 800,
      height: 600,
      strokeCount: 0,
    };

    const result = SubmitDrawingRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should reject payload with invalid dimensions', () => {
    const invalidPayload = {
      imageBase64: 'data:image/webp;base64,AAAA...',
      format: 'image/webp',
      width: 100, // min is 300
      height: 5000, // max is 4096
      strokeCount: 1,
    };

    const result = SubmitDrawingRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should parse and coerce valid query parameters', () => {
    const query = {
      limit: '15',
    };

    const result = GetDrawingsQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(15);
    }
  });
});
