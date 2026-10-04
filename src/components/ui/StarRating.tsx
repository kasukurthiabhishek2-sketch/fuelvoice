/**
 * Star Rating Component
 *
 * Interactive star rating with hover preview and accessible single-choice semantics.
 * Supports both display-only and interactive modes.
 */

'use client';

import React, { useState } from 'react';

interface StarRatingProps {
  /** Current rating value (1-5) */
  value: number;
  /** Called when rating changes (omit for read-only) */
  onChange?: (value: number) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show numeric value next to stars */
  showValue?: boolean;
  /** Custom label for accessibility */
  label?: string;
}

const SIZES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

const STARS = [1, 2, 3, 4, 5] as const;

function StarIcon({ filled, size }: { filled: boolean; size: keyof typeof SIZES }) {
  return (
    <svg
      aria-hidden="true"
      className={`${SIZES[size]} transition-colors duration-150`}
      viewBox="0 0 24 24"
      fill={filled ? '#F59E0B' : 'none'}
      stroke={filled ? '#F59E0B' : 'currentColor'}
      strokeWidth={filled ? 0 : 1.5}
      style={{ color: 'var(--text-tertiary)' }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

export function StarRating({
  value,
  onChange,
  size = 'md',
  showValue = false,
  label = 'Rating',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const isInteractive = !!onChange;
  const displayValue = hoverValue || value;

  const selectRelative = (current: number, delta: number) => {
    if (!onChange) return;
    const next = Math.min(5, Math.max(1, current + delta));
    onChange(next);
    requestAnimationFrame(() => {
      document.getElementById(`rating-${next}`)?.focus();
    });
  };

  if (!isInteractive) {
    return (
      <div
        className="inline-flex items-center gap-1.5"
        role="img"
        aria-label={`${label}: ${value} out of 5 stars`}
      >
        {STARS.map((star) => (
          <StarIcon key={star} filled={star <= value} size={size} />
        ))}
        {showValue && value > 0 && (
          <span className="ml-1 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {value.toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5" role="radiogroup" aria-label={label}>
      {STARS.map((star) => (
        <button
          key={star}
          id={`rating-${star}`}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          tabIndex={star === (value || 1) ? 0 : -1}
          onClick={() => onChange(star)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
              event.preventDefault();
              selectRelative(star, 1);
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
              event.preventDefault();
              selectRelative(star, -1);
            } else if (event.key === 'Home') {
              event.preventDefault();
              onChange(1);
              requestAnimationFrame(() => document.getElementById('rating-1')?.focus());
            } else if (event.key === 'End') {
              event.preventDefault();
              onChange(5);
              requestAnimationFrame(() => document.getElementById('rating-5')?.focus());
            }
          }}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl transition duration-150 hover:scale-105 hover:bg-[var(--bg-tertiary)]"
        >
          <StarIcon filled={star <= displayValue} size={size} />
        </button>
      ))}
      {showValue && value > 0 && (
        <span className="ml-1 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
