import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import sql from "@/lib/db";
import { Application, ApplicationStatus } from "@/lib/types";
import DashboardClient from "@/components/DashboardClient";
import { DashboardPageSkeleton } from "@/components/ui/page-skeletons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Trekr",
};

const STANDARD_STATUSES = [
  "Watching",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Ghosted",
  "Closed",
  "Custom",
];

async function getApplications(
  userId: string,
  status?: string,
): Promise<Application[]> {
  if (!status) {
    const rows = await sql`
      SELECT * FROM applications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return rows as Application[];
  }
  // Custom label filter (user-defined value stored in custom_status column)
  if (!STANDARD_STATUSES.includes(status)) {
    const rows = await sql`
      SELECT * FROM applications
      WHERE user_id = ${userId} AND status = 'Custom' AND custom_status = ${status}
      ORDER BY created_at DESC
    `;
    return rows as Application[];
  }
  const rows = await sql`
    SELECT * FROM applications
    WHERE user_id = ${userId} AND status = ${status}
    ORDER BY created_at DESC
  `;
  return rows as Application[];
}

async function getStats(userId: string) {
  const [statusRows, weeklyRows] = await Promise.all([
    sql`
      SELECT status, COUNT(*)::int as count
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
        AND created_at >= NOW() - INTERVAL '10 weeks'
      GROUP BY DATE_TRUNC('week', created_at), label
      ORDER BY DATE_TRUNC('week', created_at)
    `,
  ]);
  const byStatus: Record<string, number> = {};
  let total = 0;
  for (const row of statusRows) {
    byStatus[row.status] = row.count;
    total += row.count;
  }
  const responses = (byStatus["Interview"] || 0) + (byStatus["Offer"] || 0);
  const applied = byStatus["Applied"] || 0;
  return {
    total,
    by_status: byStatus,
    response_rate:
      applied + responses > 0
        ? Math.round((responses / (applied + responses)) * 100)
        : 0,
    offer_rate:
      responses > 0
        ? Math.round(((byStatus["Offer"] || 0) / responses) * 100)
        : 0,
    weekly: weeklyRows.map((r) => ({
      label: r.label as string,
      count: r.count as number,
    })),
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; q?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { s } = await searchParams;

  return (
    <Suspense key={s ?? "all"} fallback={<DashboardPageSkeleton />}>
      <DashboardContent userId={userId} activeStatus={s} />
    </Suspense>
  );
}

async function DashboardContent({
  userId,
  activeStatus,
}: {
  userId: string;
  activeStatus?: string;
}) {
  const [applications, stats] = await Promise.all([
    getApplications(userId, activeStatus),
    getStats(userId),
  ]);

  return (
    <DashboardClient
      initialApplications={applications}
      stats={stats}
      weekly={stats.weekly}
      activeStatus={activeStatus}
    />
  );
}
