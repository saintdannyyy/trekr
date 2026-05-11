import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The pipeline for everything you're applying to. Jobs, grad school,
              grants — all in one place.
            </p>
          </div>
          <FooterCol
            title="Product"
            items={["Features", "Pricing", "Changelog", "Roadmap"]}
          />
          <FooterCol
            title="Company"
            items={["About", "Blog", "Contact", "Careers"]}
          />
          <FooterCol
            title="Legal"
            items={["Privacy", "Terms", "Security", "DPA"]}
          />
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Trekr. All rights reserved.</p>
          <p>Built for ambitious people.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i}>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
