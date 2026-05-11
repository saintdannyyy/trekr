"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

type PermState = "default" | "granted" | "denied" | "unsupported";

export default function PushNotificationManager() {
  const [permState, setPermState] = useState<PermState>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setPermState("unsupported");
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (reg) => {
        setPermState(Notification.permission as PermState);
        const existing = await reg.pushManager.getSubscription();
        setSubscribed(!!existing);
      })
      .catch(() => setPermState("unsupported"));
  }, []);

  async function enable() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermState(permission as PermState);
      if (permission !== "granted") {
        toast.error("Notifications blocked. Enable them in browser settings.");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) throw new Error();
      setSubscribed(true);
      toast.success("Reminder notifications enabled");
    } catch {
      toast.error("Failed to enable notifications");
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      toast.success("Notifications disabled");
    } catch {
      toast.error("Failed to disable notifications");
    } finally {
      setLoading(false);
    }
  }

  // Don't render anything if push isn't supported or already denied
  if (permState === "unsupported" || permState === "denied") return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={subscribed ? disable : enable}
          disabled={loading}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full disabled:opacity-50"
        >
          {subscribed ? (
            <Bell size={14} className="shrink-0 text-brand" />
          ) : (
            <BellOff size={14} className="shrink-0" />
          )}
          {loading
            ? "…"
            : subscribed
              ? "Notifications on"
              : "Enable notifications"}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {subscribed
          ? "Disable reminder push notifications"
          : "Get push notifications when reminders are due"}
      </TooltipContent>
    </Tooltip>
  );
}
