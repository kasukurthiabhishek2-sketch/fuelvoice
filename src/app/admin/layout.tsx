/**
 * Admin Layout
 * Protected route guard — only accessible to users with role='admin'.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LoginButton } from '@/components/auth/LoginButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center" role="status" aria-live="polite">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true" />
        <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>Checking admin access…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <AdminAccessIcon kind="lock" />
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Access Denied</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Please sign in to access this page.</p>
        <div className="mx-auto flex max-w-xs flex-col items-stretch gap-3">
          <LoginButton />
          <Link href="/" className="secondary-action">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <AdminAccessIcon kind="shield" />
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Admin Only</h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>You do not have admin privileges.</p>
        <div className="mt-6 flex justify-center">
          <Link href="/" className="secondary-action">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-500">Admin</span>
      </div>
      {children}
    </div>
  );
}


function AdminAccessIcon({ kind }: { kind: 'lock' | 'shield' }) {
  return (
    <div
      className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
      aria-hidden="true"
    >
      {kind === 'lock' ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z" strokeLinejoin="round" />
          <path d="m9.5 12 1.7 1.7 3.6-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}
