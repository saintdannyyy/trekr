"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check, Trash2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, isPast, format } from "date-fns";
import { cn } from "@/lib/utils";

// ─── Push notification hook (same logic as PushNotificationManager) ───────────

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i);
  }
  return view;
}

function usePush() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permState, setPermState] = useState<NotificationPermission | "">("");

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return;
    }
    setSupported(true);
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const sw = reg.installing ?? reg.waiting ?? reg.active;
      if (sw && sw.state !== "activated") {
        await new Promise<void>((resolve) => {
          sw.addEventListener("statechange", function handler() {
            if (sw.state === "activated") {
              sw.removeEventListener("statechange", handler);
              resolve();
            }
          });
        });
      }
      setPermState(Notification.permission);
      const existing = await reg.pushManager.getSubscription();
      setSubscribed(!!existing);
    });
  }, []);

  async function enable() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermState(permission);
      if (permission !== "granted") {
        toast.error("Notifications blocked — enable them in browser settings.");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const stale = await reg.pushManager.getSubscription();
      if (stale) await stale.unsubscribe();
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error();
      setSubscribed(true);
      toast.success("Push notifications enabled");
    } catch (e) {
      console.error("Push subscribe error:", e);
      toast.error("Failed to enable notifications");
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast.success("Push notifications disabled");
    } catch {
      toast.error("Failed to disable notifications");
    } finally {
      setLoading(false);
    }
  }

  return { supported, subscribed, loading, permState, enable, disable };
}

// ─── Reminder type ────────────────────────────────────────────────────────────

interface Reminder {
  id: string;
  message: string;
  remind_at: string;
  done: boolean;
  created_at: string;
  application_id: string;
  company: string;
  role: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NotificationsClient() {
  const push = usePush();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "done">("upcoming");

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setReminders(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("Failed to load reminders"))
      .finally(() => setLoadingReminders(false));
  }, []);

  async function markDone(id: string, done: boolean) {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done } : r)));
    const res = await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    if (!res.ok) {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, done: !done } : r)),
      );
      toast.error("Failed to update reminder");
    }
  }

  async function deleteReminder(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete reminder");
      // Re-fetch to restore state
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => setReminders(Array.isArray(data) ? data : []));
    }
  }

  const upcoming = reminders.filter((r) => !r.done);
  const done = reminders.filter((r) => r.done);
  const overdue = upcoming.filter((r) => isPast(new Date(r.remind_at)));
  const future = upcoming.filter((r) => !isPast(new Date(r.remind_at)));
  const shown = tab === "upcoming" ? upcoming : done;

  return (
    <div className="space-y-6">
      {/* Push notifications card */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
              push.subscribed
                ? "bg-brand/10 text-brand"
                : "bg-muted text-muted-foreground",
            )}
          >
            {push.subscribed ? <Bell size={16} /> : <BellOff size={16} />}
          </div>
          <div>
            <p className="text-sm font-medium">Push notifications</p>
            <p className="text-xs text-muted-foreground">
              {!push.supported
                ? "Not available on localhost — deploy to enable"
                : push.permState === "denied"
                  ? "Blocked in browser — check site settings"
                  : push.subscribed
                    ? "You'll get reminders via browser push"
                    : "Get browser alerts for your reminders"}
            </p>
          </div>
        </div>
        {push.supported && push.permState !== "denied" && (
          <button
            onClick={push.subscribed ? push.disable : push.enable}
            disabled={push.loading}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50",
              push.subscribed
                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                : "bg-brand text-white hover:bg-brand/90",
            )}
          >
            {push.loading ? "…" : push.subscribed ? "Disable" : "Enable"}
          </button>
        )}
      </div>

      {/* Reminders section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Reminders</h2>
          {overdue.length > 0 && tab === "upcoming" && (
            <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
              <AlertCircle size={12} />
              {overdue.length} overdue
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4 w-fit">
          {(["upcoming", "done"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize",
                tab === t
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "upcoming"
                ? `Upcoming (${upcoming.length})`
                : `Done (${done.length})`}
            </button>
          ))}
        </div>

        {loadingReminders ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
            {tab === "upcoming"
              ? "No upcoming reminders. Add them from any application."
              : "No completed reminders yet."}
          </div>
        ) : (
          <div className="space-y-2">
            {shown.map((r) => {
              const isOverdue = !r.done && isPast(new Date(r.remind_at));
              return (
                <div
                  key={r.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    r.done
                      ? "bg-muted/40 border-border opacity-60"
                      : isOverdue
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-card border-border",
                  )}
                >
                  <button
                    onClick={() => markDone(r.id, !r.done)}
                    className={cn(
                      "mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                      r.done
                        ? "bg-brand border-brand text-white"
                        : isOverdue
                          ? "border-amber-500 hover:bg-amber-500/10"
                          : "border-border hover:border-brand hover:bg-brand/5",
                    )}
                  >
                    {r.done && <Check size={10} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm",
                        r.done
                          ? "line-through text-muted-foreground"
                          : "text-foreground",
                      )}
                    >
                      {r.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {r.company} — {r.role}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs mt-1",
                        isOverdue && !r.done
                          ? "text-amber-500 font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      <Clock size={10} />
                      {r.done
                        ? format(new Date(r.remind_at), "d MMM yyyy, HH:mm")
                        : isOverdue
                          ? `Overdue · ${formatDistanceToNow(new Date(r.remind_at), { addSuffix: true })}`
                          : formatDistanceToNow(new Date(r.remind_at), {
                              addSuffix: true,
                            })}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="mt-0.5 p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                    aria-label="Delete reminder"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick summary footer */}
        {tab === "upcoming" && future.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Next:{" "}
            <span className="text-foreground font-medium">
              {format(new Date(future[0].remind_at), "d MMM, HH:mm")}
            </span>{" "}
            — {future[0].company}
          </p>
        )}
      </div>
    </div>
  );
}
