/**
 * Photon API Client — Search Autocomplete
 * 
 * Photon (photon.komoot.io) is a free, open-source geocoder built on OSM data.
 * Unlike Nominatim, it explicitly SUPPORTS autocomplete/search-as-you-type.
 * 
 * We filter by `osm_tag=amenity:fuel` to only return fuel stations.
 * Results are returned in GeoJSON format.
 */

import type { PhotonFeature } from '@/types/station';

const PHOTON_API = 'https://photon.komoot.io/api';

export interface SearchResult {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  osmType: string;
  osmId: number;
}

const SEARCH_STOPWORDS = new Set(['at', 'in', 'near', 'the', 'fuel', 'station', 'petrol', 'pump']);

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

function meaningfulQueryTokens(query: string): string[] {
  const tokens = normalizeSearchText(query)
    .split(/\s+/)
    .filter((token) => token.length >= 2);

  const meaningful = tokens.filter((token) => !SEARCH_STOPWORDS.has(token));
  return meaningful.length > 0 ? meaningful : tokens;
}

function rankSearchResults(query: string, results: SearchResult[]): SearchResult[] {
  const tokens = meaningfulQueryTokens(query);
  if (tokens.length < 2) return results;

  return results
    .map((result, index) => {
      const name = normalizeSearchText(result.name);
      const city = normalizeSearchText(result.city);
      const state = normalizeSearchText(result.state);
      const country = normalizeSearchText(result.country);
      const searchable = [name, city, state, country].filter(Boolean).join(' ');
      const coverage = tokens.reduce((count, token) => count + (searchable.includes(token) ? 1 : 0), 0);
      const weightedScore = tokens.reduce((score, token) => {
        if (name.includes(token)) score += 5;
        if (city.includes(token)) score += 4;
        if (state.includes(token)) score += 3;
        if (country.includes(token)) score += 2;
        return score;
      }, 0);

      return { result, index, coverage, weightedScore };
    })
    .sort((a, b) =>
      b.coverage - a.coverage ||
      b.weightedScore - a.weightedScore ||
      a.index - b.index
    )
    .map(({ result }) => result);
}

/**
 * Search for fuel stations by name/location.
 * Uses Photon's autocomplete-friendly endpoint.
 * 
 * @param query - Search text
 * @param lat - Optional bias latitude (prioritize results near user)
 * @param lng - Optional bias longitude
 * @param limitCount - Max results (default 8)
 */
export async function searchFuelStations(
  query: string,
  lat?: number,
  lng?: number,
  limitCount: number = 8
): Promise<SearchResult[]> {
  if (query.trim().length < 2) return [];

  const queryTokens = meaningfulQueryTokens(query);
  const requestLimit = queryTokens.length > 1
    ? Math.min(Math.max(limitCount * 3, 24), 40)
    : limitCount;

  const params = new URLSearchParams({
    q: query,
    limit: requestLimit.toString(),
    lang: 'en',
    osm_tag: 'amenity:fuel',
  });

  // Bias results toward user's location if available
  if (lat !== undefined && lng !== undefined) {
    params.set('lat', lat.toString());
    params.set('lon', lng.toString());
  }

  const response = await fetch(`${PHOTON_API}?${params}`, {
    headers: {
      'User-Agent': 'FuelVoice/1.0 (community fuel station reviews)',
    },
  });

  if (!response.ok) {
    throw new Error(`Photon API error: ${response.status}`);
  }

  const data = await response.json();
  const features: PhotonFeature[] = data.features || [];

  const results = features
    .map(featureToSearchResult)
    .filter((r): r is SearchResult => r !== null);

  return rankSearchResults(query, results).slice(0, limitCount);
}

/**
 * General location search (not limited to fuel stations).
 * Used for searching by city/area when the user wants to explore.
 */
export async function searchLocation(
  query: string,
  limitCount: number = 5
): Promise<SearchResult[]> {
  if (query.trim().length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    limit: limitCount.toString(),
    lang: 'en',
  });

  const response = await fetch(`${PHOTON_API}?${params}`, {
    headers: {
      'User-Agent': 'FuelVoice/1.0 (community fuel station reviews)',
    },
  });

  if (!response.ok) {
    throw new Error(`Photon API error: ${response.status}`);
  }

  const data = await response.json();
  const features: PhotonFeature[] = data.features || [];

  return features
    .map(featureToSearchResult)
    .filter((r): r is SearchResult => r !== null);
}

/** Convert a Photon feature to a SearchResult */
function featureToSearchResult(feature: PhotonFeature): SearchResult | null {
  const props = feature.properties;
  const [lng, lat] = feature.geometry.coordinates;

  if (!props.name && !props.city) return null;

  const fullOsmType = normalizeOsmType(props.osm_type);

  return {
    id: `${fullOsmType}_${props.osm_id}`,
    name: props.name || `Fuel Station in ${props.city || 'Unknown'}`,
    city: props.city || '',
    state: props.state || '',
    country: props.country || '',
    countryCode: (props.countrycode || '').toLowerCase(),
    lat,
    lng,
    osmType: fullOsmType,
    osmId: props.osm_id,
  };
}

/**
 * Photon returns osm_type as "N", "W", "R" (single letter).
 * Overpass API expects "node", "way", "relation".
 */
function normalizeOsmType(type: string): string {
  const map: Record<string, string> = {
    N: 'node',
    W: 'way',
    R: 'relation',
    node: 'node',
    way: 'way',
    relation: 'relation',
  };
  return map[type] || type.toLowerCase();
}
