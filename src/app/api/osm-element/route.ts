import { NextRequest, NextResponse } from 'next/server';
import type { OverpassElement } from '@/types/station';

const OSM_API_BASE = 'https://api.openstreetmap.org/api/0.6';
const REQUEST_TIMEOUT_MS = 6_000;

type OsmType = 'node' | 'way' | 'relation';

interface OsmApiElement {
  type?: string;
  id?: number;
  lat?: number;
  lon?: number;
  nodes?: number[];
  members?: Array<{ type?: string; ref?: number }>;
  tags?: Record<string, string>;
}

interface OsmApiPayload {
  elements?: OsmApiElement[];
}

function isOsmType(value: string | null): value is OsmType {
  return value === 'node' || value === 'way' || value === 'relation';
}

function centerFromCoordinates(points: Array<{ lat: number; lon: number }>) {
  if (points.length === 0) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (const point of points) {
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLon = Math.min(minLon, point.lon);
    maxLon = Math.max(maxLon, point.lon);
  }

  return {
    lat: (minLat + maxLat) / 2,
    lon: (minLon + maxLon) / 2,
  };
}

function normalizeOsmApiElement(
  osmType: OsmType,
  osmId: number,
  payload: OsmApiPayload,
): OverpassElement | null {
  const elements = Array.isArray(payload.elements) ? payload.elements : [];
  const target = elements.find((element) => element.type === osmType && element.id === osmId);
  if (!target) return null;

  const tags = target.tags || {};
  if (tags.amenity !== 'fuel') return null;

  if (osmType === 'node') {
    if (!Number.isFinite(target.lat) || !Number.isFinite(target.lon)) return null;

    return {
      type: 'node',
      id: osmId,
      lat: target.lat,
      lon: target.lon,
      tags,
    };
  }

  const nodeMap = new Map<number, { lat: number; lon: number }>();
  const ways = new Map<number, OsmApiElement>();

  for (const element of elements) {
    if (
      element.type === 'node' &&
      typeof element.id === 'number' &&
      Number.isFinite(element.lat) &&
      Number.isFinite(element.lon)
    ) {
      nodeMap.set(element.id, { lat: element.lat!, lon: element.lon! });
    }

    if (element.type === 'way' && typeof element.id === 'number') {
      ways.set(element.id, element);
    }
  }

  const nodeIds = new Set<number>();

  if (osmType === 'way') {
    for (const nodeId of target.nodes || []) nodeIds.add(nodeId);
  } else {
    for (const member of target.members || []) {
      if (member.type === 'node' && typeof member.ref === 'number') {
        nodeIds.add(member.ref);
      }

      if (member.type === 'way' && typeof member.ref === 'number') {
        const way = ways.get(member.ref);
        for (const nodeId of way?.nodes || []) nodeIds.add(nodeId);
      }
    }
  }

  const coordinates = [...nodeIds]
    .map((nodeId) => nodeMap.get(nodeId))
    .filter((point): point is { lat: number; lon: number } => Boolean(point));

  const center = centerFromCoordinates(coordinates);
  if (!center) return null;

  return {
    type: osmType,
    id: osmId,
    center,
    tags,
  };
}

function getOsmApiUrl(osmType: OsmType, osmId: number): string {
  const suffix = osmType === 'node' ? '' : '/full';
  return `${OSM_API_BASE}/${osmType}/${osmId}${suffix}.json`;
}

export async function GET(request: NextRequest) {
  const osmType = request.nextUrl.searchParams.get('type');
  const osmIdValue = request.nextUrl.searchParams.get('id');
  const osmId = Number(osmIdValue);

  if (!isOsmType(osmType) || !Number.isSafeInteger(osmId) || osmId <= 0) {
    return NextResponse.json({ error: 'Invalid OpenStreetMap station identifier' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getOsmApiUrl(osmType, osmId), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FuelVoice/1.0 (https://fuelvoice.vercel.app; community fuel station reviews)',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (response.status === 404 || response.status === 410) {
      return NextResponse.json({ error: 'Station not found on OpenStreetMap' }, { status: 404 });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'OpenStreetMap station source temporarily unavailable' },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const payload = await response.json() as OsmApiPayload;
    const element = normalizeOsmApiElement(osmType, osmId, payload);

    if (!element) {
      return NextResponse.json(
        { error: 'OpenStreetMap object is not a usable fuel station' },
        { status: 422, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    return NextResponse.json(
      { element },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
        },
      },
    );
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';

    return NextResponse.json(
      { error: timedOut ? 'OpenStreetMap station source timed out' : 'OpenStreetMap station source temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  } finally {
    clearTimeout(timeout);
  }
}
