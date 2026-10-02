/**
 * Hero Section
 *
 * Clear value proposition with search first and a compact explanation of
 * what users can evaluate before choosing a station.
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchBar } from '@/components/search/SearchBar';
import { ExploreMapSection } from './ExploreMapSection';
import type { GeolocationResult } from '@/hooks/useGeolocation';

interface HeroProps {
  geolocation: GeolocationResult;
}

const decisionSignals = [
  {
    title: 'Fuel quality',
    description: 'Compare first-hand ratings before you stop.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3.5c3.4 4.1 5.1 7.2 5.1 9.6A5.1 5.1 0 1 1 6.9 13c0-2.4 1.7-5.5 5.1-9.5Z" strokeLinejoin="round" />
        <path d="M9.3 14.2c.4 1.3 1.3 2 2.7 2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Service & cleanliness',
    description: 'See the details a generic map rating hides.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 4.5h10v15H7z" strokeLinejoin="round" />
        <path d="M9.5 8.5h5M9.5 12h5M9.5 15.5h3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Consumer recourse',
    description: 'Find complaint guidance when something goes wrong.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3.5 19 6v5.3c0 4.4-2.7 7.6-7 9.2-4.3-1.6-7-4.8-7-9.2V6l7-2.5Z" strokeLinejoin="round" />
        <path d="m9.3 12 1.7 1.7 3.8-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function Hero({ geolocation }: HeroProps) {
  const { latitude, longitude } = geolocation;

  return (
    <section className="hero-surface overflow-hidden">
      <div className="hero-grid pointer-events-none absolute inset-x-0 top-0 h-[620px] opacity-70" aria-hidden="true" />
      <div className="brand-orb -right-24 top-24 h-72 w-72 bg-amber-300/30" aria-hidden="true" />
      <div className="brand-orb -left-28 top-52 h-72 w-72 bg-orange-300/25" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:items-center lg:gap-16 lg:px-8 lg:pb-14 lg:pt-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <span className="info-chip">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Community reviews + OpenStreetMap station data
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: 0.05 }}
            className="max-w-4xl text-[2.6rem] font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[4.55rem]"
            style={{ color: 'var(--text-primary)' }}
          >
            Know the stop before
            <span className="block bg-gradient-to-r from-brand-500 via-orange-500 to-accent-500 bg-clip-text text-transparent">
              you pull into a Fuel Station.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="mt-6 max-w-2xl text-base leading-7 sm:text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Find mapped fuel stations, compare community experiences, inspect the details that matter, and share what actually happened.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mt-8 max-w-2xl"
          >
            <div className="surface-panel p-2.5 sm:p-3">
              <SearchBar
                variant="hero"
                userLat={latitude}
                userLng={longitude}
                placeholder="Search station name, brand, or city…"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>Jump to:</span>
              <Link href="#explore-map" className="info-chip transition hover:border-brand-500/30 hover:text-brand-500">
                Explore map
              </Link>
              <Link href="#nearby-stations" className="info-chip transition hover:border-brand-500/30 hover:text-brand-500">
                Nearby stations
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="surface-panel relative overflow-hidden p-5 sm:p-6 lg:p-7"
          aria-label="What FuelVoice helps you evaluate"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker">Decision support</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.035em]" style={{ color: 'var(--text-primary)' }}>
                More context than a pin on a map
              </h2>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 18.5V10l8-5 8 5v8.5" strokeLinejoin="round" />
                <path d="M8 18.5v-5h8v5M3 19.5h18" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {decisionSignals.map((signal) => (
              <div
                key={signal.title}
                className="flex gap-4 rounded-2xl border border-[var(--border-secondary)] bg-[var(--bg-secondary)] p-4"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--bg-card)] text-brand-500 shadow-[var(--shadow-xs)]">
                  {signal.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{signal.title}</h3>
                  <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>{signal.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 border-t border-[var(--border-primary)] pt-4 text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>
            If the map provider is unavailable, FuelVoice shows an unavailable state instead of substitute station data.
          </p>
        </motion.aside>
      </div>

      <ExploreMapSection geolocation={geolocation} />
    </section>
  );
}
