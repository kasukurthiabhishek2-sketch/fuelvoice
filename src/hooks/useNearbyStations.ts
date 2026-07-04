/**
 * useNearbyStations Hook
 * 
 * Queries Overpass API for fuel stations near the user's location.
 * Uses TanStack Query for caching and deduplication.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { findNearbyStations } from '@/lib/api/overpass';
import type { StationSummary } from '@/types/station';

interface UseNearbyStationsOptions {
  lat: number | null;
  lng: number | null;
  radiusMeters?: number;
  enabled?: boolean;
}

export function useNearbyStations({
  lat,
  lng,
  radiusMeters = 5000,
  enabled = true,
}: UseNearbyStationsOptions) {
  return useQuery<StationSummary[]>({
    queryKey: ['nearby-stations', lat, lng, radiusMeters],
    queryFn: () => findNearbyStations(lat!, lng!, radiusMeters),
    enabled: enabled && lat !== null && lng !== null,
    staleTime: 10 * 60 * 1000, // 10 minutes (stations don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
