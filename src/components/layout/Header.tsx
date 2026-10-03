/**
 * Compact product header.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LoginButton } from '@/components/auth/LoginButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="product-header">
      <div className="app-frame flex h-[74px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="FuelVoice home">
          <span className="fuelvoice-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6.5 4.5h7.5v15H6.5z" strokeLinejoin="round" />
              <path d="M8.5 7h3.5M14 8.5h2.2l1.8 2.1V17a1.5 1.5 0 0 0 3 0v-5.7l-1.8-2.1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.5 15.5h7.5M5 19.5h10.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">FuelVoice</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            href="/search"
            className={`header-action ${pathname === '/search' ? 'header-action-active' : ''}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </Link>
          <ThemeToggle />
          {!loading && (user ? <UserMenu /> : <LoginButton variant="compact" />)}
        </div>
      </div>
    </header>
  );
}
