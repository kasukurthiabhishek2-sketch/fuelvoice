/**
 * Overpass API client for OpenStreetMap fuel stations.
 *
 * Development E2E mocks are isolated behind non-production mock mode. In
 * production an upstream failure is an error, never a reason to fabricate a
 * plausible-looking petrol station or rating.
 */

import type { OverpassElement, StationSummary } from '@/types/station';
import { canUseE2EMocks } from '@/lib/testing/e2e';

const OVERPASS_API_DIRECT = 'https://overpass-api.de/api/interpreter';
const REQUEST_TIMEOUT_MS = 15_000;
let rateLimitUntil = 0;

function getOverpassUrl(): string {
  return typeof window !== 'undefined' ? '/api/overpass' : OVERPASS_API_DIRECT;
}

function isMockMode(): boolean {
  if (!canUseE2EMocks()) return false;
  const value = localStorage.getItem('fuelvoice:mock_user');
  return value === 'true' || value === 'admin';
}

async function postOverpass(query: string): Promise<{ elements?: OverpassElement[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(getOverpassUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    if (response.status === 429 || response.status === 406) {
      rateLimitUntil = Date.now() + 15_000;
    }
    if (!response.ok) {
      throw new Error(`Fuel-station data provider returned ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Fuel-station data provider timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function findNearbyStations(
  lat: number,
  lng: number,
  radiusMeters: number = 5000,
): Promise<StationSummary[]> {
  if (isMockMode()) {
    return [{
      id: 'node_6254336890',
      name: 'Fuel Station',
      brand: 'Shell',
      address: 'Abids Road, Hyderabad, Telangana, IN',
      lat: 17.3887027,
      lng: 78.4753829,
      distance: 0.12,
      reviewCount: 0,
      avgRating: 0,
    }];
  }

  if (Date.now() < rateLimitUntil) {
    throw new Error('Fuel-station data provider is rate-limited. Please retry shortly.');
  }

  const query = `
    [out:json][timeout:10];
    (
      nwr["amenity"="fuel"](around:${radiusMeters},${lat},${lng});
    );
    out body center;
  `;
  const data = await postOverpass(query);

  return (data.elements || [])
    .map((element) => elementToStationSummary(element, lat, lng))
    .filter((station): station is StationSummary => station !== null)
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}

export async function getStationByOsmId(
  osmType: string,
  osmId: number,
): Promise<OverpassElement | null> {
  if (isMockMode() && osmId === 6254336890) {
    return {
      type: 'node',
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
      },
    };
  }

  if (!['node', 'way', 'relation'].includes(osmType) || !Number.isSafeInteger(osmId) || osmId <= 0) {
    return null;
  }

  const query = `
    [out:json][timeout:10];
    ${osmType}(${osmId});
    out body center;
  `;
  const data = await postOverpass(query);
  return data.elements?.[0] || null;
}

function elementToStationSummary(
  element: OverpassElement,
  userLat: number,
  userLng: number,
): StationSummary | null {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat === undefined || lng === undefined) return null;

  const tags = element.tags || {};
  const addressParts = [
    tags['addr:street'],
    tags['addr:city'],
    tags['addr:state'],
    tags['addr:country'],
  ].filter(Boolean);

  return {
    id: `${element.type}_${element.id}`,
    name: tags.name || tags.brand || tags.operator || 'Fuel Station',
    brand: tags.brand || tags.operator || '',
    address: addressParts.join(', '),
    lat,
    lng,
    avgRating: 0,
    reviewCount: 0,
    distance: haversineDistance(userLat, userLng, lat, lng),
  };
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusKm * c * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
