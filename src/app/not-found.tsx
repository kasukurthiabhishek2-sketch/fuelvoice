/**
 * Custom 404 Page
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <div
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" strokeLinecap="round" />
          </svg>
        </div>
        <p className="section-kicker mt-6">Page unavailable</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">
          Page Not Found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Return home or search for a fuel station instead.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="primary-action justify-center">
            Back to Home
          </Link>
          <Link href="/search" className="secondary-action justify-center">
            Search stations
          </Link>
        </div>
      </div>
    </div>
  );
}
