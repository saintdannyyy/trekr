"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Application, ApplicationStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/ui/StatusBadge";
import StatsBar from "@/components/ui/StatsBar";
import ApplicationModal from "@/components/ApplicationModal";
import { format } from "date-fns";
import { toast } from "sonner";
import { LayoutList, LayoutGrid, Plus, Search, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const KANBAN_COLUMNS: ApplicationStatus[] = [
  "Watching",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Ghosted",
  "Closed",
];

interface Props {
  initialApplications: Application[];
  stats: Record<string, unknown>;
  weekly: Array<{ label: string; count: number }>;
  activeStatus?: string;
}

export default function DashboardClient({
  initialApplications,
  stats,
  weekly,
  activeStatus,
}: Props) {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>(initialApplications);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<keyof Application>("created_at");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [view, setView] = useState<"table" | "board">("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return apps
      .filter(
        (a) =>
          !q ||
          [a.role, a.company, a.location, a.notes, a.custom_status]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) => {
        const va = String(a[sortCol] ?? "");
        const vb = String(b[sortCol] ?? "");
        return va < vb ? -sortDir : va > vb ? sortDir : 0;
      });
  }, [apps, search, sortCol, sortDir]);

  function sort(col: keyof Application) {
    if (sortCol === col) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortCol(col);
      setSortDir(1);
    }
  }

  function arrow(col: keyof Application) {
    if (sortCol !== col) return <span className="opacity-20 ml-1">↕</span>;
    return <span className="ml-1 text-brand">{sortDir === 1 ? "↑" : "↓"}</span>;
  }

  function onSaved(app: Application) {
    setApps((prev) => {
      const idx = prev.findIndex((a) => a.id === app.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = app;
        return next;
      }
      return [app, ...prev];
    });
    toast.success(editing ? "Application updated" : "Application added");
  }

  function openEdit(app: Application, e?: React.MouseEvent) {
    e?.stopPropagation();
    setEditing(app);
    setModalOpen(true);
  }

  const pageTitle = activeStatus
    ? `${activeStatus} applications`
    : "All applications";

  return (
    <>
      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-6xl">
        {/* Page header */}
        <div className="flex items-start justify-between mb-5 gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-lg sm:text-xl font-semibold text-foreground">
              {pageTitle}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} role{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* View toggle — hidden on smallest screens, show list only */}
            <div className="hidden sm:flex items-center rounded-lg border border-border bg-card p-0.5">
              <button
                onClick={() => setView("table")}
                title="Table view"
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === "table"
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutList size={14} />
              </button>
              <button
                onClick={() => setView("board")}
                title="Board view"
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === "board"
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
            <Button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="gap-1.5 text-sm"
              size="sm"
            >
              <Plus size={14} />
              <span className="hidden xs:inline">Add role</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Mini weekly activity chart */}
        {weekly.length > 0 && (
          <div className="mb-2 rounded-xl border border-border bg-card px-4 pt-3 pb-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">
                Activity (last 10 weeks)
              </p>
              <Link
                href="/dashboard/analytics"
                className="text-xs text-brand hover:text-brand-deep font-medium transition-colors"
              >
                View analytics →
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={56}>
              <BarChart data={weekly} barSize={10}>
                <XAxis
                  dataKey="label"
                  tick={{
                    fontSize: 9,
                    fill: "var(--color-muted-foreground,#6b7280)",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: "1px solid var(--color-border,#e5e7eb)",
                    background: "var(--color-card,#fff)",
                  }}
                  itemStyle={{ color: "var(--color-foreground,#111)" }}
                />
                <Bar
                  dataKey="count"
                  name="Applications"
                  fill="#6366f1"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            className="pl-9"
            placeholder="Search roles, companies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Views */}
        {view === "table" ? (
          <TableView
            apps={filtered}
            sort={sort}
            arrow={arrow}
            onRowClick={(app) => router.push(`/dashboard/${app.id}`)}
            onEdit={openEdit}
            search={search}
          />
        ) : (
          <KanbanView
            apps={filtered}
            onCardClick={(app) => router.push(`/dashboard/${app.id}`)}
            onEdit={openEdit}
          />
        )}
      </div>

      <ApplicationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={onSaved}
        existing={editing}
      />
    </>
  );
}

// ── Table View ──────────────────────────────────────────────────────
function TableView({
  apps,
  sort,
  arrow,
  onRowClick,
  onEdit,
  search,
}: {
  apps: Application[];
  sort: (col: keyof Application) => void;
  arrow: (col: keyof Application) => React.ReactNode;
  onRowClick: (app: Application) => void;
  onEdit: (app: Application, e: React.MouseEvent) => void;
  search: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted border-b border-border">
              {(
                [
                  { col: "role" as keyof Application, label: "Role", cls: "" },
                  { col: "status" as keyof Application, label: "Status", cls: "" },
                  { col: "date_applied" as keyof Application, label: "Applied", cls: "hidden sm:table-cell" },
                  { col: "location" as keyof Application, label: "Location", cls: "hidden md:table-cell" },
                  { col: "work_type" as keyof Application, label: "Type", cls: "hidden lg:table-cell" },
                ] as { col: keyof Application; label: string; cls: string }[]
              ).map(({ col, label, cls }) => (
                <th
                  key={col}
                  className={cn("text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 cursor-pointer select-none hover:text-foreground transition-colors", cls)}
                  onClick={() => sort(col)}
                >
                  {label}
                  {arrow(col)}
                </th>
              ))}
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Notes
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {apps.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-muted/50 cursor-pointer transition-colors group"
                onClick={() => onRowClick(app)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground leading-tight">
                    {app.role}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {app.company}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={app.status}
                    customStatus={app.custom_status ?? undefined}
                  />
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">
                  {app.date_applied
                    ? format(new Date(app.date_applied), "d MMM yy")
                    : "—"}
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-muted-foreground max-w-35 truncate">
                  {app.location || "—"}
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {app.work_type || "—"}
                </td>
                <td className="hidden lg:table-cell px-4 py-3 max-w-45">
                  <p className="text-muted-foreground text-xs truncate italic">
                    {app.notes || "—"}
                  </p>
                </td>
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all p-1 rounded hover:bg-muted"
                    onClick={(e) => onEdit(app, e)}
                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!apps.length && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-3 w-fit text-muted-foreground opacity-20">
            <LayoutList size={32} />
          </div>
          <p className="text-foreground font-medium">No applications found</p>
          <p className="text-muted-foreground text-sm mt-1">
            {search
              ? "Try a different search term"
              : "Add your first role to get started"}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Kanban Board View ───────────────────────────────────────────────
function KanbanView({
  apps,
  onCardClick,
  onEdit,
}: {
  apps: Application[];
  onCardClick: (app: Application) => void;
  onEdit: (app: Application, e: React.MouseEvent) => void;
}) {
  const byStatus = useMemo(() => {
    const map: Record<string, Application[]> = {};
    for (const col of KANBAN_COLUMNS) map[col] = [];
    for (const app of apps) {
      const key = KANBAN_COLUMNS.includes(app.status as ApplicationStatus)
        ? app.status
        : "Watching";
      map[key].push(app);
    }
    return map;
  }, [apps]);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => (
        <div key={col} className="shrink-0 w-56">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {col}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {byStatus[col].length}
            </span>
          </div>
          <div className="space-y-2">
            {byStatus[col].map((app) => (
              <div
                key={app.id}
                role="button"
                tabIndex={0}
                className="card p-3 cursor-pointer hover:border-brand/30 hover:shadow-md transition-all group"
                onClick={() => onCardClick(app)}
                onKeyDown={(e) => e.key === "Enter" && onCardClick(app)}
              >
                <p className="text-sm font-medium text-foreground leading-tight line-clamp-2">
                  {app.role}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {app.company}
                </p>
                {app.date_applied && (
                  <p className="text-xs text-muted-foreground mt-2 tabular-nums">
                    {format(new Date(app.date_applied), "d MMM yy")}
                  </p>
                )}
                {app.location && (
                  <p className="text-xs text-muted-foreground truncate">
                    {app.location}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  {app.work_type ? (
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {app.work_type}
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={(e) => onEdit(app, e)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all p-1 rounded hover:bg-muted"
                    title="Edit"
                  >
                    <Pencil size={11} />
                  </button>
                </div>
              </div>
            ))}
            {byStatus[col].length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-6 text-center">
                <p className="text-xs text-muted-foreground">Empty</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
