/**
 * Nearby station discovery and location permission flow.
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
  } = useNearbyStations({ lat: latitude, lng: longitude });

  const showLocationPrompt = !hasLocation && permissionState !== 'denied';
  const showDenied = permissionState === 'denied';

  return (
    <section className="section-shell" id="nearby-stations">
      <div className="page-shell">
        <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Local discovery</span>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Nearby Fuel Stations
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              {hasLocation
                ? isIpLocation
                  ? 'Showing stations around your approximate network location. Enable precise location for better distance accuracy.'
                  : 'Stations mapped within roughly 5 km of your current location.'
                : 'Use your location for a faster, distance-aware station list.'}
            </p>
          </div>

          <Link href="/search" className="button-secondary self-start sm:self-auto">
            Search another area
            <ArrowIcon />
          </Link>
        </div>

        {showLocationPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 grid gap-6 rounded-[24px] border p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                <LocationIcon />
              </div>
              <div>
                <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>Use your precise location</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  FuelVoice only uses it to calculate nearby stations and distances in this experience. You can still search manually without granting access.
                </p>
              </div>
            </div>

            <button onClick={requestLocation} disabled={geoLoading} className="button-primary w-full disabled:opacity-50 lg:w-auto">
              {geoLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Detecting…
                </>
              ) : (
                <>
                  <LocationIcon small />
                  Enable location
                </>
              )}
            </button>
          </motion.div>
        )}

        {showDenied && (
          <div className="mb-8 flex flex-col gap-4 rounded-[24px] border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}>
            <div>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Location access is blocked</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Search by station, city, or brand instead. The rest of FuelVoice still works.</p>
            </div>
            <Link href="/search" className="button-primary flex-shrink-0">Search manually</Link>
          </div>
        )}

        {stationsLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <SkeletonStationCard key={index} />)}
          </div>
        )}

        {stations && stations.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-tertiary)' }}>
                {stations.length} station{stations.length === 1 ? '' : 's'} found
              </p>
              {isIpLocation && <span className="meta-chip">Approximate location</span>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stations.slice(0, 9).map((station, index) => {
                const brand = station.brand ? getBrand(station.brand) : null;

                return (
                  <motion.div
                    key={station.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.035, duration: 0.25 }}
                  >
                    <Link href={\`/station/\${station.id}\`} className="group block h-full" aria-label={\`View \${station.name}\`}>
                      <article className="interactive-card flex h-full flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            {brand && (
                              <span
                                className="inline-flex max-w-full items-center rounded-lg px-2 py-1 text-[11px] font-bold"
                                style={{ background: brand.bgColor, color: brand.color }}
                              >
                                <span className="truncate">{brand.name}</span>
                              </span>
                            )}
                            <h3 className="mt-2 line-clamp-2 text-[15px] font-extrabold leading-5 tracking-[-0.01em] transition-colors group-hover:text-brand-500"
                              style={{ color: 'var(--text-primary)' }}>
                              {station.name}
                            </h3>
                          </div>

                          {station.distance !== undefined && (
                            <span className="meta-chip flex-shrink-0">
                              <LocationDotIcon />
                              {formatDistance(station.distance)}
                            </span>
                          )}
                        </div>

                        <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>
                          {station.address || 'Address details are not available for this mapped station.'}
                        </p>

                        <div className="mt-5 flex items-end justify-between gap-3 border-t pt-4" style={{ borderColor: 'var(--border-secondary)' }}>
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
                                <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>No reviews yet</p>
                                <p className="mt-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Be the first to add context</p>
                              </>
                            )}
                          </div>

                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 transition-transform group-hover:translate-x-0.5 dark:text-brand-300">
                            <ArrowIcon />
                          </span>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {stations && stations.length === 0 && !stationsLoading && (
          <StateCard
            icon={<SearchIcon />}
            title="No mapped stations nearby"
            description="Nothing was returned inside the nearby radius. Search for a specific station, brand, city, or a wider area."
            action={<Link href="/search" className="button-primary">Search another area</Link>}
          />
        )}

        {stationsError && (
          <StateCard
            icon={<WarningIcon />}
            title="Nearby stations are temporarily unavailable"
            description="The station provider could not be reached. FuelVoice is not substituting fabricated station data."
            action={<button onClick={() => refetch()} className="button-primary">Retry</button>}
          />
        )}
      </div>
    </section>
  );
}

function StateCard({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl rounded-[24px] border p-7 text-center" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-100 dark:bg-surface-800" style={{ color: 'var(--text-secondary)' }}>{icon}</div>
      <h3 className="mt-4 text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      <div className="mt-5 flex justify-center">{action}</div>
    </div>
  );
}

function LocationIcon({ small = false }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={small ? 'h-4 w-4' : 'h-6 w-6'} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.3" />
    </svg>
  );
}

function LocationDotIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-brand-500" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="10" r="3.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-warning-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4 3 20h18L12 4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 3h.01" />
    </svg>
  );
}
