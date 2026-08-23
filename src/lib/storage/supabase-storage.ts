import { IStorageProvider, StorageUploadOptions, StorageUploadResult } from './adapter';
import { supabaseAdminClient, supabasePublicClient } from '../db/supabase';

export class SupabaseStorageProvider implements IStorageProvider {
  async upload(options: StorageUploadOptions): Promise<StorageUploadResult> {
    const { bucket, key, buffer, contentType, upsert = false } = options;

    const { data, error } = await supabaseAdminClient.storage
      .from(bucket)
      .upload(key, buffer, {
        contentType,
        upsert,
      });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    const publicUrl = this.getPublicUrl(bucket, data.path);

    return {
      path: data.path,
      publicUrl,
      sizeBytes: buffer.byteLength,
    };
  }

  getPublicUrl(bucket: string, key: string): string {
    const { data } = supabasePublicClient.storage.from(bucket).getPublicUrl(key);
    return data.publicUrl;
  }

  async delete(bucket: string, key: string): Promise<void> {
    const { error } = await supabaseAdminClient.storage.from(bucket).remove([key]);
    if (error) {
      console.warn(`Supabase Storage delete failed for ${bucket}/${key}:`, error.message);
    }
  }
}

export const defaultStorageProvider: IStorageProvider = new SupabaseStorageProvider();
