/**
 * Photon API Client — Search Autocomplete
 *
 * Photon (photon.komoot.io) is a free, open-source geocoder built on OSM data.
 * Unlike Nominatim, it explicitly supports autocomplete/search-as-you-type.
 */

import type { PhotonFeature } from '@/types/station';
import { findNearbyStations } from '@/lib/api/overpass';

const PHOTON_API = '/api/photon';
const PHOTON_REQUEST_TIMEOUT_MS = 7_000;
const LOCATION_LAYERS = ['city', 'locality', 'district', 'county', 'state', 'country'] as const;

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

interface LocationContext {
  query: string;
  brandQuery: string;
  lat: number;
  lng: number;
  countryCode: string;
  bbox?: [number, number, number, number];
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

function searchableLocationText(result: SearchResult): string {
  return normalizeSearchText([result.name, result.city, result.state, result.country].filter(Boolean).join(' '));
}

function hasAllTokens(value: string, tokens: string[]): boolean {
  return tokens.every((token) => value.includes(token));
}

function distanceKm(
  latA: number,
  lngA: number,
  latB: number,
  lngB: number
): number {
  const toRad = (value: number) => value * Math.PI / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(latB - latA);
  const dLng = toRad(lngB - lngA);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchPhotonFeatures(params: URLSearchParams, signal?: AbortSignal): Promise<PhotonFeature[]> {
  const controller = new AbortController();
  const forwardAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', forwardAbort, { once: true });
  const timeout = setTimeout(() => controller.abort(), PHOTON_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${PHOTON_API}?${params}`, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Photon API error: ${response.status}`);
    }

    const data = await response.json();
    return data.features || [];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError' && !signal?.aborted) {
      throw new Error('Photon API request timed out');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

function locationContextFromFeature(
  feature: PhotonFeature,
  query: string,
  brandQuery: string
): LocationContext | null {
  const result = featureToSearchResult(feature);
  if (!result) return null;

  const extent = feature.properties.extent;
  const bbox = extent && extent.length === 4
    ? [extent[0], extent[1], extent[2], extent[3]] as [number, number, number, number]
    : undefined;

  return {
    query,
    brandQuery,
    lat: result.lat,
    lng: result.lng,
    countryCode: result.countryCode,
    bbox,
  };
}

async function inferLocationContexts(
  query: string,
  userLat?: number,
  userLng?: number,
  signal?: AbortSignal
): Promise<LocationContext[]> {
  const tokens = meaningfulQueryTokens(query);
  if (tokens.length < 2) return [];

  const maxSuffix = Math.min(2, tokens.length - 1);

  for (let suffixLength = maxSuffix; suffixLength >= 1; suffixLength -= 1) {
    const locationTokens = tokens.slice(-suffixLength);
    const brandTokens = tokens.slice(0, -suffixLength);
    if (brandTokens.length === 0) continue;

    const locationQuery = locationTokens.join(' ');
    const params = new URLSearchParams({
      q: locationQuery,
      limit: '5',
      lang: 'en',
    });
    LOCATION_LAYERS.forEach((layer) => params.append('layer', layer));

    const features = await fetchPhotonFeatures(params, signal);
    const matching = features
      .map((feature) => {
        const result = featureToSearchResult(feature);
        if (!result || !hasAllTokens(searchableLocationText(result), locationTokens)) return null;
        return {
          context: locationContextFromFeature(feature, locationQuery, brandTokens.join(' ')),
          result,
        };
      })
      .filter((entry): entry is { context: LocationContext; result: SearchResult } =>
        entry !== null && entry.context !== null
      );

    if (matching.length === 0) continue;

    if (userLat !== undefined && userLng !== undefined) {
      matching.sort((a, b) =>
        distanceKm(userLat, userLng, a.context.lat, a.context.lng) -
        distanceKm(userLat, userLng, b.context.lat, b.context.lng)
      );
    }

    const seen = new Set<string>();
    return matching
      .filter(({ context }) => {
        const key = `${context.countryCode}:${context.lat.toFixed(3)}:${context.lng.toFixed(3)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 2)
      .map(({ context }) => context);
  }

  return [];
}

function rankStationCandidates(
  brandQuery: string,
  context: LocationContext,
  results: SearchResult[]
): SearchResult[] {
  const brandTokens = meaningfulQueryTokens(brandQuery);

  return results
    .map((result, index) => {
      const name = normalizeSearchText(result.name);
      const brandCoverage = brandTokens.reduce(
        (count, token) => count + (name.includes(token) ? 1 : 0),
        0
      );
      const distance = distanceKm(context.lat, context.lng, result.lat, result.lng);
      const sameCountry = Boolean(
        context.countryCode &&
        result.countryCode &&
        context.countryCode === result.countryCode
      );

      return { result, index, brandCoverage, distance, sameCountry };
    })
    .sort((a, b) =>
      b.brandCoverage - a.brandCoverage ||
      Number(b.sameCountry) - Number(a.sameCountry) ||
      a.distance - b.distance ||
      a.index - b.index
    )
    .map(({ result }) => result);
}

async function searchWithinLocation(
  context: LocationContext,
  limitCount: number,
  signal?: AbortSignal
): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: context.brandQuery,
    limit: Math.min(Math.max(limitCount * 2, 16), 32).toString(),
    lang: 'en',
    osm_tag: 'amenity:fuel',
    lat: context.lat.toString(),
    lon: context.lng.toString(),
    zoom: '12',
    location_bias_scale: '0.05',
  });

  if (context.bbox) {
    params.set('bbox', context.bbox.join(','));
  }

  const features = await fetchPhotonFeatures(params, signal);
  const results = features
    .map(featureToSearchResult)
    .filter((result): result is SearchResult => result !== null)
    .filter((result) => context.bbox || distanceKm(context.lat, context.lng, result.lat, result.lng) <= 150);

  return rankStationCandidates(context.brandQuery, context, results);
}

function interleaveUnique(resultSets: SearchResult[][], limitCount: number): SearchResult[] {
  const output: SearchResult[] = [];
  const seen = new Set<string>();
  const maxLength = Math.max(0, ...resultSets.map((results) => results.length));

  for (let index = 0; index < maxLength && output.length < limitCount; index += 1) {
    for (const results of resultSets) {
      const result = results[index];
      if (!result || seen.has(result.id)) continue;

      seen.add(result.id);
      output.push(result);
      if (output.length >= limitCount) break;
    }
  }

  return output;
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
 *
 * For multi-word searches that contain a recognizable place suffix
 * ("Shell Hyderabad", "BP New Delhi"), resolve that place first and
 * constrain/bias the station lookup to it. This avoids globally plausible
 * but locally wrong matches from dominating the candidate pool.
 */
export async function searchFuelStations(
  query: string,
  lat?: number,
  lng?: number,
  limitCount: number = 8,
  signal?: AbortSignal
): Promise<SearchResult[]> {
  if (query.trim().length < 2) return [];

  const locationContexts = await inferLocationContexts(query, lat, lng, signal);

  if (locationContexts.length > 0) {
    const contextualResults = await Promise.all(
      locationContexts.map((context) => searchWithinLocation(context, limitCount, signal))
    );

    return interleaveUnique(contextualResults, limitCount);
  }

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

  if (lat !== undefined && lng !== undefined) {
    params.set('lat', lat.toString());
    params.set('lon', lng.toString());
    params.set('zoom', '12');
    params.set('location_bias_scale', '0.05');
  }

  const features = await fetchPhotonFeatures(params, signal);
  const results = features
    .map(featureToSearchResult)
    .filter((result): result is SearchResult => result !== null);

  if (results.length > 0) return rankSearchResults(query, results).slice(0, limitCount);

  // A place name alone (e.g. "Ameerpet") will not match amenity:fuel.
  // Resolve it to a locality, then use the existing nearby-OSM station API.
  // Keep provider errors distinct from empty search results.
  if (queryTokens.length === 1) {
    try {
      const locationParams = new URLSearchParams({ q: query, limit: '5', lang: 'en' });
      LOCATION_LAYERS.forEach((layer) => locationParams.append('layer', layer));
      const places = await fetchPhotonFeatures(locationParams, signal);
      const normalized = normalizeSearchText(query);
      const place = places.find((feature) => {
        const name = normalizeSearchText(feature.properties.name || feature.properties.city || '');
        return name === normalized || name.startsWith(normalized + ' ');
      });
      if (place && !signal?.aborted) {
        const location = featureToSearchResult(place);
        if (location) {
          const nearby = await findNearbyStations(location.lat, location.lng, 5000);
          if (signal?.aborted) return [];
          return nearby.slice(0, limitCount).map((station) => {
            const [osmType, osmIdString] = station.id.split('_');
            return {
              id: station.id,
              name: station.name,
              city: location.city || location.name,
              state: location.state,
              country: location.country,
              countryCode: location.countryCode,
              lat: station.lat,
              lng: station.lng,
              osmType,
              osmId: Number(osmIdString),
            };
          });
        }
      }
    } catch (error) {
      if (signal?.aborted) throw error;
      // No verified nearby stations is an empty result, not invented data.
    }
  }

  return [];
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

  const features = await fetchPhotonFeatures(params);

  return features
    .map(featureToSearchResult)
    .filter((result): result is SearchResult => result !== null);
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
