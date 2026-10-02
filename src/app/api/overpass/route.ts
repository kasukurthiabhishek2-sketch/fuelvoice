/**
 * Server-side Overpass proxy.
 *
 * Fuel-station area queries are cached by a lightly quantized map center so
 * repeated homepage/map requests do not wait on the public Overpass network.
 * Provider failures are still surfaced; FuelVoice never fabricates station
 * data to hide an upstream outage.
 */

import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.privatevoid.net/api/interpreter',
];

const MAX_BODY_SIZE = 4096;
const ENDPOINT_TIMEOUT_MS = 3_500;
const MAX_RADIUS_METERS = 10_000;
const MAX_QUERY_TIMEOUT_SECONDS = 15;

type AllowedQuery =
  | { kind: 'area'; radius: number; lat: number; lng: number }
  | { kind: 'station'; osmType: 'node' | 'way' | 'relation'; osmId: number };

function quantizeCoordinate(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function parseAllowedQuery(body: string): AllowedQuery | null {
  const query = new URLSearchParams(body).get('data');
  if (!query) return null;

  const normalized = query.replace(/\s+/g, ' ').trim().toLowerCase();
  const timeoutMatch = /^\[out:json\]\[timeout:(\d+)\];\s*/.exec(normalized);
  if (!timeoutMatch || Number(timeoutMatch[1]) > MAX_QUERY_TIMEOUT_SECONDS) return null;

  const queryBody = normalized.slice(timeoutMatch[0].length).trim();

  const areaMatch = /^\(\s*nwr\["amenity"="fuel"\]\(around:(\d+),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\);\s*\);\s*out body center;?$/.exec(queryBody);
  if (areaMatch) {
    const radius = Number(areaMatch[1]);
    const lat = Number(areaMatch[2]);
    const lng = Number(areaMatch[3]);

    if (
      Number.isFinite(radius) &&
      radius > 0 &&
      radius <= MAX_RADIUS_METERS &&
      Number.isFinite(lat) &&
      lat >= -90 &&
      lat <= 90 &&
      Number.isFinite(lng) &&
      lng >= -180 &&
      lng <= 180
    ) {
      return {
        kind: 'area',
        radius,
        lat: quantizeCoordinate(lat),
        lng: quantizeCoordinate(lng),
      };
    }
    return null;
  }

  const stationMatch = /^(node|way|relation)\(([1-9]\d*)\);\s*out body center;?$/.exec(queryBody);
  if (!stationMatch) return null;

  const osmId = Number(stationMatch[2]);
  if (!Number.isSafeInteger(osmId) || osmId <= 0) return null;

  return {
    kind: 'station',
    osmType: stationMatch[1] as 'node' | 'way' | 'relation',
    osmId,
  };
}

async function fetchFromEndpoint(url: string, body: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ENDPOINT_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'FuelVoice/1.0 (https://fuelvoice.vercel.app; community fuel station reviews)',
      },
      body,
      signal: controller.signal,
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJsonFromProviders(body: string): Promise<unknown> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetchFromEndpoint(endpoint, body);
      if (!response.ok) {
        console.warn(`[API/overpass] ${endpoint} returned ${response.status}`);
        continue;
      }
      return await response.json();
    } catch (error) {
      console.warn(
        `[API/overpass] ${endpoint} failed:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  throw new Error('Fuel-station data provider temporarily unavailable');
}

const getCachedArea = unstable_cache(
  async (radius: number, lat: number, lng: number) => {
    const query = `[out:json][timeout:10];
(
  nwr["amenity"="fuel"](around:${radius},${lat},${lng});
);
out body center;`;
    return fetchJsonFromProviders(`data=${encodeURIComponent(query)}`);
  },
  ['fuelvoice-overpass-area-v1'],
  { revalidate: 300 },
);

const getCachedStation = unstable_cache(
  async (osmType: 'node' | 'way' | 'relation', osmId: number) => {
    const query = `[out:json][timeout:10];
${osmType}(${osmId});
out body center;`;
    return fetchJsonFromProviders(`data=${encodeURIComponent(query)}`);
  },
  ['fuelvoice-overpass-station-v1'],
  { revalidate: 600 },
);

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  const body = await request.text();
  if (body.length > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  const parsed = parseAllowedQuery(body);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid or disallowed Overpass query' }, { status: 400 });
  }

  try {
    const data = parsed.kind === 'area'
      ? await getCachedArea(parsed.radius, parsed.lat, parsed.lng)
      : await getCachedStation(parsed.osmType, parsed.osmId);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
      },
    });
  } catch (error) {
    console.warn(
      '[API/overpass] all providers failed:',
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      { error: 'Fuel-station data provider temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
