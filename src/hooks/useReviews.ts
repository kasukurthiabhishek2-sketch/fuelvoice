/**
 * Review queries and mutations for the trust-first station experience.
 */

'use client';

import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { DocumentSnapshot } from 'firebase/firestore';
import {
  createReviewV2,
  deleteReviewV2,
  getReviewsV2,
  getUserActiveReviewCount,
  getUserReviewReactions,
  toggleReviewReaction,
  updateReviewV2,
} from '@/lib/firebase/reviewRepository';
import type {
  ComplaintCategory,
  ReviewFormData,
  ReviewReaction,
  ReviewSortOption,
} from '@/types/review';

export function useReviews(stationId: string) {
  const [sortBy, setSortBy] = useState<ReviewSortOption>('risk-first');
  const [category, setCategory] = useState<ComplaintCategory | null>(null);

  const queryResult = useInfiniteQuery({
    queryKey: ['reviews', stationId, sortBy, category],
    queryFn: ({ pageParam }) => getReviewsV2(stationId, sortBy, 20, pageParam, category),
    initialPageParam: undefined as DocumentSnapshot | undefined,
    getNextPageParam: (lastPage) => lastPage.lastDoc || undefined,
    enabled: Boolean(stationId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  return {
    reviews: queryResult.data ? queryResult.data.pages.flatMap((page) => page.reviews) : [],
    hasMore: queryResult.hasNextPage,
    fetchNextPage: queryResult.fetchNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    sortBy,
    setSortBy,
    category,
    setCategory,
  };
}

function invalidateReviewSurface(queryClient: ReturnType<typeof useQueryClient>, stationId: string, userId?: string) {
  queryClient.invalidateQueries({ queryKey: ['reviews', stationId] });
  queryClient.invalidateQueries({ queryKey: ['station', stationId] });
  if (userId) queryClient.invalidateQueries({ queryKey: ['review-capacity', stationId, userId] });
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
    }) => createReviewV2(stationId, userId, userName, userPhoto, formData),
    onSuccess: (_result, variables) => {
      invalidateReviewSurface(queryClient, stationId, variables.userId);
    },
  });
}

export function useUpdateReview(stationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      userId,
      formData,
    }: {
      reviewId: string;
      userId: string;
      formData: ReviewFormData;
    }) => updateReviewV2(reviewId, stationId, userId, formData),
    onSuccess: (_result, variables) => {
      invalidateReviewSurface(queryClient, stationId, variables.userId);
    },
  });
}

export function useDeleteReview(stationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      userId,
      reason,
    }: {
      reviewId: string;
      userId: string;
      reason: string;
    }) => deleteReviewV2(reviewId, stationId, userId, reason),
    onSuccess: (_result, variables) => {
      invalidateReviewSurface(queryClient, stationId, variables.userId);
    },
  });
}

export function useToggleReviewReaction(stationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      userId,
      reaction,
    }: {
      reviewId: string;
      userId: string;
      reaction: ReviewReaction;
    }) => toggleReviewReaction(reviewId, userId, reaction),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', stationId] });
      queryClient.invalidateQueries({ queryKey: ['review-reactions', variables.userId] });
    },
  });
}

export function useUserReviewReactions(reviewIds: string[], userId?: string) {
  return useQuery({
    queryKey: ['review-reactions', userId, ...reviewIds],
    queryFn: () => getUserReviewReactions(reviewIds, userId!),
    enabled: Boolean(userId && reviewIds.length),
    staleTime: 30_000,
  });
}

export function useUserActiveReviewCount(stationId: string, userId?: string) {
  return useQuery({
    queryKey: ['review-capacity', stationId, userId],
    queryFn: () => getUserActiveReviewCount(stationId, userId!),
    enabled: Boolean(stationId && userId),
    staleTime: 30_000,
  });
}
