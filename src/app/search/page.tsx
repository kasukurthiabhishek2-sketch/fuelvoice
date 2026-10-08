/** Search-first workspace for finding and reviewing fuel stations. */

import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';

export default function SearchPage() {
  return (
    <section className="search-workspace min-h-[calc(100svh-68px)] border-b border-[var(--border-secondary)]">
      <div className="app-frame py-10 sm:py-14 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="home-kicker">Explore fuel stations</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-0.055em] text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
            Find your station.
            <span className="block text-[var(--text-tertiary)]">Know before you stop.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            Search a fuel station, brand or neighbourhood. Explore real community experiences before you visit.
          </p>
          <p className="mt-2 text-xs text-[var(--text-tertiary)]">
            Precise browser location is never required for search.
          </p>

          <div className="home-search-shell mt-7 max-w-3xl">
            <SearchBar
              variant="hero"
              placeholder="Try Ameerpet, Shell, or IndianOil"
              suggestions={['Ameerpet', 'Shell', 'IndianOil']}
            />
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-[var(--border-primary)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Found a station you know?</p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                Share a review to help drivers make better choices.
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">
                Search works without precise location permission.
              </p>
            </div>
            <Link href="/contribute" className="secondary-action shrink-0">
              Contribute a review <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
