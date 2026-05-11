import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

// ── Interview Rounds ──────────────────────────────────────────────
export async function postInterviewRound(req: NextRequest, applicationId: string) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { round_number, round_type, scheduled_at, notes, outcome } = body;
  const [row] = await sql`
    INSERT INTO interview_rounds (application_id, user_id, round_number, round_type, scheduled_at, notes, outcome)
    VALUES (${applicationId}, ${userId}, ${round_number || 1}, ${round_type || 'Interview'},
            ${scheduled_at || null}, ${notes || null}, ${outcome || 'Pending'})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}

export async function patchInterviewRound(roundId: string, userId: string, body: any) {
  const [row] = await sql`
    UPDATE interview_rounds SET
      round_type   = COALESCE(${body.round_type || null}, round_type),
      scheduled_at = COALESCE(${body.scheduled_at || null}, scheduled_at),
      notes        = COALESCE(${body.notes || null}, notes),
      outcome      = COALESCE(${body.outcome || null}, outcome)
    WHERE id = ${roundId} AND user_id = ${userId}
    RETURNING *
  `;
  return row;
}

// ── Contacts ──────────────────────────────────────────────────────
export async function postContact(req: NextRequest, applicationId: string) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { name, title, email, linkedin_url, notes } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const [row] = await sql`
    INSERT INTO contacts (application_id, user_id, name, title, email, linkedin_url, notes)
    VALUES (${applicationId}, ${userId}, ${name.trim()}, ${title || null},
            ${email || null}, ${linkedin_url || null}, ${notes || null})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}

// ── Documents ─────────────────────────────────────────────────────
export async function postDocument(req: NextRequest, applicationId: string) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { doc_type, label, file_url } = body;
  if (!label?.trim()) return NextResponse.json({ error: 'Label required' }, { status: 400 });
  const [row] = await sql`
    INSERT INTO documents (application_id, user_id, doc_type, label, file_url)
    VALUES (${applicationId}, ${userId}, ${doc_type || 'Resume'}, ${label.trim()}, ${file_url || null})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}

// ── Reminders ─────────────────────────────────────────────────────
export async function postReminder(req: NextRequest, applicationId: string) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { message, remind_at } = body;
  if (!message?.trim() || !remind_at) return NextResponse.json({ error: 'Message and remind_at required' }, { status: 400 });
  const [row] = await sql`
    INSERT INTO reminders (application_id, user_id, message, remind_at)
    VALUES (${applicationId}, ${userId}, ${message.trim()}, ${remind_at})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}

export async function patchReminder(reminderId: string, userId: string, done: boolean) {
  const [row] = await sql`
    UPDATE reminders SET done = ${done}
    WHERE id = ${reminderId} AND user_id = ${userId}
    RETURNING *
  `;
  return row;
}
