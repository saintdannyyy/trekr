import type { Metadata } from "next";
import NotificationsClient from "@/components/NotificationsClient";

export const metadata: Metadata = { title: "Notifications — Trekr" };

export default function NotificationsPage() {
  return (
    <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">Notifications</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manage push alerts and view your upcoming reminders.
      </p>
      <NotificationsClient />
    </div>
  );
}
