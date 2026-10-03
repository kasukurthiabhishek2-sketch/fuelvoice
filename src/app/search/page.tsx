/** Dedicated station search workspace. */

import { SearchBar } from '@/components/search/SearchBar';

export default function SearchPage() {
  return (
    <section className="search-workspace min-h-[calc(100svh-74px)] border-b border-[var(--border-secondary)]">
      <div className="app-frame py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="home-kicker">Station search</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-medium leading-[1] tracking-[-0.055em] text-[var(--text-primary)] sm:text-6xl">
            Find the station.
            <span className="block text-[var(--text-tertiary)]">Then judge it by the evidence.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            Search by station name, brand, locality, or city. FuelVoice does not request your location just to make search work.
          </p>

          <div className="home-search-shell mt-8 max-w-3xl">
            <SearchBar
              variant="hero"
              placeholder="Search a fuel station, brand, locality, or city"
            />
          </div>

          <div className="search-principles mt-10 grid gap-px overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--border-primary)] sm:grid-cols-3">
            <SearchPrinciple title="No location gate" copy="Search works without granting location permission." />
            <SearchPrinciple title="Trust over stars" copy="Open a station to see its Trust Score and reviews." />
            <SearchPrinciple title="Official complaint paths" copy="Verified destinations appear on supported station pages." />
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchPrinciple({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="bg-[var(--bg-card)] p-5">
      <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">{copy}</p>
    </div>
  );
}
