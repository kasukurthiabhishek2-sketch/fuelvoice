/**
 * Compact review composer.
 *
 * A rating is required. Written context is optional. Ratings of 1-2 require at
 * least one explicit complaint category; FuelVoice never infers complaint type.
 */

'use client';

import React, { useRef, useState } from 'react';
import { StarRating } from '@/components/ui/StarRating';
import { LoginButton } from '@/components/auth/LoginButton';
import { useAuth } from '@/hooks/useAuth';
import { useCreateReview, useUserActiveReviewCount } from '@/hooks/useReviews';
import { useToast } from '@/components/ui/Toast';
import { sanitizeText } from '@/lib/utils/sanitize';
import {
  COMPLAINT_CATEGORIES,
  type ComplaintCategory,
  type ReviewFormData,
} from '@/types/review';
import { MAX_ACTIVE_REVIEWS_PER_STATION } from '@/lib/firebase/reviewRepository';

interface ReviewFormProps {
  stationId: string;
  stationName: string;
  onSuccess?: () => void;
}

const INITIAL_FORM: ReviewFormData = {
  rating: 0,
  content: '',
  complaintCategories: [],
  title: '',
  fuelQuality: 0,
  service: 0,
  staffBehaviour: 0,
  cleanliness: 0,
  washroom: 0,
  airFilling: 0,
  tags: [],
  isAnonymous: false,
  suggestions: '',
};

export function ReviewForm({ stationId, stationName, onSuccess }: ReviewFormProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const createReview = useCreateReview(stationId);
  const { data: activeCount = 0, isLoading: countLoading } = useUserActiveReviewCount(stationId, user?.uid);
  const [form, setForm] = useState<ReviewFormData>(INITIAL_FORM);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitGuardRef = useRef(false);

  const remaining = Math.max(0, MAX_ACTIVE_REVIEWS_PER_STATION - activeCount);

  if (!user) {
    return (
      <div id="write-review" className="review-composer-shell scroll-mt-28 p-5 sm:p-6">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Share your experience</p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Reading is open to everyone. Sign in only when you want to add a review.
        </p>
        <div className="mt-4"><LoginButton /></div>
      </div>
    );
  }

  if (profile?.isBanned) {
    return (
      <div id="write-review" className="review-composer-shell scroll-mt-28 p-5 sm:p-6">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Reviews are unavailable for this account.</p>
      </div>
    );
  }

  if (!countLoading && remaining === 0) {
    return (
      <div id="write-review" className="review-composer-shell scroll-mt-28 p-5 sm:p-6">
        <p className="text-sm font-semibold text-[var(--text-primary)]">You have 3 active reviews for this station.</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Delete one of your reviews to free a slot.
        </p>
      </div>
    );
  }

  const setRating = (rating: number) => {
    setForm((current) => ({
      ...current,
      rating,
      complaintCategories: rating <= 2 ? current.complaintCategories : [],
    }));
    setErrors((current) => ({ ...current, rating: '', categories: '' }));
  };

  const toggleCategory = (category: ComplaintCategory) => {
    setForm((current) => ({
      ...current,
      complaintCategories: current.complaintCategories.includes(category)
        ? current.complaintCategories.filter((item) => item !== category)
        : [...current.complaintCategories, category],
    }));
    setErrors((current) => ({ ...current, categories: '' }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitGuardRef.current) return;

    const nextErrors: Record<string, string> = {};

    if (form.rating < 1 || form.rating > 5) nextErrors.rating = 'Choose a rating from 1 to 5.';
    if (form.content.length > 2000) nextErrors.content = 'Keep the review under 2000 characters.';
    if (form.rating <= 2 && form.complaintCategories.length === 0) {
      nextErrors.categories = 'Choose at least one complaint category.';
    }

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    submitGuardRef.current = true;
    try {
      await createReview.mutateAsync({
        userId: user.uid,
        userName: profile?.displayName || user.displayName || 'FuelVoice user',
        userPhoto: profile?.photoURL || user.photoURL || '',
        formData: {
          ...form,
          content: sanitizeText(form.content.trim()),
          isAnonymous: false,
        },
      });
      setForm(INITIAL_FORM);
      setIsOpen(false);
      toast('Review published', 'success');
      onSuccess?.();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not publish the review', 'error');
    } finally {
      submitGuardRef.current = false;
    }
  };

  return (
    <div id="write-review" className="scroll-mt-28">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="review-composer-shell group flex w-full items-center justify-between gap-4 p-5 text-left transition hover:border-[var(--border-strong)] sm:p-6"
          aria-expanded="false"
          aria-controls="review-form-panel"
        >
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Write a review</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Start with a rating. Add context only when it helps another customer. {countLoading ? '' : `${remaining} review slot${remaining === 1 ? '' : 's'} remaining.`}
            </p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-black transition-transform group-hover:translate-x-0.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      ) : (
        <form id="review-form-panel" onSubmit={handleSubmit} className="review-composer-shell p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold tracking-[-0.03em] text-[var(--text-primary)]">Review {stationName}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Your rating contributes to the station Trust Score once enough reviews exist.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              aria-label="Close review form"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m7 7 10 10M17 7 7 17" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mt-6">
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Your rating</label>
            <div className="mt-3"><StarRating value={form.rating} onChange={setRating} size="lg" label="Your rating" /></div>
            {errors.rating && <p className="mt-2 text-xs text-rose-400" role="alert">{errors.rating}</p>}
          </div>

          {form.rating > 0 && form.rating <= 2 && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                What went wrong?
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Choose every category that applies.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.entries(COMPLAINT_CATEGORIES) as [ComplaintCategory, string][]).map(([value, label]) => {
                  const selected = form.complaintCategories.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleCategory(value)}
                      aria-pressed={selected}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        selected
                          ? 'border-white bg-white text-black'
                          : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {errors.categories && <p className="mt-2 text-xs text-rose-400" role="alert">{errors.categories}</p>}
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="review-content" className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
              Add context <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="review-content"
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              placeholder="What should another customer know?"
              rows={4}
              maxLength={2000}
              aria-invalid={Boolean(errors.content)}
              aria-describedby={errors.content ? 'review-content-error' : undefined}
              className="mt-3 w-full resize-none rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--border-strong)]"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              {errors.content ? <p id="review-content-error" className="text-xs text-rose-400" role="alert">{errors.content}</p> : <span />}
              <span className="text-xs text-[var(--text-tertiary)]">{form.content.length}/2000</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="secondary-action"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createReview.isPending}
              className="primary-action disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createReview.isPending ? 'Publishing…' : 'Publish review'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
