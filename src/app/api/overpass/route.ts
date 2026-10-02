/**
 * Server-side Overpass proxy.
 *
 * Only FuelVoice's fuel-station queries are accepted. Provider failures are
 * surfaced as 503 responses; production must never invent station data.
 */

import { NextRequest, NextResponse } from 'next/server';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.privatevoid.net/api/interpreter',
];

const MAX_BODY_SIZE = 4096;
const ENDPOINT_TIMEOUT_MS = 5_000;

function isAllowedQuery(body: string): boolean {
  const params = new URLSearchParams(body);
  const query = params.get('data');
  if (!query) return false;

  const normalized = query.replace(/\s+/g, ' ').trim().toLowerCase();
  const blocklist = ['out meta', 'timeline', '[adiff:', '[diff:', 'make ', 'convert '];
  if (blocklist.some((blocked) => normalized.includes(blocked))) return false;

  if (!normalized.includes('out body') && !normalized.includes('out center')) return false;
  if (normalized.includes('"amenity"="fuel"')) return true;

  const queryBody = normalized
    .replace(/^\[out:json\]\[timeout:\d+\];/, '')
    .trim();
  return /^(node|way|relation)\(\d+\)\s*;?\s*out\s+(body|center|body\s+center|center\s+body)\s*;?$/.test(queryBody);
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
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  const body = await request.text();
  if (body.length > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }
  if (!isAllowedQuery(body)) {
    return NextResponse.json({ error: 'Invalid or disallowed Overpass query' }, { status: 400 });
  }

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetchFromEndpoint(endpoint, body);
      if (!response.ok) {
        console.warn(`[API/overpass] ${endpoint} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    } catch (error) {
      console.warn(
        `[API/overpass] ${endpoint} failed:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return NextResponse.json(
    { error: 'Fuel-station data provider temporarily unavailable' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
