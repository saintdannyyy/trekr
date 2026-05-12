"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BarChart2, GitBranch, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/dashboard",
    label: "All applications",
    icon: "▤",
    exact: true,
    s: null,
  },
  { href: "/dashboard?s=Applied", label: "Applied", icon: "◎", s: "Applied" },
  {
    href: "/dashboard?s=Interview",
    label: "Interviews",
    icon: "◷",
    s: "Interview",
  },
  { href: "/dashboard?s=Offer", label: "Offers", icon: "✦", s: "Offer" },
  {
    href: "/dashboard?s=Watching",
    label: "Watching",
    icon: "◉",
    s: "Watching",
  },
  {
    href: "/dashboard?s=Rejected",
    label: "Rejected",
    icon: "✕",
    s: "Rejected",
  },
  { href: "/dashboard?s=Ghosted", label: "Ghosted", icon: "◌", s: "Ghosted" },
  {
    href: "/dashboard?s=Closed",
    label: "Closed / Missed",
    icon: "—",
    s: "Closed",
  },
];

export default function SidebarNavLinks({
  customStatuses = [],
}: {
  customStatuses?: string[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const s = searchParams.get("s");

  function isActive(sValue: string | null, exact = false) {
    if (exact) return pathname === "/dashboard" && !s;
    return pathname === "/dashboard" && s === sValue;
  }

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
        Pipeline
      </p>{" "}
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors",
            isActive(item.s, item.exact)
              ? "bg-brand/10 text-brand font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <span className="text-[11px] w-4 text-center shrink-0">
            {item.icon}
          </span>
          {item.label}
        </Link>
      ))}
      {customStatuses.length > 0 && (
        <>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 pt-4 mb-2">
            Custom
          </p>
          {customStatuses.map((label) => (
            <Link
              key={label}
              href={`/dashboard?s=${encodeURIComponent(label)}`}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors",
                isActive(label)
                  ? "bg-brand/10 text-brand font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="text-[11px] w-4 text-center shrink-0">◈</span>
              {label}
            </Link>
          ))}
        </>
      )}
      {/* Analytics + Timeline */}
      <div className="pt-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
          Insights
        </p>
        <Link
          href="/dashboard/timeline"
          className={cn(
            "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors",
            pathname === "/dashboard/timeline"
              ? "bg-brand/10 text-brand font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <GitBranch size={13} className="shrink-0" />
          Timeline
        </Link>
        <Link
          href="/dashboard/analytics"
          className={cn(
            "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors",
            pathname === "/dashboard/analytics"
              ? "bg-brand/10 text-brand font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <BarChart2 size={13} className="shrink-0" />
          Analytics
        </Link>
        <Link
          href="/dashboard/notifications"
          className={cn(
            "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors",
            pathname === "/dashboard/notifications"
              ? "bg-brand/10 text-brand font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Bell size={13} className="shrink-0" />
          Notifications
        </Link>
      </div>
    </nav>
  );
}
