/**
 * Nominatim API Client — Reverse Geocoding Only
 * 
 * Nominatim usage policy:
 * - No autocomplete (handled by Photon instead)
 * - Max 1 request per second
 * - Must provide User-Agent
 * - Must attribute OpenStreetMap
 * 
 * We use Nominatim only for reverse geocoding (lat/lng → country/address)
 * to detect the user's country for consumer complaint links.
 */

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

export interface ReverseGeoResult {
  displayName: string;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  road: string;
  postcode: string;
}

/**
 * Reverse geocode coordinates to get address/country info.
 * Used to auto-detect user's country for complaint links.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeoResult | null> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lng.toString(),
    format: 'json',
    addressdetails: '1',
    'accept-language': 'en',
  });

  const response = await fetch(`${NOMINATIM_API}/reverse?${params}`, {
    headers: {
      'User-Agent': 'FuelVoice/1.0 (community fuel station reviews)',
    },
  });

  if (!response.ok) {
    console.warn(`Nominatim reverse geocoding failed: ${response.status}`);
    return null;
  }

  const data = await response.json();

  if (data.error) return null;

  const address = data.address || {};

  return {
    displayName: data.display_name || '',
    country: address.country || '',
    countryCode: (address.country_code || '').toLowerCase(),
    state: address.state || '',
    city: address.city || address.town || address.village || '',
    road: address.road || '',
    postcode: address.postcode || '',
  };
}
