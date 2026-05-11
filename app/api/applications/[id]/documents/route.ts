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

  const { doc_type, label, file_url } = await req.json();
  if (!label?.trim()) return NextResponse.json({ error: 'Label is required' }, { status: 400 });

  const [row] = await sql`
    INSERT INTO documents (application_id, user_id, doc_type, label, file_url)
    VALUES (
      ${applicationId}, ${userId},
      ${doc_type || 'Resume'},
      ${label.trim()},
      ${file_url || null}
    )
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
