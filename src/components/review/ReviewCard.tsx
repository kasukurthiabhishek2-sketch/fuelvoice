/**
 * Review Card Component
 * 
 * Premium card design for displaying individual reviews.
 * Includes avatar, rating, tags, like button, and report action.
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StarRating } from '@/components/ui/StarRating';
import { useAuth } from '@/hooks/useAuth';
import { useToggleLike } from '@/hooks/useReviews';
import { useToast } from '@/components/ui/Toast';
import { createReport } from '@/lib/firebase/firestore';
import { timeAgo } from '@/lib/utils/format';
import { REVIEW_TAGS, type ReviewTag } from '@/types/review';
import type { Review } from '@/types/review';
import type { ReportReason } from '@/types/user';

interface ReviewCardProps {
  review: Review;
  isLiked?: boolean;
  stationId: string;
}

export function ReviewCard({ review, isLiked: initialIsLiked = false, stationId }: ReviewCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const toggleLikeMutation = useToggleLike();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(review.likeCount || 0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast('Please sign in to like reviews', 'info');
      return;
    }

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      await toggleLikeMutation.mutateAsync({
        reviewId: review.id,
        userId: user.uid,
      });
    } catch {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
      toast('Failed to update like', 'error');
    }
  };

  const handleReport = async (reason: ReportReason) => {
    if (!user) return;

    try {
      await createReport(review.id, stationId, user.uid, reason, '');
      toast('Report submitted. Thank you for keeping FuelVoice safe.', 'success');
      setShowReportDialog(false);
    } catch {
      toast('Failed to submit report', 'error');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/station/${stationId}#review-${review.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: review.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Link copied to clipboard', 'success');
      }
    } catch {
      // User cancelled share
    }
  };

  const isLongContent = review.content.length > 300;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 sm:p-6"
      id={`review-${review.id}`}
    >
      {/* Header: Avatar + Name + Rating + Time */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {review.userPhoto && !review.isAnonymous ? (
            <Image
              src={review.userPhoto}
              alt={review.userName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
              {review.isAnonymous ? '?' : review.userName[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {review.isAnonymous ? 'Anonymous' : review.userName}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {timeAgo(review.createdAt)}
            </span>
            {review.isFeatured && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent-500/10 text-accent-600">
                ⭐ Featured
              </span>
            )}
          </div>
          <div className="mt-1">
            <StarRating value={review.rating} size="sm" />
          </div>
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="mt-3 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {review.title}
        </h3>
      )}

      {/* Content */}
      <p
        className="mt-2 text-sm leading-relaxed whitespace-pre-line"
        style={{ color: 'var(--text-secondary)' }}
      >
        {isLongContent && !expanded ? review.content.slice(0, 300) + '…' : review.content}
      </p>
      {isLongContent && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-brand-500 hover:text-brand-600 mt-1 transition-colors"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Category scores */}
      {(review.fuelQuality > 0 || review.service > 0 || review.cleanliness > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.fuelQuality > 0 && <ScoreBadge label="Fuel Quality" score={review.fuelQuality} />}
          {review.service > 0 && <ScoreBadge label="Service" score={review.service} />}
          {review.cleanliness > 0 && <ScoreBadge label="Cleanliness" score={review.cleanliness} />}
          {review.staffBehaviour > 0 && <ScoreBadge label="Staff" score={review.staffBehaviour} />}
        </div>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.tags.map((tag) => {
            const tagInfo = REVIEW_TAGS[tag as ReviewTag];
            if (!tagInfo) return null;
            const colorClasses = {
              red: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
              amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
              green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
              blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            };
            return (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses[tagInfo.color]}`}
              >
                {tagInfo.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Actions: Like, Share, Report */}
      <div className="mt-4 flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isLiked
              ? 'bg-brand-500/10 text-brand-500'
              : 'hover:bg-surface-100 dark:hover:bg-surface-700'
          }`}
          style={!isLiked ? { color: 'var(--text-secondary)' } : undefined}
          aria-label={isLiked ? 'Unlike review' : 'Like review'}
        >
          <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          {likeCount > 0 && likeCount}
        </motion.button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-surface-100 dark:hover:bg-surface-700"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Share review"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>

        <button
          onClick={() => {
            if (!user) {
              toast('Please sign in to report reviews', 'info');
              return;
            }
            setShowReportDialog(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-surface-100 dark:hover:bg-surface-700 ml-auto"
          style={{ color: 'var(--text-tertiary)' }}
          aria-label="Report review"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        </button>
      </div>

      {/* Report Dialog */}
      {showReportDialog && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-4 rounded-xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Why are you reporting this review?
          </p>
          <div className="flex flex-wrap gap-2">
            {(['spam', 'abuse', 'misinformation', 'harassment'] as ReportReason[]).map((reason) => (
              <button
                key={reason}
                onClick={() => handleReport(reason)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }}
              >
                {reason.charAt(0).toUpperCase() + reason.slice(1)}
              </button>
            ))}
            <button
              onClick={() => setShowReportDialog(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-surface-100 dark:hover:bg-surface-700"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
    >
      {label}: {score}/5
    </span>
  );
}
