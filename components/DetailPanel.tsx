'use client';

import { useState, useEffect } from 'react';
import { Application, InterviewRound, Contact, Document, Reminder } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { format } from 'date-fns';

interface Props {
  applicationId: string | null;
  onClose: () => void;
  onEdit: (app: Application) => void;
  onDeleted: (id: string) => void;
}

export default function DetailPanel({ applicationId, onClose, onEdit, onDeleted }: Props) {
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'overview' | 'interviews' | 'contacts' | 'documents' | 'reminders'>('overview');

  useEffect(() => {
    if (!applicationId) { setApp(null); return; }
    setLoading(true);
    fetch(`/api/applications/${applicationId}`)
      .then(r => r.json())
      .then(data => { setApp(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [applicationId]);

  async function handleDelete() {
    if (!app || !confirm(`Remove "${app.role} at ${app.company}"?`)) return;
    await fetch(`/api/applications/${app.id}`, { method: 'DELETE' });
    onDeleted(app.id);
    onClose();
  }

  if (!applicationId) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md bg-white border-l border-stone-200 shadow-xl flex flex-col h-full overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-start justify-between">
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-sm flex items-center gap-1 mt-0.5">
            ← back
          </button>
          <div className="flex gap-2">
            <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => app && onEdit(app)}>Edit</button>
            <button className="btn-danger text-xs py-1.5 px-3" onClick={handleDelete}>Delete</button>
          </div>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">Loading…</div>
        )}

        {!loading && app && (
          <>
            {/* Role info */}
            <div className="px-6 py-5 border-b border-stone-100">
              <h2 className="text-xl font-semibold text-stone-900 leading-tight">{app.role}</h2>
              <p className="text-amber-600 font-medium mt-0.5">{app.company}</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <StatusBadge status={app.status} customStatus={app.custom_status} />
                {app.work_type && <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">{app.work_type}</span>}
                {app.location && <span className="text-xs text-stone-500">📍 {app.location}</span>}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-stone-100 px-6 overflow-x-auto">
              {(['overview','interviews','contacts','documents','reminders'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-xs font-medium py-3 px-1 mr-5 border-b-2 capitalize transition-colors whitespace-nowrap ${
                    tab === t ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {t}
                  {t === 'interviews' && app.interview_rounds?.length ? ` (${app.interview_rounds.length})` : ''}
                  {t === 'contacts'   && app.contacts?.length   ? ` (${app.contacts.length})`   : ''}
                  {t === 'documents'  && app.documents?.length  ? ` (${app.documents.length})`  : ''}
                  {t === 'reminders'  && app.reminders?.filter(r => !r.done).length ? ` (${app.reminders.filter(r => !r.done).length})` : ''}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-sm">

              {tab === 'overview' && (
                <div className="space-y-4">
                  <Row label="Date applied" value={app.date_applied ? format(new Date(app.date_applied), 'd MMM yyyy') : '—'} />
                  <Row label="Salary" value={
                    app.salary_min || app.salary_max
                      ? `${app.salary_currency} ${app.salary_min?.toLocaleString() ?? '?'} – ${app.salary_max?.toLocaleString() ?? '?'}`
                      : '—'
                  } />
                  {app.job_url && (
                    <div>
                      <p className="label">Job posting</p>
                      <a href={app.job_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm break-all">
                        View posting ↗
                      </a>
                    </div>
                  )}
                  {app.notes && (
                    <div>
                      <p className="label">Notes</p>
                      <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{app.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'interviews' && (
                <div className="space-y-3">
                  {!app.interview_rounds?.length && <Empty text="No interview rounds logged yet." />}
                  {app.interview_rounds?.map(ir => (
                    <div key={ir.id} className="card p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-stone-800">Round {ir.round_number} · {ir.round_type}</span>
                        <OutcomePill outcome={ir.outcome} />
                      </div>
                      {ir.scheduled_at && <p className="text-xs text-stone-400">{format(new Date(ir.scheduled_at), 'd MMM yyyy, h:mm a')}</p>}
                      {ir.notes && <p className="text-stone-500 mt-2 text-xs leading-relaxed">{ir.notes}</p>}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'contacts' && (
                <div className="space-y-3">
                  {!app.contacts?.length && <Empty text="No contacts logged yet." />}
                  {app.contacts?.map(c => (
                    <div key={c.id} className="card p-4">
                      <p className="font-medium text-stone-800">{c.name}</p>
                      {c.title && <p className="text-xs text-stone-400">{c.title}</p>}
                      <div className="flex flex-wrap gap-3 mt-2">
                        {c.email && <a href={`mailto:${c.email}`} className="text-xs text-blue-500 hover:underline">{c.email}</a>}
                        {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">LinkedIn ↗</a>}
                      </div>
                      {c.notes && <p className="text-stone-500 mt-2 text-xs">{c.notes}</p>}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'documents' && (
                <div className="space-y-3">
                  {!app.documents?.length && <Empty text="No documents logged yet." />}
                  {app.documents?.map(d => (
                    <div key={d.id} className="card p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-stone-800">{d.label}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{d.doc_type}</p>
                      </div>
                      {d.file_url && (
                        <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Open ↗</a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'reminders' && (
                <div className="space-y-3">
                  {!app.reminders?.length && <Empty text="No reminders set." />}
                  {app.reminders?.map(r => (
                    <div key={r.id} className={`card p-4 ${r.done ? 'opacity-50' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium ${r.done ? 'line-through text-stone-400' : 'text-stone-800'}`}>{r.message}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{format(new Date(r.remind_at), 'd MMM yyyy, h:mm a')}</p>
                        </div>
                        {!r.done && (
                          <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="text-stone-700">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-stone-400 text-sm py-4 text-center">{text}</p>;
}

function OutcomePill({ outcome }: { outcome?: string }) {
  if (!outcome) return null;
  const styles: Record<string, string> = {
    Passed: 'bg-green-50 text-green-700',
    Failed: 'bg-red-50 text-red-600',
    Pending: 'bg-amber-50 text-amber-600',
    Cancelled: 'bg-stone-100 text-stone-500',
  };
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles[outcome] ?? styles.Pending}`}>{outcome}</span>;
}
