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

  const { round_number, round_type, scheduled_at, notes, outcome } = await req.json();

  const [row] = await sql`
    INSERT INTO interview_rounds
      (application_id, user_id, round_number, round_type, scheduled_at, notes, outcome)
    VALUES (
      ${applicationId}, ${userId},
      ${round_number || 1},
      ${round_type || 'Phone Screen'},
      ${scheduled_at || null},
      ${notes || null},
      ${outcome || 'Pending'}
    )
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
