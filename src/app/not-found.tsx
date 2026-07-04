/**
 * Custom 404 Page
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Page Not Found
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 transition-all shadow-md"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
