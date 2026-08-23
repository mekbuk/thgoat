import { NextRequest, NextResponse } from 'next/server';
import { submitVoteSchema } from '@/lib/validators/game-schemas';
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

    const body = await req.json();
    const parsed = submitVoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid vote', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await GameService.submitVote(
      code,
      sessionToken,
      parsed.data.stage_id,
      parsed.data.submission_id
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to submit vote' },
      { status: err?.status || 500 }
    );
  }
}
