import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reminderId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { reminderId } = await params;
  const { done, message, remind_at } = await req.json();

  const [row] = await sql`
    UPDATE reminders SET
      done       = COALESCE(${done ?? null}, done),
      message    = COALESCE(${message || null}, message),
      remind_at  = COALESCE(${remind_at || null}, remind_at)
    WHERE id = ${reminderId} AND user_id = ${userId}
    RETURNING *
  `;
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ reminderId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { reminderId } = await params;
  const [row] = await sql`
    DELETE FROM reminders WHERE id = ${reminderId} AND user_id = ${userId} RETURNING id
  `;
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ deleted: row.id });
}
