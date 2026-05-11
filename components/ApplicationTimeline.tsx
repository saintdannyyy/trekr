"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Plus,
  X,
  Trash2,
  MessageSquare,
  ArrowRightLeft,
  RefreshCw,
  XCircle,
  Video,
  Star,
} from "lucide-react";
import { ApplicationUpdate, UpdateType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MANUAL_TYPES: { value: UpdateType; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "follow_up", label: "Follow-up" },
  { value: "interview_note", label: "Interview note" },
  { value: "offer_note", label: "Offer note" },
];

function typeStyle(type: UpdateType): {
  icon: React.ReactNode;
  dot: string;
  label: string;
} {
  switch (type) {
    case "status_change":
      return {
        icon: <ArrowRightLeft size={11} />,
        dot: "bg-brand/15 text-brand",
        label: "Status change",
      };
    case "rejection":
      return {
        icon: <XCircle size={11} />,
        dot: "bg-destructive/15 text-destructive",
        label: "Rejection",
      };
    case "follow_up":
      return {
        icon: <RefreshCw size={11} />,
        dot: "bg-blue-500/15 text-blue-600",
        label: "Follow-up",
      };
    case "interview_note":
      return {
        icon: <Video size={11} />,
        dot: "bg-amber-500/15 text-amber-600",
        label: "Interview note",
      };
    case "offer_note":
      return {
        icon: <Star size={11} />,
        dot: "bg-emerald-500/15 text-emerald-600",
        label: "Offer note",
      };
    default:
      return {
        icon: <MessageSquare size={11} />,
        dot: "bg-muted text-muted-foreground",
        label: "Note",
      };
  }
}

export default function ApplicationTimeline({ appId }: { appId: string }) {
  const [updates, setUpdates] = useState<ApplicationUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ type: "note" as UpdateType, message: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/applications/${appId}/updates`)
      .then((r) => r.json())
      .then((data) => setUpdates(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.message.trim()) return toast.error("Message is required");
    setSaving(true);
    try {
      const res = await fetch(`/api/applications/${appId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const entry: ApplicationUpdate = await res.json();
      setUpdates((prev) => [entry, ...prev]);
      setForm({ type: "note", message: "" });
      setAdding(false);
      toast.success("Update added");
    } catch {
      toast.error("Failed to add update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(updateId: string) {
    const res = await fetch(`/api/updates/${updateId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to remove");
      return;
    }
    setUpdates((prev) => prev.filter((u) => u.id !== updateId));
    toast.success("Entry removed");
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-6 w-6 rounded-full bg-muted shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-28" />
              <div className="h-3 bg-muted rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Timeline</h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-deep font-medium transition-colors"
          >
            <Plus size={14} />
            Add update
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <div className="card p-4 border-brand/30 bg-brand-soft/20">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground">New update</p>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, type: v as UpdateType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MANUAL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Message *</Label>
              <textarea
                rows={3}
                placeholder="What happened? What's the update?"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAdding(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Add"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Empty state */}
      {updates.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <div className="mx-auto mb-3 w-fit text-muted-foreground opacity-30">
            <ArrowRightLeft size={22} />
          </div>
          <p className="text-sm font-medium text-foreground">
            No timeline entries yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Status changes are logged automatically. Add manual notes to track
            your progress.
          </p>
          <button
            onClick={() => setAdding(true)}
            className="mt-3 text-sm text-brand hover:text-brand-deep font-medium transition-colors"
          >
            Add first update
          </button>
        </div>
      )}

      {/* Timeline */}
      {updates.length > 0 && (
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />
          <div className="space-y-2">
            {updates.map((u) => {
              const s = typeStyle(u.type);
              const canDelete = u.type !== "status_change";
              return (
                <div key={u.id} className="relative flex gap-4 pb-2">
                  {/* Dot */}
                  <div
                    className={cn(
                      "relative z-10 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      s.dot,
                    )}
                  >
                    {s.icon}
                  </div>
                  {/* Card */}
                  <div className="flex-1 min-w-0 card p-3 group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">
                            {s.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {format(
                              new Date(u.created_at),
                              "d MMM yyyy, h:mm a",
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-1 leading-relaxed">
                          {u.message}
                        </p>
                        {u.metadata?.reason && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            Reason: {u.metadata.reason}
                          </p>
                        )}
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
