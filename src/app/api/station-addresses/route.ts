/**
 * Batch station-address enrichment.
 *
 * Nearby OSM fuel features often omit addr:* tags. FuelVoice already has
 * station coordinates, so this endpoint resolves only incomplete cards through
 * MapTiler's batch reverse-geocoding API and returns a human-readable address.
 *
 * The browser never fans out one request per card and the provider key remains
 * behind the server boundary.
 */

import { NextRequest, NextResponse } from 'next/server';

const MAX_STATIONS = 12;
const PROVIDER_TIMEOUT_MS = 6_000;
const ADDRESS_CACHE_SECONDS = 60 * 60 * 24 * 30;

interface AddressRequestStation {
  id: string;
  lat: number;
  lng: number;
}

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

function validStation(value: unknown): value is AddressRequestStation {
  if (!value || typeof value !== 'object') return false;

  const station = value as Partial<AddressRequestStation>;
  return (
    typeof station.id === 'string' &&
    /^(node|way|relation)_\d+$/.test(station.id) &&
    typeof station.lat === 'number' &&
    Number.isFinite(station.lat) &&
    station.lat >= -90 &&
    station.lat <= 90 &&
    typeof station.lng === 'number' &&
    Number.isFinite(station.lng) &&
    station.lng >= -180 &&
    station.lng <= 180
  );
}

function quantize(value: number): number {
  return Math.round(value * 100_000) / 100_000;
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

function selectAddress(collection: MapTilerCollection | undefined) {
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

async function fetchBatchAddresses(
  stations: AddressRequestStation[],
  requestOrigin: string,
): Promise<Map<string, { address: string; precision: string }>> {
  const apiKey = process.env.MAPTILER_API_KEY || process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (!apiKey) throw new Error('MapTiler API key is not configured');

  const queries = stations
    .map((station) => `${quantize(station.lng)},${quantize(station.lat)}`)
    .join(';');

  const url = new URL(`https://api.maptiler.com/geocoding/${queries}.json`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('language', 'en');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FuelVoice/1.0 (https://fuelvoice.vercel.app; station address enrichment)',
        Referer: `${requestOrigin}/`,
        Origin: requestOrigin,
      },
      signal: controller.signal,
      next: { revalidate: ADDRESS_CACHE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`MapTiler reverse geocoding returned ${response.status}`);
    }

    const payload = await response.json() as MapTilerCollection | MapTilerCollection[];
    const collections = Array.isArray(payload) ? payload : [payload];
    const result = new Map<string, { address: string; precision: string }>();

    stations.forEach((station, index) => {
      const resolved = selectAddress(collections[index]);
      if (resolved) result.set(station.id, resolved);
    });

    return result;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const rawStations = (payload as { stations?: unknown } | null)?.stations;
  if (!Array.isArray(rawStations) || rawStations.length === 0 || rawStations.length > MAX_STATIONS) {
    return NextResponse.json(
      { error: `stations must contain between 1 and ${MAX_STATIONS} items` },
      { status: 400 },
    );
  }

  if (!rawStations.every(validStation)) {
    return NextResponse.json({ error: 'Invalid station coordinates' }, { status: 400 });
  }

  const uniqueStations = Array.from(
    new Map(rawStations.map((station) => [station.id, station])).values(),
  );

  try {
    const resolved = await fetchBatchAddresses(uniqueStations, request.nextUrl.origin);
    const addresses = Object.fromEntries(
      uniqueStations
        .map((station) => {
          const match = resolved.get(station.id);
          return match
            ? [station.id, { ...match, source: 'maptiler' as const }]
            : null;
        })
        .filter((entry): entry is [string, { address: string; precision: string; source: 'maptiler' }] => entry !== null),
    );

    return NextResponse.json(
      { addresses },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${ADDRESS_CACHE_SECONDS}, stale-while-revalidate=${ADDRESS_CACHE_SECONDS}`,
        },
      },
    );
  } catch (error) {
    console.warn(
      '[API/station-addresses] address enrichment failed:',
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      { error: 'Station address lookup temporarily unavailable', addresses: {} },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
