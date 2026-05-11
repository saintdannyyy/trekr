import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { roundId } = await params;
  const { round_type, scheduled_at, notes, outcome } = await req.json();

  const [row] = await sql`
    UPDATE interview_rounds SET
      round_type   = COALESCE(${round_type || null}, round_type),
      scheduled_at = COALESCE(${scheduled_at || null}, scheduled_at),
      notes        = COALESCE(${notes ?? null}, notes),
      outcome      = COALESCE(${outcome || null}, outcome)
    WHERE id = ${roundId} AND user_id = ${userId}
    RETURNING *
  `;
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { roundId } = await params;
  const [row] = await sql`
    DELETE FROM interview_rounds WHERE id = ${roundId} AND user_id = ${userId} RETURNING id
  `;
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ deleted: row.id });
}
