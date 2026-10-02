/**
 * Primary application navigation.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LoginButton } from '@/components/auth/LoginButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b glass-strong" style={{ borderColor: 'var(--border-primary)' }}>
      <div className="page-shell">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-8">
            <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label="FuelVoice home">
              <BrandMark />
              <span className="truncate text-[17px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
                Fuel<span className="text-brand-500">Voice</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
              <NavLink href="/search">Search</NavLink>
              <NavLink href="/#explore-map">Explore map</NavLink>
              <NavLink href="/#nearby-stations">Nearby</NavLink>
            </nav>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/#explore-map"
              className="hidden min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-500/10 dark:text-brand-300 sm:inline-flex"
            >
              <MapIcon />
              Explore
            </Link>
            <ThemeToggle />
            {!loading && (user ? <UserMenu /> : <LoginButton variant="compact" />)}
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
    </Link>
  );
}

function BrandMark() {
  return (
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-[0_8px_18px_rgba(234,88,12,0.22)] transition-transform duration-200 group-hover:-translate-y-0.5">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h7a2 2 0 0 1 2 2v14H5V6a2 2 0 0 1 2-2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h5M16 9h1.5l1.5 2v5.5a1.5 1.5 0 0 0 3 0V10l-2-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 15h5" />
      </svg>
    </span>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v15M15 6v15" />
    </svg>
  );
}
