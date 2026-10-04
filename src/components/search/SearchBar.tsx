/**
 * Search Bar Component
 *
 * Autocomplete search with keyboard navigation, explicit clear affordance,
 * and a high-contrast command surface that works in both themes.
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
    router.push(`/station/${result.id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((previous) => (previous < results.length - 1 ? previous + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((previous) => (previous > 0 ? previous - 1 : results.length - 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedIndex(-1);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const isHero = variant === 'hero';
  const hasResultsPopup = isOpen && results.length > 0;
  const activeOptionId = selectedIndex >= 0 && results[selectedIndex]
    ? `search-result-${results[selectedIndex].id}`
    : undefined;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative w-full">
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--text-tertiary)]">
          <svg
            className={isHero ? 'h-5 w-5' : 'h-4 w-4'}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" strokeLinecap="round" />
          </svg>
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
          className={`w-full border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] outline-none transition-all duration-200 ${isHero
            ? 'rounded-2xl py-4 pl-12 pr-12 text-[15px] shadow-[var(--shadow-xs)] focus:border-brand-500 focus:shadow-[var(--shadow-glow)] sm:py-[18px] sm:pr-24 sm:text-base'
            : 'rounded-xl py-2.5 pl-10 pr-20 text-sm shadow-[var(--shadow-xs)] focus:border-brand-500'
          }`}
          role="combobox"
          aria-expanded={hasResultsPopup}
          aria-controls={hasResultsPopup ? 'search-results' : undefined}
          aria-label="Search fuel stations"
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          aria-busy={isSearching}
          autoComplete="off"
        />

        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {isSearching && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" aria-label="Searching" />
          )}
          {!isSearching && searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-tertiary)] transition hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m7 7 10 10M17 7 7 17" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isSearching
          ? 'Searching fuel stations'
          : isOpen && searchTerm.length >= 2
            ? results.length > 0
              ? `${results.length} fuel station result${results.length === 1 ? '' : 's'} available`
              : 'No fuel stations found'
            : ''}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            id="search-results"
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 top-full z-[9999] mt-2 w-full overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] p-1.5 shadow-[var(--shadow-xl)] backdrop-blur-2xl"
            role="listbox"
            aria-label="Fuel station search results"
          >
            <div className="flex items-center justify-between px-3 pb-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Stations</span>
              <span className="text-[10px] text-[var(--text-tertiary)]">Use ↑ ↓ and Enter</span>
            </div>
            {results.map((result, index) => (
              <button
                key={result.id}
                id={`search-result-${result.id}`}
                type="button"
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${index === selectedIndex
                  ? 'bg-brand-500/10'
                  : 'hover:bg-[var(--bg-tertiary)]'
                }`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M6.5 4.5h7.5v15H6.5z" strokeLinejoin="round" />
                    <path d="M8.5 8h3.5M14 8.5h2.2l1.8 2.1V17a1.5 1.5 0 0 0 3 0v-5.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {result.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {[result.city, result.state, result.country].filter(Boolean).join(', ') || 'Location details unavailable'}
                  </span>
                </span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && searchTerm.length >= 2 && !isSearching && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute left-0 top-full z-[9999] mt-2 w-full rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] p-6 text-center shadow-[var(--shadow-xl)] backdrop-blur-2xl"
          >
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              No fuel stations found for &ldquo;{searchTerm}&rdquo;
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Try a station name, brand, locality, or city.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
