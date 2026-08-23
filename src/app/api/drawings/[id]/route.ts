import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/db/supabase';
import { defaultStorageProvider } from '@/lib/storage/supabase-storage';
import { DrawingPublicDto } from '@/types/drawing';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdminClient
      .from('drawings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Drawing not found',
          },
        },
        { status: 404 }
      );
    }

    const bucketName = process.env.STORAGE_BUCKET_NAME || 'drawings';
    const drawingDto: DrawingPublicDto = {
      id: data.id,
      imageUrl: defaultStorageProvider.getPublicUrl(bucketName, data.storage_path),
      thumbnailUrl: data.thumbnail_path
        ? defaultStorageProvider.getPublicUrl(bucketName, data.thumbnail_path)
        : undefined,
      title: data.title || 'Untitled Throat Goat',
      width: data.width,
      height: data.height,
      strokeCount: data.stroke_count,
      createdAt: data.created_at,
    };

    return NextResponse.json(drawingDto);
  } catch (error) {
    console.error('Unhandled get single drawing error:', error);
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
