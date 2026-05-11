import type { Metadata } from "next";
import OverallTimeline from "@/components/OverallTimeline";

export const metadata: Metadata = { title: "Timeline — Trekr" };

export default function TimelinePage() {
  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-foreground">
          Timeline
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your full job search roadmap — every application, every update
        </p>
      </div>
      <OverallTimeline />
    </div>
  );
}
