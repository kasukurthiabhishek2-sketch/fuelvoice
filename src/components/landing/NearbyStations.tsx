/**
 * Nearby Stations Section
 *
 * Scannable nearby-station cards with location, brand, rating, review volume,
 * and a clear next action.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { GeolocationResult } from '@/hooks/useGeolocation';
import { useNearbyStations } from '@/hooks/useNearbyStations';
import { SkeletonStationCard } from '@/components/ui/Skeleton';
import { StarRating } from '@/components/ui/StarRating';
import { formatDistance } from '@/lib/utils/format';
import { getBrand } from '@/lib/constants/brands';

interface NearbyStationsProps {
  geolocation: GeolocationResult;
}

export function NearbyStations({ geolocation }: NearbyStationsProps) {
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

  return (
    <section className="border-y border-[var(--border-secondary)] bg-[var(--bg-secondary)] py-16 sm:py-20" id="nearby-stations">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Around you</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Nearby Fuel Stations
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
              {hasLocation
                ? isIpLocation
                  ? 'Showing stations around your approximate IP-based area. Enable precise location for better distance ordering.'
                  : 'Fuel stations within 5km, ordered around your current location.'
                : 'Enable location to discover mapped stations near you.'}
            </p>
          </div>

          <Link href="/search" className="secondary-action self-start sm:self-auto">
            Search another area
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {showLocationPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-panel mx-auto mb-8 flex max-w-3xl flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7"
          >
            <div className="flex gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Use your location for useful distance</h3>
                <p className="mt-1 max-w-xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  Location is used to sort nearby mapped stations. You can still search manually without granting it.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={requestLocation}
              disabled={geoLoading}
              className="primary-action shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {geoLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Detecting…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  Enable Location
                </>
              )}
            </button>
          </motion.div>
        )}

        {showDenied && (
          <div className="surface-panel mx-auto mb-8 flex max-w-3xl flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Location access is blocked</p>
              <p className="mt-1 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                Nothing else is blocked. Search by station, brand, or city and continue normally.
              </p>
            </div>
            <Link href="/search" className="secondary-action shrink-0">
              Search manually
            </Link>
          </div>
        )}

        {stationsLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonStationCard key={index} />
            ))}
          </div>
        )}

        {stations && stations.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stations.slice(0, 9).map((station, index) => {
              const brand = station.brand ? getBrand(station.brand) : null;

              return (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.3 }}
                  className="h-full"
                >
                  <Link href={`/station/${station.id}`} className="group block h-full">
                    <article className="station-card card flex h-full min-h-[220px] flex-col p-5 group-hover:-translate-y-0.5 group-hover:border-brand-500/25">
                      <div className="flex items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M6.5 4.5h7.5v15H6.5z" strokeLinejoin="round" />
                            <path d="M8.5 8h3.5M14 8.5h2.2l1.8 2.1V17a1.5 1.5 0 0 0 3 0v-5.7" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 19.5h10.5" strokeLinecap="round" />
                          </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3
                            className="truncate text-sm font-bold transition-colors group-hover:text-brand-500"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {station.name}
                          </h3>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {brand && (
                              <span
                                className="rounded-lg px-2 py-1 text-[10px] font-bold"
                                style={{ background: brand.bgColor, color: brand.color }}
                              >
                                {brand.name}
                              </span>
                            )}
                            {station.distance !== undefined && (
                              <span className="rounded-lg bg-[var(--bg-tertiary)] px-2 py-1 text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                                {formatDistance(station.distance)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex min-h-[42px] items-start gap-2 text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>
                        <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" strokeLinejoin="round" />
                          <circle cx="12" cy="10" r="2" />
                        </svg>
                        <span className="line-clamp-2">{station.address || 'Address details are not available for this mapped station.'}</span>
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--border-secondary)] pt-4">
                        <div>
                          {station.reviewCount > 0 ? (
                            <>
                              <StarRating value={station.avgRating} size="sm" showValue />
                              <p className="mt-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                                {station.reviewCount} community review{station.reviewCount === 1 ? '' : 's'}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>No reviews yet</p>
                              <p className="mt-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Open the station to be first</p>
                            </>
                          )}
                        </div>

                        <span className="flex items-center gap-1 text-xs font-bold text-brand-500">
                          View
                          <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {stations && stations.length === 0 && !stationsLoading && (
          <div className="surface-panel mx-auto max-w-2xl p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" strokeLinejoin="round" />
                <path d="M9 10h6" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No Stations Nearby</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
              We could not find mapped fuel stations within 5km. Search a specific station or city instead.
            </p>
            <Link href="/search" className="primary-action mt-5">Search another area</Link>
          </div>
        )}

        {stationsError && (
          <div className="surface-panel mx-auto max-w-2xl p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-500">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 4 21 20H3L12 4Z" strokeLinejoin="round" />
                <path d="M12 9v5M12 17.2v.1" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Station data could not be loaded</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
              The mapped-station provider did not respond successfully. FuelVoice will not replace it with invented station data.
            </p>
            <button type="button" onClick={() => refetch()} className="primary-action mt-5">Retry</button>
          </div>
        )}
      </div>
    </section>
  );
}
