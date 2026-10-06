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
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const hasActiveSearch = searchTerm.length >= 2;
  const queryMatchesInput = hasActiveSearch && debouncedTerm === searchTerm;
  const isDebouncing = hasActiveSearch && !queryMatchesInput;
  const isSearching = hasActiveSearch && (
    isDebouncing ||
    (queryMatchesInput && query.isFetching)
  );
  const hasCompletedSearch = hasActiveSearch &&
    queryMatchesInput &&
    !query.isFetching &&
    (query.isSuccess || query.isError);
  const results = queryMatchesInput && query.isSuccess
    ? query.data || []
    : [];
  const error = hasCompletedSearch && query.isError
    ? query.error
    : null;

  return {
    searchTerm,
    setSearchTerm,
    results,
    isSearching,
    error,
    hasCompletedSearch,
    hasResults: results.length > 0,
    retrySearch: () => query.refetch(),
  };
}
