import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import { Application, ApplicationStatus } from '@/lib/types';
import DashboardClient from '@/components/DashboardClient';

async function getApplications(userId: string, status?: string): Promise<Application[]> {
  if (status) {
    const rows = await sql`
      SELECT * FROM applications
      WHERE user_id = ${userId} AND status = ${status}
      ORDER BY created_at DESC
    `;
    return rows as Application[];
  }
  const rows = await sql`
    SELECT * FROM applications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return rows as Application[];
}

async function getStats(userId: string) {
  const rows = await sql`
    SELECT status, COUNT(*)::int as count
    FROM applications
    WHERE user_id = ${userId}
    GROUP BY status
  `;
  const byStatus: Record<string, number> = {};
  let total = 0;
  for (const row of rows) {
    byStatus[row.status] = row.count;
    total += row.count;
  }
  const responses = (byStatus['Interview'] || 0) + (byStatus['Offer'] || 0);
  const applied = byStatus['Applied'] || 0;
  return {
    total,
    by_status: byStatus,
    response_rate: applied + responses > 0 ? Math.round((responses / (applied + responses)) * 100) : 0,
    offer_rate: responses > 0 ? Math.round(((byStatus['Offer'] || 0) / responses) * 100) : 0,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { s?: string; q?: string };
}) {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const [applications, stats] = await Promise.all([
    getApplications(userId, searchParams.s),
    getStats(userId),
  ]);

  return (
    <DashboardClient
      initialApplications={applications}
      stats={stats}
      activeStatus={searchParams.s}
    />
  );
}
