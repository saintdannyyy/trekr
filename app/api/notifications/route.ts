import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reminders = await sql`
    SELECT
      r.id,
      r.message,
      r.remind_at,
      r.done,
      r.created_at,
      a.id      AS application_id,
      a.company,
      a.role
    FROM reminders r
    JOIN applications a ON a.id = r.application_id
    WHERE r.user_id = ${userId}
    ORDER BY r.done ASC, r.remind_at ASC
  `;

  return NextResponse.json(reminders);
}
