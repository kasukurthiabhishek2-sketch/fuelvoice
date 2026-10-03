/**
 * Minimal search-first homepage.
 *
 * No geolocation, station API, or map work starts on the landing page.
 */

'use client';

import { SearchBar } from '@/components/search/SearchBar';

interface HeroProps {
  userLat?: number | null;
  userLng?: number | null;
}

export function Hero({ userLat, userLng }: HeroProps) {
  return (
    <section className="minimal-home">
      <div className="minimal-home-grid" aria-hidden="true" />
      <div className="app-frame relative flex min-h-[calc(100svh-74px)] items-center py-16 sm:py-20">
        <div className="mx-auto w-full max-w-4xl text-center">
          <p className="home-kicker">Fuel station trust, without the noise.</p>

          <h1 className="mx-auto mt-6 max-w-4xl text-[3.2rem] font-medium leading-[0.95] tracking-[-0.065em] text-white sm:text-[4.7rem] lg:text-[6rem]">
            Know the station
            <span className="block text-white/42">before you trust it.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-[15px] leading-7 text-white/58 sm:text-lg sm:leading-8">
            FuelVoice brings customer reviews, a single Trust Score, and verified official complaint routes together on each station page.
          </p>

          <div className="home-search-shell mx-auto mt-9 max-w-3xl text-left">
            <SearchBar
              variant="hero"
              userLat={userLat}
              userLng={userLng}
              placeholder="Search a fuel station, brand, locality, or city"
            />
          </div>

          <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
            <HomeSignal number="01" title="Trust Score" copy="One station-level signal after enough reviews exist." />
            <HomeSignal number="02" title="Reviews first" copy="Negative experiences surface before secondary station details." />
            <HomeSignal number="03" title="Official help" copy="Verified complaint routes when something goes wrong." />
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeSignal({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <div className="home-signal">
      <span className="text-[10px] font-bold tracking-[0.14em] text-white/25">{number}</span>
      <p className="mt-3 text-sm font-semibold text-white/88">{title}</p>
      <p className="mt-1.5 text-xs leading-5 text-white/42">{copy}</p>
    </div>
  );
}
