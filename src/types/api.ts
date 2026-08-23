import { DrawingPublicDto } from './drawing';

export interface SubmitDrawingRequest {
  imageBase64: string;
  format: 'image/png' | 'image/webp';
  width: number;
  height: number;
  strokeCount: number;
  title?: string;
  creatorId?: string;
}

export interface SubmitDrawingResponse {
  success: true;
  drawing: DrawingPublicDto;
}

export interface GetDrawingsResponse {
  drawings: DrawingPublicDto[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = (T & { success: true }) | ApiErrorResponse;
