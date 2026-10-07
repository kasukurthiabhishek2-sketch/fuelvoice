/**
 * Progressive address enrichment for nearby station cards.
 *
 * MapTiler Cloud requires end-user requests to reach its API directly unless a
 * separate proxy agreement exists. FuelVoice therefore batches incomplete
 * station coordinates into one browser request and caches the result through
 * TanStack Query.
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

interface MapTilerContext {
  text?: string;
}

interface MapTilerFeature {
  text?: string;
  address?: string;
  place_name?: string;
  place_type?: string[];
  context?: MapTilerContext[];
}

interface MapTilerCollection {
  type?: string;
  features?: MapTilerFeature[];
}

function needsEnrichment(station: StationSummary): boolean {
  return station.addressQuality !== 'full';
}

function featureScore(feature: MapTilerFeature): number {
  const types = feature.place_type || [];

  if (types.includes('address')) return 100;
  if (types.includes('street')) return 90;
  if (types.some((type) => ['neighbourhood', 'neighborhood', 'suburb', 'district'].includes(type))) return 80;
  if (types.some((type) => ['locality', 'village', 'town', 'city', 'municipality', 'place'].includes(type))) return 70;
  if (types.includes('poi')) return 20;
  return 40;
}

function cleanAddress(feature: MapTilerFeature | undefined): string {
  if (!feature) return '';

  const placeName = feature.place_name?.trim();
  if (placeName && placeName.split(',').length >= 2) {
    return placeName.replace(/\s+,/g, ',').replace(/,\s*,+/g, ', ').trim();
  }

  const first = [feature.address, feature.text].filter(Boolean).join(' ').trim();
  const context = (feature.context || [])
    .map((item) => item.text?.trim())
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set([first, ...context].filter(Boolean))).join(', ');
}

function resolveCollection(collection: MapTilerCollection | undefined): Omit<ResolvedStationAddress, 'source'> | null {
  const candidates = [...(collection?.features || [])].sort(
    (left, right) => featureScore(right) - featureScore(left),
  );

  for (const feature of candidates) {
    const address = cleanAddress(feature);
    if (!address) continue;

    return {
      address,
      precision: feature.place_type?.[0] || 'location',
    };
  }

  return null;
}

function quantize(value: number): number {
  return Math.round(value * 100_000) / 100_000;
}

async function fetchStationAddresses(
  stations: Array<{ id: string; lat: number; lng: number }>,
): Promise<AddressMap> {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (!apiKey) return {};

  const queries = stations
    .map((station) => `${quantize(station.lng)},${quantize(station.lat)}`)
    .join(';');

  const url = new URL(`https://api.maptiler.com/geocoding/${queries}.json`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('language', 'en');

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'force-cache',
  });

  if (!response.ok) {
    throw new Error(`MapTiler station address lookup returned ${response.status}`);
  }

  const payload = await response.json() as MapTilerCollection | MapTilerCollection[];
  const collections = Array.isArray(payload) ? payload : [payload];
  const addresses: AddressMap = {};

  stations.forEach((station, index) => {
    const match = resolveCollection(collections[index]);
    if (!match) return;

    addresses[station.id] = {
      ...match,
      source: 'maptiler',
    };
  });

  return addresses;
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
    queryFn: () => fetchStationAddresses(unresolved),
    enabled: unresolved.length > 0,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
