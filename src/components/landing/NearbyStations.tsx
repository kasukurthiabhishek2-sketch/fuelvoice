/**
 * Nearby Stations Section
 * 
 * Shows fuel stations near the user's location.
 * Handles the geolocation permission flow gracefully.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNearbyStations } from '@/hooks/useNearbyStations';
import { SkeletonStationCard } from '@/components/ui/Skeleton';
import { StarRating } from '@/components/ui/StarRating';
import { formatDistance } from '@/lib/utils/format';
import { getBrand } from '@/lib/constants/brands';

export function NearbyStations() {
  const { latitude, longitude, loading: geoLoading, error: geoError, requestLocation, hasLocation, permissionState } = useGeolocation();
  const { data: stations, isLoading: stationsLoading, error: stationsError } = useNearbyStations({
    lat: latitude,
    lng: longitude,
  });

  const showLocationPrompt = !hasLocation && permissionState !== 'denied';
  const showDenied = permissionState === 'denied';

  return (
    <section className="py-16 sm:py-20" id="nearby-stations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Nearby Fuel Stations
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {hasLocation ? 'Fuel stations within 5km of your location' : 'Enable location to discover stations near you'}
            </p>
          </div>
        </div>

        {/* Location Permission Prompt */}
        {showLocationPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 text-center max-w-lg mx-auto"
          >
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Discover Nearby Stations
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Allow location access to find petrol pumps and gas stations near you.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={requestLocation}
              disabled={geoLoading}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {geoLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Detecting Location…
                </span>
              ) : (
                'Enable Location'
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Location Denied */}
        {showDenied && (
          <div className="card p-8 text-center max-w-lg mx-auto">
            <div className="text-4xl mb-4">🚫</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Location Access Denied
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              You can still search for stations manually using the search bar above.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-surface-100 dark:hover:bg-surface-700"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-primary)' }}
            >
              Search Manually →
            </Link>
          </div>
        )}

        {/* Loading Skeletons */}
        {stationsLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonStationCard key={i} />
            ))}
          </div>
        )}

        {/* Station Grid */}
        {stations && stations.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stations.slice(0, 9).map((station, i) => (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link href={`/station/${station.id}`} className="block">
                  <div className="card p-5 h-full hover:border-brand-500/30 transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-sm truncate group-hover:text-brand-500 transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {station.name}
                        </h3>
                        {station.brand && (
                          <span
                            className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              background: getBrand(station.brand).bgColor,
                              color: getBrand(station.brand).color,
                            }}
                          >
                            {getBrand(station.brand).name}
                          </span>
                        )}
                      </div>
                      {station.distance !== undefined && (
                        <span
                          className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                        >
                          {formatDistance(station.distance)}
                        </span>
                      )}
                    </div>

                    {station.address && (
                      <p className="mt-2 text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {station.address}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <StarRating value={station.avgRating} size="sm" showValue />
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {station.reviewCount > 0 ? `${station.reviewCount} reviews` : 'No reviews yet'}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {stations && stations.length === 0 && !stationsLoading && (
          <div className="card p-8 text-center max-w-lg mx-auto">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Stations Nearby
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              We couldn&apos;t find any fuel stations within 5km. Try searching for a specific station or city.
            </p>
          </div>
        )}

        {/* Error State */}
        {stationsError && (
          <div className="card p-8 text-center max-w-lg mx-auto">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Something Went Wrong
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Failed to load nearby stations. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
