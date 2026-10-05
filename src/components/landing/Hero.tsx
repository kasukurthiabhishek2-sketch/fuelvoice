/**
 * Search-first homepage hero.
 *
 * Keeps station discovery in the first viewport while letting nearby,
 * distance-aware results enter the page quickly below it.
 */

'use client';

import { SearchBar } from '@/components/search/SearchBar';

interface HeroProps {
  userLat?: number | null;
  userLng?: number | null;
}

export function Hero({ userLat, userLng }: HeroProps) {
  const distanceReady = userLat !== null && userLat !== undefined && userLng !== null && userLng !== undefined;

  return (
    <section className="minimal-home" aria-labelledby="home-title">
      <div className="minimal-home-grid" aria-hidden="true" />
      <div className="app-frame relative py-14 sm:py-18 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="home-kicker">Fuel station decisions, with evidence.</p>

          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,.9fr)_minmax(420px,1.1fr)] lg:items-end lg:gap-14">
            <div>
              <h1 id="home-title" className="home-title max-w-3xl text-[3.15rem] font-medium leading-[0.94] tracking-[-0.065em] sm:text-[4.6rem] lg:text-[5.35rem]">
                Know the station
                <span className="home-title-muted block">before you trust it.</span>
              </h1>

              <p className="home-copy mt-6 max-w-xl text-[15px] leading-7 sm:text-lg sm:leading-8">
                Search any fuel station, compare nearby options by distance, read customer evidence, and reach verified complaint channels when you need them.
              </p>
            </div>

            <div className="lg:pb-1">
              <div className="home-search-shell text-left">
                <SearchBar
                  variant="hero"
                  userLat={userLat}
                  userLng={userLng}
                  placeholder="Search station, brand, locality, or city"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold text-[var(--text-secondary)]">
                <a href="#nearby-stations" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-brand-600 hover:text-brand-500 dark:text-brand-300">
                  Browse nearby stations
                  <span aria-hidden="true">↓</span>
                </a>
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${distanceReady ? 'bg-emerald-400' : 'bg-[var(--text-tertiary)]'}`} aria-hidden="true" />
                  {distanceReady ? 'Distance-aware results ready' : 'Search works without location'}
                </span>
              </div>

              <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--border-primary)] sm:grid-cols-3">
                <HomeFact title="Distance" copy="See how far each nearby station is." />
                <HomeFact title="Trust" copy="Scores appear only after enough reviews." />
                <HomeFact title="Official help" copy="Verified complaint routes, not guesses." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeFact({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="bg-[var(--bg-card)] p-4">
      <p className="text-xs font-bold text-[var(--text-primary)]">{title}</p>
      <p className="mt-1 text-[11px] leading-5 text-[var(--text-tertiary)]">{copy}</p>
    </div>
  );
}
