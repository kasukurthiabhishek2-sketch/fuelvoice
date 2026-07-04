/**
 * Dynamic import wrapper for ExploreMap (Leaflet requires window).
 */

'use client';

import dynamic from 'next/dynamic';

export const ExploreMap = dynamic(
  () => import('./ExploreMap').then((mod) => mod.ExploreMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="skeleton" style={{ height: 500, borderRadius: 0 }} />
    ),
  }
);
