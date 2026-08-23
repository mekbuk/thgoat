import { NextRequest, NextResponse } from 'next/server';
import { joinRoomSchema } from '@/lib/validators/game-schemas';
import { GameService } from '@/lib/services/game-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const parsed = joinRoomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid nickname', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await GameService.joinRoom(code, parsed.data.nickname);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to join room' },
      { status: err?.status || 500 }
    );
  }
}
