/**
 * Interactive map discovery workspace.
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
    <section className="relative scroll-mt-24 pb-14 pt-4 sm:pb-20 sm:pt-8 lg:pb-24" id="explore-map">
      <div className="app-frame">
        <div className="map-shell map-workspace p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col gap-6 px-3 pb-5 pt-3 sm:px-4 sm:pb-6 sm:pt-4 lg:flex-row lg:items-end lg:justify-between lg:px-5">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="workspace-chip">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live discovery workspace
                </span>
                <span className="workspace-chip">
                  <span className={`h-1.5 w-1.5 rounded-full ${hasLocation && !isIpLocation ? 'bg-emerald-400' : 'bg-amber-300'}`} />
                  {locationLabel}
                </span>
              </div>

              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-brand-300">Map discovery</p>
              <h2 className="workspace-title mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl lg:text-[2.8rem]">
                Explore what is actually around you.
              </h2>
              <p className="workspace-copy mt-3 max-w-xl text-sm leading-6 sm:text-base">
                Pan, zoom, compare, then open a station only when it looks worth the stop. The list stays tied to the active viewport.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-white/45">Active area</p>
                <p className="mt-1 text-sm font-extrabold text-white">
                  {stationsLoading
                    ? 'Loading stations…'
                    : stations?.length
                      ? `${stations.length} mapped station${stations.length === 1 ? '' : 's'}`
                      : 'Pan to discover'}
                </p>
              </div>

              <Link
                href="/search"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white px-4 text-sm font-extrabold text-[#17211D] transition hover:-translate-y-0.5 hover:bg-[#F4F7F4]"
              >
                Search by name
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[25px] border border-white/10 bg-[var(--bg-secondary)] shadow-[0_20px_55px_rgba(0,0,0,0.22)]">
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

          <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-1 pt-4 text-[10px] font-semibold text-white/45 sm:px-4">
            <span>Station data from OpenStreetMap · community reviews from FuelVoice</span>
            <span className="hidden sm:inline">Drag map · scroll to zoom · tap a station to compare</span>
          </div>
        </div>
      </div>
    </section>
  );
}
