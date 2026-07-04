/**
 * Dynamic import wrapper for StationMap (Leaflet requires window).
 */

'use client';

import dynamic from 'next/dynamic';

export const StationMap = dynamic(
  () => import('./StationMap').then((mod) => mod.StationMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="skeleton rounded-2xl" style={{ height: 300 }} />
    ),
  }
);
