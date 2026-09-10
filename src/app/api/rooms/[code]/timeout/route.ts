import { NextRequest, NextResponse } from 'next/server';
import { GameService } from '@/lib/services/game-service';

export const dynamic = 'force-dynamic';

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

    const body = await req.json().catch(() => ({}));
    const result = await GameService.handleTimeout(
      code,
      sessionToken,
      body?.phase,
      body?.matchup_id
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('Timeout handler error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to handle timeout' },
      { status: err?.status || 500 }
    );
  }
}
