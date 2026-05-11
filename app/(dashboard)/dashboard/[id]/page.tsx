import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import sql from "@/lib/db";
import ApplicationDetail from "@/components/ApplicationDetail";
import type { Application } from "@/lib/types";

async function getApplication(
  id: string,
  userId: string,
): Promise<Application | null> {
  const [row] = await sql`
    SELECT
      a.*,
      COALESCE(json_agg(DISTINCT ir.*) FILTER (WHERE ir.id IS NOT NULL), '[]') AS interview_rounds,
      COALESCE(json_agg(DISTINCT c.*)  FILTER (WHERE c.id IS NOT NULL), '[]')  AS contacts,
      COALESCE(json_agg(DISTINCT d.*)  FILTER (WHERE d.id IS NOT NULL), '[]')  AS documents,
      COALESCE(json_agg(DISTINCT r.*)  FILTER (WHERE r.id IS NOT NULL), '[]')  AS reminders
    FROM applications a
    LEFT JOIN interview_rounds ir ON ir.application_id = a.id
    LEFT JOIN contacts c          ON c.application_id  = a.id
    LEFT JOIN documents d         ON d.application_id  = a.id
    LEFT JOIN reminders r         ON r.application_id  = a.id
    WHERE a.id = ${id} AND a.user_id = ${userId}
    GROUP BY a.id
  `;
  return (row as Application) ?? null;
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const application = await getApplication(id, userId);
  if (!application) notFound();

  return <ApplicationDetail initialData={application} />;
}
