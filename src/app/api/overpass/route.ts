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

/**
 * Overpass API endpoints — primary + fallback mirrors.
 * If the primary returns an error, we try the next one.
 */
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

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

/**
 * Attempt to fetch from an Overpass endpoint.
 * Returns the Response or throws on network/abort errors.
 */
async function fetchFromEndpoint(
  url: string,
  body: string,
  signal: AbortSignal,
): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Overpass API policy requires a User-Agent identifying the application.
      // Without this, the API may reject requests with 406 Not Acceptable.
      'User-Agent': 'FuelVoice/1.0 (https://fuelvoice.vercel.app; community fuel station reviews)',
    },
    body,
    signal,
  });
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

    // Try each endpoint until one succeeds
    let lastError: Response | null = null;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const response = await fetchFromEndpoint(endpoint, body, controller.signal);

        if (response.ok) {
          clearTimeout(timeout);
          const data = await response.json();

          return NextResponse.json(data, {
            headers: {
              // Cache successful responses for 5 minutes at the edge
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
          });
        }

        // If rate-limited (429) or client error (4xx), try next endpoint
        lastError = response;
        console.warn(`[API/overpass] ${endpoint} returned ${response.status}, trying next...`);
      } catch (fetchErr) {
        // Network error on this endpoint — try next (unless aborted)
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
          throw fetchErr; // propagate timeout
        }
        console.warn(`[API/overpass] ${endpoint} failed:`, fetchErr);
      }
    }

    clearTimeout(timeout);

    // All endpoints failed — return the last error status
    const status = lastError?.status || 502;
    return NextResponse.json(
      { error: `All Overpass endpoints failed (last status: ${status})` },
      { status: Math.min(status, 502) } // don't forward weird status codes
    );
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
