'use client';

interface Props {
  stats: {
    total: number;
    by_status: Record<string, number>;
    response_rate: number;
    offer_rate: number;
  };
}

const tiles = [
  { key: 'total',         label: 'Total tracked',  color: 'text-stone-900' },
  { key: 'Applied',       label: 'Applied',         color: 'text-blue-600'  },
  { key: 'Interview',     label: 'Interviews',      color: 'text-orange-500'},
  { key: 'Offer',         label: 'Offers',          color: 'text-green-600' },
  { key: 'response_rate', label: 'Response rate',   color: 'text-amber-600', suffix: '%' },
];

export default function StatsBar({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {tiles.map(t => {
        const val =
          t.key === 'total'         ? stats.total :
          t.key === 'response_rate' ? stats.response_rate :
          (stats.by_status[t.key] ?? 0);

        return (
          <div key={t.key} className="card px-4 py-3">
            <p className="text-xs text-stone-400 mb-1">{t.label}</p>
            <p className={`text-2xl font-semibold tabular-nums ${t.color}`}>
              {val}{t.suffix ?? ''}
            </p>
          </div>
        );
      })}
    </div>
  );
}
