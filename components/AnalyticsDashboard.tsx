"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const BRAND = "#6366f1";
const PALETTE = [
  "#6366f1",
  "#34d399",
  "#fb923c",
  "#f87171",
  "#60a5fa",
  "#a78bfa",
  "#fbbf24",
  "#ec4899",
];
const STATUS_COLORS: Record<string, string> = {
  Watching: "#94a3b8",
  Applied: "#6366f1",
  Interview: "#f59e0b",
  Offer: "#10b981",
  Rejected: "#ef4444",
  Ghosted: "#6b7280",
  Closed: "#374151",
  Custom: "#8b5cf6",
};

interface AnalyticsData {
  applicationsByWeek: Array<{ label: string; count: number }>;
  statusCounts: Array<{ status: string; count: number }>;
  rejectionReasons: Array<{ reason: string; count: number }>;
  kpis: {
    total: number;
    responseRate: number;
    offerRate: number;
    rejectionRate: number;
    avgDaysToResponse: number | null;
  };
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card px-5 py-4">
      <p className="text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </p>
      <p
        className="text-3xl font-semibold tabular-nums tracking-tight"
        style={{ color: accent ?? "inherit" }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-foreground mb-3">{children}</h2>
  );
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card p-5", className)}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  );
}

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { applicationsByWeek, statusCounts, rejectionReasons, kpis } = data;

  const funnelOrder = [
    "Watching",
    "Applied",
    "Interview",
    "Offer",
    "Rejected",
    "Ghosted",
    "Closed",
  ];
  const funnelData = funnelOrder
    .map((s) => ({
      status: s,
      count: statusCounts.find((r) => r.status === s)?.count ?? 0,
    }))
    .filter((d) => d.count > 0);

  const hasRejectionReasons = rejectionReasons.length > 0;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total applications" value={kpis.total} />
        <KpiCard
          label="Response rate"
          value={`${kpis.responseRate}%`}
          sub="Interview + Offer / Applied"
          accent={kpis.responseRate >= 20 ? "#10b981" : "#f59e0b"}
        />
        <KpiCard
          label="Offer rate"
          value={`${kpis.offerRate}%`}
          sub="Offers / Responses"
          accent={kpis.offerRate > 0 ? "#10b981" : undefined}
        />
        <KpiCard
          label="Rejection rate"
          value={`${kpis.rejectionRate}%`}
          sub="Rejected / Applied"
          accent={kpis.rejectionRate > 60 ? "#ef4444" : undefined}
        />
      </div>

      {/* Applications over time + Status funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ChartCard title="Applications over time" className="lg:col-span-3">
          {applicationsByWeek.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Not enough data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={applicationsByWeek} barSize={20}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border, #e5e7eb)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{
                    fontSize: 11,
                    fill: "var(--color-muted-foreground, #6b7280)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                    fill: "var(--color-muted-foreground, #6b7280)",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="count"
                  name="Applications"
                  fill={BRAND}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Status distribution" className="lg:col-span-2">
          {funnelData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelData} layout="vertical" barSize={14}>
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{
                    fontSize: 10,
                    fill: "var(--color-muted-foreground, #6b7280)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="status"
                  tick={{
                    fontSize: 11,
                    fill: "var(--color-muted-foreground, #6b7280)",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? BRAND}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Rejection reasons */}
      {hasRejectionReasons && (
        <ChartCard title="Rejection reasons">
          <div className="flex items-center justify-center gap-8">
            <PieChart width={160} height={160}>
              <Pie
                data={rejectionReasons}
                dataKey="count"
                nameKey="reason"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={3}
              >
                {rejectionReasons.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
            </PieChart>
            <div className="space-y-1.5">
              {rejectionReasons.map((r, i) => (
                <div key={r.reason} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                    {r.reason}
                  </span>
                  <span className="text-xs font-medium text-foreground tabular-nums ml-auto pl-4">
                    {r.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
