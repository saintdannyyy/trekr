import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await sql`
    SELECT * FROM applications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    role, company, status = 'Applied', custom_status,
    date_applied, location, work_type = 'Full Time',
    job_url, salary_min, salary_max, salary_currency = 'GHS', notes,
  } = body;

  if (!role?.trim() || !company?.trim()) {
    return NextResponse.json({ error: 'Role and company are required' }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO applications (
      user_id, role, company, status, custom_status,
      date_applied, location, work_type, job_url,
      salary_min, salary_max, salary_currency, notes
    ) VALUES (
      ${userId}, ${role.trim()}, ${company.trim()}, ${status},
      ${custom_status || null}, ${date_applied || null},
      ${location || null}, ${work_type}, ${job_url || null},
      ${salary_min || null}, ${salary_max || null},
      ${salary_currency}, ${notes || null}
    )
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
