import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Vercel sends Authorization: Bearer <CRON_SECRET> for protected crons
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Initialise VAPID inside the handler so env vars are available at request time
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  // Fetch all overdue, pending reminders joined with their application
  const reminders = await sql`
    SELECT
      r.id,
      r.user_id,
      r.message,
      r.remind_at,
      a.id   AS app_id,
      a.role AS role,
      a.company
    FROM reminders r
    JOIN applications a ON a.id = r.application_id
    WHERE r.done = FALSE AND r.remind_at <= NOW()
  `;

  if (!reminders.length) return NextResponse.json({ sent: 0, fired: 0 });

  // Gather unique user IDs and their subscriptions
  const userIds = [...new Set(reminders.map((r) => r.user_id))];
  const subs = await sql`
    SELECT user_id, endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE user_id = ANY(${userIds})
  `;

  type Sub = { endpoint: string; p256dh: string; auth: string };
  const subsByUser: Record<string, Sub[]> = {};
  for (const sub of subs) {
    if (!subsByUser[sub.user_id]) subsByUser[sub.user_id] = [];
    subsByUser[sub.user_id].push(sub as Sub);
  }

  let sent = 0;
  const staleEndpoints: string[] = [];

  for (const reminder of reminders) {
    const userSubs = subsByUser[reminder.user_id] ?? [];
    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: `${reminder.role} at ${reminder.company}`,
            body: reminder.message,
            url: `/dashboard/${reminder.app_id}`,
            reminderId: reminder.id,
          }),
        );
        sent++;
      } catch (err: unknown) {
        // 410 Gone — subscription expired or user unsubscribed from the browser
        if (
          err &&
          typeof err === "object" &&
          "statusCode" in err &&
          (err as { statusCode: number }).statusCode === 410
        ) {
          staleEndpoints.push(sub.endpoint);
        }
      }
    }
  }

  // Remove stale subscriptions
  if (staleEndpoints.length) {
    await sql`DELETE FROM push_subscriptions WHERE endpoint = ANY(${staleEndpoints})`;
  }

  // Mark fired reminders as done
  const reminderIds = reminders.map((r) => r.id);
  await sql`UPDATE reminders SET done = TRUE WHERE id = ANY(${reminderIds})`;

  return NextResponse.json({ sent, fired: reminders.length });
}
