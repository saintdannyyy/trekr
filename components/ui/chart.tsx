"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export function ChartContainer({
  children,
  className,
  height = 220,
}: {
  children: React.ReactElement;
  className?: string;
  height?: number;
}) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    fill?: string;
    color?: string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: p.fill ?? p.color ?? "#6366f1" }}
          />
          {p.name && <span className="text-muted-foreground">{p.name}:</span>}
          <span className="font-medium text-foreground tabular-nums">
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
