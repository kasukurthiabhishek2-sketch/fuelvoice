/**
 * Review types — represents a user review for a fuel station
 */

import { Timestamp } from 'firebase/firestore';

export interface Review {
  /** Auto-generated Firestore document ID */
  id: string;
  /** Station ID (OSM format: "type_osmId") */
  stationId: string;
  /** Firebase UID of reviewer */
  userId: string;
  /** Denormalized display name (for fast reads) */
  userName: string;
  /** Denormalized profile photo URL */
  userPhoto: string;
  /** Review title */
  title: string;
  /** Review body text (sanitized) */
  content: string;
  /** Overall rating (1-5) */
  rating: number;
  /** Category ratings (1-5 each) */
  fuelQuality: number;
  service: number;
  staffBehaviour: number;
  cleanliness: number;
  washroom: number;
  airFilling: number;
  /** Issue tags */
  tags: ReviewTag[];
  /** Whether the reviewer chose to be anonymous */
  isAnonymous: boolean;
  /** Denormalized like count */
  likeCount: number;
  /** Denormalized report count */
  reportCount: number;
  /** Hidden by admin (still in DB, not displayed) */
  isHidden: boolean;
  /** Featured by admin (highlighted) */
  isFeatured: boolean;
  /** Suggestions text */
  suggestions: string;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt: Timestamp;
}

/** Form data for creating/editing a review (without server-set fields) */
export interface ReviewFormData {
  title: string;
  content: string;
  rating: number;
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

/** Predefined issue tags */
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

/** Tag metadata for display */
export const REVIEW_TAGS: Record<ReviewTag, { label: string; color: 'red' | 'amber' | 'green' | 'blue' }> = {
  'fraud': { label: 'Fraud', color: 'red' },
  'overcharging': { label: 'Overcharging', color: 'red' },
  'short-measure': { label: 'Short Measure', color: 'red' },
  'adulteration': { label: 'Adulteration', color: 'red' },
  'poor-service': { label: 'Poor Service', color: 'amber' },
  'rude-staff': { label: 'Rude Staff', color: 'amber' },
  'clean': { label: 'Clean', color: 'green' },
  'well-maintained': { label: 'Well Maintained', color: 'green' },
  'fast-service': { label: 'Fast Service', color: 'green' },
  'good-quality': { label: 'Good Quality', color: 'blue' },
};

/** Sort options for review listing */
export type ReviewSortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'most-liked';

export const REVIEW_SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'most-liked', label: 'Most Liked' },
];
