/**
 * Global Error Boundary
 */

'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Something Went Wrong
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 transition-all shadow-md"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
