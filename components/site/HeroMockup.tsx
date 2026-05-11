"use client";

import { motion } from "framer-motion";
import { Bell, Briefcase, GraduationCap, Award, Calendar } from "lucide-react";

type Card = {
  org: string;
  role: string;
  due: string;
  tone: "blue" | "yellow" | "neutral";
};

const columns: { title: string; count: number; cards: Card[] }[] = [
  {
    title: "Applied",
    count: 6,
    cards: [
      { org: "Stripe", role: "Product Engineer", due: "May 14", tone: "blue" },
      {
        org: "MIT Media Lab",
        role: "MS — Fall '26",
        due: "Jun 02",
        tone: "neutral",
      },
      {
        org: "Rhodes Trust",
        role: "Scholarship",
        due: "Jul 09",
        tone: "yellow",
      },
    ],
  },
  {
    title: "Interview",
    count: 3,
    cards: [
      {
        org: "Linear",
        role: "Design Engineer",
        due: "Tomorrow",
        tone: "yellow",
      },
      { org: "Stanford GSB", role: "MBA — R2", due: "May 21", tone: "blue" },
    ],
  },
  {
    title: "Offer",
    count: 1,
    cards: [
      { org: "Y Combinator", role: "S26 Batch", due: "Decision", tone: "blue" },
    ],
  },
];

const toneStyles: Record<Card["tone"], string> = {
  blue: "bg-brand-soft text-brand-deep",
  yellow: "bg-accent/40 text-foreground",
  neutral: "bg-muted text-muted-foreground",
};

export function HeroMockup() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-10 -z-10 opacity-70 [background:var(--gradient-soft)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.18_25)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.85_0.16_85)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.78_0.16_145)]" />
          <div className="ml-3 inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            trekr.app / board
          </div>
        </div>

        <div className="grid sm:grid-cols-[160px_1fr]">
          {/* Sidebar */}
          <aside className="hidden border-r border-border bg-muted/20 p-3 sm:block">
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pipelines
            </p>
            <SideItem icon={<Briefcase size={14} />} label="Jobs" active />
            <SideItem icon={<GraduationCap size={14} />} label="Grad school" />
            <SideItem icon={<Award size={14} />} label="Grants" />
            <SideItem icon={<Calendar size={14} />} label="Deadlines" />
          </aside>

          {/* Board */}
          <div className="overflow-hidden p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold">
                Spring &#39;26 applications
              </h3>
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-muted-foreground" />
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
                  3
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {columns.map((col) => (
                <div key={col.title}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {col.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {col.count}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {col.cards.map((card) => (
                      <div
                        key={card.org + card.role}
                        className="rounded-lg border border-border bg-background p-2.5 shadow-[var(--shadow-card)]"
                      >
                        <p className="text-[11px] font-semibold text-foreground">
                          {card.org}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {card.role}
                        </p>
                        <span
                          className={`mt-1.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-medium ${toneStyles[card.tone]}`}
                        >
                          {card.due}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SideItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium ${
        active
          ? "bg-brand text-brand-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}
