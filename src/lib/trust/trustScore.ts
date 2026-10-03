import type { Review } from '@/types/review';

export const TRUST_SCORE_MIN_REVIEWS = 5;
export const LOW_QUALITY_MIN_REACTIONS = 5;
export const LOW_QUALITY_NOT_HELPFUL_RATIO = 0.65;

function timestampMillis(value: Review['createdAt'] | Review['reviewerJoinedAt']): number | null {
  if (!value || typeof value.toMillis !== 'function') return null;
  return value.toMillis();
}

/**
 * Internal reviewer credibility signal.
 *
 * Account age is the only authenticity input today. The scale intentionally
 * stays conservative so a very old account cannot overpower the review set.
 * Future mobile verification and OSINT signals can extend this function.
 */
export function calculateReviewerCredibility(review: Review): number {
  const createdAt = timestampMillis(review.createdAt);
  const joinedAt = timestampMillis(review.reviewerJoinedAt);
  if (createdAt === null || joinedAt === null || joinedAt > createdAt) return 50;

  const ageDays = Math.max(0, Math.floor((createdAt - joinedAt) / 86_400_000));
  if (ageDays < 7) return 45;
  if (ageDays < 30) return 55;
  if (ageDays < 180) return 65;
  if (ageDays < 365) return 75;
  if (ageDays < 730) return 85;
  return 95;
}

export function ratingToTrustValue(rating: number): number {
  const bounded = Math.min(5, Math.max(1, rating));
  return (bounded - 1) * 25;
}

/**
 * Returns null until the station has enough evidence.
 *
 * Reviewer credibility changes influence, not sentiment: older accounts get a
 * modestly higher weight, but their rating still determines whether they push
 * trust up or down.
 */
export function calculateTrustScore(reviews: Review[]): number | null {
  const visible = reviews.filter((review) => !review.isHidden && Number.isFinite(review.rating));
  if (visible.length < TRUST_SCORE_MIN_REVIEWS) return null;

  let weightedTotal = 0;
  let totalWeight = 0;

  for (const review of visible) {
    const credibility = calculateReviewerCredibility(review);
    const weight = 0.75 + credibility / 200;
    weightedTotal += ratingToTrustValue(review.rating) * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;
  return Math.round(Math.min(100, Math.max(0, weightedTotal / totalWeight)));
}

export function isLowQualityReview(review: Review): boolean {
  const helpful = Math.max(0, review.helpfulCount || review.likeCount || 0);
  const notHelpful = Math.max(0, review.notHelpfulCount || 0);
  const total = helpful + notHelpful;
  if (total < LOW_QUALITY_MIN_REACTIONS) return false;
  return notHelpful / total >= LOW_QUALITY_NOT_HELPFUL_RATIO;
}
