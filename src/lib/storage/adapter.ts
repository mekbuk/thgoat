/**
 * Pluggable Storage Provider Contract Interface
 *
 * Adheres to Constitution Principle IV: decouples object storage
 * from vendor-specific APIs (Supabase Storage, S3, Cloudflare R2, MinIO).
 */

export interface StorageUploadOptions {
  bucket: string;
  key: string;
  buffer: Buffer | Uint8Array;
  contentType: string;
  upsert?: boolean;
}

export interface StorageUploadResult {
  path: string;
  publicUrl: string;
  sizeBytes: number;
}

export interface IStorageProvider {
  /**
   * Uploads a binary buffer to object storage and returns public URL
   */
  upload(options: StorageUploadOptions): Promise<StorageUploadResult>;

  /**
   * Retrieves the public URL for a stored key
   */
  getPublicUrl(bucket: string, key: string): string;

  /**
   * Deletes a stored asset if needed (e.g. rollback on DB transaction failure)
   */
  delete(bucket: string, key: string): Promise<void>;
}
