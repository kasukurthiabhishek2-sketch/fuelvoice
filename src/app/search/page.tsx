/** Dedicated station search workspace. */

import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';

export default function SearchPage() {
  return (
    <section className="search-workspace min-h-[calc(100svh-68px)] border-b border-[var(--border-secondary)]">
      <div className="app-frame py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div>
              <p className="home-kicker">Station search</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-[var(--text-primary)] sm:text-5xl">
                Find the station.
                <span className="block text-[var(--text-tertiary)]">See the community evidence.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                Search by station name, brand, locality, or city. Precise browser location is never required for search.
              </p>

              <div className="home-search-shell mt-6 max-w-3xl">
                <SearchBar
                  variant="hero"
                  placeholder="Search a station, brand, locality, or city"
                />
              </div>
            </div>

            <aside className="search-contribute-card">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Know a station?</p>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                Add what you experienced.
              </h2>
              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                A rating comes first. Extra context is optional, and low ratings ask for the issue categories that apply.
              </p>
              <Link href="/contribute" className="primary-action mt-4 w-full">Contribute a review</Link>
            </aside>
          </div>

          <div className="search-principles mt-8 grid gap-px overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--border-primary)] sm:grid-cols-3">
            <SearchPrinciple title="No location gate" copy="Search works without precise location permission." />
            <SearchPrinciple title="Trust over stars" copy="Trust Score appears once a station has enough community evidence." />
            <SearchPrinciple title="Official complaint paths" copy="Verified destinations appear on supported station pages." />
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchPrinciple({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="bg-[var(--bg-card)] p-4 sm:p-5">
      <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-1.5 text-xs leading-5 text-[var(--text-tertiary)]">{copy}</p>
    </div>
  );
}
