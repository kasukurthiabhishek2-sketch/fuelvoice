/**
 * Search bar with Photon autocomplete and keyboard navigation.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useStationSearch } from '@/hooks/useStationSearch';
import type { SearchResult } from '@/lib/api/photon';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  userLat?: number | null;
  userLng?: number | null;
  placeholder?: string;
}

export function SearchBar({
  variant = 'compact',
  userLat,
  userLng,
  placeholder = 'Search fuel stations worldwide…',
}: SearchBarProps) {
  const router = useRouter();
  const { searchTerm, setSearchTerm, results, isSearching } = useStationSearch({
    lat: userLat,
    lng: userLng,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setSearchTerm('');
    router.push(\`/station/\${result.id}\`);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((current) => (current < results.length - 1 ? current + 1 : 0));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((current) => (current > 0 ? current - 1 : results.length - 1));
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const isHero = variant === 'hero';

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className={\`relative \${isHero ? 'max-w-2xl' : ''}\`}>
        <div
          className={\`absolute left-2.5 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300 \${isHero ? 'h-10 w-10' : 'h-8 w-8'}\`}
          aria-hidden="true"
        >
          <SearchIcon className={isHero ? 'h-5 w-5' : 'h-4 w-4'} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(event) => {
            const nextValue = event.target.value;
            setSearchTerm(nextValue);
            setIsOpen(nextValue.length >= 2);
            setSelectedIndex(-1);
          }}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={\`w-full border outline-none transition-all duration-200 placeholder:text-surface-400 \${isHero
            ? 'min-h-[60px] rounded-2xl py-3.5 pl-[62px] pr-14 text-[15px] font-medium shadow-lg focus:border-brand-500 focus:shadow-[var(--shadow-glow)]'
            : 'min-h-11 rounded-xl py-2.5 pl-12 pr-11 text-sm shadow-sm focus:border-brand-500'
          }\`}
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-primary)',
          }}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-label="Search fuel stations"
          aria-autocomplete="list"
          autoComplete="off"
        />

        {isHero && !isSearching && (
          <span
            className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-lg border px-2 py-1 text-[10px] font-bold sm:block"
            style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}
          >
            SEARCH
          </span>
        )}

        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2" aria-label="Searching">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            id="search-results"
            initial={{ opacity: 0, y: 7, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 7, scale: 0.99 }}
            transition={{ duration: 0.14 }}
            className={\`absolute top-full z-[9999] mt-2 w-full overflow-hidden rounded-2xl border shadow-xl \${isHero ? 'max-w-2xl' : ''}\`}
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-elevated)' }}
            role="listbox"
          >
            <div className="border-b px-4 py-2.5" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-tertiary)' }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em]">Matching fuel stations</p>
            </div>

            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={\`flex min-h-[60px] w-full items-center gap-3 px-3.5 py-3 text-left transition-colors \${index === selectedIndex ? 'bg-brand-500/10' : 'hover:bg-surface-50 dark:hover:bg-surface-800'}\`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <PumpIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{result.name}</p>
                  <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {[result.city, result.state, result.country].filter(Boolean).join(', ') || 'Location details unavailable'}
                  </p>
                </div>
                <ChevronIcon />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && searchTerm.length >= 2 && !isSearching && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 7 }}
            className={\`absolute top-full z-[9999] mt-2 w-full rounded-2xl border p-5 shadow-xl \${isHero ? 'max-w-2xl' : ''}\`}
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-elevated)' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-surface-100 dark:bg-surface-800">
                <SearchIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  No fuel stations found for &ldquo;{searchTerm}&rdquo;
                </p>
                <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>
                  Try a station name, fuel brand, city, or a broader area.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
    </svg>
  );
}

function PumpIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a2 2 0 0 1 2 2v14H4V6a2 2 0 0 1 2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h6M16 9h1.5l1.5 2v5.5a1.5 1.5 0 0 0 3 0V10l-2-2" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  );
}
