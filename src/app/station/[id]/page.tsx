/**
 * Station page.
 *
 * Designed for direct search-engine landings: identity, Trust Score, contribution
 * and community reviews appear before maps and secondary station metadata.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getStation } from '@/lib/firebase/firestore';
import { getStationByOsmId } from '@/lib/api/overpass';
import { ratingToTrustValue, TRUST_SCORE_MIN_REVIEWS } from '@/lib/trust/trustScore';
import { ConsumerComplaint } from '@/components/station/ConsumerComplaint';
import { LazyStationMap } from '@/components/station/LazyStationMap';
import { ReviewForm } from '@/components/review/ReviewForm';
import { ReviewList } from '@/components/review/ReviewList';
import { SkeletonPage } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getBrand } from '@/lib/constants/brands';
import type { Station } from '@/types/station';

export default function StationPage() {
  const params = useParams();
  const stationId = params.id as string;
  const { toast } = useToast();

  const {
    data: station,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['station', stationId],
    queryFn: () => fetchStation(stationId),
    enabled: Boolean(stationId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) return <SkeletonPage />;

  if (error || !station) {
    const unavailable = error instanceof Error
      && /provider|timed out|rate-limited|temporarily/i.test(error.message);

    return (
      <div className="app-frame py-20 text-center">
        <div className="station-error-panel mx-auto max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
            {unavailable ? 'Source unavailable' : 'Station unavailable'}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">
            {unavailable ? 'Station data could not be loaded.' : 'We could not find this station.'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            {unavailable
              ? 'The mapped-station provider is not responding. FuelVoice will not substitute invented station data.'
              : 'The station ID may be invalid or no longer available from the mapped source.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/search" className="secondary-action">Search stations</Link>
            {unavailable && (
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="primary-action disabled:opacity-50"
              >
                {isFetching ? 'Retrying…' : 'Retry'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const brand = getBrand(station.brand);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
  const safeWebsite = getSafeWebsite(station.website);
  const trustScore = station.reviewCount >= TRUST_SCORE_MIN_REVIEWS
    ? Math.round(station.trustScore ?? ratingToTrustValue(station.avgRating))
    : null;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: station.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Station link copied', 'success');
      }
    } catch {
      // Native share sheet was dismissed.
    }
  };

  return (
    <div className="station-page pb-28 lg:pb-20">
      <section className="station-hero">
        <div className="app-frame py-7 sm:py-9 lg:py-12">
          <div className="flex items-center justify-between gap-4">
            <Link href="/search" className="station-back-link">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Search
            </Link>
            <button type="button" onClick={handleShare} className="station-back-link">
              Share
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M7 12v7h10v-7M12 4v11M8.5 7.5 12 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {station.brand && (
                  <span
                    className="station-brand-pill"
                    style={{ '--brand-pill': brand.color } as React.CSSProperties}
                  >
                    {brand.name}
                  </span>
                )}
                <span className="station-source-pill">Mapped station</span>
              </div>

              <h1 className="mt-4 max-w-4xl text-[2.35rem] font-semibold leading-[1.02] tracking-[-0.055em] text-[var(--text-primary)] sm:text-5xl lg:text-[3.8rem]">
                {station.name}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                {station.address || 'Mapped location available. Address details have not been published for this station.'}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <a href="#write-review" className="primary-action">
                  Write a review
                </a>
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="secondary-action">
                  Get directions
                </a>
                <a href="#complaints" className="station-inline-action">
                  Official complaint options
                </a>
              </div>
            </div>

            <div className="trust-score-panel" aria-label={trustScore === null ? 'Trust Score unavailable' : `Trust Score ${trustScore} out of 100`}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Trust Score</p>
              {trustScore === null ? (
                <>
                  <p className="mt-3 text-xl font-semibold tracking-[-0.035em] text-[var(--text-primary)]">Insufficient data</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">
                    {station.reviewCount} of {TRUST_SCORE_MIN_REVIEWS} reviews needed
                  </p>
                  <a href="#write-review" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-white underline decoration-white/25 underline-offset-4 hover:decoration-white/70">
                    Help unlock the Trust Score
                  </a>
                </>
              ) : (
                <>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-6xl font-medium tracking-[-0.065em] text-white">{trustScore}</span>
                    <span className="pb-2 text-sm font-semibold text-white/45">/100</span>
                  </div>
                  <div className="trust-meter" aria-hidden="true">
                    <span style={{ width: `${trustScore}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                    {station.reviewCount} review{station.reviewCount === 1 ? '' : 's'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="app-frame py-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="min-w-0">
            <section className="community-contribution-entry" aria-labelledby="contribution-heading">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Add your experience</p>
                <h2 id="contribution-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Help the next driver decide.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                  Start with a rating. Written context is optional, and low ratings ask only for the issue categories that apply.
                </p>
              </div>
              <ReviewForm stationId={stationId} stationName={station.name} />
            </section>

            <section id="reviews" className="mt-10 scroll-mt-28">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Community evidence</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                    Reviews
                  </h2>
                </div>
                {station.reviewCount > 0 && (
                  <span className="text-xs font-semibold text-[var(--text-tertiary)]">
                    {station.reviewCount} total
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Risk-heavy experiences appear first by default. Helpful reactions and issue filters keep the useful evidence easier to find.
              </p>

              <div className="mt-5">
                <ReviewList stationId={stationId} />
              </div>
            </section>

            <section className="mt-10">
              <ConsumerComplaint
                lat={station.lat}
                lng={station.lng}
                brand={station.brand}
                countryCode={station.addressComponents?.countryCode}
                showMobileBar
              />
            </section>

            <section className="station-secondary-section mt-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Station details</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Useful details, after the reviews.
                </h2>
              </div>

              <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--border-primary)] sm:grid-cols-2">
                <DetailRow label="Brand" value={station.brand || 'Not available'} />
                <DetailRow label="Operator" value={station.operator || 'Not available'} />
                <DetailRow label="Opening hours" value={station.openingHours || 'Not available'} />
                <DetailRow label="Phone" value={station.phone || 'Not available'} href={station.phone ? `tel:${station.phone}` : undefined} />
                <DetailRow
                  label="Website"
                  value={safeWebsite?.label || 'Not available'}
                  href={safeWebsite?.href}
                  external
                />
                <DetailRow label="Fuel types" value={station.fuelTypes.length ? station.fuelTypes.join(' · ') : 'Not available'} />
              </dl>

              <div className="mt-8">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Location</p>
                    <p className="mt-1 text-xs text-[var(--text-tertiary)]">Interactive map loads only when you reach it.</p>
                  </div>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-mr-2 inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  >
                    Directions ↗
                  </a>
                </div>
                <LazyStationMap lat={station.lat} lng={station.lng} name={station.name} />
              </div>
            </section>
            <div className="station-quiet-note mt-8">
              Station identity and mapped facts come from OpenStreetMap. Customer experiences and Trust Score are FuelVoice community data.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function DetailRow({
  label,
  value,
  href,
  external = false,
}: {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="bg-[var(--bg-card)] p-4">
      <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">{label}</dt>
      <dd className="mt-1.5 min-w-0 text-sm font-semibold text-[var(--text-primary)]">
        {href ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="block truncate underline decoration-white/15 underline-offset-4 hover:decoration-white/50"
          >
            {value}
          </a>
        ) : (
          <span className="block truncate">{value}</span>
        )}
      </dd>
    </div>
  );
}

function getSafeWebsite(raw: string): { href: string; label: string } | null {
  if (!raw?.trim()) return null;

  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return { href: url.toString(), label: url.hostname };
  } catch {
    return null;
  }
}

async function fetchStation(stationId: string): Promise<Station> {
  const match = /^(node|way|relation)_([1-9][0-9]*)$/.exec(stationId);
  if (!match) throw new Error('Invalid station ID');

  try {
    const cached = await getStation(stationId);
    if (cached) return cached;
  } catch {
    // Firestore is an optional cache/community layer for station identity.
    // Fall through to the mapped source so public station pages remain usable.
  }

  const osmId = Number(match[2]);
  if (!Number.isSafeInteger(osmId)) throw new Error('Invalid station ID');

  const element = await getStationByOsmId(match[1], osmId);
  if (!element) throw new Error('Station not found on OpenStreetMap');

  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat === undefined || lng === undefined) throw new Error('Station has no usable coordinates');

  return {
    id: stationId,
    name: tags.name || tags.brand || tags.operator || 'Fuel Station',
    brand: tags.brand || tags.operator || '',
    operator: tags.operator || '',
    address: [
      tags['addr:street'],
      tags['addr:city'],
      tags['addr:state'],
      tags['addr:country'],
    ].filter(Boolean).join(', '),
    addressComponents: {
      street: tags['addr:street'],
      city: tags['addr:city'],
      state: tags['addr:state'],
      country: tags['addr:country'],
      countryCode: tags['addr:country_code'] || tags['ISO3166-1:alpha2'],
    },
    lat,
    lng,
    phone: tags.phone || tags['contact:phone'] || '',
    website: tags.website || tags['contact:website'] || '',
    openingHours: tags.opening_hours || '',
    fuelTypes: extractFuelTypes(tags),
    osmTags: tags,
    avgRating: 0,
    reviewCount: 0,
    complaintCount: 0,
    scores: {
      fuelQuality: 0,
      service: 0,
      staffBehaviour: 0,
      cleanliness: 0,
      washroom: 0,
      airFilling: 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}

function extractFuelTypes(tags: Record<string, string>): string[] {
  const types: string[] = [];
  if (tags['fuel:diesel'] === 'yes') types.push('Diesel');
  if (tags['fuel:octane_95'] === 'yes' || tags['fuel:petrol'] === 'yes') types.push('Petrol');
  if (tags['fuel:cng'] === 'yes') types.push('CNG');
  if (tags['fuel:lpg'] === 'yes') types.push('LPG');
  if (tags['fuel:e85'] === 'yes') types.push('E85');
  if (tags['fuel:electric'] === 'yes') types.push('Electric');
  return types;
}
