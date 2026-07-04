/**
 * Formatting Utilities
 * 
 * Date, number, and distance formatters used throughout the app.
 */

import { Timestamp } from 'firebase/firestore';
import { formatDistanceToNow, format } from 'date-fns';

/** Convert Firestore Timestamp to "X ago" string */
export function timeAgo(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return 'Unknown';

  try {
    const date = timestamp.toDate();
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

/** Format a date nicely */
export function formatDate(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return 'Unknown';

  try {
    const date = timestamp.toDate();
    return format(date, 'MMM d, yyyy');
  } catch {
    return 'Unknown';
  }
}

/** Format distance in km with appropriate units */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/** Format a rating to 1 decimal place */
export function formatRating(rating: number): string {
  if (!rating || rating === 0) return '—';
  return rating.toFixed(1);
}

/** Format a large number compactly (1.2K, 3.4M) */
export function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/** Capitalize first letter */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Generate a slug from text (for URLs) */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
