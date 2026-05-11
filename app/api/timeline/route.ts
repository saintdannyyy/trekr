import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // All applications, ordered by applied date (earliest first)
  const apps = await sql`
    SELECT id, company, role, status, custom_status, date_applied, created_at, job_url
    FROM applications
    WHERE user_id = ${userId}
    ORDER BY COALESCE(date_applied, created_at::date) ASC
  `;

  // All updates joined with app info, try/catch if table missing
  let updates: Array<{
    id: string;
    application_id: string;
    company: string;
    role: string;
    type: string;
    message: string;
    metadata: Record<string, string>;
    created_at: string;
  }> = [];
  try {
    updates = (await sql`
      SELECT
        au.id,
        au.application_id,
        a.company,
        a.role,
        au.type,
        au.message,
        au.metadata,
        au.created_at
      FROM application_updates au
      JOIN applications a ON a.id = au.application_id
      WHERE au.user_id = ${userId}
      ORDER BY au.created_at DESC
      LIMIT 100
    `) as typeof updates;
  } catch {
    updates = [];
  }

  return NextResponse.json({ apps, updates });
}
