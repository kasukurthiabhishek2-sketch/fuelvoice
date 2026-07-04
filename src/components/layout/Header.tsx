/**
 * Header Component
 * 
 * Sticky navigation header with glassmorphism effect.
 * Contains logo, theme toggle, and auth buttons.
 * No nav links — search is directly on the home page.
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
    <header className="sticky top-0 z-40 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="FuelVoice home">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-2xl"
            >
              ⛽
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
              FuelVoice
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {!loading && (
              <>
                {user ? (
                  <UserMenu />
                ) : (
                  <LoginButton variant="compact" />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
