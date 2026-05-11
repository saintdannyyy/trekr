import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const [row] = await sql`
    SELECT
      a.*,
      COALESCE(
        json_agg(DISTINCT ir.*) FILTER (WHERE ir.id IS NOT NULL), '[]'
      ) AS interview_rounds,
      COALESCE(
        json_agg(DISTINCT c.*) FILTER (WHERE c.id IS NOT NULL), '[]'
      ) AS contacts,
      COALESCE(
        json_agg(DISTINCT d.*) FILTER (WHERE d.id IS NOT NULL), '[]'
      ) AS documents,
      COALESCE(
        json_agg(DISTINCT r.*) FILTER (WHERE r.id IS NOT NULL), '[]'
      ) AS reminders
    FROM applications a
    LEFT JOIN interview_rounds ir ON ir.application_id = a.id
    LEFT JOIN contacts c ON c.application_id = a.id
    LEFT JOIN documents d ON d.application_id = a.id
    LEFT JOIN reminders r ON r.application_id = a.id
    WHERE a.id = ${id} AND a.user_id = ${userId}
    GROUP BY a.id
  `;

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    role, company, status, custom_status,
    date_applied, location, work_type,
    job_url, salary_min, salary_max, salary_currency, notes,
    rejection_reason,
  } = body;

  // Capture old status for change-logging
  const [current] = await sql`SELECT status FROM applications WHERE id = ${id} AND user_id = ${userId}`;
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const oldStatus = current.status as string;

  const [row] = await sql`
    UPDATE applications SET
      role            = COALESCE(${role || null}, role),
      company         = COALESCE(${company || null}, company),
      status          = COALESCE(${status || null}, status),
      custom_status   = ${custom_status ?? null},
      date_applied    = COALESCE(${date_applied || null}, date_applied),
      location        = COALESCE(${location || null}, location),
      work_type       = COALESCE(${work_type || null}, work_type),
      job_url         = COALESCE(${job_url || null}, job_url),
      salary_min      = ${salary_min ?? null},
      salary_max      = ${salary_max ?? null},
      salary_currency = COALESCE(${salary_currency || null}, salary_currency),
      notes           = COALESCE(${notes || null}, notes)
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Auto-log status changes and rejection reasons (best-effort)
  if (status && status !== oldStatus) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS application_updates (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL, type TEXT NOT NULL, message TEXT NOT NULL,
          metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`
        INSERT INTO application_updates (application_id, user_id, type, message, metadata)
        VALUES (
          ${id}, ${userId}, 'status_change',
          ${`Status changed from ${oldStatus} to ${status}`},
          ${JSON.stringify({ from: oldStatus, to: status })}
        )
      `;
      if (status === 'Rejected' && rejection_reason?.trim()) {
        await sql`
          INSERT INTO application_updates (application_id, user_id, type, message, metadata)
          VALUES (
            ${id}, ${userId}, 'rejection',
            ${rejection_reason.trim()},
            ${JSON.stringify({ reason: rejection_reason.trim() })}
          )
        `;
      }
    } catch {
      // Never fail the main request due to logging
    }
  }

  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const [row] = await sql`
    DELETE FROM applications
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `;

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ deleted: row.id });
}
