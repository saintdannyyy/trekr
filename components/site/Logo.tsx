import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 ${className}`}
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-[var(--shadow-glow-brand)]">
        <span className="font-display text-[18px] font-bold leading-none">
          T
        </span>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-foreground">
        Trekr
      </span>
    </Link>
  );
}
