import React from 'react';
import Link from 'next/link';

export function Footer() {
  const footerLinkClass =
    'inline-flex min-h-11 items-center rounded-lg px-1.5 hover:text-[var(--text-primary)]';

  return (
    <footer className="product-footer">
      <div className="app-frame flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold tracking-[-0.02em] text-[var(--text-primary)]">FuelVoice</Link>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            Community reviews and verified complaint paths for fuel stations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] sm:gap-4">
          <Link href="/search" className={footerLinkClass}>Search stations</Link>
          <Link href="/contribute" className={footerLinkClass}>Contribute</Link>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLinkClass}
          >
            OpenStreetMap
          </a>
        </div>
      </div>
    </footer>
  );
}
