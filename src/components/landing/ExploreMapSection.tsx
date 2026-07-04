/**
 * Explore Map Section
 * 
 * Always-visible interactive map section on the homepage.
 * - If location is available: shows nearby stations on the map
 * - If location is not available: shows the map with a location prompt overlay
 * - Users can click station markers to navigate to station profiles
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExploreMap } from './ExploreMapDynamic';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNearbyStations } from '@/hooks/useNearbyStations';

export function ExploreMapSection() {
  const router = useRouter();
  const {
    latitude,
    longitude,
    hasLocation,
    loading: geoLoading,
    requestLocation,
    permissionState,
  } = useGeolocation();

  // Fallback to default coordinates (Hyderabad) when user location is not yet available
  const queryLat = hasLocation && latitude !== null ? latitude : 17.3887027;
  const queryLng = hasLocation && longitude !== null ? longitude : 78.4753829;

  const { data: stations, isLoading: stationsLoading } = useNearbyStations({
    lat: queryLat,
    lng: queryLng,
  });

  const stationCount = stations?.length || 0;

  const handleStationSelect = (stationId: string) => {
    router.push(`/station/${stationId}`);
  };

  return (
    <section className="py-12" id="explore-map">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Explore <span className="bg-gradient-to-r from-brand-500 to-amber-500 bg-clip-text text-transparent">Live Stations</span>
            </h2>
            <p className="text-sm mt-2 max-w-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Explore active fuel bunks near you in real-time. Pan, swipe, or zoom the map to instantly update the visible stations list and read community reviews.
            </p>
          </div>
        </motion.div>

        {/* Map Explorer Dashboard Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <ExploreMap
            lat={latitude}
            lng={longitude}
            hasLocation={hasLocation}
            stations={stations || []}
            onStationSelect={handleStationSelect}
            requestLocation={requestLocation}
            geoLoading={geoLoading}
            permissionState={permissionState}
            stationsLoading={stationsLoading}
          />
        </motion.div>
      </div>
    </section>
  );
}
