/**
 * Global product header.
 *
 * The shell stays intentionally compact so discovery remains the visual focus.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LoginButton } from '@/components/auth/LoginButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/#explore-map', label: 'Explore map', match: 'map' },
  { href: '/#nearby-stations', label: 'Nearby', match: 'nearby' },
  { href: '/search', label: 'Search', match: 'search' },
];

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 isolate border-b border-[var(--border-secondary)] bg-[var(--bg-primary)]">
      <div className="app-frame">
        <div className="flex h-[74px] items-center justify-between gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="FuelVoice home">
            <span
              className="grid h-10 w-10 place-items-center rounded-[14px] border border-brand-500/20 bg-brand-500 text-white shadow-[0_10px_28px_rgba(85,114,104,0.22)] transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-[1.03]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M6.5 4.5h7.5v15H6.5z" strokeLinejoin="round" />
                <path d="M8.5 7h3.5M14 8.5h2.2l1.8 2.1V17a1.5 1.5 0 0 0 3 0v-5.7l-1.8-2.1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 15.5h7.5M5 19.5h10.5" strokeLinecap="round" />
              </svg>
            </span>

            <span className="leading-none">
              <span className="block text-[18px] font-black tracking-[-0.045em]" style={{ color: 'var(--text-primary)' }}>
                FuelVoice
              </span>
              <span className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.15em] sm:block" style={{ color: 'var(--text-tertiary)' }}>
                Better stops, informed by drivers
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center rounded-[15px] border border-[var(--border-primary)] bg-[var(--bg-card)] p-1 shadow-[var(--shadow-xs)] md:flex"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => {
              const active = item.match === 'search' ? pathname === '/search' : item.match === 'map' && pathname === '/';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[11px] px-4 py-2 text-xs font-bold transition-all ${active
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="grid h-10 w-10 place-items-center rounded-[13px] border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-brand-600 dark:hover:text-brand-300 md:hidden"
              aria-label="Search fuel stations"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" strokeLinecap="round" />
              </svg>
            </Link>
            <ThemeToggle />
            {!loading && (user ? <UserMenu /> : <LoginButton variant="compact" />)}
          </div>
        </div>
      </div>
    </header>
  );
}
