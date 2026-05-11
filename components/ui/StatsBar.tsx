interface Props {
  stats: Record<string, unknown>;
}

const tiles = [
  { key: "total", label: "Total", colorClass: "text-foreground" },
  { key: "Applied", label: "Applied", colorClass: "text-brand" },
  { key: "Interview", label: "Interviews", colorClass: "text-amber-500" },
  { key: "Offer", label: "Offers", colorClass: "text-emerald-500" },
  {
    key: "response_rate",
    label: "Response rate",
    colorClass: "text-foreground",
    suffix: "%",
  },
];

export default function StatsBar({ stats }: Props) {
  const byStatus = (stats.by_status ?? {}) as Record<string, number>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {tiles.map((t) => {
        const val =
          t.key === "total"
            ? ((stats.total as number) ?? 0)
            : t.key === "response_rate"
              ? ((stats.response_rate as number) ?? 0)
              : (byStatus[t.key] ?? 0);

        return (
          <div key={t.key} className="card px-4 py-3.5">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              {t.label}
            </p>
            <p
              className={`text-2xl font-semibold tabular-nums tracking-tight ${t.colorClass}`}
            >
              {val}
              {t.suffix ?? ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}
