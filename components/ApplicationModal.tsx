'use client';

import { useState, useEffect } from 'react';
import { Application, ApplicationStatus, WorkType } from '@/lib/types';

const STATUSES: ApplicationStatus[] = [
  'Watching', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted', 'Closed', 'Custom',
];
const WORK_TYPES: WorkType[] = [
  'Full Time', 'Part Time', 'Contract', 'Remote', 'Hybrid', 'On-site',
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (app: Application) => void;
  existing?: Application | null;
}

const empty = {
  role: '', company: '', status: 'Applied' as ApplicationStatus, custom_status: '',
  date_applied: new Date().toISOString().slice(0, 10),
  location: '', work_type: 'Full Time' as WorkType,
  job_url: '', salary_min: '', salary_max: '', salary_currency: 'GHS', notes: '',
};

export default function ApplicationModal({ open, onClose, onSaved, existing }: Props) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setForm({
        role: existing.role,
        company: existing.company,
        status: existing.status,
        custom_status: existing.custom_status || '',
        date_applied: existing.date_applied?.slice(0, 10) || '',
        location: existing.location || '',
        work_type: existing.work_type || 'Full Time',
        job_url: existing.job_url || '',
        salary_min: existing.salary_min?.toString() || '',
        salary_max: existing.salary_max?.toString() || '',
        salary_currency: existing.salary_currency || 'GHS',
        notes: existing.notes || '',
      });
    } else {
      setForm(empty);
    }
    setError('');
  }, [existing, open]);

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.role.trim() || !form.company.trim()) {
      setError('Role and company are required.');
      return;
    }
    if (form.status === 'Custom' && !form.custom_status.trim()) {
      setError('Please describe the custom status.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        custom_status: form.status === 'Custom' ? form.custom_status : null,
      };
      const res = await fetch(
        existing ? `/api/applications/${existing.id}` : '/api/applications',
        {
          method: existing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const saved: Application = await res.json();
      onSaved(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-900">
            {existing ? 'Edit application' : 'Add application'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Role + Company */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Role title *</label>
              <input className="input" placeholder="e.g. Frontend Engineer" value={form.role} onChange={e => set('role', e.target.value)} />
            </div>
            <div>
              <label className="label">Company *</label>
              <input className="input" placeholder="e.g. TheSkillClub" value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
            <div>
              <label className="label">Date applied</label>
              <input type="date" className="input" value={form.date_applied} onChange={e => set('date_applied', e.target.value)} />
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Work type</label>
              <select className="input" value={form.work_type} onChange={e => set('work_type', e.target.value)}>
                {WORK_TYPES.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {form.status === 'Custom' && (
            <div>
              <label className="label">Describe the status</label>
              <input className="input" placeholder='e.g. "Waiting on referral from friend"' value={form.custom_status} onChange={e => set('custom_status', e.target.value)} />
            </div>
          )}

          {/* Location + URL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Location</label>
              <input className="input" placeholder="e.g. Accra · Hybrid" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="label">Job URL</label>
              <input type="url" className="input" placeholder="https://..." value={form.job_url} onChange={e => set('job_url', e.target.value)} />
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className="label">Salary range (optional)</label>
            <div className="flex items-center gap-2">
              <select className="input w-24" value={form.salary_currency} onChange={e => set('salary_currency', e.target.value)}>
                {['GHS','USD','EUR','GBP','NGN','KES'].map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" className="input" placeholder="Min" value={form.salary_min} onChange={e => set('salary_min', e.target.value)} />
              <span className="text-stone-400 text-sm">–</span>
              <input type="number" className="input" placeholder="Max" value={form.salary_max} onChange={e => set('salary_max', e.target.value)} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Contact info, next steps, anything useful..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : existing ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
