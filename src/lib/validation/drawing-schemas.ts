import { z } from 'zod';

export const SubmitDrawingRequestSchema = z.object({
  imageBase64: z.string().min(1, 'Image data is required'),
  format: z.enum(['image/png', 'image/webp']).default('image/webp'),
  width: z.number().int().min(300, 'Width must be at least 300px').max(4096, 'Width cannot exceed 4096px'),
  height: z.number().int().min(300, 'Height must be at least 300px').max(4096, 'Height cannot exceed 4096px'),
  strokeCount: z.number().int().min(1, 'Drawing must contain at least one stroke'),
  title: z.string().trim().max(100, 'Title cannot exceed 100 characters').optional().default('Untitled Throat Goat'),
  creatorId: z.string().uuid().optional(),
});

export type SubmitDrawingInput = z.infer<typeof SubmitDrawingRequestSchema>;

export const GetDrawingsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().datetime().optional(),
});

export type GetDrawingsQueryInput = z.infer<typeof GetDrawingsQuerySchema>;
