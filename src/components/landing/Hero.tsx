/**
 * Community-first homepage hero.
 *
 * Search and contribution are the immediate jobs. Product explanation is kept
 * short so nearby stations can enter the first viewport instead of living
 * behind a full-screen marketing block.
 */

'use client';

import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';

interface HeroProps {
  userLat?: number | null;
  userLng?: number | null;
}

export function Hero({ userLat, userLng }: HeroProps) {
  return (
    <section className="community-home-hero" aria-labelledby="home-title">
      <div className="app-frame py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <p className="home-kicker">Fuel stations, judged by the people who use them.</p>
            <h1 id="home-title" className="community-hero-title mt-4">
              Find the station.
              <span className="block text-[var(--text-tertiary)]">Add your voice.</span>
            </h1>
            <p className="community-hero-copy mt-4">
              Search any station, check community evidence, or review one you know. FuelVoice keeps the useful actions up front.
            </p>
          </div>

          <div className="home-search-shell mt-7 max-w-3xl">
            <SearchBar
              variant="hero"
              userLat={userLat}
              userLng={userLng}
              placeholder="Search a station, brand, locality, or city"
            />
          </div>

          <div className="community-hero-actions mt-4">
            <Link href="/contribute" className="primary-action">
              Review a station
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/search" className="secondary-action">Browse stations</Link>
            <span className="community-hero-note">Search works without precise location permission.</span>
          </div>

          <div className="community-proof-row mt-7" aria-label="FuelVoice product principles">
            <span><strong>Reviews</strong> stay public</span>
            <span><strong>Trust Score</strong> starts at 5 reviews</span>
            <span><strong>Complaint links</strong> are verified</span>
          </div>
        </div>
      </div>
    </section>
  );
}
