/**
 * Review card focused on evidence, not social noise.
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StarRating } from '@/components/ui/StarRating';
import { useAuth } from '@/hooks/useAuth';
import {
  useDeleteReview,
  useToggleReviewReaction,
  useUpdateReview,
} from '@/hooks/useReviews';
import { useToast } from '@/components/ui/Toast';
import { sanitizeText } from '@/lib/utils/sanitize';
import { timeAgo } from '@/lib/utils/format';
import { isReviewOwner } from '@/lib/firebase/reviewRepository';
import {
  COMPLAINT_CATEGORIES,
  type ComplaintCategory,
  type Review,
  type ReviewFormData,
  type ReviewReaction,
} from '@/types/review';

interface ReviewCardProps {
  review: Review;
  stationId: string;
  initialReaction?: ReviewReaction | null;
}

function legacyForm(review: Review): ReviewFormData {
  return {
    rating: review.rating,
    content: review.content || '',
    complaintCategories: review.complaintCategories || [],
    title: review.title || '',
    fuelQuality: review.fuelQuality || 0,
    service: review.service || 0,
    staffBehaviour: review.staffBehaviour || 0,
    cleanliness: review.cleanliness || 0,
    washroom: review.washroom || 0,
    airFilling: review.airFilling || 0,
    tags: review.tags || [],
    isAnonymous: false,
    suggestions: review.suggestions || '',
  };
}

export function ReviewCard({ review, stationId, initialReaction = null }: ReviewCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const reactionMutation = useToggleReviewReaction(stationId);
  const updateMutation = useUpdateReview(stationId);
  const deleteMutation = useDeleteReview(stationId);

  const [reaction, setReaction] = useState<ReviewReaction | null>(initialReaction);
  const [helpfulCount, setHelpfulCount] = useState(Math.max(0, review.helpfulCount || review.likeCount || 0));
  const [notHelpfulCount, setNotHelpfulCount] = useState(Math.max(0, review.notHelpfulCount || 0));
  const [showLowQuality, setShowLowQuality] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<ReviewFormData>(() => legacyForm(review));
  const [showDelete, setShowDelete] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [editError, setEditError] = useState('');

  const isOwner = Boolean(user && isReviewOwner(review.id, stationId, user.uid));
  const totalReactions = helpfulCount + notHelpfulCount;
  const isLowQuality = totalReactions >= 5 && notHelpfulCount / totalReactions >= 0.65;
  const edited = review.updatedAt.toMillis() - review.createdAt.toMillis() > 1000;
  const editContentId = `review-edit-content-${review.id}`;
  const editErrorId = `review-edit-error-${review.id}`;
  const deleteReasonId = `review-delete-reason-${review.id}`;
  const deleteHelpId = `review-delete-help-${review.id}`;

  const applyOptimisticReaction = (next: ReviewReaction | null) => {
    let helpful = helpfulCount;
    let notHelpful = notHelpfulCount;

    if (reaction === 'helpful') helpful = Math.max(0, helpful - 1);
    if (reaction === 'not-helpful') notHelpful = Math.max(0, notHelpful - 1);
    if (next === 'helpful') helpful += 1;
    if (next === 'not-helpful') notHelpful += 1;

    setHelpfulCount(helpful);
    setNotHelpfulCount(notHelpful);
    setReaction(next);
  };

  const handleReaction = async (nextReaction: ReviewReaction) => {
    if (!user) {
      toast('Sign in to mark reviews helpful or not helpful', 'info');
      return;
    }
    if (reactionMutation.isPending) return;

    const previousReaction = reaction;
    const previousHelpful = helpfulCount;
    const previousNotHelpful = notHelpfulCount;
    const optimisticNext = previousReaction === nextReaction ? null : nextReaction;
    applyOptimisticReaction(optimisticNext);

    try {
      const result = await reactionMutation.mutateAsync({
        reviewId: review.id,
        userId: user.uid,
        reaction: nextReaction,
      });
      setReaction(result);
    } catch {
      setReaction(previousReaction);
      setHelpfulCount(previousHelpful);
      setNotHelpfulCount(previousNotHelpful);
      toast('Could not update your reaction', 'error');
    }
  };

  const toggleEditCategory = (category: ComplaintCategory) => {
    setEditForm((current) => ({
      ...current,
      complaintCategories: current.complaintCategories.includes(category)
        ? current.complaintCategories.filter((item) => item !== category)
        : [...current.complaintCategories, category],
    }));
  };

  const saveEdit = async () => {
    if (!user) return;
    setEditError('');

    if (editForm.rating < 1 || editForm.rating > 5) {
      setEditError('Choose a rating from 1 to 5.');
      return;
    }
    if (editForm.rating <= 2 && editForm.complaintCategories.length === 0) {
      setEditError('Choose at least one complaint category for a 1-2 rating.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        reviewId: review.id,
        userId: user.uid,
        formData: {
          ...editForm,
          content: sanitizeText(editForm.content.trim()),
          complaintCategories: editForm.rating <= 2 ? editForm.complaintCategories : [],
          isAnonymous: false,
        },
      });
      setShowEdit(false);
      toast('Review updated', 'success');
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Could not update the review');
    }
  };

  const deleteReview = async () => {
    if (!user) return;
    if (deleteReason.trim().length < 10) {
      toast('Deletion reason must be at least 10 characters', 'info');
      return;
    }

    try {
      await deleteMutation.mutateAsync({
        reviewId: review.id,
        userId: user.uid,
        reason: deleteReason,
      });
      toast('Review removed', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not remove the review', 'error');
    }
  };

  if (isLowQuality && !showLowQuality) {
    return (
      <div className="review-card-muted" id={`review-${review.id}`}>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Review collapsed</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">
            At least 65% of 5+ reactions marked this review Not helpful.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowLowQuality(true)}
          className="secondary-action shrink-0"
        >
          Show review
        </button>
      </div>
    );
  }

  return (
    <article className="review-card" id={`review-${review.id}`}>
      <div className="flex items-start gap-3">
        {review.userPhoto ? (
          <Image
            src={review.userPhoto}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--bg-tertiary)] text-sm font-bold text-[var(--text-primary)]">
            {review.userName[0]?.toUpperCase() || 'U'}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-[var(--text-primary)]">{review.userName}</span>
            <span className="text-xs text-[var(--text-tertiary)]">{timeAgo(review.createdAt)}</span>
            {edited && <span className="text-xs text-[var(--text-tertiary)]">Edited</span>}
          </div>
          <div className="mt-1.5">
            <StarRating value={review.rating} size="sm" />
          </div>
        </div>

        {isOwner && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setShowEdit((value) => !value)}
              className="review-icon-button"
              aria-label="Edit your review"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m4 20 4.2-1 9.9-9.9-3.2-3.2L5 15.8 4 20Z" strokeLinejoin="round" />
                <path d="m13.8 7 3.2 3.2" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setShowDelete((value) => !value)}
              className="review-icon-button hover:text-rose-400"
              aria-label="Delete your review"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 7h14M9 7V4h6v3M8 10v7M12 10v7M16 10v7M7 7l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {review.complaintCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.complaintCategories.map((category) => (
            <span key={category} className="complaint-chip">
              {COMPLAINT_CATEGORIES[category]}
            </span>
          ))}
        </div>
      )}

      {review.content && (
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[var(--text-secondary)]">
          {review.content}
        </p>
      )}

      {showEdit && isOwner && (
        <div className="mt-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Edit review</p>
          <div className="mt-3">
            <StarRating
              value={editForm.rating}
              label="Edit rating"
              onChange={(rating) => setEditForm((current) => ({
                ...current,
                rating,
                complaintCategories: rating <= 2 ? current.complaintCategories : [],
              }))}
              size="md"
            />
          </div>

          {editForm.rating > 0 && editForm.rating <= 2 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.entries(COMPLAINT_CATEGORIES) as [ComplaintCategory, string][]).map(([category, label]) => {
                const selected = editForm.complaintCategories.includes(category);
                return (
                  <button
                    type="button"
                    key={category}
                    onClick={() => toggleEditCategory(category)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      selected
                        ? 'border-white bg-white text-black'
                        : 'border-[var(--border-primary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          <label htmlFor={editContentId} className="sr-only">Review context (optional)</label>
          <textarea
            id={editContentId}
            value={editForm.content}
            onChange={(event) => setEditForm((current) => ({ ...current, content: event.target.value }))}
            maxLength={2000}
            rows={4}
            placeholder="Add context (optional)"
            aria-invalid={editError ? true : undefined}
            aria-describedby={editError ? editErrorId : undefined}
            className="mt-4 w-full resize-none rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-strong)]"
          />

          {editError && <p id={editErrorId} className="mt-2 text-xs text-rose-400" role="alert">{editError}</p>}

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowEdit(false)} className="secondary-action">Cancel</button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={updateMutation.isPending}
              className="primary-action disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      {showDelete && isOwner && (
        <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Remove this review?</p>
          <p id={deleteHelpId} className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
            Tell us why. The reason is kept for audit purposes and is not shown publicly.
          </p>
          <label htmlFor={deleteReasonId} className="sr-only">Reason for deleting review</label>
          <textarea
            id={deleteReasonId}
            value={deleteReason}
            onChange={(event) => setDeleteReason(event.target.value)}
            minLength={10}
            maxLength={500}
            rows={2}
            placeholder="Reason for deletion, at least 10 characters"
            aria-describedby={deleteHelpId}
            className="mt-3 w-full resize-none rounded-xl border border-rose-500/20 bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-rose-400"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setShowDelete(false)} className="secondary-action">Keep review</button>
            <button
              type="button"
              onClick={deleteReview}
              disabled={deleteMutation.isPending || deleteReason.trim().length < 10}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-500 px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              {deleteMutation.isPending ? 'Removing…' : 'Remove review'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--border-secondary)] pt-4">
        <button
          type="button"
          onClick={() => handleReaction('helpful')}
          disabled={reactionMutation.isPending}
          className={`reaction-button ${reaction === 'helpful' ? 'reaction-button-active' : ''}`}
        >
          Helpful
          {helpfulCount > 0 && <span>{helpfulCount}</span>}
        </button>
        <button
          type="button"
          onClick={() => handleReaction('not-helpful')}
          disabled={reactionMutation.isPending}
          className={`reaction-button ${reaction === 'not-helpful' ? 'reaction-button-active' : ''}`}
        >
          Not helpful
          {notHelpfulCount > 0 && <span>{notHelpfulCount}</span>}
        </button>

        {isLowQuality && showLowQuality && (
          <button
            type="button"
            onClick={() => setShowLowQuality(false)}
            className="ml-auto text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            Collapse review
          </button>
        )}
      </div>
    </article>
  );
}
