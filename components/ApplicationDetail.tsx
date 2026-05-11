"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ChevronLeft,
  ExternalLink,
  Pencil,
  Trash2,
  Plus,
  X,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  BookOpen,
  Phone,
  FileText,
  Bell,
  User,
  Check,
} from "lucide-react";
import {
  Application,
  InterviewRound,
  Contact,
  Document,
  Reminder,
  InterviewRoundType,
  DocumentType,
} from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import ApplicationModal from "@/components/ApplicationModal";
import ApplicationTimeline from "@/components/ApplicationTimeline";
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
import { cn } from "@/lib/utils";

type Tab =
  | "overview"
  | "interviews"
  | "contacts"
  | "documents"
  | "reminders"
  | "timeline";

const ROUND_TYPES: InterviewRoundType[] = [
  "Phone Screen",
  "Technical",
  "Take-home",
  "Panel",
  "Culture Fit",
  "Final",
  "Offer Call",
  "Other",
];
const DOC_TYPES: DocumentType[] = [
  "Resume",
  "Cover Letter",
  "Portfolio",
  "Other",
];
const OUTCOMES = ["Pending", "Passed", "Failed", "Cancelled"];

export default function ApplicationDetail({
  initialData,
}: {
  initialData: Application;
}) {
  const router = useRouter();
  const [app, setApp] = useState<Application>(initialData);
  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingSection, setAddingSection] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`Remove "${app.role} at ${app.company}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Application removed");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete application");
      setDeleting(false);
    }
  }

  function handleSaved(updated: Application) {
    setApp((prev) => ({ ...prev, ...updated }));
    setEditOpen(false);
    toast.success("Application updated");
  }

  // Interview actions
  async function addInterview(data: Record<string, unknown>) {
    const res = await fetch(`/api/applications/${app.id}/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const round: InterviewRound = await res.json();
    setApp((prev) => ({
      ...prev,
      interview_rounds: [...(prev.interview_rounds ?? []), round],
    }));
    toast.success("Interview round added");
    setAddingSection(null);
  }

  async function updateInterviewOutcome(roundId: string, outcome: string) {
    const res = await fetch(`/api/interviews/${roundId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome }),
    });
    if (!res.ok) {
      toast.error("Failed to update outcome");
      return;
    }
    const updated: InterviewRound = await res.json();
    setApp((prev) => ({
      ...prev,
      interview_rounds: (prev.interview_rounds ?? []).map((r) =>
        r.id === roundId ? updated : r,
      ),
    }));
  }

  async function deleteInterview(roundId: string) {
    const res = await fetch(`/api/interviews/${roundId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to remove interview round");
      return;
    }
    setApp((prev) => ({
      ...prev,
      interview_rounds: (prev.interview_rounds ?? []).filter(
        (r) => r.id !== roundId,
      ),
    }));
    toast.success("Interview round removed");
  }

  // Contact actions
  async function addContact(data: Record<string, unknown>) {
    const res = await fetch(`/api/applications/${app.id}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const contact: Contact = await res.json();
    setApp((prev) => ({
      ...prev,
      contacts: [...(prev.contacts ?? []), contact],
    }));
    toast.success("Contact added");
    setAddingSection(null);
  }

  async function deleteContact(contactId: string) {
    const res = await fetch(`/api/contacts/${contactId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to remove contact");
      return;
    }
    setApp((prev) => ({
      ...prev,
      contacts: (prev.contacts ?? []).filter((c) => c.id !== contactId),
    }));
    toast.success("Contact removed");
  }

  // Document actions
  async function addDocument(data: Record<string, unknown>) {
    const res = await fetch(`/api/applications/${app.id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const doc: Document = await res.json();
    setApp((prev) => ({
      ...prev,
      documents: [...(prev.documents ?? []), doc],
    }));
    toast.success("Document added");
    setAddingSection(null);
  }

  async function deleteDocument(docId: string) {
    const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to remove document");
      return;
    }
    setApp((prev) => ({
      ...prev,
      documents: (prev.documents ?? []).filter((d) => d.id !== docId),
    }));
    toast.success("Document removed");
  }

  // Reminder actions
  async function addReminder(data: Record<string, unknown>) {
    const res = await fetch(`/api/applications/${app.id}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const reminder: Reminder = await res.json();
    setApp((prev) => ({
      ...prev,
      reminders: [...(prev.reminders ?? []), reminder],
    }));
    toast.success("Reminder set");
    setAddingSection(null);
  }

  async function toggleReminder(reminderId: string, done: boolean) {
    const res = await fetch(`/api/reminders/${reminderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    if (!res.ok) return;
    setApp((prev) => ({
      ...prev,
      reminders: (prev.reminders ?? []).map((r) =>
        r.id === reminderId ? { ...r, done } : r,
      ),
    }));
  }

  async function deleteReminder(reminderId: string) {
    const res = await fetch(`/api/reminders/${reminderId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Failed to remove reminder");
      return;
    }
    setApp((prev) => ({
      ...prev,
      reminders: (prev.reminders ?? []).filter((r) => r.id !== reminderId),
    }));
    toast.success("Reminder removed");
  }

  const pendingReminders = (app.reminders ?? []).filter((r) => !r.done).length;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    {
      key: "interviews",
      label: `Interviews${app.interview_rounds?.length ? ` (${app.interview_rounds.length})` : ""}`,
    },
    {
      key: "contacts",
      label: `Contacts${app.contacts?.length ? ` (${app.contacts.length})` : ""}`,
    },
    {
      key: "documents",
      label: `Documents${app.documents?.length ? ` (${app.documents.length})` : ""}`,
    },
    {
      key: "reminders",
      label: `Reminders${pendingReminders ? ` (${pendingReminders})` : ""}`,
    },
    { key: "timeline", label: "Timeline" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky header — offset for mobile top bar */}
      <div className="sticky top-14 lg:top-0 z-10 bg-card border-b border-border">
        <div className="px-4 sm:px-8 pt-4 sm:pt-5 pb-0 max-w-5xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ChevronLeft size={14} />
            Dashboard
          </Link>

          <div className="flex items-start justify-between gap-3 pb-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl sm:text-2xl font-semibold text-foreground leading-tight">
                {app.role}
              </h1>
              <p className="text-brand font-medium mt-0.5">{app.company}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge
                  status={app.status}
                  customStatus={app.custom_status ?? undefined}
                />
                {app.work_type && (
                  <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    <Briefcase size={10} />
                    {app.work_type}
                  </span>
                )}
                {app.location && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={10} />
                    {app.location}
                  </span>
                )}
                {app.date_applied && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={10} />
                    {format(new Date(app.date_applied), "d MMM yyyy")}
                  </span>
                )}
                {(app.salary_min || app.salary_max) && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign size={10} />
                    {app.salary_currency}{" "}
                    {app.salary_min?.toLocaleString() ?? "?"}–
                    {app.salary_max?.toLocaleString() ?? "?"}
                  </span>
                )}
                {app.job_url && (
                  <a
                    href={app.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-xs text-brand hover:underline"
                  >
                    View posting
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                <Pencil size={13} className="sm:mr-1.5" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 size={13} className="sm:mr-1.5" />
                <span className="hidden sm:inline">{deleting ? "Deleting…" : "Delete"}</span>
              </Button>
            </div>
          </div>

          {/* Tabs — horizontally scrollable */}
          <div className="flex overflow-x-auto gap-1 pb-px hide-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "text-sm font-medium py-3 px-1 mr-4 border-b-2 whitespace-nowrap transition-colors shrink-0",
                  tab === t.key
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 sm:px-8 py-5 sm:py-6 max-w-5xl mx-auto w-full">
        {tab === "overview" && <OverviewTab app={app} />}
        {tab === "interviews" && (
          <InterviewsTab
            app={app}
            addingSection={addingSection}
            setAddingSection={setAddingSection}
            onAdd={addInterview}
            onUpdateOutcome={updateInterviewOutcome}
            onDelete={deleteInterview}
          />
        )}
        {tab === "contacts" && (
          <ContactsTab
            app={app}
            addingSection={addingSection}
            setAddingSection={setAddingSection}
            onAdd={addContact}
            onDelete={deleteContact}
          />
        )}
        {tab === "documents" && (
          <DocumentsTab
            app={app}
            addingSection={addingSection}
            setAddingSection={setAddingSection}
            onAdd={addDocument}
            onDelete={deleteDocument}
          />
        )}
        {tab === "reminders" && (
          <RemindersTab
            app={app}
            addingSection={addingSection}
            setAddingSection={setAddingSection}
            onAdd={addReminder}
            onToggle={toggleReminder}
            onDelete={deleteReminder}
          />
        )}
        {tab === "timeline" && <ApplicationTimeline appId={app.id} />}
      </div>

      <ApplicationModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={handleSaved}
        existing={app}
      />
    </div>
  );
}

// ── Overview Tab ────────────────────────────────────────────────────
function OverviewTab({ app }: { app: Application }) {
  return (
    <div className="max-w-2xl space-y-6">
      {app.notes ? (
        <div>
          <p className="label mb-2">Notes</p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {app.notes}
          </p>
        </div>
      ) : (
        <EmptySlot
          icon={<BookOpen size={22} />}
          text="No notes yet."
          sub="Edit this application to add notes."
        />
      )}
    </div>
  );
}

// ── Interviews Tab ──────────────────────────────────────────────────
function InterviewsTab({
  app,
  addingSection,
  setAddingSection,
  onAdd,
  onUpdateOutcome,
  onDelete,
}: {
  app: Application;
  addingSection: string | null;
  setAddingSection: (s: string | null) => void;
  onAdd: (d: Record<string, unknown>) => Promise<void>;
  onUpdateOutcome: (id: string, outcome: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState({
    round_number: (app.interview_rounds?.length ?? 0) + 1,
    round_type: "Phone Screen" as InterviewRoundType,
    scheduled_at: "",
    notes: "",
    outcome: "Pending",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onAdd(form);
      setForm((f) => ({
        ...f,
        round_number: f.round_number + 1,
        notes: "",
        scheduled_at: "",
      }));
    } catch {
      toast.error("Failed to add interview round");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 max-w-2xl">
      <SectionHeader
        title="Interview Rounds"
        onAdd={() => setAddingSection("interviews")}
        adding={addingSection === "interviews"}
      />

      {addingSection === "interviews" && (
        <AddCard onCancel={() => setAddingSection(null)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Round #</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.round_number}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      round_number: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select
                  value={form.round_type}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      round_type: v as InterviewRoundType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROUND_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Scheduled at</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduled_at: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Outcome</Label>
                <Select
                  value={form.outcome}
                  onValueChange={(v) => setForm((f) => ({ ...f, outcome: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTCOMES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <textarea
                rows={2}
                placeholder="Any notes about this round…"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <FormActions
              onCancel={() => setAddingSection(null)}
              saving={saving}
              label="Add round"
            />
          </form>
        </AddCard>
      )}

      {app.interview_rounds?.map((ir) => (
        <div key={ir.id} className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">
                  Round {ir.round_number} · {ir.round_type}
                </span>
              </div>
              {ir.scheduled_at && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar size={10} />
                  {format(new Date(ir.scheduled_at), "d MMM yyyy, h:mm a")}
                </p>
              )}
              {ir.notes && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {ir.notes}
                </p>
              )}
              <div className="mt-2">
                <Select
                  value={ir.outcome ?? "Pending"}
                  onValueChange={(v) => onUpdateOutcome(ir.id, v)}
                >
                  <SelectTrigger className="h-7 text-xs w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTCOMES.map((o) => (
                      <SelectItem key={o} value={o} className="text-xs">
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <button
              onClick={() => onDelete(ir.id)}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10 shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}

      {!app.interview_rounds?.length && addingSection !== "interviews" && (
        <EmptySlot
          icon={<Phone size={22} />}
          text="No interview rounds logged."
          action={{
            label: "Log a round",
            onClick: () => setAddingSection("interviews"),
          }}
        />
      )}
    </div>
  );
}

// ── Contacts Tab ────────────────────────────────────────────────────
function ContactsTab({
  app,
  addingSection,
  setAddingSection,
  onAdd,
  onDelete,
}: {
  app: Application;
  addingSection: string | null;
  setAddingSection: (s: string | null) => void;
  onAdd: (d: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    linkedin_url: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      await onAdd(form);
      setForm({ name: "", title: "", email: "", linkedin_url: "", notes: "" });
    } catch {
      toast.error("Failed to add contact");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 max-w-2xl">
      <SectionHeader
        title="Contacts"
        onAdd={() => setAddingSection("contacts")}
        adding={addingSection === "contacts"}
      />

      {addingSection === "contacts" && (
        <AddCard onCancel={() => setAddingSection(null)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  placeholder="Sarah Chen"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  placeholder="Recruiter"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  placeholder="sarah@company.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">LinkedIn URL</Label>
                <Input
                  placeholder="https://linkedin.com/in/…"
                  value={form.linkedin_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, linkedin_url: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <textarea
                rows={2}
                placeholder="Met at a career fair…"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <FormActions
              onCancel={() => setAddingSection(null)}
              saving={saving}
              label="Add contact"
            />
          </form>
        </AddCard>
      )}

      {app.contacts?.map((c) => (
        <div
          key={c.id}
          className="card p-4 flex items-start justify-between gap-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{c.name}</p>
            {c.title && (
              <p className="text-xs text-muted-foreground mt-0.5">{c.title}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-2">
              {c.email && (
                <a
                  href={`mailto:${c.email}`}
                  className="text-xs text-brand hover:underline"
                >
                  {c.email}
                </a>
              )}
              {c.linkedin_url && (
                <a
                  href={c.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand hover:underline inline-flex items-center gap-0.5"
                >
                  LinkedIn <ExternalLink size={9} />
                </a>
              )}
            </div>
            {c.notes && (
              <p className="text-xs text-muted-foreground mt-2">{c.notes}</p>
            )}
          </div>
          <button
            onClick={() => onDelete(c.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10 shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {!app.contacts?.length && addingSection !== "contacts" && (
        <EmptySlot
          icon={<User size={22} />}
          text="No contacts added yet."
          action={{
            label: "Add a contact",
            onClick: () => setAddingSection("contacts"),
          }}
        />
      )}
    </div>
  );
}

// ── Documents Tab ───────────────────────────────────────────────────
function DocumentsTab({
  app,
  addingSection,
  setAddingSection,
  onAdd,
  onDelete,
}: {
  app: Application;
  addingSection: string | null;
  setAddingSection: (s: string | null) => void;
  onAdd: (d: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState({
    doc_type: "Resume" as DocumentType,
    label: "",
    file_url: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim()) return toast.error("Label is required");
    setSaving(true);
    try {
      await onAdd(form);
      setForm({ doc_type: "Resume", label: "", file_url: "" });
    } catch {
      toast.error("Failed to add document");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 max-w-2xl">
      <SectionHeader
        title="Documents"
        onAdd={() => setAddingSection("documents")}
        adding={addingSection === "documents"}
      />

      {addingSection === "documents" && (
        <AddCard onCancel={() => setAddingSection(null)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select
                  value={form.doc_type}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, doc_type: v as DocumentType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Label *</Label>
                <Input
                  placeholder="Resume v3 — Tailored"
                  value={form.label}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, label: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">File URL</Label>
              <Input
                placeholder="https://drive.google.com/…"
                value={form.file_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, file_url: e.target.value }))
                }
              />
            </div>
            <FormActions
              onCancel={() => setAddingSection(null)}
              saving={saving}
              label="Add document"
            />
          </form>
        </AddCard>
      )}

      {app.documents?.map((d) => (
        <div
          key={d.id}
          className="card p-4 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand shrink-0">
              <FileText size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {d.label}
              </p>
              <p className="text-xs text-muted-foreground">{d.doc_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {d.file_url && (
              <a
                href={d.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand hover:underline inline-flex items-center gap-0.5"
              >
                Open <ExternalLink size={10} />
              </a>
            )}
            <button
              onClick={() => onDelete(d.id)}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}

      {!app.documents?.length && addingSection !== "documents" && (
        <EmptySlot
          icon={<FileText size={22} />}
          text="No documents attached."
          action={{
            label: "Attach a document",
            onClick: () => setAddingSection("documents"),
          }}
        />
      )}
    </div>
  );
}

// ── Reminders Tab ───────────────────────────────────────────────────
function RemindersTab({
  app,
  addingSection,
  setAddingSection,
  onAdd,
  onToggle,
  onDelete,
}: {
  app: Application;
  addingSection: string | null;
  setAddingSection: (s: string | null) => void;
  onAdd: (d: Record<string, unknown>) => Promise<void>;
  onToggle: (id: string, done: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState({ message: "", remind_at: "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.message.trim() || !form.remind_at)
      return toast.error("Message and date are required");
    setSaving(true);
    try {
      await onAdd(form);
      setForm({ message: "", remind_at: "" });
    } catch {
      toast.error("Failed to set reminder");
    } finally {
      setSaving(false);
    }
  }

  const pending = (app.reminders ?? []).filter((r) => !r.done);
  const done = (app.reminders ?? []).filter((r) => r.done);

  return (
    <div className="space-y-3 max-w-2xl">
      <SectionHeader
        title="Reminders"
        onAdd={() => setAddingSection("reminders")}
        adding={addingSection === "reminders"}
      />

      {addingSection === "reminders" && (
        <AddCard onCancel={() => setAddingSection(null)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Message *</Label>
              <Input
                placeholder="Follow up with recruiter"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Remind at *</Label>
              <Input
                type="datetime-local"
                value={form.remind_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, remind_at: e.target.value }))
                }
              />
            </div>
            <FormActions
              onCancel={() => setAddingSection(null)}
              saving={saving}
              label="Set reminder"
            />
          </form>
        </AddCard>
      )}

      {pending.map((r) => (
        <div
          key={r.id}
          className="card p-4 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={() => onToggle(r.id, true)}
              className="mt-0.5 h-4 w-4 rounded border border-border flex items-center justify-center hover:border-brand transition-colors shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{r.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Calendar size={10} />
                {format(new Date(r.remind_at), "d MMM yyyy, h:mm a")}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDelete(r.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10 shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {done.length > 0 && (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-4">
            Done
          </p>
          {done.map((r) => (
            <div
              key={r.id}
              className="card p-4 flex items-start justify-between gap-3 opacity-50"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => onToggle(r.id, false)}
                  className="mt-0.5 h-4 w-4 rounded border border-brand bg-brand flex items-center justify-center shrink-0"
                >
                  <Check size={10} className="text-white" />
                </button>
                <div className="min-w-0">
                  <p className="text-sm line-through text-muted-foreground">
                    {r.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(r.remind_at), "d MMM yyyy")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDelete(r.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10 shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </>
      )}

      {!app.reminders?.length && addingSection !== "reminders" && (
        <EmptySlot
          icon={<Bell size={22} />}
          text="No reminders set."
          action={{
            label: "Set a reminder",
            onClick: () => setAddingSection("reminders"),
          }}
        />
      )}
    </div>
  );
}

// ── Shared sub-components ───────────────────────────────────────────
function SectionHeader({
  title,
  onAdd,
  adding,
}: {
  title: string;
  onAdd: () => void;
  adding: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-1">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {!adding && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-deep font-medium transition-colors"
        >
          <Plus size={14} />
          Add
        </button>
      )}
    </div>
  );
}

function AddCard({
  children,
  onCancel,
}: {
  children: React.ReactNode;
  onCancel: () => void;
}) {
  return (
    <div className="card p-4 border-brand/30 bg-brand-soft/20">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-foreground">New entry</p>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      {children}
    </div>
  );
}

function FormActions({
  onCancel,
  saving,
  label,
}: {
  onCancel: () => void;
  saving: boolean;
  label: string;
}) {
  return (
    <div className="flex gap-2 justify-end pt-1">
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? "Saving…" : label}
      </Button>
    </div>
  );
}

function EmptySlot({
  icon,
  text,
  sub,
  action,
}: {
  icon: React.ReactNode;
  text: string;
  sub?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="rounded-xl border border-dashed border-border py-12 text-center">
      <div className="mx-auto w-fit text-muted-foreground opacity-30 mb-3">
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground">{text}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 text-sm text-brand hover:text-brand-deep font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
