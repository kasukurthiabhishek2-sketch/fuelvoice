/**
 * Nearby station discovery and contribution opportunities.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import type { GeolocationResult } from '@/hooks/useGeolocation';
import { useNearbyStations } from '@/hooks/useNearbyStations';
import { useStationAddresses } from '@/hooks/useStationAddresses';
import { SkeletonStationCard } from '@/components/ui/Skeleton';
import { formatDistance } from '@/lib/utils/format';
import { getBrand } from '@/lib/constants/brands';
import { TRUST_SCORE_MIN_REVIEWS } from '@/lib/trust/trustScore';

interface NearbyStationsProps {
  geolocation: GeolocationResult;
  context?: 'discover' | 'contribute';
}

export function NearbyStations({ geolocation, context = 'discover' }: NearbyStationsProps) {
  const {
    latitude,
    longitude,
    loading: geoLoading,
    requestLocation,
    hasLocation,
    permissionState,
    isIpLocation,
  } = geolocation;

  const {
    data: stations,
    isLoading: stationsLoading,
    error: stationsError,
    refetch,
  } = useNearbyStations({
    lat: latitude,
    lng: longitude,
  });

  const showLocationPrompt = !hasLocation && permissionState !== 'denied';
  const showDenied = permissionState === 'denied';
  const contributeMode = context === 'contribute';
  const visibleStations = stations
    ? [...stations]
        .sort((a, b) => contributeMode ? a.reviewCount - b.reviewCount : 0)
        .slice(0, 9)
    : [];

  const {
    data: resolvedAddresses = {},
    isFetching: addressesLoading,
  } = useStationAddresses(visibleStations);

  const usesAddressLookup = visibleStations.some(
    (station) => station.addressQuality !== 'full',
  );

  return (
    <section className="nearby-section scroll-mt-24 py-10 sm:py-12 lg:py-14" id="nearby-stations">
      <div className="app-frame">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">{contributeMode ? 'Community contribution' : 'Around you'}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-3xl">
              {contributeMode ? 'Stations that need your voice' : 'Stations around you'}
            </h2>
            <p className="nearby-support-copy mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              {contributeMode
                ? 'Pick a station you know. Stations with the least community evidence appear first.'
                : hasLocation
                  ? isIpLocation
                    ? 'Using your approximate area. Enable precise location only if you want more accurate distance.'
                    : 'Nearby mapped stations with review status visible before you open them.'
                  : 'Enable location for nearby discovery, or search any place manually.'}
            </p>
          </div>
          <Link href="/search" className="secondary-action self-start">
            Search another area
          </Link>
        </div>

        {showLocationPrompt && (
          <div className="community-location-prompt mb-6">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Want more accurate nearby results?</p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                Precise location is optional and only improves distance ordering.
              </p>
            </div>
            <button
              type="button"
              onClick={requestLocation}
              disabled={geoLoading}
              className="secondary-action shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {geoLoading ? 'Detecting…' : 'Use precise location'}
            </button>
          </div>
        )}

        {showDenied && (
          <div className="community-location-prompt mb-6">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Location access is blocked</p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                Nothing else is blocked. Search by station, brand, locality, or city.
              </p>
            </div>
            <Link href="/search" className="secondary-action shrink-0">Search manually</Link>
          </div>
        )}

        {stationsLoading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonStationCard key={index} className={index >= 3 ? 'hidden sm:block' : ''} />
            ))}
          </div>
        )}

        {stations && stations.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleStations.map((station) => {
              const brand = station.brand ? getBrand(station.brand) : null;
              const reviewsNeeded = Math.max(0, TRUST_SCORE_MIN_REVIEWS - station.reviewCount);
              const hasTrustScore = station.reviewCount >= TRUST_SCORE_MIN_REVIEWS && station.trustScore !== undefined;
              const resolvedAddress = resolvedAddresses[station.id];
              const displayAddress = resolvedAddress?.address || station.address;
              const isResolvingAddress =
                station.addressQuality !== 'full' &&
                !resolvedAddress &&
                addressesLoading;

              const communityTitle = hasTrustScore
                ? `Trust ${Math.round(station.trustScore!)}/100`
                : station.reviewCount === 0
                  ? `Needs ${TRUST_SCORE_MIN_REVIEWS} reviews`
                  : `${reviewsNeeded} more review${reviewsNeeded === 1 ? '' : 's'} needed`;

              const communityDetail = hasTrustScore
                ? `${station.reviewCount} community review${station.reviewCount === 1 ? '' : 's'}`
                : station.reviewCount === 0
                  ? 'Be the first to add useful evidence'
                  : `${station.reviewCount} review${station.reviewCount === 1 ? '' : 's'} already submitted`;

              return (
                <article key={station.id} className="station-card-v2" data-station-id={station.id}>
                  <div className="station-card-topline">
                    {brand ? (
                      <span className="station-card-brand" style={{ background: brand.bgColor }}>
                        {brand.name}
                      </span>
                    ) : (
                      <span className="station-card-brand station-card-brand-neutral">Independent</span>
                    )}
                    {station.distance !== undefined && (
                      <span className="station-card-distance">
                        {formatDistance(station.distance)} away
                      </span>
                    )}
                  </div>

                  <h3 className="station-card-name">
                    <Link href={`/station/${station.id}`} className="station-card-title-link">
                      {station.name}
                    </Link>
                  </h3>

                  <div className="station-card-address-row">
                    <span className="station-card-pin" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
                        <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" strokeLinejoin="round" />
                        <circle cx="12" cy="10" r="2" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className={`station-card-address ${isResolvingAddress ? 'station-card-address-loading' : ''}`}>
                        {isResolvingAddress
                          ? 'Finding the mapped address…'
                          : displayAddress || 'Location pinned on map'}
                      </p>
                      {resolvedAddress ? (
                        <span className="station-address-source">Approx. mapped address</span>
                      ) : !displayAddress && !isResolvingAddress ? (
                        <span className="station-address-source">Open the station to view its exact map pin</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="station-card-community">
                    <span className={`station-card-signal ${hasTrustScore ? 'station-card-signal-trusted' : ''}`} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="station-card-community-title">{communityTitle}</p>
                      <p className="station-card-community-detail">{communityDetail}</p>
                    </div>
                  </div>

                  <div className="station-card-actions">
                    <Link href={`/station/${station.id}`} className="station-card-view-action">
                      View details
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    <Link href={`/station/${station.id}#write-review`} className="community-review-action">
                      Review station
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {stations && stations.length > 0 && (
          <div className="station-data-attribution">
            <span>Map data</span>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="station-data-attribution-link"
            >
              © OpenStreetMap contributors
            </a>
            {usesAddressLookup && (
              <>
                <span aria-hidden="true">·</span>
                <span>Address lookup</span>
                <a
                  href="https://www.maptiler.com/copyright/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="station-data-attribution-link"
                >
                  © MapTiler
                </a>
              </>
            )}
          </div>
        )}

        {stations && stations.length === 0 && !stationsLoading && !stationsError && (
          <div className="empty-review-state mx-auto max-w-2xl text-center">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">No mapped stations nearby</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              Search a station, brand, locality, or city instead.
            </p>
            <Link href="/search" className="primary-action mt-5">Search another area</Link>
          </div>
        )}

        {stationsError && (
          <div className="empty-review-state mx-auto max-w-2xl text-center">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Station data could not be loaded</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              The mapped-station provider did not respond. FuelVoice will not substitute invented station data.
            </p>
            <button type="button" onClick={() => refetch()} className="primary-action mt-5">Retry</button>
          </div>
        )}
      </div>
    </section>
  );
}
