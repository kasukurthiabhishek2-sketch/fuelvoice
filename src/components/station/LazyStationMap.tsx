/**
 * Viewport-deferred station map.
 *
 * The station section keeps directions available immediately. Leaflet and tile
 * requests start only when the user is close enough to the map to plausibly need it.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { StationMap } from './StationMapDynamic';

interface LazyStationMapProps {
  lat: number;
  lng: number;
  name: string;
}

export function LazyStationMap({ lat, lng, name }: LazyStationMapProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;
    const target = rootRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '320px 0px', threshold: 0.01 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={rootRef} className="lazy-map-shell">
      {shouldLoad ? (
        <StationMap lat={lat} lng={lng} name={name} />
      ) : (
        <div className="lazy-map-placeholder">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Map loads when you reach it.</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
              Reviews and trust information stay fast even on a slow connection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
