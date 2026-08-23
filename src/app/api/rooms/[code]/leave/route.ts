import { NextRequest, NextResponse } from 'next/server';
import { GameService } from '@/lib/services/game-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const sessionToken = req.headers.get('x-session-token');

    if (!sessionToken) {
      return NextResponse.json({ error: 'Missing x-session-token header' }, { status: 401 });
    }

    const result = await GameService.leaveRoom(code, sessionToken);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to leave room' },
      { status: err?.status || 500 }
    );
  }
}
