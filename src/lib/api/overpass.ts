/**
 * Overpass API Client
 * 
 * Queries OpenStreetMap's Overpass API for fuel stations.
 * Uses the `amenity=fuel` tag to find petrol pumps/gas stations.
 * 
 * Endpoint: https://overpass-api.de/api/interpreter
 * Rate limit: Be reasonable (no more than 1 req/sec, cache aggressively)
 */

import type { OverpassElement, StationSummary } from '@/types/station';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

/**
 * Module-level rate limiter for Overpass API.
 * Overpass asks for ≤1 req/2s and no concurrent requests.
 * We enforce a 12s minimum gap between calls to be safe.
 */
const MIN_INTERVAL_MS = 12_000;   // minimum ms between API calls
let lastCallAt = 0;               // timestamp of last successful call
let inFlight = false;             // true while a request is in progress
let rateLimitUntil = 0;           // backoff-until timestamp after a 429

export async function findNearbyStations(
  lat: number,
  lng: number,
  radiusMeters: number = 5000
): Promise<StationSummary[]> {
  // Mock mode
  if (typeof window !== 'undefined' && localStorage.getItem('fuelvoice:mock_user') === 'true') {
    return [
      {
        id: 'node_6254336890',
        name: 'Fuel Station',
        brand: 'Shell',
        address: 'Abids Road, Hyderabad, Telangana, IN',
        lat: 17.3887027,
        lng: 78.4753829,
        distance: 120,
        reviewCount: 0,
        avgRating: 0,
      }
    ];
  }

  // Skip if another request is already running
  if (inFlight) {
    console.warn('[Overpass] Request skipped — previous still in-flight');
    return [];
  }

  // Respect rate-limit cooldown after a 429
  const now = Date.now();
  if (now < rateLimitUntil) {
    const wait = Math.ceil((rateLimitUntil - now) / 1000);
    console.warn(`[Overpass] Rate-limited. Retry in ${wait}s`);
    return [];
  }

  // Enforce minimum gap between requests
  const sinceLastCall = now - lastCallAt;
  if (sinceLastCall < MIN_INTERVAL_MS && lastCallAt > 0) {
    console.warn(`[Overpass] Too soon — ${Math.ceil((MIN_INTERVAL_MS - sinceLastCall) / 1000)}s cooldown remaining`);
    return [];
  }

  inFlight = true;
  lastCallAt = Date.now();

  const controller = new AbortController();
  // Client-side timeout: abort if Overpass takes longer than 12s
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const overpassQuery = `
      [out:json][timeout:10];
      (
        nwr["amenity"="fuel"](around:${radiusMeters},${lat},${lng});
      );
      out body center;
    `;

    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: controller.signal,
    });

    if (response.status === 429) {
      rateLimitUntil = Date.now() + 30_000;
      console.warn('[Overpass] 429 — backing off 30s');
      return [];
    }

    // Handle all server-side errors gracefully — don't throw to the UI
    if (response.status >= 500) {
      console.warn(`[Overpass] Server error ${response.status} — will retry on next move`);
      return [];
    }

    if (!response.ok) {
      console.warn(`[Overpass] Unexpected status ${response.status}`);
      return [];
    }

    const data = await response.json();
    const elements: OverpassElement[] = data.elements || [];

    return elements
      .map((el) => elementToStationSummary(el, lat, lng))
      .filter((s): s is StationSummary => s !== null)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('[Overpass] Request timed out after 12s — will retry on next move');
    } else {
      console.warn('[Overpass] Fetch failed:', err);
    }
    return [];
  } finally {
    clearTimeout(timeout);
    inFlight = false;
  }
}

export async function getStationByOsmId(
  osmType: string,
  osmId: number
): Promise<OverpassElement | null> {
  // If running in development or testing (mock session active)
  if (osmId === 6254336890 && typeof window !== 'undefined' && localStorage.getItem('fuelvoice:mock_user') === 'true') {
    return {
      type: osmType as any,
      id: osmId,
      lat: 17.3887027,
      lon: 78.4753829,
      tags: {
        name: 'Fuel Station',
        brand: 'Shell',
        operator: 'Shell Retail',
        'addr:street': 'Abids Road',
        'addr:city': 'Hyderabad',
        'addr:state': 'Telangana',
        'addr:country': 'IN',
        'addr:country_code': 'IN',
        phone: '+914012345678',
        website: 'https://shell.in',
        opening_hours: '24/7',
        'fuel:diesel': 'yes',
        'fuel:octane_95': 'yes',
      }
    };
  }

  const overpassQuery = `
    [out:json][timeout:10];
    ${osmType}(${osmId});
    out body center;
  `;

  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(overpassQuery)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  return data.elements?.[0] || null;
}

/** Convert a raw Overpass element to a StationSummary */
function elementToStationSummary(
  el: OverpassElement,
  userLat: number,
  userLng: number
): StationSummary | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;

  if (!lat || !lng) return null;

  const tags = el.tags || {};
  const name = tags.name || tags.brand || tags.operator || 'Fuel Station';

  // Build address from available tags
  const addressParts = [
    tags['addr:street'],
    tags['addr:city'],
    tags['addr:state'],
    tags['addr:country'],
  ].filter(Boolean);

  return {
    id: `${el.type}_${el.id}`,
    name,
    brand: tags.brand || tags.operator || '',
    address: addressParts.length > 0 ? addressParts.join(', ') : '',
    lat,
    lng,
    avgRating: 0,
    reviewCount: 0,
    distance: haversineDistance(userLat, userLng, lat, lng),
  };
}

/** Calculate distance between two coordinates in kilometers (Haversine formula) */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
