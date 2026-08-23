import { NextRequest, NextResponse } from 'next/server';
import { GameService } from '@/lib/services/game-service';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const sessionToken = req.headers.get('x-session-token');

    if (!sessionToken) {
      return NextResponse.json({ error: 'Missing x-session-token header' }, { status: 401 });
    }

    const state = await GameService.getRoomState(code, sessionToken);
    return NextResponse.json(state, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to retrieve room state' },
      { status: err?.status || 500 }
    );
  }
}
