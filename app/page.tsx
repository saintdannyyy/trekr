"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  CalendarClock,
  Layers,
  FolderOpen,
  Plus,
  MoveRight,
  BellRing,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { HeroMockup } from "@/components/site/HeroMockup";
import { SectionHeading } from "@/components/site/SectionHeading";
import { FAQ } from "@/components/site/FAQ";

export default function Home() {
  return (
    <div className="min-h-screen bg-background bg-grid-page">
      <Navbar />
      <main>
        <Hero />
        <LogoStrip />
        <UseCases />
        <Features />
        <HowItWorks />
        <StatBand />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section id="product" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, oklch(0.43 0.19 268 / 0.12) 0%, transparent 70%), radial-gradient(40% 40% at 85% 30%, oklch(0.88 0.16 95 / 0.20) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-5xl px-5 pt-28 pb-10 text-center sm:px-6 sm:pt-36 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-medium text-foreground backdrop-blur sm:text-xs">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            Introducing Trekr — Public Beta
          </span>
          <h1 className="mt-5 font-display text-[36px] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[72px]">
            Track every application
            <br className="hidden sm:block" />{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">in one place.</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 -z-0 h-2.5 bg-accent/70 sm:bottom-2 sm:h-4"
              />
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            Jobs, grad school, grants, fellowships — anything with stages and
            deadlines. Trekr keeps it all in one calm, focused pipeline.
          </p>
          <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <Link
              href="/sign-up"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-glow-accent)] transition-transform hover:-translate-y-0.5"
            >
              Get started — it&apos;s free
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href="#how"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-6 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-muted"
            >
              See how it works
            </a>
          </div>
          <p className="mt-5 text-[11px] text-muted-foreground sm:text-xs">
            No credit card · Free forever plan · Your data stays yours
          </p>
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <HeroMockup />
      </div>
    </section>
  );
}

/* ---------------- Logo strip ---------------- */

function LogoStrip() {
  const items = [
    "Stripe",
    "Stanford",
    "Y Combinator",
    "MIT",
    "Rhodes",
    "Fulbright",
    "Linear",
  ];
  return (
    <section className="border-y border-border bg-muted/30 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Used to track applications to
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {items.map((i) => (
            <span
              key={i}
              className="font-display text-lg font-semibold tracking-tight text-muted-foreground"
            >
              {i}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Use cases ---------------- */

const useCases = [
  {
    icon: Briefcase,
    title: "Jobs & internships",
    desc: "From outreach to offer. Track every role, recruiter, and follow-up.",
  },
  {
    icon: GraduationCap,
    title: "Grad & PhD programs",
    desc: "Manage SOPs, deadlines, recommenders, and decisions across schools.",
  },
  {
    icon: Award,
    title: "Grants & fellowships",
    desc: "Rhodes, Fulbright, Marshall — keep complex applications on schedule.",
  },
  {
    icon: Sparkles,
    title: "Anything with a deadline",
    desc: "Accelerators, scholarships, visas, housing. If you can apply, you can track it.",
  },
];

function UseCases() {
  return (
    <section id="use-cases" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Built for any pipeline"
          title="One tracker for everything you're applying to."
          sub="Stop juggling spreadsheets, Notion docs, and 12 browser tabs. Trekr fits the way real applications actually work."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-[var(--shadow-card)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-deep transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                <Icon size={18} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Features ---------------- */

function Features() {
  return (
    <section className="bg-muted/30 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Why Trekr"
          title="Designed for clarity, not clutter."
          sub="Every feature earns its place. No bloat, no learning curve."
        />
        <div className="mt-16 space-y-20">
          <FeatureRow
            icon={Layers}
            title="A unified pipeline"
            desc="Board view for spatial thinkers. List view for the planners. Switch instantly. Filter by deadline, status, priority, or pipeline."
            visual={<PipelineVisual />}
          />
          <FeatureRow
            icon={CalendarClock}
            title="Deadlines that won't slip"
            desc="Smart reminders surface what needs you today. A unified calendar shows every deadline across every pipeline at a glance."
            visual={<CalendarVisual />}
            reverse
          />
          <FeatureRow
            icon={FolderOpen}
            title="Documents & contacts in one place"
            desc="Attach resumes, SOPs, transcripts. Save recommenders and recruiters. Everything tied to the application that needs it."
            visual={<DocsVisual />}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  desc,
  visual,
  reverse,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <Icon size={18} />
        </span>
        <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          {desc}
        </p>
      </div>
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        {visual}
      </div>
    </motion.div>
  );
}

function PipelineVisual() {
  const stages = ["Saved", "Applied", "Interview", "Offer"];
  return (
    <div className="space-y-2">
      {stages.map((s, i) => (
        <div
          key={s}
          className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
        >
          <div className="flex items-center gap-3">
            <span
              className={`h-2 w-2 rounded-full ${i === 2 ? "bg-accent" : "bg-brand"}`}
            />
            <span className="text-sm font-medium text-foreground">{s}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {[8, 6, 3, 1][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function CalendarVisual() {
  const days = Array.from({ length: 21 }, (_, i) => i + 1);
  const marked = new Set([4, 9, 14, 17]);
  const today = 9;
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => (
        <div
          key={d}
          className={`flex h-10 items-center justify-center rounded-md text-xs font-medium ${
            d === today
              ? "bg-brand text-brand-foreground"
              : marked.has(d)
                ? "bg-accent/40 text-foreground"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {d}
        </div>
      ))}
    </div>
  );
}

function DocsVisual() {
  const items = [
    { name: "Resume_2026.pdf", tag: "Stripe" },
    { name: "SOP_MIT_v3.docx", tag: "MIT" },
    { name: "Transcript.pdf", tag: "Stanford" },
    { name: "Rec — Dr. Park", tag: "Rhodes" },
  ];
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div
          key={i.name}
          className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-soft text-brand-deep">
              <FolderOpen size={14} />
            </span>
            <span className="text-sm font-medium text-foreground">
              {i.name}
            </span>
          </div>
          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {i.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- How it works ---------------- */

const steps = [
  {
    icon: Plus,
    title: "Add an opportunity",
    desc: "Paste a link or add it manually. Trekr captures the essentials in seconds.",
  },
  {
    icon: MoveRight,
    title: "Move it through stages",
    desc: "Drag across your pipeline. Customize stages to match how you actually apply.",
  },
  {
    icon: BellRing,
    title: "Get reminded before it matters",
    desc: "Smart deadline alerts so nothing important slips through the cracks.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps. Then peace of mind."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-2xl border border-border bg-card p-7"
            >
              <span className="absolute -top-4 left-7 inline-flex h-8 items-center rounded-full bg-foreground px-3 font-display text-xs font-semibold text-background">
                Step {i + 1}
              </span>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <s.icon size={18} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Stats band ---------------- */

function StatBand() {
  const stats = [
    { value: "0", label: "Missed deadlines" },
    { value: "1", label: "Place for everything" },
    { value: "∞", label: "Custom pipelines" },
  ];
  return (
    <section className="px-6 py-16">
      <div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl px-8 py-16 text-center text-white"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl"
        />
        <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          The calm tracker for chaotic seasons.
        </h3>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm uppercase tracking-wider text-white/70">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function FAQSection() {
  return (
    <section id="faq" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="FAQ" title="Questions, answered." />
        <FAQ />
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */

function FinalCTA() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-foreground px-8 py-16 text-center text-background sm:py-20">
        <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Stop tracking applications in spreadsheets.
        </h3>
        <p className="mx-auto mt-4 max-w-xl text-base text-background/70">
          Trekr is free to start. Your next opportunity deserves a system, not a
          tab graveyard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/sign-up"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-glow-accent)] transition-transform hover:-translate-y-0.5"
          >
            Create your free account
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex h-12 items-center rounded-xl border border-background/20 px-6 text-sm font-semibold text-background hover:bg-background/10"
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
