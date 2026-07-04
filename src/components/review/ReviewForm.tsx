/**
 * Review Form Component
 * Multi-step form for creating a review with category ratings, tags, and anonymous option.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarRating } from '@/components/ui/StarRating';
import { useAuth } from '@/hooks/useAuth';
import { useCreateReview, useHasUserReviewed } from '@/hooks/useReviews';
import { useToast } from '@/components/ui/Toast';
import { sanitizeText, validateReviewContent, validateReviewTitle } from '@/lib/utils/sanitize';
import { REVIEW_TAGS, type ReviewTag, type ReviewFormData } from '@/types/review';
import { LoginButton } from '@/components/auth/LoginButton';

interface ReviewFormProps {
  stationId: string;
  stationName: string;
  onSuccess?: () => void;
}

const INITIAL_FORM: ReviewFormData = {
  title: '', content: '', rating: 0, fuelQuality: 0, service: 0,
  staffBehaviour: 0, cleanliness: 0, washroom: 0, airFilling: 0,
  tags: [], isAnonymous: false, suggestions: '',
};

export function ReviewForm({ stationId, stationName, onSuccess }: ReviewFormProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const mutation = useCreateReview(stationId);
  const { data: hasReviewed } = useHasUserReviewed(stationId, user?.uid);
  const [form, setForm] = useState<ReviewFormData>(INITIAL_FORM);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Sign in to leave a review</p>
        <LoginButton />
      </div>
    );
  }

  if (hasReviewed) {
    return (
      <div className="card p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>You&apos;ve already reviewed this station</p>
      </div>
    );
  }

  const toggleTag = (tag: ReviewTag) => {
    setForm(p => ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.rating === 0) errs.rating = 'Please select a rating';
    const te = validateReviewTitle(form.title); if (te) errs.title = te;
    const ce = validateReviewContent(form.content); if (ce) errs.content = ce;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await mutation.mutateAsync({
        userId: user.uid,
        userName: profile?.displayName || user.displayName || 'User',
        userPhoto: profile?.photoURL || user.photoURL || '',
        formData: { ...form, title: sanitizeText(form.title), content: sanitizeText(form.content), suggestions: sanitizeText(form.suggestions) },
      });
      toast('Review submitted!', 'success');
      setIsOpen(false);
      onSuccess?.();
    } catch { toast('Failed to submit review', 'error'); }
  };

  return (
    <div>
      {!isOpen && (
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setIsOpen(true)}
          className="w-full py-4 px-6 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-md hover:shadow-lg transition-all">
          ✍️ Write a Review for {stationName}
        </motion.button>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit} className="card p-6 space-y-5 overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Write a Review</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700" aria-label="Close">
                <svg className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Overall Rating *</label>
              <StarRating value={form.rating} onChange={v => { console.log("STARRATING CLICKED IN FORM:", v); setForm({ ...form, rating: v }); }} size="lg" />
              {errors.rating && <p className="text-xs text-danger-500 mt-1">{errors.rating}</p>}
            </div>

            <div>
              <label htmlFor="review-title" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Title *</label>
              <input id="review-title" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Sum up your experience" maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-brand-500 transition-colors"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
              {errors.title && <p className="text-xs text-danger-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="review-content" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Your Review *</label>
              <textarea id="review-content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Describe your experience…" rows={4} maxLength={2000}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-brand-500 resize-none transition-colors"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
              <div className="flex justify-between mt-1">
                {errors.content && <p className="text-xs text-danger-500">{errors.content}</p>}
                <p className="text-xs ml-auto" style={{ color: 'var(--text-tertiary)' }}>{form.content.length}/2000</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Category Ratings <span className="text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>(optional)</span></p>
              <div className="grid gap-3 sm:grid-cols-2">
                {([['Fuel Quality','fuelQuality'],['Service','service'],['Staff','staffBehaviour'],['Cleanliness','cleanliness'],['Washroom','washroom'],['Air Filling','airFilling']] as const).map(([label, key]) => (
                  <div key={key} className="flex items-center justify-between gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <StarRating value={form[key]} onChange={v => setForm({ ...form, [key]: v })} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Tags <span className="text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>(optional)</span></p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(REVIEW_TAGS) as [ReviewTag, { label: string; color: string }][]).map(([tag, info]) => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.tags.includes(tag) ? 'bg-brand-500/10 text-brand-500 border-brand-500/30' : 'hover:bg-surface-100 dark:hover:bg-surface-700'}`}
                    style={!form.tags.includes(tag) ? { color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' } : undefined}>
                    {info.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm({ ...form, isAnonymous: !form.isAnonymous })}
                className={`relative w-10 h-6 rounded-full transition-colors ${form.isAnonymous ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-600'}`}
                role="switch" aria-checked={form.isAnonymous} aria-label="Post anonymously">
                <motion.div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                  animate={{ left: form.isAnonymous ? 18 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </button>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Post anonymously</span>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }}>Cancel</button>
              <motion.button whileTap={{ scale: 0.99 }} type="submit" disabled={mutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 transition-all">
                {mutation.isPending ? 'Submitting…' : 'Submit Review'}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
