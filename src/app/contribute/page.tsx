/**
 * Contribution hub.
 *
 * The page intentionally uses existing station and profile data. It does not
 * claim visit verification and does not invent global activity metrics.
 */

'use client';

import { SearchBar } from '@/components/search/SearchBar';
import { NearbyStations } from '@/components/landing/NearbyStations';
import { LoginButton } from '@/components/auth/LoginButton';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function ContributePage() {
  const geolocation = useGeolocation();
  const { user, profile } = useAuth();
  const reviewCount = profile?.reviewCount || 0;
  const helpfulMarks = profile?.likeCount || 0;
  const nextMilestone = reviewCount < 5 ? 5 : reviewCount < 10 ? 10 : reviewCount < 25 ? 25 : null;

  return (
    <div className="contribute-page">
      <section className="contribute-hero">
        <div className="app-frame py-10 sm:py-14">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div className="max-w-3xl">
              <p className="home-kicker">Contribute</p>
              <h1 className="mt-3 text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-[var(--text-primary)] sm:text-5xl">
                Make the next fuel stop easier for someone else.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                Search a station you know or pick one nearby. Rate the experience first, then add only the context that helps.
              </p>
              <div className="home-search-shell mt-6 max-w-3xl">
                <SearchBar
                  variant="hero"
                  userLat={geolocation.latitude}
                  userLng={geolocation.longitude}
                  placeholder="Find a station to review"
                />
              </div>
            </div>

            <aside className="contribution-summary" aria-label="Your contribution summary">
              {user ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Your contribution</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="contribution-stat">
                      <strong>{reviewCount}</strong>
                      <span>reviews</span>
                    </div>
                    <div className="contribution-stat">
                      <strong>{helpfulMarks}</strong>
                      <span>helpful marks</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-[var(--text-secondary)]">
                    {nextMilestone
                      ? `${Math.max(0, nextMilestone - reviewCount)} more review${nextMilestone - reviewCount === 1 ? '' : 's'} to reach the ${nextMilestone}-review milestone.`
                      : 'Your review history is already substantial. Keep quality ahead of quantity.'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Build a useful contribution history</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                    Anyone can read. Sign in only when you are ready to publish a review or mark one helpful.
                  </p>
                  <div className="mt-4"><LoginButton /></div>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>

      <NearbyStations geolocation={geolocation} context="contribute" />
    </div>
  );
}
