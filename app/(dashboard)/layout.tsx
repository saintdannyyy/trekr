import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Settings } from "lucide-react";
import SidebarNavLinks from "@/components/SidebarNavLinks";
import PushNotificationManager from "@/components/PushNotificationManager";
import MobileSidebarToggle from "@/components/MobileSidebarToggle";
import sql from "@/lib/db";

async function getCustomStatuses(userId: string): Promise<string[]> {
  const rows = await sql`
    SELECT DISTINCT custom_status
    FROM applications
    WHERE user_id = ${userId}
      AND status = 'Custom'
      AND custom_status IS NOT NULL
    ORDER BY custom_status
  `;
  return rows.map((r) => r.custom_status as string);
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const customStatuses = await getCustomStatuses(userId);

  const sidebarContent = (
    <>
      <Suspense fallback={<div className="flex-1" />}>
        <SidebarNavLinks customStatuses={customStatuses} />
      </Suspense>
      <div className="px-3 py-4 border-t border-border shrink-0 space-y-0.5">
        <PushNotificationManager />
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings size={14} className="shrink-0" />
          Settings
        </Link>
        <div className="flex items-center gap-3 px-2 py-2">
          <UserButton />
          <span className="text-xs text-muted-foreground truncate">
            My account
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-card border-r border-border flex-col">
        <div className="px-4 py-4 border-b border-border shrink-0">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo.png"
              alt="Trekr"
              width={96}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <MobileSidebarToggle>{sidebarContent}</MobileSidebarToggle>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Image
            src="/logo.png"
            alt="Trekr"
            width={72}
            height={24}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>
        <UserButton />
      </div>

      {/* Main — offset top on mobile for the fixed top bar */}
      <main className="flex-1 overflow-auto lg:pt-0 pt-14">{children}</main>
    </div>
  );
}
