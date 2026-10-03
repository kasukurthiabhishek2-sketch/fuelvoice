/**
 * Review domain types.
 *
 * Public station pages use a 0-100 Trust Score. Individual reviews retain a
 * private 1-5 rating input and explicit complaint categories for negative
 * experiences. Legacy fields remain available while older documents are
 * migrated away from the original category-rating/like model.
 */

import { Timestamp } from 'firebase/firestore';

export type ComplaintCategory =
  | 'fuel-quality'
  | 'short-filling'
  | 'pricing-billing'
  | 'staff-behavior'
  | 'payment-issue'
  | 'facilities'
  | 'safety'
  | 'other';

export const COMPLAINT_CATEGORIES: Record<ComplaintCategory, string> = {
  'fuel-quality': 'Fuel quality',
  'short-filling': 'Quantity / short-filling',
  'pricing-billing': 'Pricing / billing',
  'staff-behavior': 'Staff behavior',
  'payment-issue': 'Payment issue',
  facilities: 'Facilities',
  safety: 'Safety',
  other: 'Other',
};

export type ReviewReaction = 'helpful' | 'not-helpful';

export interface Review {
  id: string;
  stationId: string;
  /** Legacy reviewer UID. New public review documents intentionally omit this. */
  userId?: string;
  userName: string;
  userPhoto: string;
  rating: number;
  /** Optional written context. */
  content: string;
  /** Required for 1-2 star reviews; optional otherwise. */
  complaintCategories: ComplaintCategory[];
  /** Reviewer account creation timestamp, denormalized for credibility weighting. */
  reviewerJoinedAt?: Timestamp;
  helpfulCount: number;
  notHelpfulCount: number;
  isHidden: boolean;
  isFeatured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Legacy compatibility fields. New reviews write neutral defaults so old
  // admin/helpers keep working until they are retired.
  title: string;
  fuelQuality: number;
  service: number;
  staffBehaviour: number;
  cleanliness: number;
  washroom: number;
  airFilling: number;
  tags: ReviewTag[];
  isAnonymous: boolean;
  likeCount: number;
  reportCount: number;
  suggestions: string;
}

export interface ReviewFormData {
  rating: number;
  content: string;
  complaintCategories: ComplaintCategory[];

  // Legacy compatibility fields.
  title: string;
  fuelQuality: number;
  service: number;
  staffBehaviour: number;
  cleanliness: number;
  washroom: number;
  airFilling: number;
  tags: ReviewTag[];
  isAnonymous: boolean;
  suggestions: string;
}

export type ReviewTag =
  | 'fraud'
  | 'overcharging'
  | 'short-measure'
  | 'adulteration'
  | 'poor-service'
  | 'rude-staff'
  | 'clean'
  | 'well-maintained'
  | 'fast-service'
  | 'good-quality';

export const REVIEW_TAGS: Record<ReviewTag, { label: string; color: 'red' | 'amber' | 'green' | 'blue' }> = {
  fraud: { label: 'Fraud', color: 'red' },
  overcharging: { label: 'Overcharging', color: 'red' },
  'short-measure': { label: 'Short Measure', color: 'red' },
  adulteration: { label: 'Adulteration', color: 'red' },
  'poor-service': { label: 'Poor Service', color: 'amber' },
  'rude-staff': { label: 'Rude Staff', color: 'amber' },
  clean: { label: 'Clean', color: 'green' },
  'well-maintained': { label: 'Well Maintained', color: 'green' },
  'fast-service': { label: 'Fast Service', color: 'green' },
  'good-quality': { label: 'Good Quality', color: 'blue' },
};

export type ReviewSortOption =
  | 'risk-first'
  | 'newest'
  | 'most-helpful'
  | 'oldest'
  | 'highest'
  | 'lowest'
  | 'most-liked';

export const REVIEW_SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: 'risk-first', label: 'Risk first' },
  { value: 'newest', label: 'Newest' },
  { value: 'most-helpful', label: 'Most helpful' },
];
