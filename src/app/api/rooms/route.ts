import { NextRequest, NextResponse } from 'next/server';
import { createRoomSchema } from '@/lib/validators/game-schemas';
import { GameService } from '@/lib/services/game-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createRoomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await GameService.createRoom(parsed.data.nickname);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('Error creating room:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to create room' },
      { status: err?.status || 500 }
    );
  }
}
