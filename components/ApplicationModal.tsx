"use client";

import { useState, useEffect } from "react";
import { Application, ApplicationStatus, WorkType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES: ApplicationStatus[] = [
  "Watching",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Ghosted",
  "Closed",
  "Custom",
];
const WORK_TYPES: WorkType[] = [
  "Full Time",
  "Part Time",
  "Contract",
  "Remote",
  "Hybrid",
  "On-site",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (app: Application) => void;
  existing?: Application | null;
}

const empty = {
  role: "",
  company: "",
  status: "Applied" as ApplicationStatus,
  custom_status: "",
  date_applied: new Date().toISOString().slice(0, 10),
  location: "",
  work_type: "Full Time" as WorkType,
  job_url: "",
  salary_min: "",
  salary_max: "",
  salary_currency: "GHS",
  notes: "",
};

export default function ApplicationModal({
  open,
  onClose,
  onSaved,
  existing,
}: Props) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (existing) {
      setForm({
        role: existing.role,
        company: existing.company,
        status: existing.status,
        custom_status: existing.custom_status || "",
        date_applied: existing.date_applied
          ? String(existing.date_applied).slice(0, 10)
          : "",
        location: existing.location || "",
        work_type: existing.work_type || "Full Time",
        job_url: existing.job_url || "",
        salary_min: existing.salary_min?.toString() || "",
        salary_max: existing.salary_max?.toString() || "",
        salary_currency: existing.salary_currency || "GHS",
        notes: existing.notes || "",
      });
    } else {
      setForm(empty);
    }
    setError("");
  }, [existing, open]);

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.role.trim() || !form.company.trim()) {
      setError("Role and company are required.");
      return;
    }
    if (form.status === "Custom" && !form.custom_status.trim()) {
      setError("Please describe the custom status.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        custom_status: form.status === "Custom" ? form.custom_status : null,
      };
      const res = await fetch(
        existing ? `/api/applications/${existing.id}` : "/api/applications",
        {
          method: existing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      const saved: Application = await res.json();
      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit application" : "Add application"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Role + Company */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="role">Role title *</Label>
              <Input
                id="role"
                placeholder="e.g. Frontend Engineer"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                placeholder="e.g. TheSkillClub"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_applied">Date applied</Label>
              <Input
                id="date_applied"
                type="date"
                value={form.date_applied}
                onChange={(e) => set("date_applied", e.target.value)}
              />
            </div>
          </div>

          {/* Status + Work type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Work type</Label>
              <Select
                value={form.work_type}
                onValueChange={(v) => set("work_type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_TYPES.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.status === "Custom" && (
            <div className="space-y-1.5">
              <Label htmlFor="custom_status">Describe the status</Label>
              <Input
                id="custom_status"
                placeholder='e.g. "Waiting on referral from friend"'
                value={form.custom_status}
                onChange={(e) => set("custom_status", e.target.value)}
              />
            </div>
          )}

          {/* Location + URL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Accra · Hybrid"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job_url">Job URL</Label>
              <Input
                id="job_url"
                type="url"
                placeholder="https://..."
                value={form.job_url}
                onChange={(e) => set("job_url", e.target.value)}
              />
            </div>
          </div>

          {/* Salary */}
          <div className="space-y-1.5">
            <Label>Salary range (optional)</Label>
            <div className="flex items-center gap-2">
              <Select
                value={form.salary_currency}
                onValueChange={(v) => set("salary_currency", v)}
              >
                <SelectTrigger className="w-24 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["GHS", "USD", "EUR", "GBP", "NGN", "KES"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Min"
                value={form.salary_min}
                onChange={(e) => set("salary_min", e.target.value)}
              />
              <span className="text-muted-foreground text-sm shrink-0">–</span>
              <Input
                type="number"
                placeholder="Max"
                value={form.salary_max}
                onChange={(e) => set("salary_max", e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="input h-24 resize-none w-full"
              placeholder="Contact info, next steps, anything useful..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving…"
                : existing
                  ? "Save changes"
                  : "Add application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
