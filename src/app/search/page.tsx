/**
 * Search and area discovery page.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import { useGeolocation } from '@/hooks/useGeolocation';
import { NearbyStations } from '@/components/landing/NearbyStations';

export default function SearchPage() {
  const geolocation = useGeolocation();
  const { latitude, longitude } = geolocation;

  return (
    <main>
      <section className="border-b gradient-mesh" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="page-shell py-10 sm:py-14 lg:py-16">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold hover:text-brand-500" style={{ color: 'var(--text-secondary)' }}>
            <BackIcon />
            Home
          </Link>

          <div className="mt-5 max-w-3xl">
            <span className="eyebrow">Station discovery</span>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Find the right fuel station, faster.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Search by station name, brand, city, or area. When location is available, results can be biased toward where you are.
            </p>
          </div>

          <div className="mt-7 max-w-2xl">
            <SearchBar variant="hero" userLat={latitude} userLng={longitude} placeholder="Search station, brand, city or area" />
          </div>
        </div>
      </section>

      <NearbyStations geolocation={geolocation} />
    </main>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m5-5-5 5 5 5" />
    </svg>
  );
}
