/**
 * Station Profile Page
 * 
 * Shows full station details, map, reviews, consumer complaints.
 * Fetches station data from Firestore or Overpass API on first visit.
 */

'use client';

import React, { useEffect, useState } from 'react';
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

  const { data: station, isLoading, error } = useQuery({
    queryKey: ['station', stationId],
    queryFn: () => fetchStation(stationId),
    enabled: !!stationId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <SkeletonPage />;

  if (error || !station) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Station Not Found</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>This station may not exist or could not be loaded.</p>
      </div>
    );
  }

  const brand = getBrand(station.brand);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: station.name, text: `Check out ${station.name} on FuelVoice`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Link copied!', 'success');
      }
    } catch { /* user cancelled */ }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Station Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{station.name}</h1>
            {station.brand && (
              <span className="inline-block mt-2 px-3 py-1 rounded-lg text-sm font-medium" style={{ background: brand.bgColor, color: brand.color }}>
                {brand.name}
              </span>
            )}
            {station.address && (
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{station.address}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-primary)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Rating + Stats */}
        {station.reviewCount > 0 && (
          <div className="mt-4 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-brand-500">{formatRating(station.avgRating)}</span>
              <div>
                <StarRating value={station.avgRating} size="sm" />
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{station.reviewCount} reviews</p>
              </div>
            </div>
            {station.complaintCount > 0 && (
              <span className="px-3 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                ⚠️ {station.complaintCount} complaint{station.complaintCount > 1 ? 's' : ''} reported
              </span>
            )}
          </div>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <StationMap lat={station.lat} lng={station.lng} name={station.name} userLat={latitude} userLng={longitude} />

          {/* Station Details */}
          <div className="card p-5">
            <h2 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Station Details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Brand" value={station.brand || 'Not available'} />
              <DetailRow label="Operator" value={station.operator || 'Not available'} />
              <DetailRow label="Phone" value={station.phone || 'Not available'} isLink={!!station.phone} href={`tel:${station.phone}`} />
              <DetailRow label="Website" value={station.website ? new URL(station.website).hostname : 'Not available'} isLink={!!station.website} href={station.website} />
              <DetailRow label="Opening Hours" value={station.openingHours || 'Not available'} />
              <DetailRow label="Coordinates" value={`${station.lat.toFixed(5)}, ${station.lng.toFixed(5)}`} />
            </div>
          </div>

          {/* Category Scores */}
          {station.reviewCount > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Scores</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <ScoreBar label="Fuel Quality" score={station.scores.fuelQuality} />
                <ScoreBar label="Service" score={station.scores.service} />
                <ScoreBar label="Staff Behaviour" score={station.scores.staffBehaviour} />
                <ScoreBar label="Cleanliness" score={station.scores.cleanliness} />
                <ScoreBar label="Washroom" score={station.scores.washroom} />
                <ScoreBar label="Air Filling" score={station.scores.airFilling} />
              </div>
            </div>
          )}

          {/* Review Form */}
          <ReviewForm stationId={stationId} stationName={station.name} />

          {/* Reviews */}
          <div>
            <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Reviews</h2>
            <ReviewList stationId={stationId} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Consumer Complaint */}
          <ConsumerComplaint lat={station.lat} lng={station.lng} countryCode={station.addressComponents?.countryCode} />

          {/* Quick Actions */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium border hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-primary)' }}>
              📍 Get Directions
            </a>
            <button onClick={handleShare}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium border hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-primary)' }}>
              🔗 Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isLink, href }: { label: string; value: string; isLink?: boolean; href?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      {isLink && href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors truncate">{value}</a>
      ) : (
        <span className="text-sm font-medium truncate" style={{ color: value === 'Not available' ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>{value}</span>
      )}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = score > 0 ? (score / 5) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{score > 0 ? score.toFixed(1) : '—'}</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
      </div>
    </div>
  );
}

/** Fetch station from Firestore, or from Overpass API if first visit */
async function fetchStation(stationId: string): Promise<Station> {
  // Try Firestore first
  const cached = await getStation(stationId);
  if (cached) return cached;

  // Parse OSM ID: "node_12345678"
  const [osmType, osmIdStr] = stationId.split('_');
  const osmId = parseInt(osmIdStr, 10);

  if (!osmType || isNaN(osmId)) throw new Error('Invalid station ID');

  // Fetch from Overpass
  const element = await getStationByOsmId(osmType, osmId);
  if (!element) throw new Error('Station not found on OpenStreetMap');

  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat ?? 0;
  const lng = element.lon ?? element.center?.lon ?? 0;

  const addressParts = [tags['addr:street'], tags['addr:city'], tags['addr:state'], tags['addr:country']].filter(Boolean);

  // Create in Firestore for future visits
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
