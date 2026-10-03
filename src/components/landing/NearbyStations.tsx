/**
 * Nearby station discovery.
 *
 * Uses a bento layout to make distance, brand and review signal scannable
 * without turning every result into the same generic card.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import type { GeolocationResult } from '@/hooks/useGeolocation';
import { useNearbyStations } from '@/hooks/useNearbyStations';
import { SkeletonStationCard } from '@/components/ui/Skeleton';
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
    <section className="nearby-section scroll-mt-24 py-16 sm:py-20 lg:py-24" id="nearby-stations">
      <div className="app-frame">
        <div className="mb-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow">Around you</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-[2.8rem]" style={{ color: 'var(--text-primary)' }}>
              Nearby Fuel Stations, without the clutter.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              {hasLocation
                ? isIpLocation
                  ? 'Ordered around your approximate area. Precise location improves distance accuracy when you choose to enable it.'
                  : 'Mapped stations around your current location, arranged for quick comparison.'
                : 'Enable location for distance-aware discovery, or search any place manually.'}
            </p>
          </div>

          <Link href="/search" className="secondary-action self-start lg:self-auto">
            Search another area
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {showLocationPrompt && (
          <div className="premium-shell mb-8 grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500 text-white shadow-[var(--shadow-glow)]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-brand-600 dark:text-brand-300">Optional precision</p>
                <h3 className="mt-1 text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>Use your location for meaningful distance</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  FuelVoice uses location only to order mapped stations nearby. Search still works normally without it.
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
                'Enable precise location'
              )}
            </button>
          </div>
        )}

        {showDenied && (
          <div className="premium-shell mb-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300">Location access is blocked</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Discovery still works. Search by station, brand, locality, or city instead.
              </p>
            </div>
            <Link href="/search" className="secondary-action shrink-0">Search manually</Link>
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
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stations.slice(0, 9).map((station, index) => {
              const brand = station.brand ? getBrand(station.brand) : null;
              const featured = index === 0;

              return (
                <Link
                  key={station.id}
                  href={`/station/${station.id}`}
                  className={`group min-w-0 ${featured ? 'lg:col-span-2' : ''}`}
                >
                  <article className={`bento-card card flex h-full flex-col ${featured ? 'min-h-[270px] p-6 sm:p-7' : 'min-h-[230px] p-5'}`}>
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`grid shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300 ${featured ? 'h-12 w-12' : 'h-10 w-10'}`}>
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M6.5 4.5h7.5v15H6.5z" strokeLinejoin="round" />
                            <path d="M8.5 8h3.5M14 8.5h2.2l1.8 2.1V17a1.5 1.5 0 0 0 3 0v-5.7" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 19.5h10.5" strokeLinecap="round" />
                          </svg>
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {featured && (
                              <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                                {hasLocation && !isIpLocation ? 'Closest mapped result' : 'Top mapped result'}
                              </span>
                            )}
                            {brand && (
                              <span className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em]" style={{ background: brand.bgColor, color: brand.color }}>
                                {brand.name}
                              </span>
                            )}
                          </div>

                          <h3 className={`mt-3 truncate font-semibold tracking-[-0.03em] transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300 ${featured ? 'text-xl sm:text-2xl' : 'text-[15px]'}`} style={{ color: 'var(--text-primary)' }}>
                            {station.name}
                          </h3>
                        </div>
                      </div>

                      <span className="pt-1 text-[10px] font-black tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className={`relative z-10 mt-5 flex items-start gap-2 leading-5 ${featured ? 'max-w-2xl text-sm' : 'text-xs'}`} style={{ color: 'var(--text-secondary)' }}>
                      <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" strokeLinejoin="round" />
                        <circle cx="12" cy="10" r="2" />
                      </svg>
                      <span className="line-clamp-2">{station.address || 'Address details are not available for this mapped station.'}</span>
                    </div>

                    <div className="relative z-10 mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
                      <div className="flex flex-wrap items-center gap-2">
                        {station.distance !== undefined && (
                          <span className="info-chip">{formatDistance(station.distance)}</span>
                        )}
                        <span className="info-chip">
                          {station.reviewCount > 0
                            ? `${station.reviewCount} review${station.reviewCount === 1 ? '' : 's'} · Trust score on station page`
                            : 'Trust score available after 5 reviews'}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-2 text-xs font-extrabold text-brand-600 dark:text-brand-300">
                        Open station
                        <span className="grid h-8 w-8 place-items-center rounded-full border border-brand-500/20 bg-brand-500/10 transition-transform group-hover:translate-x-1">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {stations && stations.length === 0 && !stationsLoading && !stationsError && (
          <div className="premium-shell mx-auto max-w-2xl p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" strokeLinejoin="round" />
                <path d="M9 10h6" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>No Stations Nearby</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
              No mapped stations were found within 5km. Search a station, brand, or city instead.
            </p>
            <Link href="/search" className="primary-action mt-5">Search another area</Link>
          </div>
        )}

        {stationsError && (
          <div className="premium-shell mx-auto max-w-2xl p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-500">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 4 21 20H3L12 4Z" strokeLinejoin="round" />
                <path d="M12 9v5M12 17.2v.1" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>Station data could not be loaded</h3>
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
