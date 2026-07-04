/**
 * Search Page
 * Full search results page with filters.
 */

'use client';

import React from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { useGeolocation } from '@/hooks/useGeolocation';
import { NearbyStations } from '@/components/landing/NearbyStations';

export default function SearchPage() {
  const { latitude, longitude } = useGeolocation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Search Fuel Stations
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Find petrol pumps and gas stations anywhere in the world
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <SearchBar variant="hero" userLat={latitude} userLng={longitude} />
      </div>

      {/* Nearby Stations */}
      <NearbyStations />
    </div>
  );
}
