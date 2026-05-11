import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import sql from "@/lib/db";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export const metadata: Metadata = { title: "Analytics — Trekr" };

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // ── All queries in parallel ─────────────────────────────────────
  const [statusRows, weeklyRows] = await Promise.all([
    sql`
      SELECT status, COUNT(*)::int AS count
      FROM applications
      WHERE user_id = ${userId}
      GROUP BY status
    `,
    sql`
      SELECT
        TO_CHAR(DATE_TRUNC('week', created_at), 'MM/DD') AS label,
        COUNT(*)::int AS count
      FROM applications
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '12 weeks'
      GROUP BY DATE_TRUNC('week', created_at), label
      ORDER BY DATE_TRUNC('week', created_at)
    `,
  ]);

  // Rejection reasons — table may not exist yet, handle gracefully
  let rejectionRows: Array<{ reason: string; count: number }> = [];
  try {
    rejectionRows = (await sql`
      SELECT
        COALESCE(metadata->>'reason', 'No reason given') AS reason,
        COUNT(*)::int AS count
      FROM application_updates
      WHERE user_id = ${userId} AND type = 'rejection'
      GROUP BY reason
      ORDER BY count DESC
    `) as Array<{ reason: string; count: number }>;
  } catch {
    rejectionRows = [];
  }

  // ── KPI derivation ───────────────────────────────────────────────
  const byStatus: Record<string, number> = {};
  let total = 0;
  for (const r of statusRows) {
    byStatus[r.status as string] = r.count as number;
    total += r.count as number;
  }

  const applied = byStatus["Applied"] ?? 0;
  const interviews = byStatus["Interview"] ?? 0;
  const offers = byStatus["Offer"] ?? 0;
  const rejected = byStatus["Rejected"] ?? 0;
  const responses = interviews + offers;

  const responseRate =
    applied + responses > 0
      ? Math.round((responses / (applied + responses)) * 100)
      : 0;
  const offerRate = responses > 0 ? Math.round((offers / responses) * 100) : 0;
  const rejectionRate =
    applied > 0 ? Math.round((rejected / applied) * 100) : 0;

  const data = {
    applicationsByWeek: weeklyRows.map((r) => ({
      label: r.label as string,
      count: r.count as number,
    })),
    statusCounts: statusRows.map((r) => ({
      status: r.status as string,
      count: r.count as number,
    })),
    rejectionReasons: rejectionRows,
    kpis: {
      total,
      responseRate,
      offerRate,
      rejectionRate,
      avgDaysToResponse: null,
    },
  };

  return (
    <div className="px-6 py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-foreground">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your application activity at a glance
        </p>
      </div>
      <AnalyticsDashboard data={data} />
    </div>
  );
}
