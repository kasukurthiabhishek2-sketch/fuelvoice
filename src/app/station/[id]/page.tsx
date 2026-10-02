/**
 * Station Profile Page
 *
 * Shows station details, map, reviews, complaint guidance, and clear primary
 * actions without changing the underlying data or review behavior.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getStation, getOrCreateStation } from '@/lib/firebase/firestore';
import { getStationByOsmId } from '@/lib/api/overpass';
import { StationMap } from '@/components/station/StationMapDynamic';
import { ConsumerComplaint } from '@/components/station/ConsumerComplaint';
import { ReviewForm } from '@/components/review/ReviewForm';
import { ReviewList } from '@/components/review/ReviewList';
import { StarRating } from '@/components/ui/StarRating';
import { SkeletonPage } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getBrand } from '@/lib/constants/brands';
import { formatRating } from '@/lib/utils/format';
import type { Station } from '@/types/station';

export default function StationPage() {
  const params = useParams();
  const stationId = params.id as string;
  const { toast } = useToast();
  const { latitude, longitude } = useGeolocation();

  const { data: station, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['station', stationId],
    queryFn: () => fetchStation(stationId),
    enabled: !!stationId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <SkeletonPage />;

  if (error || !station) {
    const unavailable = error instanceof Error && /provider|timed out|rate-limited|temporarily/i.test(error.message);

    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="surface-panel mx-auto max-w-xl p-8 sm:p-10">
          <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${unavailable ? 'bg-amber-500/10 text-amber-500' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}>
            {unavailable ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 4 21 20H3L12 4Z" strokeLinejoin="round" />
                <path d="M12 9v5M12 17.2v.1" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" strokeLinecap="round" />
              </svg>
            )}
          </div>

          <h1 className="mt-5 text-2xl font-black tracking-[-0.035em]" style={{ color: 'var(--text-primary)' }}>
            {unavailable ? 'Station Data Temporarily Unavailable' : 'Station Not Found'}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
            {unavailable
              ? 'OpenStreetMap station data could not be loaded right now. No substitute station data is being shown.'
              : 'This station does not appear to exist.'}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/search" className="secondary-action">Back to search</Link>
            {unavailable && (
              <button type="button" onClick={() => refetch()} disabled={isFetching} className="primary-action disabled:opacity-50">
                {isFetching ? 'Retrying…' : 'Retry'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const brand = getBrand(station.brand);
  const safeWebsite = getSafeWebsite(station.website);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: station.name,
          text: `Check out ${station.name} on FuelVoice`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Link copied!', 'success');
      }
    } catch {
      // User cancelled the platform share sheet.
    }
  };

  return (
    <div className="pb-16 sm:pb-20">
      <section className="hero-surface border-b border-[var(--border-secondary)]">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-xs font-bold transition-colors hover:text-brand-500"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to station search
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-panel relative mt-5 overflow-hidden p-5 sm:p-7 lg:p-8"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500" aria-hidden="true" />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {station.brand && (
                    <span
                      className="rounded-xl px-2.5 py-1.5 text-xs font-bold"
                      style={{ background: brand.bgColor, color: brand.color }}
                    >
                      {brand.name}
                    </span>
                  )}
                  <span className="info-chip">OpenStreetMap listing</span>
                </div>

                <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-[-0.045em] sm:text-4xl lg:text-5xl" style={{ color: 'var(--text-primary)' }}>
                  {station.name}
                </h1>

                <div className="mt-3 flex max-w-3xl items-start gap-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="2" />
                  </svg>
                  <span>{station.address || 'Address details are not available for this mapped station.'}</span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {station.reviewCount > 0 ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3">
                      <span className="text-3xl font-black text-brand-500">{formatRating(station.avgRating)}</span>
                      <div>
                        <StarRating value={station.avgRating} size="sm" />
                        <p className="mt-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                          {station.reviewCount} review{station.reviewCount === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3">
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No community rating yet</p>
                      <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>You can be the first to review this station.</p>
                    </div>
                  )}

                  {station.complaintCount > 0 && (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
                      <p className="text-xs font-bold text-rose-500">
                        {station.complaintCount} complaint{station.complaintCount === 1 ? '' : 's'} reported
                      </p>
                      <p className="mt-1 text-[11px] text-rose-500/80">Open complaint guidance below before deciding what to do next.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="primary-action">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="2" />
                  </svg>
                  Get directions
                </a>
                <button type="button" onClick={handleShare} className="secondary-action">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <circle cx="18" cy="5" r="2.5" />
                    <circle cx="6" cy="12" r="2.5" />
                    <circle cx="18" cy="19" r="2.5" />
                    <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
                  </svg>
                  Share station
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">
        <main className="min-w-0 space-y-6">
          <section>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Location</p>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Where this station is</h2>
              </div>
              <span className="hidden text-xs sm:block" style={{ color: 'var(--text-tertiary)' }}>
                {station.lat.toFixed(5)}, {station.lng.toFixed(5)}
              </span>
            </div>
            <div className="map-shell p-2">
              <StationMap
                lat={station.lat}
                lng={station.lng}
                name={station.name}
                userLat={latitude}
                userLng={longitude}
              />
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Station profile</p>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Station Details</h2>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6.5 4.5h7.5v15H6.5z" strokeLinejoin="round" />
                  <path d="M8.5 8h3.5M14 8.5h2.2l1.8 2.1V17a1.5 1.5 0 0 0 3 0v-5.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <DetailRow label="Brand" value={station.brand || 'Not available'} />
              <DetailRow label="Operator" value={station.operator || 'Not available'} />
              <DetailRow label="Phone" value={station.phone || 'Not available'} isLink={!!station.phone} href={`tel:${station.phone}`} />
              <DetailRow label="Website" value={safeWebsite?.label || 'Not available'} isLink={!!safeWebsite} href={safeWebsite?.href} />
              <DetailRow label="Opening Hours" value={station.openingHours || 'Not available'} />
              <DetailRow label="Coordinates" value={`${station.lat.toFixed(5)}, ${station.lng.toFixed(5)}`} />
            </div>

            {station.fuelTypes?.length > 0 && (
              <div className="mt-5 border-t border-[var(--border-secondary)] pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>Mapped fuel types</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {station.fuelTypes.map((fuelType) => (
                    <span key={fuelType} className="info-chip">{fuelType}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {station.reviewCount > 0 && (
            <section className="card p-5 sm:p-6">
              <div>
                <p className="section-kicker">Community signal</p>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Category Scores</h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  See where the overall rating comes from instead of relying on one number.
                </p>
              </div>

              <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <ScoreBar label="Fuel Quality" score={station.scores.fuelQuality} />
                <ScoreBar label="Service" score={station.scores.service} />
                <ScoreBar label="Staff Behaviour" score={station.scores.staffBehaviour} />
                <ScoreBar label="Cleanliness" score={station.scores.cleanliness} />
                <ScoreBar label="Washroom" score={station.scores.washroom} />
                <ScoreBar label="Air Filling" score={station.scores.airFilling} />
              </div>
            </section>
          )}

          <section>
            <div className="mb-4">
              <p className="section-kicker">Contribute</p>
              <h2 className="mt-2 text-xl font-black tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Share your experience</h2>
              <p className="mt-1 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                Add useful detail for the next driver, especially around fuel quality, service, and facilities.
              </p>
            </div>
            <ReviewForm stationId={stationId} stationName={station.name} />
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Community</p>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>Reviews</h2>
              </div>
              {station.reviewCount > 0 && (
                <span className="info-chip">{station.reviewCount} total</span>
              )}
            </div>
            <ReviewList stationId={stationId} />
          </section>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <ConsumerComplaint
            lat={station.lat}
            lng={station.lng}
            countryCode={station.addressComponents?.countryCode}
          />

          <div className="card p-5">
            <p className="section-kicker">Next step</p>
            <h3 className="mt-2 text-base font-black" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>
              Navigate, share, or verify the public source without hunting around the page.
            </p>

            <div className="mt-4 space-y-2">
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="primary-action w-full">
                Get directions
              </a>
              <button type="button" onClick={handleShare} className="secondary-action w-full">
                Share station
              </button>
              <a
                href={`https://www.openstreetmap.org/?mlat=${station.lat}&mlon=${station.lng}#map=18/${station.lat}/${station.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-action w-full"
              >
                Open source map
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Data note:</strong> station identity and mapped metadata come from OpenStreetMap. Review scores and complaint counts are FuelVoice community data.
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  isLink,
  href,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
}) {
  const unavailable = value === 'Not available';

  return (
    <div className="rounded-2xl border border-[var(--border-secondary)] bg-[var(--bg-secondary)] p-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </span>
      {isLink && href ? (
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="mt-1 block truncate text-sm font-bold text-brand-500 transition-colors hover:text-brand-600"
        >
          {value}
        </a>
      ) : (
        <span
          className="mt-1 block truncate text-sm font-bold"
          style={{ color: unavailable ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = score > 0 ? (score / 5) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex justify-between gap-3">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>{score > 0 ? score.toFixed(1) : '—'}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
        />
      </div>
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

  const [, osmType, osmIdText] = match;
  const osmId = Number(osmIdText);
  if (!Number.isSafeInteger(osmId)) throw new Error('Invalid station ID');

  const cached = await getStation(stationId);
  if (cached) return cached;

  const element = await getStationByOsmId(osmType, osmId);
  if (!element) throw new Error('Station not found on OpenStreetMap');

  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat === undefined || lng === undefined) throw new Error('Station has no usable coordinates');

  const addressParts = [
    tags['addr:street'],
    tags['addr:city'],
    tags['addr:state'],
    tags['addr:country'],
  ].filter(Boolean);

  return getOrCreateStation({
    id: stationId,
    name: tags.name || tags.brand || tags.operator || 'Fuel Station',
    brand: tags.brand || tags.operator || '',
    operator: tags.operator || '',
    address: addressParts.join(', '),
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
  });
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
