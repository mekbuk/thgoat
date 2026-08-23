export interface DrawingEntity {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  format: 'image/png' | 'image/webp';
  width: number;
  height: number;
  file_size_bytes: number;
  stroke_count: number;
  title: string | null;
  creator_id: string | null;
  status: 'published' | 'flagged' | 'archived';
  created_at: string; // ISO 8601 string
  updated_at: string;
}

export interface DrawingPublicDto {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  width: number;
  height: number;
  strokeCount: number;
  createdAt: string;
}
