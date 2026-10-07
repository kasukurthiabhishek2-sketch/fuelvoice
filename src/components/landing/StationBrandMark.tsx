/**
 * Verified brand imagery for station cards.
 *
 * Map only explicitly recognized fuel-company names; OSM operator/name tags
 * can be free-form and must not be guessed into an unrelated logo.
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';

type BrandIdentity = { label: string; initials: string; src: string; background: string };

const LOGOS: Record<string, BrandIdentity> = {
  shell: {
    label: 'Shell', initials: 'S',
    src: 'https://cdn.simpleicons.org/shell/E31C23',
    background: '#fff0c9',
  },
  indianoil: {
    label: 'IndianOil', initials: 'IO',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Indian_Oil_Logo.svg',
    background: '#f5e8dc',
  },
  hpcl: {
    label: 'Hindustan Petroleum', initials: 'HP',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Hindustan_Petroleum_logo.svg',
    background: '#eaf0f9',
  },
  bpcl: {
    label: 'Bharat Petroleum', initials: 'BP',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Bharat_Petroleum_logo.svg',
    background: '#e8f2f5',
  },
  bp: {
    label: 'BP', initials: 'BP',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Bp_textlogo.svg',
    background: '#eaf7e8',
  },
};

export function getStationBrandLogo(brand: string): BrandIdentity | null {
  const normalized = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized === 'shell' || normalized === 'shellretail') return LOGOS.shell;
  if (['indianoil', 'indianoilcorporation', 'iocl', 'indianoilpetrolpump'].includes(normalized)) return LOGOS.indianoil;
  if (['hp', 'hpcl', 'hindustanpetroleum', 'hindustanpetroleumcorporation'].includes(normalized)) return LOGOS.hpcl;
  if (['bpcl', 'bharatpetroleum', 'bharatpetroleumcorporation'].includes(normalized)) return LOGOS.bpcl;
  if (normalized === 'bp') return LOGOS.bp;
  return null;
}

export function StationBrandMark({ brand, stationName }: { brand: string; stationName: string }) {
  const identity = getStationBrandLogo(brand) || getStationBrandLogo(stationName);
  const [failedSource, setFailedSource] = useState<string | null>(null);

  return (
    <span
      className="station-brand-mark"
      style={identity ? { backgroundColor: identity.background } : undefined}
      aria-label={identity ? `${identity.label} station` : 'Fuel station'}
    >
      {identity && failedSource !== identity.src ? (
        <Image
          unoptimized
          src={identity.src}
          width={48}
          height={48}
          loading="lazy"
          className="station-brand-mark-image"
          alt={`${identity.label} logo`}
          onError={() => setFailedSource(identity.src)}
        />
      ) : (
        <span className="station-brand-mark-fallback" aria-hidden="true">
          {identity?.initials || 'FV'}
        </span>
      )}
    </span>
  );
}
