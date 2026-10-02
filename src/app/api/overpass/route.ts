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
  'https://overpass.privatevoid.net/api/interpreter',
];

const MAX_BODY_SIZE = 4096;
const ENDPOINT_TIMEOUT_MS = 4_000;
const MAX_RADIUS_METERS = 10_000;
const MAX_QUERY_TIMEOUT_SECONDS = 15;

function isAllowedQuery(body: string): boolean {
  const query = new URLSearchParams(body).get('data');
  if (!query) return false;

  const normalized = query.replace(/\s+/g, ' ').trim().toLowerCase();
  const timeoutMatch = /^\[out:json\]\[timeout:(\d+)\];\s*/.exec(normalized);
  if (!timeoutMatch || Number(timeoutMatch[1]) > MAX_QUERY_TIMEOUT_SECONDS) return false;

  const queryBody = normalized.slice(timeoutMatch[0].length).trim();

  const areaMatch = /^\(\s*nwr\["amenity"="fuel"\]\(around:(\d+),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\);\s*\);\s*out body center;?$/.exec(queryBody);
  if (areaMatch) {
    const radius = Number(areaMatch[1]);
    const lat = Number(areaMatch[2]);
    const lng = Number(areaMatch[3]);
    return Number.isFinite(radius) &&
      radius > 0 && radius <= MAX_RADIUS_METERS &&
      Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
      Number.isFinite(lng) && lng >= -180 && lng <= 180;
  }

  return /^(node|way|relation)\([1-9]\d*\);\s*out body center;?$/.test(queryBody);
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
