/**
 * Review List with sorting controls.
 * Displays reviews for a station with sort options.
 */

'use client';

import React from 'react';
import { useReviews, useUserLikes } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { ReviewCard } from './ReviewCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { REVIEW_SORT_OPTIONS, type ReviewSortOption } from '@/types/review';

interface ReviewListProps {
  stationId: string;
}

export function ReviewList({ stationId }: ReviewListProps) {
  const { user } = useAuth();
  const { reviews, isLoading, sortBy, setSortBy } = useReviews(stationId);
  const reviewIds = reviews.map(r => r.id);
  const { data: likedSet } = useUserLikes(reviewIds, user?.uid);

  return (
    <div>
      {/* Sort controls */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {REVIEW_SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value as ReviewSortOption)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                sortBy === opt.value
                  ? 'bg-brand-500/10 text-brand-500 border-brand-500/30'
                  : 'hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
              style={sortBy !== opt.value ? { color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' } : undefined}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Reviews */}
      {!isLoading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isLiked={likedSet?.has(review.id) || false}
              stationId={stationId}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && reviews.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
            No Reviews Yet
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Be the first to review this station and help the community!
          </p>
        </div>
      )}
    </div>
  );
}
