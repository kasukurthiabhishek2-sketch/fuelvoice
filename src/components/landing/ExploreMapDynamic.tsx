/**
 * Dynamic import wrapper for ExploreMap (Leaflet requires window).
 *
 * The loading state mirrors the final desktop/mobile geometry so the map chunk
 * can arrive without causing a large layout shift.
 */

'use client';

import dynamic from 'next/dynamic';

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

export const ExploreMap = dynamic(
  () => import('./ExploreMap').then((mod) => mod.ExploreMapInner),
  {
    ssr: false,
    loading: MapLoadingShell,
  }
);
