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

  const { name, title, email, linkedin_url, notes } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const [row] = await sql`
    INSERT INTO contacts (application_id, user_id, name, title, email, linkedin_url, notes)
    VALUES (
      ${applicationId}, ${userId},
      ${name.trim()},
      ${title || null},
      ${email || null},
      ${linkedin_url || null},
      ${notes || null}
    )
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
