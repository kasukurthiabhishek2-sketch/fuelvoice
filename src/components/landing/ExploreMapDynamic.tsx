/**
 * Dynamic + proximity-aware wrapper for ExploreMap.
 *
 * Leaflet creates GPU-transformed panes. Mounting those panes far below the
 * mobile viewport can cause Chromium compositing artifacts to bleed over the
 * hero. The map now prewarms shortly before it is needed and stays inside a
 * paint-containment boundary.
 */

'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ComponentProps } from 'react';

function MapLoadingShell() {
  return (
    <div
      className="flex w-full flex-col gap-6 lg:h-[600px] lg:flex-row"
      data-testid="map-loading-shell"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative h-[400px] flex-1 overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)] lg:h-full">
        <div className="absolute inset-0 map-loading-grid" aria-hidden="true" />
        <div className="absolute inset-0 grid place-items-center p-6">
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-4 py-3 text-center shadow-[var(--shadow-sm)]">
            <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" aria-hidden="true" />
            <p className="mt-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Preparing map…
            </p>
          </div>
        </div>
      </div>

      <div className="h-[320px] w-full shrink-0 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-4 lg:h-full lg:w-[380px] xl:w-[420px]">
        <div className="skeleton h-5 w-32" />
        <div className="mt-2 skeleton h-3 w-56" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-[var(--border-secondary)] p-3">
              <div className="skeleton h-4 w-2/3" />
              <div className="mt-2 skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const LazyExploreMap = dynamic(
  () => import('./ExploreMap').then((mod) => mod.ExploreMapInner),
  {
    ssr: false,
    loading: MapLoadingShell,
  }
);

type ExploreMapProps = ComponentProps<typeof LazyExploreMap>;

export function ExploreMap(props: ExploreMapProps) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    // Warm the Leaflet bundle after the critical hero paint without creating
    // any Leaflet DOM/compositor layers yet. The dynamic import cache makes
    // the real mount fast once the workspace actually enters the viewport.
    const preloadTimer = setTimeout(() => {
      void import('./ExploreMap');
    }, 700);

    return () => clearTimeout(preloadTimer);
  }, []);

  useEffect(() => {
    const boundary = boundaryRef.current;
    if (!boundary || shouldMount) return;

    if (!('IntersectionObserver' in window)) {
      const timer = setTimeout(() => setShouldMount(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      {
        // Do not create Leaflet GPU panes until the workspace itself reaches
        // the viewport. Its JavaScript bundle is already preloaded above.
        rootMargin: '0px',
      },
    );

    observer.observe(boundary);
    return () => observer.disconnect();
  }, [shouldMount]);

  return (
    <div ref={boundaryRef} className="leaflet-viewport-guard">
      {shouldMount ? <LazyExploreMap {...props} /> : <MapLoadingShell />}
    </div>
  );
}
