import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { href: '/dashboard',           label: 'All applications', icon: '▤' },
  { href: '/dashboard?s=Applied', label: 'Applied',          icon: '◎' },
  { href: '/dashboard?s=Interview',label: 'Interviews',      icon: '◷' },
  { href: '/dashboard?s=Offer',   label: 'Offers',           icon: '✦' },
  { href: '/dashboard?s=Watching',label: 'Watching',         icon: '◉' },
  { href: '/dashboard?s=Closed',  label: 'Closed / Missed',  icon: '◌' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-stone-200 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-stone-100">
          <span className="font-semibold text-lg tracking-tight text-stone-900">
            Trekr<span className="text-amber-500">.</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2 mb-2">Filter</p>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
            >
              <span className="text-stone-400 text-xs w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-stone-100 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-xs text-stone-500 truncate">My account</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
