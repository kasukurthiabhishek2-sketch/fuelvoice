/**
 * Search Bar Component
 * 
 * Full-featured search bar with Photon API autocomplete.
 * Supports keyboard navigation (arrow keys, Enter, Escape).
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStationSearch } from '@/hooks/useStationSearch';
import type { SearchResult } from '@/lib/api/photon';

interface SearchBarProps {
  /** Size variant */
  variant?: 'hero' | 'compact';
  /** Bias search results toward user location */
  userLat?: number | null;
  userLng?: number | null;
  /** Optional placeholder override */
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open dropdown when results appear
  useEffect(() => {
    if (results.length > 0 && searchTerm.length >= 2) {
      setIsOpen(true);
      setSelectedIndex(-1);
    }
  }, [results, searchTerm]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setSearchTerm('');
    router.push(`/station/${result.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const isHero = variant === 'hero';

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className={`relative ${isHero ? 'max-w-2xl mx-auto' : ''}`}>
        {/* Search Icon */}
        <div className="absolute z-50 left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`${isHero ? 'w-5 h-5' : 'w-4 h-4'}`}
            style={{ color: 'var(--text-tertiary)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full transition-all duration-200 outline-none
            ${isHero
              ? 'pl-12 pr-4 py-4 text-base rounded-full shadow-xl border-2 focus:border-brand-500 focus:shadow-[var(--shadow-glow)]'
              : 'pl-10 pr-4 py-2.5 text-sm rounded-full shadow-md border focus:border-brand-500'
            }`}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-primary)',
          }}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-label="Search fuel stations"
          autoComplete="off"
        />

        {/* Loading spinner */}
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            id="search-results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-2 w-full rounded-2xl overflow-hidden glass-strong shadow-xl z-[9999] ${isHero ? 'max-w-2xl left-1/2 -translate-x-1/2' : ''}`}
            role="listbox"
          >
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-brand-500/10'
                    : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                }`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="flex-shrink-0 mt-0.5">
                   <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <span className="text-sm">⛽</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {result.name}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {[result.city, result.state, result.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results */}
      <AnimatePresence>
        {isOpen && searchTerm.length >= 2 && !isSearching && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`absolute top-full mt-2 w-full rounded-2xl glass-strong shadow-xl z-[9999] p-6 text-center ${isHero ? 'max-w-2xl left-1/2 -translate-x-1/2' : ''}`}
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No fuel stations found for &ldquo;{searchTerm}&rdquo;
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Try searching by station name, brand, or city
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
