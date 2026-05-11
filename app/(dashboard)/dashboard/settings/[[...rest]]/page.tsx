import { UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — Trekr",
};

export default function SettingsPage() {
  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-semibold text-foreground mb-6">
        Settings
      </h1>
      <UserProfile />
    </div>
  );
}
