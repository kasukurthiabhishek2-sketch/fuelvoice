/**
 * Homepage discovery hero.
 *
 * Primary search is immediately available; supporting trust signals stay
 * compact so the map remains the next obvious action.
 */

'use client';

import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import { ExploreMapSection } from './ExploreMapSection';
import type { GeolocationResult } from '@/hooks/useGeolocation';

interface HeroProps {
  geolocation: GeolocationResult;
}

const signals = [
  {
    index: '01',
    title: 'Mapped facts',
    copy: 'Station identity and public metadata stay tied to OpenStreetMap.',
  },
  {
    index: '02',
    title: 'Driver context',
    copy: 'Community reviews add the experience a map pin cannot show.',
  },
  {
    index: '03',
    title: 'Consumer recourse',
    copy: 'Complaint guidance stays close when something goes wrong.',
  },
];

export function Hero({ geolocation }: HeroProps) {
  const { latitude, longitude } = geolocation;

  return (
    <section className="hero-surface overflow-hidden">
      <div className="quiet-grid pointer-events-none absolute inset-x-0 top-0 h-[650px] opacity-70" aria-hidden="true" />

      <div className="app-frame relative pb-12 pt-10 sm:pt-14 lg:pb-16 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:items-stretch lg:gap-10">
          <div className="flex min-w-0 flex-col justify-center py-2 lg:py-8">
            <div className="mb-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-3 py-2 text-[11px] font-bold shadow-[var(--shadow-xs)]" style={{ color: 'var(--text-secondary)' }}>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]" />
                Driver-first station intelligence
              </span>
            </div>

            <h1
              className="hero-wordmark max-w-[780px] text-[2.7rem] font-black leading-[0.98] sm:text-[3.6rem] lg:text-[4.7rem]"
              style={{ color: 'var(--text-primary)' }}
            >
              Know the stop before
              <span className="block text-brand-600 dark:text-brand-300">
                you pull into a Fuel Station.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[15px] leading-7 sm:text-lg sm:leading-8" style={{ color: 'var(--text-secondary)' }}>
              Search mapped fuel stations, compare what drivers actually experienced, and make the next stop with more context than a star rating.
            </p>

            <div className="command-surface mt-8 max-w-3xl p-2.5 sm:p-3">
              <div className="mb-2 flex items-center justify-between px-2.5 pt-1">
                <span className="text-[10px] font-black uppercase tracking-[0.13em]" style={{ color: 'var(--text-tertiary)' }}>
                  Find a station
                </span>
                <span className="hidden text-[10px] font-semibold sm:inline" style={{ color: 'var(--text-tertiary)' }}>
                  Name · brand · locality · city
                </span>
              </div>
              <SearchBar
                variant="hero"
                userLat={latitude}
                userLng={longitude}
                placeholder="Search station name, brand, or city…"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link href="#explore-map" className="primary-action">
                Explore the map
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="#nearby-stations" className="secondary-action">See nearby stations</Link>
              <span className="ml-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                OpenStreetMap + community reviews
              </span>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[32px] bg-[var(--surface-contrast)] p-6 text-[var(--surface-contrast-text)] shadow-[0_32px_80px_rgba(23,32,28,0.20)] sm:p-7 lg:p-8" aria-label="How FuelVoice supports a decision">
            <div className="pointer-events-none absolute -right-20 -top-20 hidden h-56 w-56 rounded-full bg-brand-400/15 blur-3xl sm:block" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 hidden h-52 w-52 rounded-full bg-accent-400/10 blur-3xl sm:block" aria-hidden="true" />

            <div className="relative">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-55">Before you stop</p>
                  <h2 className="mt-3 max-w-xs text-2xl font-black tracking-[-0.04em] sm:text-[1.7rem]">
                    One decision. Three useful signals.
                  </h2>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-current/10 bg-current/[0.06]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 18.5V10l8-5 8 5v8.5" strokeLinejoin="round" />
                    <path d="M8 18.5v-5h8v5M3 19.5h18" strokeLinecap="round" />
                  </svg>
                </span>
              </div>

              <div className="mt-8 divide-y divide-current/10 border-y border-current/10">
                {signals.map((signal) => (
                  <div key={signal.index} className="grid grid-cols-[42px_1fr] gap-3 py-5">
                    <span className="pt-0.5 text-[10px] font-black tracking-[0.14em] opacity-40">{signal.index}</span>
                    <div>
                      <h3 className="text-sm font-extrabold">{signal.title}</h3>
                      <p className="mt-1.5 text-xs leading-5 opacity-65">{signal.copy}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-current/10 bg-current/[0.045] p-4">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3.5 19 6v5.3c0 4.4-2.7 7.6-7 9.2-4.3-1.6-7-4.8-7-9.2V6l7-2.5Z" strokeLinejoin="round" />
                  <path d="m9.3 12 1.7 1.7 3.8-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-[11px] leading-5 opacity-65">
                  Provider outages stay visible. FuelVoice does not invent substitute stations to make an empty map look busy.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ExploreMapSection geolocation={geolocation} />
    </section>
  );
}
