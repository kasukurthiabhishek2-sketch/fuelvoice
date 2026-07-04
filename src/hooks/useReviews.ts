/**
 * useReviews Hook
 * 
 * Manages review data for a station including:
 * - Paginated fetching with TanStack Query
 * - Sort order management
 * - Review creation
 * - Optimistic like updates
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReviews,
  createReview,
  toggleLike,
  hasUserLiked,
  hasUserReviewed,
  getUserLikes,
} from '@/lib/firebase/firestore';
import type { Review, ReviewFormData, ReviewSortOption } from '@/types/review';
import { useState } from 'react';

export function useReviews(stationId: string) {
  const [sortBy, setSortBy] = useState<ReviewSortOption>('newest');
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ['reviews', stationId, sortBy],
    queryFn: () => getReviews(stationId, sortBy, 20),
    enabled: !!stationId,
  });

  return {
    reviews: reviewsQuery.data?.reviews || [],
    hasMore: reviewsQuery.data?.hasMore || false,
    isLoading: reviewsQuery.isLoading,
    error: reviewsQuery.error,
    sortBy,
    setSortBy,
    refetch: reviewsQuery.refetch,
  };
}

export function useCreateReview(stationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      userName,
      userPhoto,
      formData,
    }: {
      userId: string;
      userName: string;
      userPhoto: string;
      formData: ReviewFormData;
    }) => createReview(stationId, userId, userName, userPhoto, formData),
    onSuccess: () => {
      // Invalidate reviews cache to refetch
      queryClient.invalidateQueries({ queryKey: ['reviews', stationId] });
      queryClient.invalidateQueries({ queryKey: ['station', stationId] });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, userId }: { reviewId: string; userId: string }) =>
      toggleLike(reviewId, userId),
    onSuccess: (_, variables) => {
      // Invalidate to refetch updated like counts
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-likes'] });
    },
  });
}

export function useUserLikes(reviewIds: string[], userId: string | undefined) {
  return useQuery({
    queryKey: ['user-likes', userId, ...reviewIds],
    queryFn: () => getUserLikes(reviewIds, userId!),
    enabled: !!userId && reviewIds.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useHasUserReviewed(stationId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['has-reviewed', stationId, userId],
    queryFn: () => hasUserReviewed(stationId, userId!),
    enabled: !!stationId && !!userId,
  });
}
