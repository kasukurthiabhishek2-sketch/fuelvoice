/**
 * Search Page
 *
 * Dedicated search workspace with a focused command surface and nearby
 * discovery below it.
 */

'use client';

import React from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { useGeolocation } from '@/hooks/useGeolocation';
import { NearbyStations } from '@/components/landing/NearbyStations';

export default function SearchPage() {
  const geolocation = useGeolocation();
  const { latitude, longitude, hasLocation, isIpLocation } = geolocation;

  return (
    <>
      <section className="hero-surface border-b border-[var(--border-secondary)]">
        <div className="hero-grid pointer-events-none absolute inset-x-0 top-[72px] h-[420px] opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">Station finder</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Search Fuel Stations
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Search mapped petrol pumps and gas stations by name, brand, locality, or city, then open a station to inspect reviews and details.
            </p>
          </div>

          <div className="surface-panel mx-auto mt-8 max-w-3xl p-2.5 sm:p-3">
            <SearchBar variant="hero" userLat={latitude} userLng={longitude} />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="info-chip">
              <span className={`h-2 w-2 rounded-full ${hasLocation && !isIpLocation ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {hasLocation
                ? isIpLocation
                  ? 'Search biased to your approximate area'
                  : 'Search biased to your current location'
                : 'Worldwide search'}
            </span>
            <span className="info-chip">OpenStreetMap station data</span>
          </div>
        </div>
      </section>

      <NearbyStations geolocation={geolocation} />
    </>
  );
}
