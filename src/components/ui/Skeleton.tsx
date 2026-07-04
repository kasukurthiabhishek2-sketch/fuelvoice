/**
 * Skeleton Loading Components
 * 
 * Animated shimmer placeholders for various content types.
 * Used everywhere to prevent blank page states.
 */

import React from 'react';

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-6 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-3 w-20" />
        </div>
      </div>
      <div className="skeleton h-4 w-24" />
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonStationCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-5 space-y-3 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-5 w-48" />
          <div className="skeleton h-4 w-32" />
        </div>
        <div className="skeleton h-8 w-16 rounded-lg" />
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="flex gap-3">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonMap({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton rounded-2xl ${className}`} style={{ height: 300 }} />
  );
}

export function SkeletonPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-3">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-4 w-96" />
      </div>
      <div className="skeleton h-64 rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
