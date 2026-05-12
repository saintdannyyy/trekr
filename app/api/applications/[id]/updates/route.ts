import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS application_updates (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      user_id         TEXT NOT NULL,
      type            TEXT NOT NULL,
      message         TEXT NOT NULL,
      metadata        JSONB DEFAULT '{}',
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const [app] = await sql`
    SELECT id FROM applications WHERE id = ${id} AND user_id = ${userId}
  `;
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const updates = await sql`
      SELECT * FROM application_updates
      WHERE application_id = ${id}
      ORDER BY created_at DESC
    `;
    return NextResponse.json(updates);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const [app] = await sql`
    SELECT id FROM applications WHERE id = ${id} AND user_id = ${userId}
  `;
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { type, message, metadata } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  await ensureTable();
  const [row] = await sql`
    INSERT INTO application_updates (application_id, user_id, type, message, metadata)
    VALUES (
      ${id}, ${userId},
      ${type || 'note'},
      ${message.trim()},
      ${JSON.stringify(metadata ?? {})}
    )
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
