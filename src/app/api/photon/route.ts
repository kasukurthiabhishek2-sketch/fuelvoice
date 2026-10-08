/**
 * Same-origin Photon gateway. Public Photon is a shared demo service: cache
 * repeated autocomplete queries and keep provider/network failures off the
 * browser's cross-origin request path.
 */
import { NextRequest, NextResponse } from 'next/server';

const PHOTON_URL = 'https://photon.komoot.io/api';
const ALLOWED_LAYERS = new Set(['city', 'locality', 'district', 'county', 'state', 'country']);
const PHOTON_TIMEOUT_MS = 5_500;

function finiteNumber(value: string | null, min: number, max: number): number | null {
  if (value === null || value.trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams;
  const query = (input.get('q') || '').trim();
  if (query.length < 2 || query.length > 100) {
    return NextResponse.json({ error: 'Search must contain 2–100 characters' }, { status: 400 });
  }

  const limit = finiteNumber(input.get('limit') ?? '8', 1, 40);
  if (limit === null || !Number.isInteger(limit)) {
    return NextResponse.json({ error: 'Invalid result limit' }, { status: 400 });
  }

  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    lang: 'en',
  });

  const osmTag = input.get('osm_tag');
  if (osmTag !== null && osmTag !== 'amenity:fuel') {
    return NextResponse.json({ error: 'Invalid search category' }, { status: 400 });
  }
  if (osmTag) params.set('osm_tag', osmTag);

  const layers = input.getAll('layer');
  if (layers.length > 6 || layers.some(layer => !ALLOWED_LAYERS.has(layer))) {
    return NextResponse.json({ error: 'Invalid location layer' }, { status: 400 });
  }
  for (const layer of layers) params.append('layer', layer);

  const latValue = input.get('lat');
  const lonValue = input.get('lon');
  if (latValue !== null || lonValue !== null) {
    const lat = finiteNumber(latValue, -90, 90);
    const lon = finiteNumber(lonValue, -180, 180);
    if (lat === null || lon === null) {
      return NextResponse.json({ error: 'Invalid location bias' }, { status: 400 });
    }
    params.set('lat', String(lat));
    params.set('lon', String(lon));
    const zoom = finiteNumber(input.get('zoom') ?? '12', 0, 18);
    const bias = finiteNumber(input.get('location_bias_scale') ?? '0.05', 0, 1);
    if (zoom === null || bias === null) {
      return NextResponse.json({ error: 'Invalid location bias settings' }, { status: 400 });
    }
    params.set('zoom', String(zoom));
    params.set('location_bias_scale', String(bias));
  }

  const bboxValue = input.get('bbox');
  if (bboxValue !== null) {
    const parts = bboxValue.split(',');
    const coords = parts.map((part, index) =>
      finiteNumber(part, index % 2 === 0 ? -180 : -90, index % 2 === 0 ? 180 : 90));
    if (parts.length !== 4 || coords.some(value => value === null) ||
      coords[0]! >= coords[2]! || coords[1]! >= coords[3]!) {
      return NextResponse.json({ error: 'Invalid search bounds' }, { status: 400 });
    }
    params.set('bbox', coords.join(','));
  }

  try {
    const response = await fetch(`${PHOTON_URL}?${params}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FuelVoice/1.0 (https://fuelvoice.vercel.app)',
      },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(PHOTON_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.warn('[API/photon] Provider status:', response.status);
      throw new Error('Photon provider unavailable');
    }

    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || !('features' in data) ||
      !Array.isArray(data.features)) {
      throw new Error('Unexpected Photon response');
    }
    return NextResponse.json({ features: data.features }, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.warn('[API/photon] Search failed:',
      error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Search provider temporarily unavailable' }, {
      status: 503, headers: { 'Cache-Control': 'no-store' },
    });
  }
}
