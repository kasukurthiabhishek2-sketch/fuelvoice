/**
 * User types — represents a registered user in Firestore
 * Privacy: email and uid are NEVER exposed to other users
 */

import { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'admin' | 'moderator';

export interface UserProfile {
  /** Firebase UID (internal only, never shown to other users) */
  uid: string;
  /** Display name from Google account */
  displayName: string;
  /** Profile photo URL from Google account */
  photoURL: string;
  /** User role for authorization */
  role: UserRole;
  /** Account creation date */
  createdAt: Timestamp;
  /** Denormalized total review count */
  reviewCount: number;
  /** Denormalized total likes received */
  likeCount: number;
  /** Whether user is banned by admin */
  isBanned: boolean;
  /** Timestamp of last review (for rate limiting) */
  lastReviewAt: Timestamp | null;
}

/** Like document — stored with compound ID: "{reviewId}__{userId}" */
export interface Like {
  reviewId: string;
  userId: string;
  createdAt: Timestamp;
}

/** Report document */
export interface Report {
  id: string;
  /** The review being reported */
  reviewId: string;
  /** Station ID (denormalized for admin queries) */
  stationId: string;
  /** UID of person filing the report */
  reporterId: string;
  /** Reason category */
  reason: ReportReason;
  /** Additional details */
  details: string;
  /** Moderation status */
  status: 'pending' | 'reviewed' | 'dismissed';
  /** Creation timestamp */
  createdAt: Timestamp;
  /** When admin reviewed it */
  reviewedAt: Timestamp | null;
  /** Admin who reviewed it */
  reviewedBy: string | null;
}

export type ReportReason = 'spam' | 'abuse' | 'misinformation' | 'harassment' | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'abuse', label: 'Abusive or harmful' },
  { value: 'misinformation', label: 'False information' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'other', label: 'Other' },
];
