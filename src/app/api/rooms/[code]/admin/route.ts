import { NextRequest, NextResponse } from 'next/server';
import { GameService } from '@/lib/services/game-service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { action, password } = body;

    if (password !== 'Passw0rd_is_zer0') {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }

    let result;
    if (action === 'force_start') {
      result = await GameService.forceStartGame(code, password);
    } else if (action === 'force_reset') {
      result = await GameService.forceResetLobby(code, password);
    } else if (action === 'force_advance') {
      result = await GameService.forceAdvance(code, password);
    } else {
      return NextResponse.json({ error: 'Unknown admin action' }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('Admin API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Admin action failed' },
      { status: err?.status || 500 }
    );
  }
}
