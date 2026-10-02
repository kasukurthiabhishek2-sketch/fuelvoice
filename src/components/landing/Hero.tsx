/**
 * FuelVoice landing hero.
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

export function Hero({ geolocation }: HeroProps) {
  const { latitude, longitude } = geolocation;

  return (
    <section className="relative overflow-hidden gradient-mesh">
      <div className="page-shell pt-10 sm:pt-14 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-14">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="eyebrow"
            >
              <span className="h-2 w-2 rounded-full bg-success-500" aria-hidden="true" />
              Community fuel intelligence
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="mt-5 max-w-3xl text-[clamp(2.65rem,7vw,5.4rem)] font-black leading-[0.96] tracking-[-0.055em]"
              style={{ color: 'var(--text-primary)' }}
            >
              Know the <span className="text-brand-500">Fuel Station</span> before you pull in.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="mt-6 max-w-2xl text-base leading-7 sm:text-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              Discover mapped stations, compare first-hand community reviews, check service quality,
              and reach consumer complaint resources from one focused place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="mt-7 max-w-2xl"
            >
              <SearchBar
                variant="hero"
                userLat={latitude}
                userLng={longitude}
                placeholder="Search station, brand, city or area"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.28 }}
              className="mt-5 flex flex-wrap items-center gap-2"
            >
              <Link href="/#nearby-stations" className="button-primary">
                <LocationIcon />
                Find stations near me
              </Link>
              <Link href="/#explore-map" className="button-secondary">
                <MapIcon />
                Explore the map
              </Link>
            </motion.div>

            <div className="mt-6 flex flex-wrap gap-2" aria-label="FuelVoice data and access information">
              <span className="meta-chip"><CheckIcon /> OpenStreetMap data</span>
              <span className="meta-chip"><CheckIcon /> Community reviews</span>
              <span className="meta-chip"><CheckIcon /> Free to browse</span>
            </div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="hero-panel p-5 sm:p-7"
            aria-label="How FuelVoice helps"
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">A better stop</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
                    Decide with context, not guesswork.
                  </h2>
                </div>
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md">
                  <ShieldIcon />
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <DecisionStep
                  number="01"
                  title="Discover"
                  description="Search globally or use your location to surface nearby mapped stations."
                />
                <DecisionStep
                  number="02"
                  title="Compare"
                  description="Use ratings, category scores and recent experiences to understand the station."
                />
                <DecisionStep
                  number="03"
                  title="Act"
                  description="Get directions, leave a review, or open the relevant complaint resources."
                />
              </div>

              <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-success-500" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No invented station data</p>
                    <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>
                      When the map provider is unavailable, FuelVoice shows an unavailable state instead of fabricated nearby results.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      <ExploreMapSection geolocation={geolocation} />
    </section>
  );
}

function DecisionStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border p-4" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}>
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-xs font-black text-brand-600 dark:text-brand-300">
        {number}
      </span>
      <div>
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>{description}</p>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-success-500" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 10 3 3 7-7" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.3" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v15M15 6v15" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4.5 6v5.4c0 4.7 3.1 8.9 7.5 10.1 4.4-1.2 7.5-5.4 7.5-10.1V6L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}
