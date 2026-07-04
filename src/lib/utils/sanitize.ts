/**
 * XSS Sanitization
 * 
 * Sanitizes user-generated content (review text) to prevent XSS attacks.
 * Uses DOMPurify for robust HTML sanitization.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize user input text, stripping all HTML tags.
 * Used for review titles, content, and suggestions.
 */
export function sanitizeText(input: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization (strip HTML tags)
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  }

  // Client-side: use DOMPurify for robust sanitization
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip ALL HTML
    ALLOWED_ATTR: [],
  }).trim();
}

/**
 * Validate review content meets requirements.
 * Returns error message or null if valid.
 */
export function validateReviewContent(text: string): string | null {
  const sanitized = sanitizeText(text);

  if (sanitized.length < 10) {
    return 'Review must be at least 10 characters long';
  }

  if (sanitized.length > 2000) {
    return 'Review must be under 2000 characters';
  }

  return null;
}

/**
 * Validate review title.
 */
export function validateReviewTitle(title: string): string | null {
  const sanitized = sanitizeText(title);

  if (sanitized.length < 3) {
    return 'Title must be at least 3 characters long';
  }

  if (sanitized.length > 100) {
    return 'Title must be under 100 characters';
  }

  return null;
}
