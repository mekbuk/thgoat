import { z } from 'zod';

export const nicknameSchema = z
  .string()
  .trim()
  .min(1, 'Nickname must be at least 1 character')
  .max(16, 'Nickname cannot exceed 16 characters')
  .regex(/^[a-zA-Z0-9_\-\s]+$/, 'Nickname can only contain letters, numbers, hyphens, and underscores');

export const roomCodeSchema = z
  .string()
  .trim()
  .length(4, 'Room code must be exactly 4 characters')
  .toUpperCase();

export const createRoomSchema = z.object({
  nickname: nicknameSchema,
});

export const joinRoomSchema = z.object({
  nickname: nicknameSchema,
});

export const submitTitleSchema = z.object({
  stage_id: z.string().uuid('Invalid stage ID'),
  title: z
    .string()
    .trim()
    .min(1, 'Title must be at least 1 character')
    .max(100, 'Title cannot exceed 100 characters'),
});

export const submitVoteSchema = z.object({
  stage_id: z.string().uuid('Invalid stage ID'),
  submission_id: z.string().uuid('Invalid submission ID'),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type SubmitTitleInput = z.infer<typeof submitTitleSchema>;
export type SubmitVoteInput = z.infer<typeof submitVoteSchema>;
