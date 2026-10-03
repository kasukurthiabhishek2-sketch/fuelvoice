/**
 * Risk-first station review feed with category filtering.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReviews, useUserReviewReactions } from '@/hooks/useReviews';
import { ReviewCard } from './ReviewCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  COMPLAINT_CATEGORIES,
  REVIEW_SORT_OPTIONS,
  type ComplaintCategory,
  type ReviewSortOption,
} from '@/types/review';

interface ReviewListProps {
  stationId: string;
}

export function ReviewList({ stationId }: ReviewListProps) {
  const { user } = useAuth();
  const {
    reviews,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    sortBy,
    setSortBy,
    category,
    setCategory,
  } = useReviews(stationId);

  const reviewIds = reviews.map((review) => review.id);
  const { data: reactions } = useUserReviewReactions(reviewIds, user?.uid);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading || isFetchingNextPage) return;
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: '320px 0px', threshold: 0.01 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isFetchingNextPage, fetchNextPage]);

  return (
    <div>
      <div className="review-controls">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {REVIEW_SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSortBy(option.value as ReviewSortOption)}
              className={`review-filter-pill ${sortBy === option.value ? 'review-filter-pill-active' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`review-filter-pill ${category === null ? 'review-filter-pill-active' : ''}`}
          >
            All issues
          </button>
          {(Object.entries(COMPLAINT_CATEGORIES) as [ComplaintCategory, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={`review-filter-pill ${category === value ? 'review-filter-pill-active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
        </div>
      )}

      {!isLoading && error && (
        <div className="empty-review-state">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Reviews could not be loaded.</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            The station is still available. Retry the review feed without losing your place.
          </p>
          <button type="button" onClick={() => refetch()} className="secondary-action mt-4">
            Retry reviews
          </button>
        </div>
      )}

      {!isLoading && !error && reviews.length > 0 && (
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              stationId={stationId}
              initialReaction={reactions?.get(review.id) || null}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && reviews.length === 0 && (
        <div className="empty-review-state">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {category ? 'No reviews match this issue yet.' : 'No reviews yet.'}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            {category
              ? 'Try another complaint category or view all reviews.'
              : 'When someone shares an experience, it will appear here without requiring visitors to sign in.'}
          </p>
        </div>
      )}

      <div ref={sentinelRef} className="h-6" aria-hidden="true" />

      {isFetchingNextPage && (
        <div className="mt-3"><SkeletonCard /></div>
      )}
    </div>
  );
}
