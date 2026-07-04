/**
 * Star Rating Component
 * 
 * Interactive star rating with hover preview and accessibility.
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

  return (
    <div className="inline-flex items-center gap-1.5" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!isInteractive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => isInteractive && setHoverValue(star)}
          onMouseLeave={() => isInteractive && setHoverValue(0)}
          className={`${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-150 disabled:cursor-default`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <svg
            className={`${SIZES[size]} transition-colors duration-150`}
            viewBox="0 0 24 24"
            fill={star <= displayValue ? '#F59E0B' : 'none'}
            stroke={star <= displayValue ? '#F59E0B' : 'currentColor'}
            strokeWidth={star <= displayValue ? 0 : 1.5}
            style={{ color: 'var(--text-tertiary)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
      {showValue && value > 0 && (
        <span className="text-sm font-semibold ml-1" style={{ color: 'var(--text-secondary)' }}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
