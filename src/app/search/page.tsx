/**
 * Dedicated station search workspace.
 */

'use client';

import React from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { useGeolocation } from '@/hooks/useGeolocation';
import { NearbyStations } from '@/components/landing/NearbyStations';

export default function SearchPage() {
  const geolocation = useGeolocation();
  const { latitude, longitude, hasLocation, isIpLocation } = geolocation;

  return (
    <>
      <section className="hero-surface border-b border-[var(--border-secondary)]">
        <div className="quiet-grid pointer-events-none absolute inset-x-0 top-[74px] h-[500px] opacity-65" aria-hidden="true" />
        <div className="app-frame relative py-12 sm:py-16 lg:py-20">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-stretch">
            <div className="premium-shell p-5 sm:p-7 lg:p-9">
              <p className="eyebrow">Station finder</p>
              <h1 className="hero-wordmark mt-5 max-w-3xl text-4xl font-black leading-[1] sm:text-5xl lg:text-[3.6rem]" style={{ color: 'var(--text-primary)' }}>
                Search less.
                <span className="block text-brand-600 dark:text-brand-300">Know more before you stop.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                Find mapped petrol pumps and gas stations by name, brand, locality, or city, then open the station for reviews, mapped details, and consumer guidance.
              </p>

              <div className="command-surface mt-7 p-2.5 sm:p-3">
                <div className="mb-2 flex items-center justify-between px-2.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--text-tertiary)' }}>Search mapped stations</span>
                  <span className="hidden text-[10px] sm:inline" style={{ color: 'var(--text-tertiary)' }}>Autocomplete as you type</span>
                </div>
                <SearchBar variant="hero" userLat={latitude} userLng={longitude} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="info-chip">
                  <span className={`h-2 w-2 rounded-full ${hasLocation && !isIpLocation ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {hasLocation
                    ? isIpLocation
                      ? 'Biased to your approximate area'
                      : 'Biased to your current location'
                    : 'Worldwide search'}
                </span>
                <span className="info-chip">OpenStreetMap station data</span>
              </div>
            </div>

            <aside className="rounded-[30px] bg-[var(--surface-contrast)] p-6 text-[var(--surface-contrast-text)] shadow-[0_28px_70px_rgba(23,32,28,0.18)] sm:p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-45">A better query</p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">Start specific, then widen.</h2>
              <div className="mt-7 divide-y divide-current/10 border-y border-current/10">
                {[
                  ['Station or brand', 'Best when you already know the operator.'],
                  ['Locality or city', 'Useful when planning a stop in another area.'],
                  ['Map exploration', 'Best when proximity matters more than a name.'],
                ].map(([title, copy], index) => (
                  <div key={title} className="grid grid-cols-[32px_1fr] gap-3 py-4">
                    <span className="text-[10px] font-black opacity-35">0{index + 1}</span>
                    <div>
                      <p className="text-sm font-extrabold">{title}</p>
                      <p className="mt-1 text-xs leading-5 opacity-60">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <NearbyStations geolocation={geolocation} />
    </>
  );
}
