/**
 * Interactive homepage map section.
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
    router.push(\`/station/\${stationId}\`);
  };

  return (
    <section className="section-shell" id="explore-map">
      <div className="page-shell">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-7 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div>
            <span className="eyebrow">Map + list</span>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Explore mapped stations
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Pan or zoom the map and the station list updates with the visible area. Select a station to surface its reviews before opening the full profile.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <span className="meta-chip">Pan to refresh area</span>
            <span className="meta-chip">Select marker for reviews</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="overflow-hidden rounded-[28px] border p-1 shadow-[var(--shadow-lg)]"
          style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}
