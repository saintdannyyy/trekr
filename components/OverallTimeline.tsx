"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  formatDistanceToNow,
  format,
  differenceInDays,
  parseISO,
} from "date-fns";
import {
  ArrowRightLeft,
  XCircle,
  RefreshCw,
  Video,
  Star,
  MessageSquare,
  ExternalLink,
  Layers,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  Watching: "#94a3b8",
  Applied: "#6366f1",
  Interview: "#f59e0b",
  Offer: "#10b981",
  Rejected: "#ef4444",
  Ghosted: "#6b7280",
  Closed: "#374151",
};
const DEFAULT_COLOR = "#8b5cf6";

type UpdateType =
  | "note"
  | "status_change"
  | "follow_up"
  | "rejection"
  | "interview_note"
  | "offer_note";

interface AppRow {
  id: string;
  company: string;
  role: string;
  status: string;
  custom_status: string | null;
  date_applied: string | null;
  created_at: string;
  job_url: string | null;
}

interface UpdateRow {
  id: string;
  application_id: string;
  company: string;
  role: string;
  type: UpdateType;
  message: string;
  metadata: Record<string, string>;
  created_at: string;
}

function typeIcon(type: UpdateType) {
  switch (type) {
    case "status_change":
      return <ArrowRightLeft size={12} />;
    case "rejection":
      return <XCircle size={12} />;
    case "follow_up":
      return <RefreshCw size={12} />;
    case "interview_note":
      return <Video size={12} />;
    case "offer_note":
      return <Star size={12} />;
    default:
      return <MessageSquare size={12} />;
  }
}

function typeColor(type: UpdateType) {
  switch (type) {
    case "status_change":
      return "bg-brand/15 text-brand";
    case "rejection":
      return "bg-destructive/15 text-destructive";
    case "follow_up":
      return "bg-blue-500/15 text-blue-600";
    case "interview_note":
      return "bg-amber-500/15 text-amber-600";
    case "offer_note":
      return "bg-emerald-500/15 text-emerald-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function typeLabel(type: UpdateType) {
  switch (type) {
    case "status_change":
      return "Status change";
    case "rejection":
      return "Rejected";
    case "follow_up":
      return "Follow-up";
    case "interview_note":
      return "Interview";
    case "offer_note":
      return "Offer";
    default:
      return "Note";
  }
}

// Groups updates by calendar date string
function groupByDate(updates: UpdateRow[]) {
  const map = new Map<string, UpdateRow[]>();
  for (const u of updates) {
    const day = String(u.created_at).slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(u);
  }
  return [...map.entries()].map(([date, items]) => ({ date, items }));
}

// Custom Gantt tooltip
function GanttTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: AppRow & { days: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs max-w-[200px]">
      <p className="font-semibold text-foreground truncate">{d.company}</p>
      <p className="text-muted-foreground truncate">{d.role}</p>
      <div className="flex items-center gap-1.5 mt-1">
        <div
          className="h-2 w-2 rounded-full"
          style={{ background: STATUS_COLORS[d.status] ?? DEFAULT_COLOR }}
        />
        <span className="text-foreground">{d.status}</span>
      </div>
      <p className="text-muted-foreground mt-0.5 tabular-nums">
        {d.days} days in pipeline
      </p>
    </div>
  );
}

export default function OverallTimeline() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [updates, setUpdates] = useState<UpdateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"roadmap" | "feed">("roadmap");

  useEffect(() => {
    fetch("/api/timeline")
      .then((r) => r.json())
      .then((d) => {
        setApps(Array.isArray(d.apps) ? d.apps : []);
        setUpdates(Array.isArray(d.updates) ? d.updates : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 max-w-4xl animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center max-w-4xl">
        <Layers
          size={24}
          className="mx-auto mb-3 text-muted-foreground opacity-30"
        />
        <p className="text-sm font-medium text-foreground">
          No applications yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Add your first application to see the roadmap.
        </p>
      </div>
    );
  }

  // ── Build Gantt data ─────────────────────────────────────────────
  const today = new Date();
  const ganttData = apps
    .map((a) => {
      const start = a.date_applied
        ? parseISO(String(a.date_applied).slice(0, 10))
        : new Date(a.created_at);
      const days = Math.max(1, differenceInDays(today, start));
      return {
        ...a,
        days,
        label: a.company.length > 18 ? a.company.slice(0, 16) + "…" : a.company,
      };
    })
    .sort((a, b) => b.days - a.days); // longest first

  const maxDays = Math.max(...ganttData.map((d) => d.days), 1);

  // ── Activity feed grouped by date ───────────────────────────────
  const grouped = groupByDate(updates);

  const TABS = [
    { key: "roadmap" as const, label: "Roadmap", icon: <Layers size={13} /> },
    {
      key: "feed" as const,
      label: "Activity feed",
      icon: <Activity size={13} />,
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Tab toggle */}
      <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ROADMAP tab ─────────────────────────────────────────── */}
      {tab === "roadmap" && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Application roadmap
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Days each application has been in your pipeline, coloured by
                status
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {Object.entries(STATUS_COLORS)
                .filter(([s]) => ganttData.some((d) => d.status === s))
                .map(([s, c]) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: c }}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {s}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <ResponsiveContainer
            width="100%"
            height={Math.max(ganttData.length * 36 + 30, 120)}
          >
            <BarChart
              data={ganttData}
              layout="vertical"
              barSize={18}
              margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="var(--color-border,#e5e7eb)"
              />
              <XAxis
                type="number"
                domain={[0, maxDays]}
                tickFormatter={(v) => `${v}d`}
                tick={{
                  fontSize: 10,
                  fill: "var(--color-muted-foreground,#6b7280)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{
                  fontSize: 11,
                  fill: "var(--color-muted-foreground,#6b7280)",
                }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip
                content={<GanttTooltip />}
                cursor={{ fill: "rgba(99,102,241,0.05)" }}
              />
              <Bar
                dataKey="days"
                radius={[0, 5, 5, 0]}
                label={{
                  position: "right",
                  formatter: (v: unknown) => `${v}d`,
                  fontSize: 10,
                  fill: "var(--color-muted-foreground,#6b7280)",
                }}
              >
                {ganttData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={STATUS_COLORS[entry.status] ?? DEFAULT_COLOR}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Application list below chart */}
          <div className="mt-5 divide-y divide-border">
            {ganttData.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between py-2.5 gap-4 group"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard?app=${a.id}`}
                    className="text-sm font-medium text-foreground hover:text-brand transition-colors truncate block"
                  >
                    {a.role}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.company}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      background: `${STATUS_COLORS[a.status] ?? DEFAULT_COLOR}20`,
                      color: STATUS_COLORS[a.status] ?? DEFAULT_COLOR,
                    }}
                  >
                    {a.status === "Custom"
                      ? (a.custom_status ?? "Custom")
                      : a.status}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums w-14 text-right">
                    {a.days}d ago
                  </span>
                  {a.job_url && (
                    <a
                      href={a.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-brand transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ACTIVITY FEED tab ───────────────────────────────────── */}
      {tab === "feed" && (
        <div className="space-y-6">
          {updates.length === 0 ? (
            <div className="card py-16 text-center">
              <Activity
                size={22}
                className="mx-auto mb-3 text-muted-foreground opacity-30"
              />
              <p className="text-sm font-medium text-foreground">
                No activity yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Status changes and notes will appear here as you update your
                applications.
              </p>
            </div>
          ) : (
            grouped.map(({ date, items }) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {format(parseISO(date), "MMMM d, yyyy")}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-2">
                  {items.map((u) => (
                    <div
                      key={u.id}
                      className="card px-4 py-3 flex items-start gap-3"
                    >
                      {/* Type dot */}
                      <div
                        className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          typeColor(u.type),
                        )}
                      >
                        {typeIcon(u.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">
                            {typeLabel(u.type)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ·
                          </span>
                          <Link
                            href={`/dashboard?app=${u.application_id}`}
                            className="text-xs font-medium text-brand hover:underline"
                          >
                            {u.company} — {u.role}
                          </Link>
                          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums">
                            {formatDistanceToNow(new Date(u.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-1 leading-relaxed">
                          {u.message}
                        </p>
                        {u.metadata?.reason && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">
                            Reason: {u.metadata.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
