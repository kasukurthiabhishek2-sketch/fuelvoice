/**
 * Nearby discovery stays usable without precise location or account access.
 * Cards expose one direct review action, and the rest of each row opens the station.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { GeolocationResult } from '@/hooks/useGeolocation';
import { useNearbyStations } from '@/hooks/useNearbyStations';
import { useStationAddresses } from '@/hooks/useStationAddresses';
import { StationBrandMark, getStationBrandLogo } from '@/components/landing/StationBrandMark';
import { SkeletonStationCard } from '@/components/ui/Skeleton';
import { formatDistance } from '@/lib/utils/format';
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
    error: locationError,
  } = geolocation;
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const { data: stations, isLoading: stationsLoading, error: stationsError, refetch } = useNearbyStations({
    lat: latitude,
    lng: longitude,
  });

  const contributeMode = context === 'contribute';
  const visibleStations = stations
    ? [...stations]
        .sort((a, b) => contributeMode ? a.reviewCount - b.reviewCount : 0)
        .slice(0, 9)
    : [];
  const { data: resolvedAddresses = {}, isFetching: addressesLoading } = useStationAddresses(visibleStations);
  const usesAddressLookup = visibleStations.some((station) => station.addressQuality !== 'full');
  const isBlocked = permissionState === 'denied';
  const hasPreciseLocation = hasLocation && !isIpLocation;

  return (
    <section className="nearby-section scroll-mt-24 py-10 sm:py-12" id="nearby-stations">
      <div className="app-frame">
        <div className="nearby-head">
          <div className="nearby-head-copy">
            <h2 className="nearby-head-title">
              {contributeMode ? 'Stations that need your voice' : 'Fuel stations near you'}
            </h2>
            <p className="nearby-head-description">
              {contributeMode
                ? 'Find a station you know and share what other drivers should expect.'
                : 'Real locations, honest experiences, and useful details from your area.'}
            </p>
          </div>
          <div className="nearby-head-controls">
            {hasPreciseLocation ? (
              <span className="nearby-location-active" role="status">
                <span className="nearby-location-indicator" aria-hidden="true" />
                Precise location on
              </span>
            ) : (
              <button
                type="button"
                className="nearby-location-button"
                aria-expanded={isBlocked ? showPermissionHelp : undefined}
                aria-controls={isBlocked ? 'nearby-location-help' : undefined}
                disabled={geoLoading}
                onClick={() => isBlocked ? setShowPermissionHelp((current) => !current) : requestLocation()}
              >
                <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                  <circle cx="12" cy="12" r="3.5" />
                  <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" strokeLinecap="round" />
                </svg>
                {geoLoading ? 'Finding you…' : isBlocked ? 'Enable location' : 'Use precise location'}
              </button>
            )}
            <Link href="/search" className="nearby-browse-link">
              Search another area
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        {isBlocked && showPermissionHelp && (
          <div id="nearby-location-help" className="nearby-location-guidance">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Location permission is blocked in your browser.</p>
              <p className="mt-1">
                Open the site controls beside the address bar, set Location to Allow, then retry here.
                Approximate-area stations and manual search continue to work meanwhile.
              </p>
            </div>
            <button type="button" onClick={requestLocation} disabled={geoLoading} className="nearby-retry-button">
              Retry location
            </button>
          </div>
        )}
        {locationError && !showPermissionHelp && !isBlocked && (
          <p className="nearby-location-error" role="status">{locationError}. You can still search by locality.</p>
        )}
        {!hasPreciseLocation && !isBlocked && !locationError && (
          <p className="nearby-location-context">
            {hasLocation
              ? 'Showing your approximate area. Enable precise location for more accurate nearby results.'
              : 'Location is optional. You can still search stations anywhere.'}
          </p>
        )}
        {isBlocked && !showPermissionHelp && (
          <p className="nearby-location-context">
            Location access is blocked. Select Enable location for instructions, or keep browsing your approximate area.
          </p>
        )}

        {stationsLoading && (
          <div className="station-list" aria-label="Loading nearby stations">
            {Array.from({ length: 3 }).map((_, index) => <SkeletonStationCard key={index} />)}
          </div>
        )}

        {stations && stations.length > 0 && (
          <div className="station-list" aria-label="Nearby fuel stations">
            {visibleStations.map((station) => {
              const reviewsNeeded = Math.max(0, TRUST_SCORE_MIN_REVIEWS - station.reviewCount);
              const hasTrustScore = station.reviewCount >= TRUST_SCORE_MIN_REVIEWS && station.trustScore !== undefined;
              const resolvedAddress = resolvedAddresses[station.id];
              const displayAddress = resolvedAddress?.address || station.address;
              const isResolvingAddress = station.addressQuality !== 'full' && !resolvedAddress && addressesLoading;
              const brandIdentity = getStationBrandLogo(station.brand) || getStationBrandLogo(station.name);
              const brandLabel = brandIdentity?.label || station.brand || 'Independent station';

              const description = hasTrustScore
                ? `Drivers have shared ${station.reviewCount} reviews for this station.`
                : station.reviewCount === 0
                  ? 'No one has reviewed this station yet. Your experience could help the next driver.'
                  : `${station.reviewCount} ${station.reviewCount === 1 ? 'driver has' : 'drivers have'} shared an experience here. Add yours to help others decide.`;

              return (
                <article key={station.id} className="station-card-v2 station-list-card" data-station-id={station.id}>
                  <Link
                    href={`/station/${station.id}`}
                    className="station-card-main-link"
                    aria-label={`View ${station.name} station details`}
                  >
                    <StationBrandMark brand={station.brand} stationName={station.name} />
                    <div className="station-list-card-content">
                      <div className="station-card-topline">
                        <span className="station-list-brand-name">{brandLabel}</span>
                        {station.distance !== undefined && (
                          <span className="station-card-distance">{formatDistance(station.distance)} away</span>
                        )}
                      </div>
                      <h3 className="station-card-name station-list-title">
                        <span className="station-card-title-link">{station.name}</span>
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
                            {isResolvingAddress ? 'Finding the mapped address…' : displayAddress || 'Mapped location available'}
                          </p>
                          {resolvedAddress ? (
                            <span className="station-address-source">Approx. mapped address</span>
                          ) : !displayAddress && !isResolvingAddress ? (
                            <span className="station-address-source">Open to view the station map pin</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="station-list-community">
                        <p className="station-card-community-title">{description}</p>
                        <p className="station-card-community-detail">
                          {hasTrustScore
                            ? `Trust Score ${Math.round(station.trustScore!)}/100`
                            : `Trust Score available after ${TRUST_SCORE_MIN_REVIEWS} reviews`}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="station-list-action">
                    <Link href={`/station/${station.id}#write-review`} className="community-review-action">
                      Review station
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {stations && stations.length > 0 && (
          <div className="station-data-attribution">
            <span>Station data:</span>
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="station-data-attribution-link">
              © OpenStreetMap contributors
            </a>
            {usesAddressLookup && (
              <>
                <span aria-hidden="true">·</span>
                <span>Approx. addresses:</span>
                <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer" className="station-data-attribution-link">© MapTiler</a>
              </>
            )}
          </div>
        )}

        {stations && stations.length === 0 && !stationsLoading && !stationsError && (
          <div className="empty-review-state mx-auto max-w-2xl text-center">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">No mapped stations nearby</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              Try a station, brand, locality, or city instead.
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
