import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: applicationId } = await params;

  const [app] = await sql`
    SELECT id FROM applications WHERE id = ${applicationId} AND user_id = ${userId}
  `;
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { message, remind_at } = await req.json();
  if (!message?.trim() || !remind_at) {
    return NextResponse.json({ error: 'Message and remind_at are required' }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO reminders (application_id, user_id, message, remind_at)
    VALUES (${applicationId}, ${userId}, ${message.trim()}, ${remind_at})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
