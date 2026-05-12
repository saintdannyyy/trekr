import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// Ensure the push_subscriptions table exists
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    TEXT NOT NULL,
      endpoint   TEXT NOT NULL,
      p256dh     TEXT NOT NULL,
      auth       TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, endpoint)
    )
  `;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint, keys } = await req.json();
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json(
      { error: "Invalid subscription object" },
      { status: 400 },
    );
  }

  await ensureTable();
  await sql`
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (${userId}, ${endpoint}, ${keys.p256dh}, ${keys.auth})
    ON CONFLICT (user_id, endpoint) DO NOTHING
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = await req.json();
  if (!endpoint)
    return NextResponse.json({ error: "endpoint required" }, { status: 400 });

  await sql`
    DELETE FROM push_subscriptions
    WHERE user_id = ${userId} AND endpoint = ${endpoint}
  `;

  return NextResponse.json({ ok: true });
}
