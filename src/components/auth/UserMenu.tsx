/**
 * User Menu Component
 * 
 * Dropdown menu showing user avatar, name, and actions (profile, admin, sign out).
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

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {photoURL ? (
          <Image
            src={photoURL}
            alt={displayName}
            width={36}
            height={36}
            className="rounded-full ring-2 ring-brand-500/30"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden glass-strong shadow-xl z-50"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {displayName}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {profile?.reviewCount || 0} reviews • {profile?.likeCount || 0} likes
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-700"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Admin Panel
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-700"
                style={{ color: 'var(--text-primary)' }}
              >
                <svg className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
