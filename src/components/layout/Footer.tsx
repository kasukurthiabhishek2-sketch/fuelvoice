/**
 * Footer Component
 *
 * Compact product footer with clear discovery and consumer-resource paths.
 */

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr_0.75fr]">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="FuelVoice footer">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-[0_10px_24px_rgba(85,114,104,0.18)]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M6.5 4.5h7.5v15H6.5z" strokeLinejoin="round" />
                  <path d="M8.5 7h3.5M14 8.5h2.2l1.8 2.1V17a1.5 1.5 0 0 0 3 0v-5.7l-1.8-2.1" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.5 15.5h7.5M5 19.5h10.5" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <span className="block text-lg font-black tracking-[-0.035em]" style={{ color: 'var(--text-primary)' }}>FuelVoice</span>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-tertiary)' }}>Community station reviews</span>
              </span>
            </Link>

            <p className="mt-5 max-w-lg text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
              Find mapped fuel stations, understand community experiences, and get practical consumer guidance without mixing opinion with source data.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="info-chip">OpenStreetMap data</span>
              <span className="info-chip">Community reviews</span>
              <span className="info-chip">Open access</span>
            </div>
          </div>

          <FooterGroup title="Discover">
            <FooterLink href="/#explore-map" label="Explore map" />
            <FooterLink href="/#nearby-stations" label="Nearby stations" />
            <FooterLink href="/search" label="Search stations" />
          </FooterGroup>

          <FooterGroup title="Consumer resources">
            <FooterLink href="https://consumerhelpline.gov.in" label="Consumer Helpline · India" external />
            <FooterLink href="https://reportfraud.ftc.gov" label="Report Fraud · USA" external />
            <FooterLink href="https://www.citizensadvice.org.uk" label="Citizens Advice · UK" external />
          </FooterGroup>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--border-primary)] pt-6 text-xs sm:flex-row sm:items-center sm:justify-between" style={{ color: 'var(--text-tertiary)' }}>
          <p>© {new Date().getFullYear()} FuelVoice. Community reviews with mapped source data.</p>
          <p>
            Powered by OpenStreetMap · Map data ©{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-brand-600 dark:hover:text-brand-300"
            >
              OpenStreetMap contributors
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-[0.12em]" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const Component = external ? 'a' : Link;

  return (
    <li>
      <Component
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-brand-300"
        style={{ color: 'var(--text-secondary)' }}
        {...linkProps}
      >
        {label}
        {external && (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 5h5v5M19 5l-8 8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 13v5H6V6h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </Component>
    </li>
  );
}
