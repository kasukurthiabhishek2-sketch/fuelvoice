/**
 * Direct complaint actions for a station.
 *
 * There is no FuelVoice form or login gate. Users go directly to a verified
 * official destination when one is available.
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  getGovernmentComplaintRoute,
  getVerifiedBrandComplaintRoute,
  type ComplaintRoute,
} from '@/lib/api/complaints';
import { reverseGeocode } from '@/lib/api/nominatim';

interface ConsumerComplaintProps {
  lat: number;
  lng: number;
  brand?: string;
  countryCode?: string;
  showMobileBar?: boolean;
}

export function ConsumerComplaint({
  lat,
  lng,
  brand = '',
  countryCode: initialCode = '',
  showMobileBar = false,
}: ConsumerComplaintProps) {
  const [detectedCountryCode, setDetectedCountryCode] = useState(initialCode);
  const [detecting, setDetecting] = useState(!initialCode);

  useEffect(() => {
    if (initialCode) {
      setDetectedCountryCode(initialCode);
      setDetecting(false);
      return;
    }

    let active = true;
    setDetecting(true);
    reverseGeocode(lat, lng)
      .then((result) => {
        if (active) setDetectedCountryCode(result?.countryCode || '');
      })
      .catch(() => {
        if (active) setDetectedCountryCode('');
      })
      .finally(() => {
        if (active) setDetecting(false);
      });

    return () => {
      active = false;
    };
  }, [lat, lng, initialCode]);

  const brandRoute = useMemo(() => getVerifiedBrandComplaintRoute(brand), [brand]);
  const governmentRoute = useMemo(
    () => getGovernmentComplaintRoute(detectedCountryCode),
    [detectedCountryCode],
  );
  const primaryRoute = brandRoute || governmentRoute;

  return (
    <>
      <section id="complaints" className="complaint-panel scroll-mt-28" aria-labelledby="complaint-heading">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Need to complain?</p>
            <h2 id="complaint-heading" className="mt-2 text-xl font-bold tracking-[-0.03em] text-[var(--text-primary)]">
              Go straight to an official channel.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              FuelVoice only shows destinations we have verified as official brand or consumer-protection sources.
            </p>
          </div>
          {(brandRoute || governmentRoute) && <VerifiedBadge />}
        </div>

        <div className="mt-5 grid gap-3">
          {brandRoute && (
            <ComplaintLink route={brandRoute} primary label="Contact station / brand support" />
          )}

          {governmentRoute && (
            <ComplaintLink
              route={governmentRoute}
              primary={!brandRoute}
              label={brandRoute ? 'Escalate to consumer protection' : 'File a consumer complaint'}
            />
          )}

          {!brandRoute && !governmentRoute && !detecting && (
            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">No verified complaint route available yet.</p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                We would rather show nothing than guess at an official destination.
              </p>
            </div>
          )}

          {detecting && !brandRoute && (
            <div className="h-16 animate-pulse rounded-2xl bg-[var(--bg-tertiary)]" aria-label="Finding official complaint route" />
          )}
        </div>
      </section>

      {showMobileBar && (
        <div className="station-mobile-actions lg:hidden">
          <a href="#write-review" className="station-mobile-secondary">Write a review</a>
          {primaryRoute ? (
            <a
              href={primaryRoute.url}
              target="_blank"
              rel="noopener noreferrer"
              className="station-mobile-primary"
            >
              File a complaint
            </a>
          ) : (
            <a href="#complaints" className="station-mobile-primary">
              Complaint options
            </a>
          )}
        </div>
      )}
    </>
  );
}

function VerifiedBadge() {
  return (
    <span className="verified-badge shrink-0">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m8.5 12.3 2.1 2.1 4.9-5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="8" />
      </svg>
      Official link verified
    </span>
  );
}

function ComplaintLink({
  route,
  primary,
  label,
}: {
  route: ComplaintRoute;
  primary: boolean;
  label: string;
}) {
  return (
    <a
      href={route.url}
      target="_blank"
      rel="noopener noreferrer"
      className={primary ? 'complaint-action-primary' : 'complaint-action-secondary'}
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold">{label}</span>
        <span className="mt-1 block text-xs font-normal opacity-65">{route.name}</span>
      </span>
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 16 16 8M10 8h6v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
