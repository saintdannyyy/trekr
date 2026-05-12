"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const view = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i);
  }
  return view;
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
      !("PushManager" in window) ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      setPermState("unsupported");
      return;
    }

    // Register service worker and check existing subscription
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (reg) => {
        // Wait for the SW to be active before querying push state
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

      // Use a fresh registration to avoid stale-state issues
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Unsubscribe any stale subscription (different VAPID key causes AbortError)
      const stale = await reg.pushManager.getSubscription();
      if (stale) await stale.unsubscribe();

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
    } catch (e) {
      console.error("Push subscribe error:", e);
      if (e instanceof Error && e.name === "AbortError") {
        toast.error(
          "Push service unavailable. Try again or check your browser settings.",
        );
      } else if (e instanceof Error && e.name === "NotAllowedError") {
        toast.error("Notifications blocked. Enable them in browser settings.");
      } else {
        toast.error("Failed to enable notifications");
      }
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
