import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
        <span className="font-semibold text-lg tracking-tight text-stone-900">
          Trekr<span className="text-amber-500">.</span>
        </span>
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-ghost text-sm">Sign in</button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="btn-primary text-sm">Get started free</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn-primary text-sm">Go to dashboard →</Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
          Open source · Free to use
        </div>

        <h1 className="text-5xl font-semibold text-stone-900 tracking-tight max-w-2xl leading-tight mb-5">
          Every application.<br />
          <span className="text-amber-500">Organised.</span>
        </h1>
        <p className="text-lg text-stone-500 max-w-xl mb-10 leading-relaxed">
          Trekr keeps your job search under control — track applications, interviews,
          contacts, documents, and follow-ups all in one place.
        </p>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn-primary text-base px-6 py-3">
              Sign in with Google — it's free
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard" className="btn-primary text-base px-6 py-3">
            Open my dashboard →
          </Link>
        </SignedIn>

        <p className="text-xs text-stone-400 mt-4">No credit card. No setup. Just sign in.</p>
      </section>

      {/* Feature strips */}
      <section className="border-t border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {[
            { icon: '📋', title: 'Full application lifecycle', body: 'From watching a role to receiving an offer — every status, every step.' },
            { icon: '📅', title: 'Interview rounds & reminders', body: 'Log every round, set follow-up reminders, never miss a deadline.' },
            { icon: '📁', title: 'Documents & contacts', body: 'Track which resume you sent, who you spoke to, and where to follow up.' },
          ].map(f => (
            <div key={f.title}>
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-sm font-semibold text-stone-800 mb-1">{f.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        Trekr · Open source under GPL-3.0 ·{' '}
        <a href="https://github.com/saintdannyyy/trekr" className="underline hover:text-stone-600" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </footer>
    </main>
  );
}
