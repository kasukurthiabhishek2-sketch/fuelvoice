/**
 * Admin Layout
 * Protected route guard — only accessible to users with role='admin'.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Access Denied</h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Please sign in to access this page.</p>
        <Link href="/" className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors">← Back to Home</Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🛡️</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Admin Only</h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>You do not have admin privileges.</p>
        <Link href="/" className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors">← Back to Home</Link>
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
