/**
 * Review repository for the trust-first FuelVoice experience.
 *
 * The browser remains the aggregation authority for now. Firestore rules limit
 * ownership and reaction writes, while a future trusted backend can take over
 * aggregate recomputation without changing the UI contract.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import { getOrCreateStation } from './firestore';
import { getStationByOsmId } from '@/lib/api/overpass';
import { canUseE2EMocks } from '@/lib/testing/e2e';
import { calculateTrustScore } from '@/lib/trust/trustScore';
import type {
  ComplaintCategory,
  Review,
  ReviewFormData,
  ReviewReaction,
  ReviewSortOption,
} from '@/types/review';

const MAX_ACTIVE_REVIEWS_PER_STATION = 3;
const PAGE_SIZE = 20;

function isMockMode(): boolean {
  if (!canUseE2EMocks() || typeof window === 'undefined') return false;
  const value = localStorage.getItem('fuelvoice:mock_user');
  return value === 'true' || value === 'admin';
}

function normalizeReview(id: string, raw: Record<string, unknown>): Review {
  const createdAt = raw.createdAt instanceof Timestamp ? raw.createdAt : Timestamp.now();
  const updatedAt = raw.updatedAt instanceof Timestamp ? raw.updatedAt : createdAt;
  const legacyTags = Array.isArray(raw.tags) ? raw.tags : [];
  const categories = Array.isArray(raw.complaintCategories) ? raw.complaintCategories : [];

  return {
    id,
    stationId: typeof raw.stationId === 'string' ? raw.stationId : '',
    userId: typeof raw.userId === 'string' ? raw.userId : undefined,
    userName: typeof raw.userName === 'string' ? raw.userName : 'FuelVoice user',
    userPhoto: typeof raw.userPhoto === 'string' ? raw.userPhoto : '',
    rating: typeof raw.rating === 'number' ? raw.rating : 0,
    content: typeof raw.content === 'string' ? raw.content : '',
    complaintCategories: categories as ComplaintCategory[],
    reviewerJoinedAt: raw.reviewerJoinedAt instanceof Timestamp ? raw.reviewerJoinedAt : undefined,
    helpfulCount: typeof raw.helpfulCount === 'number'
      ? Math.max(0, raw.helpfulCount)
      : typeof raw.likeCount === 'number'
        ? Math.max(0, raw.likeCount)
        : 0,
    notHelpfulCount: typeof raw.notHelpfulCount === 'number' ? Math.max(0, raw.notHelpfulCount) : 0,
    isHidden: raw.isHidden === true,
    isFeatured: raw.isFeatured === true,
    createdAt,
    updatedAt,

    title: typeof raw.title === 'string' ? raw.title : '',
    fuelQuality: typeof raw.fuelQuality === 'number' ? raw.fuelQuality : 0,
    service: typeof raw.service === 'number' ? raw.service : 0,
    staffBehaviour: typeof raw.staffBehaviour === 'number' ? raw.staffBehaviour : 0,
    cleanliness: typeof raw.cleanliness === 'number' ? raw.cleanliness : 0,
    washroom: typeof raw.washroom === 'number' ? raw.washroom : 0,
    airFilling: typeof raw.airFilling === 'number' ? raw.airFilling : 0,
    tags: legacyTags as Review['tags'],
    isAnonymous: raw.isAnonymous === true,
    likeCount: typeof raw.likeCount === 'number' ? Math.max(0, raw.likeCount) : 0,
    reportCount: typeof raw.reportCount === 'number' ? Math.max(0, raw.reportCount) : 0,
    suggestions: typeof raw.suggestions === 'string' ? raw.suggestions : '',
  };
}

function reviewIdCandidates(stationId: string, userId: string): string[] {
  return [
    `${stationId}__${userId}`,
    `${stationId}__${userId}__1`,
    `${stationId}__${userId}__2`,
    `${stationId}__${userId}__3`,
  ];
}

export function isReviewOwner(reviewId: string, stationId: string, userId: string): boolean {
  return reviewIdCandidates(stationId, userId).includes(reviewId);
}

function validateReviewForm(formData: ReviewFormData): void {
  if (!Number.isInteger(formData.rating) || formData.rating < 1 || formData.rating > 5) {
    throw new Error('Choose a rating from 1 to 5');
  }
  if (formData.content.length > 2000) {
    throw new Error('Review text must be 2000 characters or fewer');
  }
  if (formData.rating <= 2 && formData.complaintCategories.length === 0) {
    throw new Error('Choose at least one complaint category for a 1-2 rating');
  }
  if (formData.complaintCategories.length > 8) {
    throw new Error('Too many complaint categories selected');
  }
}

async function ensureStationExists(stationId: string): Promise<void> {
  const existing = await getDoc(doc(db, 'stations', stationId));
  if (existing.exists()) return;

  const match = /^(node|way|relation)_([1-9][0-9]*)$/.exec(stationId);
  if (!match) throw new Error('Invalid station ID');

  const element = await getStationByOsmId(match[1], Number(match[2]));
  if (!element) throw new Error('Station could not be loaded');

  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat === undefined || lng === undefined) throw new Error('Station has no usable coordinates');

  await getOrCreateStation({
    id: stationId,
    name: tags.name || tags.brand || tags.operator || 'Fuel Station',
    brand: tags.brand || tags.operator || '',
    operator: tags.operator || '',
    address: [
      tags['addr:street'],
      tags['addr:city'],
      tags['addr:state'],
      tags['addr:country'],
    ].filter(Boolean).join(', '),
    addressComponents: {
      street: tags['addr:street'],
      city: tags['addr:city'],
      state: tags['addr:state'],
      country: tags['addr:country'],
      countryCode: tags['addr:country_code'] || tags['ISO3166-1:alpha2'],
    },
    lat,
    lng,
    phone: tags.phone || tags['contact:phone'] || '',
    website: tags.website || tags['contact:website'] || '',
    openingHours: tags.opening_hours || '',
    fuelTypes: [],
    osmTags: tags,
  });
}

export async function getUserActiveReviewCount(stationId: string, userId: string): Promise<number> {
  if (isMockMode()) {
    const key = `fuelvoice:mock_user_reviews:${stationId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]') as Array<{ userId?: string }>;
    return stored.filter((review) => review.userId === userId).length;
  }

  const snapshots = await Promise.all(
    reviewIdCandidates(stationId, userId).map((reviewId) => getDoc(doc(db, 'reviews', reviewId))),
  );
  return Math.min(
    MAX_ACTIVE_REVIEWS_PER_STATION,
    snapshots.reduce((count, snapshot) => count + (snapshot.exists() ? 1 : 0), 0),
  );
}

function mockReviews(stationId: string): Review[] {
  const key = `fuelvoice:mock_user_reviews:${stationId}`;
  const stored = typeof window === 'undefined'
    ? []
    : JSON.parse(localStorage.getItem(key) || '[]') as Array<Record<string, unknown>>;

  const base = Array.from({ length: 12 }, (_, index) => {
    const rating = [1, 2, 2, 3, 4, 5][index % 6];
    const createdAt = Timestamp.fromMillis(Date.now() - index * 3_600_000);
    return normalizeReview(`mock-review-${index + 1}`, {
      stationId,
      userName: `Driver ${index + 1}`,
      userPhoto: '',
      rating,
      content: rating <= 2
        ? 'The visit had issues that other drivers may want to know about.'
        : 'Straightforward visit with no major issue to report.',
      complaintCategories: rating <= 2
        ? [index % 2 === 0 ? 'fuel-quality' : 'short-filling']
        : [],
      helpfulCount: (index * 3) % 8,
      notHelpfulCount: index === 2 ? 5 : index % 3,
      reviewerJoinedAt: Timestamp.fromMillis(createdAt.toMillis() - (60 + index * 45) * 86_400_000),
      createdAt,
      updatedAt: createdAt,
      isHidden: false,
      isFeatured: false,
    });
  });

  return [...stored.map((item, index) => normalizeReview(String(item.id || `mock-user-${index}`), item)), ...base];
}

export async function getReviewsV2(
  stationId: string,
  sortBy: ReviewSortOption = 'risk-first',
  pageSize: number = PAGE_SIZE,
  lastDoc?: DocumentSnapshot,
  category?: ComplaintCategory | null,
): Promise<{ reviews: Review[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  if (isMockMode()) {
    let reviews = mockReviews(stationId);
    if (category) reviews = reviews.filter((review) => review.complaintCategories.includes(category));

    if (sortBy === 'newest') {
      reviews.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    } else if (sortBy === 'most-helpful') {
      reviews.sort((a, b) => b.helpfulCount - a.helpfulCount || b.createdAt.toMillis() - a.createdAt.toMillis());
    } else {
      reviews.sort((a, b) => a.rating - b.rating || b.complaintCategories.length - a.complaintCategories.length || b.createdAt.toMillis() - a.createdAt.toMillis());
    }

    const start = lastDoc ? Number(lastDoc.id.replace('mock-page-', '')) || 0 : 0;
    const page = reviews.slice(start, start + pageSize);
    const hasMore = start + pageSize < reviews.length;
    return {
      reviews: page,
      lastDoc: hasMore ? ({ id: `mock-page-${start + pageSize}` } as DocumentSnapshot) : null,
      hasMore,
    };
  }

  const constraints: QueryConstraint[] = [
    where('stationId', '==', stationId),
    where('isHidden', '==', false),
  ];
  if (category) constraints.push(where('complaintCategories', 'array-contains', category));

  if (sortBy === 'risk-first') {
    constraints.push(orderBy('rating', 'asc'), orderBy('createdAt', 'desc'));
  } else {
    // Most-helpful is sorted client-side per loaded page so legacy reviews
    // without helpfulCount remain visible.
    constraints.push(orderBy('createdAt', 'desc'));
  }

  if (lastDoc) constraints.push(startAfter(lastDoc));
  constraints.push(limit(pageSize + 1));

  const snapshot = await getDocs(query(collection(db, 'reviews'), ...constraints));
  const docs = snapshot.docs;
  const hasMore = docs.length > pageSize;
  const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
  let reviews = pageDocs.map((item) => normalizeReview(item.id, item.data()));

  if (sortBy === 'most-helpful') {
    reviews = reviews.sort(
      (a, b) => b.helpfulCount - a.helpfulCount || b.createdAt.toMillis() - a.createdAt.toMillis(),
    );
  }

  return {
    reviews,
    lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
    hasMore,
  };
}

async function getAllVisibleReviews(stationId: string): Promise<Review[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'reviews'),
      where('stationId', '==', stationId),
      where('isHidden', '==', false),
    ),
  );
  return snapshot.docs.map((item) => normalizeReview(item.id, item.data()));
}

async function recalculateStationTrust(stationId: string): Promise<void> {
  if (isMockMode()) return;

  const reviews = await getAllVisibleReviews(stationId);
  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount) * 10) / 10
    : 0;
  const complaintCount = reviews.filter((review) => review.rating <= 2).length;
  const trustScore = calculateTrustScore(reviews);

  await updateDoc(doc(db, 'stations', stationId), {
    reviewCount,
    avgRating,
    complaintCount,
    trustScore: trustScore ?? 0,
    lastUpdated: new Date().toISOString(),
  });
}

export async function createReviewV2(
  stationId: string,
  userId: string,
  userName: string,
  userPhoto: string,
  formData: ReviewFormData,
): Promise<string> {
  validateReviewForm(formData);

  if (isMockMode()) {
    const count = await getUserActiveReviewCount(stationId, userId);
    if (count >= MAX_ACTIVE_REVIEWS_PER_STATION) {
      throw new Error('You already have 3 active reviews for this station');
    }
    const key = `fuelvoice:mock_user_reviews:${stationId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]') as Array<Record<string, unknown>>;
    const now = Timestamp.now();
    const review = normalizeReview(`mock-user-review-${Date.now()}`, {
      stationId,
      userId,
      userName,
      userPhoto,
      rating: formData.rating,
      content: formData.content,
      complaintCategories: formData.complaintCategories,
      reviewerJoinedAt: Timestamp.fromMillis(now.toMillis() - 400 * 86_400_000),
      helpfulCount: 0,
      notHelpfulCount: 0,
      createdAt: now,
      updatedAt: now,
      isHidden: false,
      isFeatured: false,
    });
    localStorage.setItem(key, JSON.stringify([review, ...stored]));
    return review.id;
  }

  await ensureStationExists(stationId);

  const candidates = reviewIdCandidates(stationId, userId);
  const existing = await Promise.all(
    candidates.map((reviewId) => getDoc(doc(db, 'reviews', reviewId))),
  );
  const activeCount = existing.filter((snapshot) => snapshot.exists()).length;
  if (activeCount >= MAX_ACTIVE_REVIEWS_PER_STATION) {
    throw new Error('You already have 3 active reviews for this station');
  }

  const slotCandidates = candidates.slice(1);
  const selectedId = slotCandidates.find((reviewId) => {
    const index = candidates.indexOf(reviewId);
    return !existing[index]?.exists();
  });
  if (!selectedId) throw new Error('No review slot is available');

  const reviewRef = doc(db, 'reviews', selectedId);
  const userRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const [reviewSnap, userSnap] = await Promise.all([
      transaction.get(reviewRef),
      transaction.get(userRef),
    ]);
    if (reviewSnap.exists()) throw new Error('That review slot was just used. Try again.');
    if (!userSnap.exists()) throw new Error('Your profile could not be loaded');

    const joinedAt = userSnap.data().createdAt instanceof Timestamp
      ? userSnap.data().createdAt
      : Timestamp.now();

    transaction.set(reviewRef, {
      id: selectedId,
      stationId,
      userName,
      userPhoto,
      rating: formData.rating,
      content: formData.content,
      complaintCategories: formData.complaintCategories,
      reviewerJoinedAt: joinedAt,
      helpfulCount: 0,
      notHelpfulCount: 0,
      isHidden: false,
      isFeatured: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      title: '',
      fuelQuality: 0,
      service: 0,
      staffBehaviour: 0,
      cleanliness: 0,
      washroom: 0,
      airFilling: 0,
      tags: [],
      isAnonymous: false,
      likeCount: 0,
      reportCount: 0,
      suggestions: '',
    });

    transaction.update(userRef, {
      reviewCount: increment(1),
      lastReviewAt: serverTimestamp(),
    });
  });

  await recalculateStationTrust(stationId);
  return selectedId;
}

export async function updateReviewV2(
  reviewId: string,
  stationId: string,
  userId: string,
  formData: ReviewFormData,
): Promise<void> {
  validateReviewForm(formData);
  if (!isReviewOwner(reviewId, stationId, userId)) throw new Error('You cannot edit this review');

  if (isMockMode()) {
    const key = `fuelvoice:mock_user_reviews:${stationId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]') as Array<Record<string, unknown>>;
    const next = stored.map((item) => item.id === reviewId
      ? {
          ...item,
          rating: formData.rating,
          content: formData.content,
          complaintCategories: formData.complaintCategories,
          updatedAt: Timestamp.now(),
        }
      : item);
    localStorage.setItem(key, JSON.stringify(next));
    return;
  }

  await updateDoc(doc(db, 'reviews', reviewId), {
    rating: formData.rating,
    content: formData.content,
    complaintCategories: formData.complaintCategories,
    updatedAt: serverTimestamp(),
  });
  await recalculateStationTrust(stationId);
}

export async function deleteReviewV2(
  reviewId: string,
  stationId: string,
  userId: string,
  reason: string,
): Promise<void> {
  const cleanReason = reason.trim();
  if (cleanReason.length < 10) throw new Error('Deletion reason must be at least 10 characters');
  if (!isReviewOwner(reviewId, stationId, userId)) throw new Error('You cannot delete this review');

  if (isMockMode()) {
    const key = `fuelvoice:mock_user_reviews:${stationId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]') as Array<Record<string, unknown>>;
    localStorage.setItem(key, JSON.stringify(stored.filter((item) => item.id !== reviewId)));
    return;
  }

  const reviewRef = doc(db, 'reviews', reviewId);
  const auditRef = doc(db, 'reviewDeletions', reviewId);

  await runTransaction(db, async (transaction) => {
    const reviewSnap = await transaction.get(reviewRef);
    if (!reviewSnap.exists()) throw new Error('Review no longer exists');

    transaction.set(auditRef, {
      reviewId,
      stationId,
      deletedBy: userId,
      reason: cleanReason,
      deletedAt: serverTimestamp(),
    });
    transaction.delete(reviewRef);
  });

  await recalculateStationTrust(stationId);
}

export async function toggleReviewReaction(
  reviewId: string,
  userId: string,
  reaction: ReviewReaction,
): Promise<ReviewReaction | null> {
  if (isMockMode()) {
    const key = 'fuelvoice:mock_review_reactions';
    const stored = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, ReviewReaction>;
    const compound = `${reviewId}__${userId}`;
    if (stored[compound] === reaction) delete stored[compound];
    else stored[compound] = reaction;
    localStorage.setItem(key, JSON.stringify(stored));
    return stored[compound] || null;
  }

  const reactionRef = doc(db, 'reviewReactions', `${reviewId}__${userId}`);
  const reviewRef = doc(db, 'reviews', reviewId);

  return runTransaction(db, async (transaction) => {
    const [reactionSnap, reviewSnap] = await Promise.all([
      transaction.get(reactionRef),
      transaction.get(reviewRef),
    ]);
    if (!reviewSnap.exists()) throw new Error('Review no longer exists');

    const reviewData = reviewSnap.data();
    let helpfulCount = Math.max(0, Number(reviewData.helpfulCount ?? reviewData.likeCount) || 0);
    let notHelpfulCount = Math.max(0, Number(reviewData.notHelpfulCount) || 0);
    const previous = reactionSnap.exists()
      ? reactionSnap.data().reaction as ReviewReaction
      : null;

    let next: ReviewReaction | null = reaction;
    if (previous === reaction) {
      next = null;
      if (reaction === 'helpful') helpfulCount = Math.max(0, helpfulCount - 1);
      else notHelpfulCount = Math.max(0, notHelpfulCount - 1);
      transaction.delete(reactionRef);
    } else {
      if (previous === 'helpful') helpfulCount = Math.max(0, helpfulCount - 1);
      if (previous === 'not-helpful') notHelpfulCount = Math.max(0, notHelpfulCount - 1);
      if (reaction === 'helpful') helpfulCount += 1;
      else notHelpfulCount += 1;

      transaction.set(reactionRef, {
        reviewId,
        userId,
        reaction,
        updatedAt: serverTimestamp(),
      });
    }

    transaction.update(reviewRef, { helpfulCount, notHelpfulCount });
    return next;
  });
}

export async function getUserReviewReactions(
  reviewIds: string[],
  userId: string,
): Promise<Map<string, ReviewReaction>> {
  const result = new Map<string, ReviewReaction>();
  if (reviewIds.length === 0) return result;

  if (isMockMode()) {
    const stored = JSON.parse(localStorage.getItem('fuelvoice:mock_review_reactions') || '{}') as Record<string, ReviewReaction>;
    for (const reviewId of reviewIds) {
      const reaction = stored[`${reviewId}__${userId}`];
      if (reaction) result.set(reviewId, reaction);
    }
    return result;
  }

  await Promise.all(reviewIds.map(async (reviewId) => {
    const snapshot = await getDoc(doc(db, 'reviewReactions', `${reviewId}__${userId}`));
    if (snapshot.exists()) {
      const reaction = snapshot.data().reaction as ReviewReaction;
      if (reaction === 'helpful' || reaction === 'not-helpful') result.set(reviewId, reaction);
    }
  }));
  return result;
}

export { MAX_ACTIVE_REVIEWS_PER_STATION };
