/**
 * Station profile page.
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
      <div className="page-shell py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 dark:bg-surface-800">
          {unavailable ? <WarningIcon /> : <SearchIcon />}
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-[-0.025em]" style={{ color: 'var(--text-primary)' }}>
          {unavailable ? 'Station Data Temporarily Unavailable' : 'Station Not Found'}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
          {unavailable
            ? 'OpenStreetMap station data could not be loaded right now. FuelVoice is not substituting fabricated station details.'
            : 'This station does not appear to exist or the station identifier is invalid.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="button-secondary">Back home</Link>
          {unavailable && (
            <button onClick={() => refetch()} disabled={isFetching} className="button-primary disabled:opacity-50">
              {isFetching ? 'Retrying…' : 'Retry'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const brand = getBrand(station.brand);
  const safeWebsite = getSafeWebsite(station.website);

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: station.name, text: \`Check out \${station.name} on FuelVoice\`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Link copied!', 'success');
      }
    } catch {
      // User cancelled native share.
    }
  };

  const directionsUrl = \`https://www.google.com/maps/dir/?api=1&destination=\${station.lat},\${station.lng}\`;

  return (
    <main className="pb-16">
      <section className="border-b gradient-mesh" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="page-shell py-6 sm:py-8">
          <Link href="/#explore-map" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold hover:text-brand-500"
            style={{ color: 'var(--text-secondary)' }}>
            <BackIcon />
            Back to map
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid gap-6 rounded-[28px] border p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-start"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">Station profile</span>
                {station.brand && (
                  <span className="inline-flex min-h-[30px] items-center rounded-full px-3 py-1 text-xs font-bold"
                    style={{ background: brand.bgColor, color: brand.color }}>
                    {brand.name}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
                {station.name}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                {station.address || 'Address details are not available for this mapped station.'}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {station.reviewCount > 0 ? (
                  <div className="flex items-center gap-3 rounded-2xl border px-3.5 py-2.5" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
                    <span className="text-2xl font-black text-brand-500">{formatRating(station.avgRating)}</span>
                    <div>
                      <StarRating value={station.avgRating} size="sm" />
                      <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        {station.reviewCount} community review{station.reviewCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="meta-chip">No community reviews yet</span>
                )}

                {station.complaintCount > 0 && (
                  <span className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-bold text-rose-500">
                    <WarningSmallIcon />
                    {station.complaintCount} complaint{station.complaintCount === 1 ? '' : 's'} reported
                  </span>
                )}

                {station.openingHours && <span className="meta-chip"><ClockIcon /> {station.openingHours}</span>}
              </div>

              {station.fuelTypes.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2" aria-label="Fuel types">
                  {station.fuelTypes.map((fuelType) => (
                    <span key={fuelType} className="rounded-lg bg-brand-500/10 px-2.5 py-1.5 text-xs font-bold text-brand-600 dark:text-brand-300">
                      {fuelType}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:w-[310px]">
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="button-primary">
                <DirectionsIcon />
                Get directions
              </a>
              <button onClick={handleShare} className="button-secondary">
                <ShareIcon />
                Share
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="page-shell mt-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0 space-y-6">
            <section className="overflow-hidden rounded-[24px] border p-1" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}>
              <StationMap lat={station.lat} lng={station.lng} name={station.name} userLat={latitude} userLng={longitude} />
            </section>

            {station.reviewCount > 0 && (
              <section className="card p-5 sm:p-6">
                <SectionHeading
                  eyebrow="Community signal"
                  title="Category scores"
                  description="Break the overall rating into the parts that matter at a fuel stop."
                />
                <div className="mt-6 grid gap-x-7 gap-y-5 sm:grid-cols-2">
                  <ScoreBar label="Fuel quality" score={station.scores.fuelQuality} />
                  <ScoreBar label="Service" score={station.scores.service} />
                  <ScoreBar label="Staff behaviour" score={station.scores.staffBehaviour} />
                  <ScoreBar label="Cleanliness" score={station.scores.cleanliness} />
                  <ScoreBar label="Washroom" score={station.scores.washroom} />
                  <ScoreBar label="Air filling" score={station.scores.airFilling} />
                </div>
              </section>
            )}

            <section className="card p-5 sm:p-6">
              <SectionHeading
                eyebrow="Station data"
                title="Details at a glance"
                description="Information available from the mapped station record."
              />
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <DetailRow label="Brand" value={station.brand || 'Not available'} />
                <DetailRow label="Operator" value={station.operator || 'Not available'} />
                <DetailRow label="Phone" value={station.phone || 'Not available'} href={station.phone ? \`tel:\${station.phone}\` : undefined} />
                <DetailRow label="Website" value={safeWebsite?.label || 'Not available'} href={safeWebsite?.href} />
                <DetailRow label="Opening hours" value={station.openingHours || 'Not available'} />
                <DetailRow label="Coordinates" value={\`\${station.lat.toFixed(5)}, \${station.lng.toFixed(5)}\`} />
              </dl>
            </section>

            <ReviewForm stationId={stationId} stationName={station.name} />

            <section>
              <SectionHeading
                eyebrow="Community"
                title="Reviews"
                description="Recent first-hand experiences shared by FuelVoice users."
              />
              <div className="mt-4">
                <ReviewList stationId={stationId} />
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <ConsumerComplaint lat={station.lat} lng={station.lng} countryCode={station.addressComponents?.countryCode} />

            <section className="card p-5">
              <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>Quick actions</h2>
              <div className="mt-3 grid gap-2">
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="button-primary w-full">
                  <DirectionsIcon />
                  Open directions
                </a>
                <button onClick={handleShare} className="button-secondary w-full">
                  <ShareIcon />
                  Share station
                </button>
                {station.phone && (
                  <a href={\`tel:\${station.phone}\`} className="button-secondary w-full">
                    <PhoneIcon />
                    Call station
                  </a>
                )}
              </div>
            </section>

            <section className="rounded-[20px] border p-5" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <DatabaseIcon />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>About this station data</p>
                  <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>
                    Location and station metadata come from OpenStreetMap. Ratings and reviews are community content stored by FuelVoice.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-500">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-black tracking-[-0.025em]" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <p className="mt-1 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{description}</p>
    </div>
  );
}

function DetailRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const unavailable = value === 'Not available';

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-secondary)', background: 'var(--bg-secondary)' }}>
      <dt className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-tertiary)' }}>{label}</dt>
      <dd className="mt-1 min-w-0">
        {href ? (
          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="block truncate text-sm font-bold text-brand-600 hover:text-brand-500 dark:text-brand-300">
            {value}
          </a>
        ) : (
          <span className="block truncate text-sm font-bold" style={{ color: unavailable ? 'var(--text-muted)' : 'var(--text-primary)' }}>{value}</span>
        )}
      </dd>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const percentage = score > 0 ? (score / 5) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{score > 0 ? score.toFixed(1) : '—'}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: \`\${percentage}%\` }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
        />
      </div>
    </div>
  );
}

function getSafeWebsite(raw: string): { href: string; label: string } | null {
  if (!raw?.trim()) return null;

  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : \`https://\${raw}\`;
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

  const addressParts = [tags['addr:street'], tags['addr:city'], tags['addr:state'], tags['addr:country']].filter(Boolean);

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

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m5-5-5 5 5 5" />
    </svg>
  );
}

function DirectionsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 9 9-9 9-9-9 9-9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h7m-2.5-2.5L15 12l-2.5 2.5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h3l1.5 4-2 1.6a16 16 0 0 0 6.9 6.9l1.6-2L20 16v3a2 2 0 0 1-2 2C9.7 21 3 14.3 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
      <path strokeLinecap="round" d="M10 6v4l2.5 1.5" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-warning-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4 3 20h18L12 4Z" />
      <path strokeLinecap="round" d="M12 9v4m0 3h.01" />
    </svg>
  );
}

function WarningSmallIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 3 2.8 17h14.4L10 3Z" />
      <path strokeLinecap="round" d="M10 7.5v3.5m0 2.5h.01" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
    </svg>
  );
}
