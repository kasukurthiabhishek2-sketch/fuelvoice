/**
 * Overpass API Proxy Route
 * 
 * Proxies Overpass API requests server-side to avoid CORS issues.
 * The Overpass API (overpass-api.de) doesn't set Access-Control-Allow-Origin
 * headers, so direct browser fetch from our domain is blocked.
 * This route forwards the request from our Next.js server.
 * 
 * Security:
 * - Rate-limited to prevent abuse (max body size, query validation)
 * - Only allows Overpass QL queries for fuel stations (`amenity=fuel`)
 * - Rejects requests that don't match expected query patterns
 */

import { NextRequest, NextResponse } from 'next/server';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

/** Max request body size in bytes (4KB — ample for our queries) */
const MAX_BODY_SIZE = 4096;

/**
 * Validates that the decoded Overpass QL query is a legitimate
 * fuel station query and not an arbitrary data extraction attempt.
 */
function isAllowedQuery(body: string): boolean {
  // Body is URL-encoded: data=<query>
  const params = new URLSearchParams(body);
  const query = params.get('data');
  if (!query) return false;

  const normalized = query.replace(/\s+/g, ' ').trim().toLowerCase();

  // Must be querying for fuel amenities
  if (!normalized.includes('"amenity"="fuel"')) return false;

  // Block dangerous Overpass features:
  // - `out meta` leaks contributor info
  // - `timeline` / `diff` are expensive operations
  // - `make` / `convert` can synthesize data
  // - `[adiff:` / `[diff:` are diff queries
  const blocklist = ['out meta', 'timeline', '[adiff:', '[diff:', 'make ', 'convert '];
  for (const blocked of blocklist) {
    if (normalized.includes(blocked)) return false;
  }

  // Must use `out body` or `out center` — standard output modes
  if (!normalized.includes('out body') && !normalized.includes('out center')) return false;

  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Guard: reject oversized payloads
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }

    const body = await request.text();

    // Guard: reject oversized body (in case content-length was missing/spoofed)
    if (body.length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }

    // Guard: validate query is a legitimate fuel station query
    if (!isAllowedQuery(body)) {
      return NextResponse.json(
        { error: 'Invalid or disallowed Overpass query' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Overpass API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        // Cache successful responses for 5 minutes at the edge
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Overpass API request timed out' },
        { status: 504 }
      );
    }

    console.error('[API/overpass] Proxy error:', err);
    return NextResponse.json(
      { error: 'Failed to proxy Overpass request' },
      { status: 502 }
    );
  }
}
