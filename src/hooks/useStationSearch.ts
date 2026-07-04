/**
 * useStationSearch Hook
 * 
 * Debounced search for fuel stations using Photon API.
 * Autocomplete-friendly with 300ms debounce.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchFuelStations, type SearchResult } from '@/lib/api/photon';

interface UseStationSearchOptions {
  lat?: number | null;
  lng?: number | null;
}

export function useStationSearch({ lat, lng }: UseStationSearchOptions = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search term
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchTerm]);

  const query = useQuery<SearchResult[]>({
    queryKey: ['station-search', debouncedTerm, lat, lng],
    queryFn: () =>
      searchFuelStations(
        debouncedTerm,
        lat ?? undefined,
        lng ?? undefined
      ),
    enabled: debouncedTerm.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    searchTerm,
    setSearchTerm,
    results: query.data || [],
    isSearching: query.isLoading && debouncedTerm.length >= 2,
    error: query.error,
    hasResults: (query.data?.length || 0) > 0,
  };
}
