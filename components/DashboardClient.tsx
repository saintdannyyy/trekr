'use client';

import { useState, useMemo } from 'react';
import { Application } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import StatsBar from '@/components/ui/StatsBar';
import ApplicationModal from '@/components/ApplicationModal';
import DetailPanel from '@/components/DetailPanel';
import { format } from 'date-fns';

interface Props {
  initialApplications: Application[];
  stats: any;
  activeStatus?: string;
}

export default function DashboardClient({ initialApplications, stats, activeStatus }: Props) {
  const [apps, setApps] = useState<Application[]>(initialApplications);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<keyof Application>('created_at');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return apps
      .filter(a =>
        !q || [a.role, a.company, a.location, a.notes, a.custom_status]
          .filter(Boolean).join(' ').toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const va = String(a[sortCol] ?? '');
        const vb = String(b[sortCol] ?? '');
        return va < vb ? -sortDir : va > vb ? sortDir : 0;
      });
  }, [apps, search, sortCol, sortDir]);

  function sort(col: keyof Application) {
    if (sortCol === col) setSortDir(d => d === 1 ? -1 : 1);
    else { setSortCol(col); setSortDir(1); }
  }

  function arrow(col: keyof Application) {
    if (sortCol !== col) return <span className="opacity-20 ml-1">↕</span>;
    return <span className="ml-1 text-amber-500">{sortDir === 1 ? '↑' : '↓'}</span>;
  }

  function onSaved(app: Application) {
    setApps(prev => {
      const idx = prev.findIndex(a => a.id === app.id);
      if (idx > -1) { const next = [...prev]; next[idx] = app; return next; }
      return [app, ...prev];
    });
  }

  function onDeleted(id: string) {
    setApps(prev => prev.filter(a => a.id !== id));
  }

  function openEdit(app: Application) {
    setEditing(app);
    setModalOpen(true);
  }

  const pageTitle = activeStatus
    ? `${activeStatus} applications`
    : 'All applications';

  return (
    <>
      <div className="px-6 py-6 max-w-6xl">
        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">{pageTitle}</h1>
            <p className="text-sm text-stone-400 mt-0.5">{filtered.length} role{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => { setEditing(null); setModalOpen(true); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add role
          </button>
        </div>

        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="input pl-9"
            placeholder="Search roles, companies, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  {[
                    { col: 'role'        as keyof Application, label: 'Role'     },
                    { col: 'status'      as keyof Application, label: 'Status'   },
                    { col: 'date_applied'as keyof Application, label: 'Applied'  },
                    { col: 'location'    as keyof Application, label: 'Location' },
                    { col: 'work_type'   as keyof Application, label: 'Type'     },
                  ].map(({ col, label }) => (
                    <th
                      key={col}
                      className="text-left text-xs font-medium text-stone-500 uppercase tracking-wide px-4 py-3 cursor-pointer select-none hover:text-stone-700"
                      onClick={() => sort(col)}
                    >
                      {label}{arrow(col)}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">Notes</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(app => (
                  <tr
                    key={app.id}
                    className="hover:bg-stone-50 cursor-pointer transition-colors group"
                    onClick={() => setDetailId(app.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-900 leading-tight">{app.role}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{app.company}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} customStatus={app.custom_status ?? undefined} />
                    </td>
                    <td className="px-4 py-3 text-stone-500 tabular-nums whitespace-nowrap">
                      {app.date_applied ? format(new Date(app.date_applied), 'd MMM yy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-500 max-w-[140px] truncate">{app.location || '—'}</td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{app.work_type || '—'}</td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="text-stone-400 text-xs truncate italic">{app.notes || '—'}</p>
                    </td>
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-700 transition-all p-1 rounded hover:bg-stone-100"
                        onClick={() => openEdit(app)}
                        title="Edit"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!filtered.length && (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-stone-500 font-medium">No applications found</p>
              <p className="text-stone-400 text-sm mt-1">
                {search ? 'Try a different search term' : 'Add your first role to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      <ApplicationModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={onSaved}
        existing={editing}
      />

      <DetailPanel
        applicationId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(app) => { setDetailId(null); openEdit(app); }}
        onDeleted={onDeleted}
      />
    </>
  );
}
