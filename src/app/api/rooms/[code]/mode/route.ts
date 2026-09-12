import { NextRequest, NextResponse } from 'next/server';
import { GameService } from '@/lib/services/game-service';
import { GameMode } from '@/types/game';

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

    const body = await req.json();
    const gameMode = body?.game_mode as GameMode;

    if (!gameMode || (gameMode !== 'CLASSIC' && gameMode !== 'CELEBRITY')) {
      return NextResponse.json({ error: 'Invalid game mode' }, { status: 400 });
    }

    const result = await GameService.setGameMode(code, sessionToken, gameMode);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update game mode' },
      { status: err?.status || 500 }
    );
  }
}
