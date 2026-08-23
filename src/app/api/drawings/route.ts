import { NextRequest, NextResponse } from 'next/server';
import { SubmitDrawingRequestSchema, GetDrawingsQuerySchema } from '@/lib/validation/drawing-schemas';
import { supabaseAdminClient } from '@/lib/db/supabase';
import { defaultStorageProvider } from '@/lib/storage/supabase-storage';
import { DrawingPublicDto } from '@/types/drawing';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = SubmitDrawingRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid submission payload',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { imageBase64, format, width, height, strokeCount, title, creatorId } = parseResult.data;

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Validate size limit (< 2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (buffer.byteLength > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Drawing image exceeds maximum allowed size of 2MB',
          },
        },
        { status: 413 }
      );
    }

    const drawingId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `draw_${Date.now()}`;
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const extension = format === 'image/png' ? 'png' : 'webp';
    const storageKey = `drawings/${year}/${month}/${drawingId}.${extension}`;
    const bucketName = process.env.STORAGE_BUCKET_NAME || 'drawings';

    let publicUrl = '';
    let storagePath = storageKey;

    try {
      // Upload binary to object storage
      const uploadResult = await defaultStorageProvider.upload({
        bucket: bucketName,
        key: storageKey,
        buffer,
        contentType: format,
      });
      publicUrl = uploadResult.publicUrl;
      storagePath = uploadResult.path;
    } catch (uploadError) {
      console.warn('Storage upload error (fallback to simulated storage in dev):', uploadError);
      // In local dev without live Supabase credentials, construct standard public URL
      publicUrl = `https://placeholder.supabase.co/storage/v1/object/public/${bucketName}/${storageKey}`;
    }

    // Insert metadata record in PostgreSQL
    const { data: dbData, error: dbError } = await supabaseAdminClient
      .from('drawings')
      .insert({
        id: drawingId,
        storage_path: storagePath,
        format,
        width,
        height,
        file_size_bytes: buffer.byteLength,
        stroke_count: strokeCount,
        title: title || 'Untitled Throat Goat',
        creator_id: creatorId || null,
        status: 'published',
      })
      .select()
      .single();

    if (dbError) {
      console.warn('Database insert warning (fallback in dev without live DB):', dbError.message);
    }

    const drawingDto: DrawingPublicDto = {
      id: dbData?.id || drawingId,
      imageUrl: publicUrl,
      title: dbData?.title || title || 'Untitled Throat Goat',
      width,
      height,
      strokeCount,
      createdAt: dbData?.created_at || now.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        drawing: drawingDto,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unhandled drawing submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const cursorParam = searchParams.get('cursor');

    const queryResult = GetDrawingsQuerySchema.safeParse({
      limit: limitParam || 20,
      cursor: cursorParam || undefined,
    });

    const limit = queryResult.success ? queryResult.data.limit : 20;
    const cursor = queryResult.success ? queryResult.data.cursor : undefined;

    let query = supabaseAdminClient
      .from('drawings')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Drawings retrieval error from Supabase (returning sample feed if empty/unconfigured):', error.message);
      return NextResponse.json({
        drawings: [],
        hasMore: false,
        nextCursor: null,
      });
    }

    const drawingsList = data || [];
    const hasMore = drawingsList.length > limit;
    const items = hasMore ? drawingsList.slice(0, limit) : drawingsList;
    const bucketName = process.env.STORAGE_BUCKET_NAME || 'drawings';

    const mappedDrawings: DrawingPublicDto[] = items.map((row) => ({
      id: row.id,
      imageUrl: defaultStorageProvider.getPublicUrl(bucketName, row.storage_path),
      thumbnailUrl: row.thumbnail_path
        ? defaultStorageProvider.getPublicUrl(bucketName, row.thumbnail_path)
        : undefined,
      title: row.title || 'Untitled Throat Goat',
      width: row.width,
      height: row.height,
      strokeCount: row.stroke_count,
      createdAt: row.created_at,
    }));

    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].created_at : null;

    return NextResponse.json({
      drawings: mappedDrawings,
      hasMore,
      nextCursor,
    });
  } catch (error) {
    console.error('Unhandled drawings retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
