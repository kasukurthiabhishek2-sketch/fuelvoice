/**
 * Progressive address enrichment for nearby station cards.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { StationSummary } from '@/types/station';

export interface ResolvedStationAddress {
  address: string;
  precision: string;
  source: 'maptiler';
}

type AddressMap = Record<string, ResolvedStationAddress>;

function needsEnrichment(station: StationSummary): boolean {
  return station.addressQuality !== 'full';
}

export function useStationAddresses(stations: StationSummary[]) {
  const unresolved = stations
    .filter(needsEnrichment)
    .slice(0, 12)
    .map((station) => ({
      id: station.id,
      lat: station.lat,
      lng: station.lng,
    }));

  const fingerprint = unresolved
    .map((station) => `${station.id}:${station.lat.toFixed(5)},${station.lng.toFixed(5)}`)
    .join('|');

  return useQuery<AddressMap>({
    queryKey: ['station-addresses', fingerprint],
    queryFn: async () => {
      const response = await fetch('/api/station-addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stations: unresolved }),
      });

      if (!response.ok) {
        throw new Error(`Station address lookup returned ${response.status}`);
      }

      const payload = await response.json() as { addresses?: AddressMap };
      return payload.addresses || {};
    },
    enabled: unresolved.length > 0,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
