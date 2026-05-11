import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ updateId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { updateId } = await params;
  try {
    const [row] = await sql`
      DELETE FROM application_updates
      WHERE id = ${updateId} AND user_id = ${userId}
      RETURNING id
    `;
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: row.id });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
