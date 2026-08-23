import { describe, it, expect } from 'vitest';
import { GetDrawingsQuerySchema } from '../../src/lib/validation/drawing-schemas';

describe('Gallery Retrieval API Contracts', () => {
  it('should validate query limits and defaults', () => {
    const defaultQuery = GetDrawingsQuerySchema.parse({});
    expect(defaultQuery.limit).toBe(20);
    expect(defaultQuery.cursor).toBeUndefined();

    const customQuery = GetDrawingsQuerySchema.parse({
      limit: '50',
      cursor: '2026-08-23T12:00:00.000Z',
    });
    expect(customQuery.limit).toBe(50);
    expect(customQuery.cursor).toBe('2026-08-23T12:00:00.000Z');
  });

  it('should reject invalid limit bounds (> 50)', () => {
    const invalidQuery = { limit: '100' };
    const result = GetDrawingsQuerySchema.safeParse(invalidQuery);
    expect(result.success).toBe(false);
  });
});
