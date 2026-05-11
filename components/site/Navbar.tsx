"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const links = [
  { href: "#product", label: "Product" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

function scrollTo(href: string, onDone?: () => void) {
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 88; // fixed navbar height + breathing room
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
  onDone?.();
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-6">
      <div
        className={`mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border px-3 pl-5 transition-all duration-300 sm:h-16 sm:pl-6 ${
          scrolled
            ? "border-border/70 bg-background/85 shadow-(--shadow-card) backdrop-blur-xl"
            : "border-border/50 bg-background/60 backdrop-blur-md"
        }`}
      >
        <Logo />

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 md:flex">
          <SignedOut>
            <Link
              href="/sign-in"
              className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="group inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground transition-transform hover:-translate-y-px"
            >
              Sign up
              <span className="ml-1.5 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="group inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground transition-transform hover:-translate-y-px"
            >
              Dashboard
              <span className="ml-1.5 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </SignedIn>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-muted md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-5xl rounded-2xl border border-border bg-background/95 shadow-(--shadow-card) backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href, () => setOpen(false))}
                className="rounded-lg px-3 py-2 text-sm font-medium text-left text-foreground hover:bg-muted"
              >
                {l.label}
              </button>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <SignedOut>
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Log in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground"
                >
                  Sign up free
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground"
                >
                  Dashboard →
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
