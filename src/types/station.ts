/**
 * Station types — represents a fuel station from OpenStreetMap
 * The ID format is "{osm_type}_{osm_id}" (e.g., "node_12345678")
 */

export interface Station {
  /** Unique identifier: "{type}_{osmId}" */
  id: string;
  /** Station name from OSM */
  name: string;
  /** Fuel brand (e.g., "Indian Oil", "Shell", "BP") */
  brand: string;
  /** Station operator (often same as brand) */
  operator: string;
  /** Full formatted address */
  address: string;
  /** Street address components */
  addressComponents: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countryCode?: string;
  };
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Phone number */
  phone: string;
  /** Website URL */
  website: string;
  /** Opening hours in OSM format */
  openingHours: string;
  /** Fuel types available */
  fuelTypes: string[];
  /** Raw OSM tags for additional data */
  osmTags: Record<string, string>;
  /** Average rating (1-5), calculated from reviews */
  avgRating: number;
  /** Total review count */
  reviewCount: number;
  /** Number of complaint reports */
  complaintCount: number;
  /** Scores by category (1-5 average) */
  scores: StationScores;
  /** Last time station data was synced from OSM */
  lastUpdated: string;
  /** Distance from user in km (client-computed, not stored) */
  distance?: number;
}

export interface StationScores {
  fuelQuality: number;
  service: number;
  staffBehaviour: number;
  cleanliness: number;
  washroom: number;
  airFilling: number;
}

/** Minimal station data for list/card views */
export interface StationSummary {
  id: string;
  name: string;
  brand: string;
  address: string;
  lat: number;
  lng: number;
  avgRating: number;
  reviewCount: number;
  distance?: number;
}

/** Raw Overpass API element */
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

/** Photon API search result feature */
export interface PhotonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    osm_id: number;
    osm_type: string;
    osm_key: string;
    osm_value: string;
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    extent?: [number, number, number, number];
  };
}
