/**
 * Explore Map Section
 *
 * Interactive map presented as the primary discovery workspace.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExploreMap } from './ExploreMapDynamic';
import type { GeolocationResult } from '@/hooks/useGeolocation';
import { useNearbyStations } from '@/hooks/useNearbyStations';

interface ExploreMapSectionProps {
  geolocation: GeolocationResult;
}

export function ExploreMapSection({ geolocation }: ExploreMapSectionProps) {
  const router = useRouter();
  const {
    latitude,
    longitude,
    hasLocation,
    isIpLocation,
    loading: geoLoading,
    requestLocation,
    permissionState,
  } = geolocation;

  const queryLat = hasLocation && latitude !== null ? latitude : 17.3887027;
  const queryLng = hasLocation && longitude !== null ? longitude : 78.4753829;

  const { data: stations, isLoading: stationsLoading } = useNearbyStations({
    lat: queryLat,
    lng: queryLng,
  });

  const handleStationSelect = (stationId: string) => {
    router.push(`/station/${stationId}`);
  };

  const locationLabel = hasLocation
    ? isIpLocation
      ? 'Approximate area'
      : 'Precise location'
    : permissionState === 'denied'
      ? 'Location blocked'
      : 'Default map area';

  return (
    <section className="relative scroll-mt-24 py-10 sm:py-14 lg:py-16" id="explore-map">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">Map discovery</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Explore <span className="text-brand-500">Mapped Stations</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Browse stations spatially, then open the ones worth comparing. Pan or zoom the map to inspect a different area.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="info-chip">
              <span className={`h-2 w-2 rounded-full ${hasLocation && !isIpLocation ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
              {locationLabel}
            </span>
            <Link href="/search" className="secondary-action">
              Search by name
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="map-shell p-2 sm:p-3">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3 px-2 py-1 sm:px-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>
                Live area explorer
              </p>
              <p className="mt-0.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {stationsLoading
                  ? 'Loading mapped stations…'
                  : stations?.length
                    ? `${stations.length} mapped station${stations.length === 1 ? '' : 's'} in the active area`
                    : 'Move around the map to discover stations'}
              </p>
            </div>
            <div className="hidden items-center gap-4 text-xs sm:flex" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                Station
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-sky-500 bg-sky-500/20" />
                Your area
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[20px] border border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
            <ExploreMap
              lat={latitude}
              lng={longitude}
              hasLocation={hasLocation}
              isIpLocation={isIpLocation}
              stations={stations || []}
              onStationSelect={handleStationSelect}
              requestLocation={requestLocation}
              geoLoading={geoLoading}
              permissionState={permissionState}
              stationsLoading={stationsLoading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
