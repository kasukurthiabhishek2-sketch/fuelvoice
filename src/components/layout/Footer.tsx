/**
 * FuelVoice footer with product and data-source context.
 */

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
      <div className="page-shell py-10 sm:py-12">
        <div className="grid gap-9 lg:grid-cols-[1.4fr_0.6fr_0.8fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="FuelVoice home">
              <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-brand-500 text-white shadow-sm">
                <PumpIcon />
              </span>
              <span className="text-lg font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
                Fuel<span className="text-brand-500">Voice</span>
              </span>
            </Link>
            <p className="mt-4 max-w-lg text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
              Community fuel-station reviews layered on open map data, with practical consumer complaint resources when a poor experience needs more than a star rating.
            </p>
            <p className="mt-4 text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>
              Station locations and metadata come from OpenStreetMap contributors. Community ratings belong to FuelVoice users.
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em]" style={{ color: 'var(--text-tertiary)' }}>Explore</p>
            <ul className="mt-3 space-y-1">
              <FooterLink href="/search" label="Search stations" />
              <FooterLink href="/#nearby-stations" label="Nearby stations" />
              <FooterLink href="/#explore-map" label="Explore map" />
            </ul>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em]" style={{ color: 'var(--text-tertiary)' }}>Consumer resources</p>
            <ul className="mt-3 space-y-1">
              <FooterLink href="https://consumerhelpline.gov.in" label="Consumer Helpline · India" external />
              <FooterLink href="https://reportfraud.ftc.gov" label="Report Fraud · USA" external />
              <FooterLink href="https://www.citizensadvice.org.uk" label="Citizens Advice · UK" external />
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: 'var(--border-primary)' }}>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>© {new Date().getFullYear()} FuelVoice. Community-powered station context.</p>
          <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <span>Powered by OpenStreetMap</span>
            <span aria-hidden="true">•</span>
            <span>Open access discovery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const Component = external ? 'a' : Link;
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <li>
      <Component
        href={href}
        className="inline-flex min-h-9 items-center text-sm font-medium transition-colors hover:text-brand-500"
        style={{ color: 'var(--text-secondary)' }}
        {...linkProps}
      >
        {label}
        {external && <span className="ml-1.5 text-xs" aria-hidden="true">↗</span>}
      </Component>
    </li>
  );
}

function PumpIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a2 2 0 0 1 2 2v14H4V6a2 2 0 0 1 2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h6M16 9h1.5l1.5 2v5.5a1.5 1.5 0 0 0 3 0V10l-2-2" />
    </svg>
  );
}
