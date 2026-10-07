/**
 * User menu with contribution status and account actions.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export function UserMenu() {
  const { user, profile, isAdmin, logOut } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setIsOpen(false);
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await logOut();
      toast('Signed out successfully', 'info');
      setIsOpen(false);
    } catch {
      toast('Failed to sign out', 'error');
    }
  };

  const displayName = profile?.displayName || user.displayName || 'User';
  const photoURL = profile?.photoURL || user.photoURL || '';

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="grid h-11 w-11 place-items-center rounded-xl transition-colors hover:bg-[var(--bg-tertiary)]"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={isOpen ? 'user-menu-panel' : undefined}
      >
        {photoURL ? (
          <Image src={photoURL} alt={displayName} width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-1 ring-brand-500/30" />
        ) : (
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="user-menu-panel"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] shadow-xl"
          >
            <div className="border-b border-[var(--border-primary)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{displayName}</p>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                {profile?.reviewCount || 0} reviews · {profile?.likeCount || 0} helpful marks
              </p>
            </div>

            <div className="p-1">
              <Link
                href="/contribute"
                onClick={() => setIsOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-tertiary)]"
              >
                <svg className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                Contribute
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-tertiary)]"
                >
                  <svg className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Admin Panel
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-tertiary)]"
              >
                <svg className="h-4 w-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
