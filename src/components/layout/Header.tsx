/**
 * Header Component
 *
 * Sticky navigation focused on the three primary discovery actions:
 * search, map exploration, and nearby stations.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LoginButton } from '@/components/auth/LoginButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-primary)] bg-[var(--bg-glass-strong)] backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="FuelVoice home">
            <motion.span
              whileHover={{ rotate: -5, scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.24)]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M6.5 4.5h7.5v15H6.5z" strokeLinejoin="round" />
                <path d="M8.5 7h3.5M14 8.5h2.2l1.8 2.1V17a1.5 1.5 0 0 0 3 0v-5.7l-1.8-2.1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 15.5h7.5M5 19.5h10.5" strokeLinecap="round" />
              </svg>
            </motion.span>
            <span className="leading-none">
              <span className="block text-[17px] font-extrabold tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
                FuelVoice
              </span>
              <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.13em] sm:block" style={{ color: 'var(--text-tertiary)' }}>
                Better stops, informed by drivers
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-1 shadow-[var(--shadow-xs)] md:flex" aria-label="Primary navigation">
            <NavLink href="/#explore-map">Explore map</NavLink>
            <NavLink href="/#nearby-stations">Nearby</NavLink>
            <NavLink href="/search">Search</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-brand-500 md:hidden"
              aria-label="Search fuel stations"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" strokeLinecap="round" />
              </svg>
            </Link>

            <ThemeToggle />

            {!loading && (
              user ? <UserMenu /> : <LoginButton variant="compact" />
            )}
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
      className="rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-[var(--bg-tertiary)] hover:text-brand-500"
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
    </Link>
  );
}
