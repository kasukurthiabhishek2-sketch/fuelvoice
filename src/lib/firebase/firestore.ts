/**
 * Firestore CRUD Helpers
 * 
 * Centralized Firestore operations for stations, reviews, likes, and reports.
 * Uses denormalized counters for performance (likeCount, reviewCount, etc.)
 * to avoid expensive aggregation queries on every page load.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  increment,
  serverTimestamp,
  writeBatch,
  runTransaction,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Station, StationScores } from '@/types/station';
import type { Review, ReviewFormData, ReviewSortOption } from '@/types/review';
import type { UserProfile, Report, ReportReason } from '@/types/user';

const isMockMode = (): boolean => {
  // Only allow mock mode in development/test — never in production
  if (process.env.NODE_ENV === 'production') return false;
  if (typeof window === 'undefined') return false;
  const mockVal = localStorage.getItem('fuelvoice:mock_user');
  return mockVal === 'true' || mockVal === 'admin';
};

/** Helper to identify plain JS objects (vs SDK classes like FieldValue or Timestamp) */
function isPlainObject(val: any): boolean {
  return val && (val.constructor === Object || val.constructor === undefined);
}

/** Recursively strips undefined fields from plain objects before writing to Firestore */
function removeUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined) as any;
  }
  if (isPlainObject(obj)) {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          result[key] = removeUndefined(val);
        }
      }
    }
    return result;
  }
  return obj;
}

// ────────────────────────────────────────────────────────────────
// STATIONS
// ────────────────────────────────────────────────────────────────

/** Get or create a station document in Firestore */
export async function getOrCreateStation(stationData: Partial<Station> & { id: string }): Promise<Station> {
  if (isMockMode()) {
    return {
      id: stationData.id,
      name: stationData.name || 'Mock Fuel Station',
      brand: stationData.brand || '',
      operator: stationData.operator || '',
      address: stationData.address || '',
      addressComponents: stationData.addressComponents || {},
      lat: stationData.lat || 0,
      lng: stationData.lng || 0,
      phone: stationData.phone || '',
      website: stationData.website || '',
      openingHours: stationData.openingHours || '',
      fuelTypes: stationData.fuelTypes || [],
      osmTags: stationData.osmTags || {},
      avgRating: 4.5,
      reviewCount: 1,
      complaintCount: 0,
      scores: {
        fuelQuality: 4.5,
        service: 4.5,
        staffBehaviour: 4.5,
        cleanliness: 4.5,
        washroom: 4.5,
        airFilling: 4.5,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  const stationRef = doc(db, 'stations', stationData.id);
  const stationSnap = await getDoc(stationRef);

  if (stationSnap.exists()) {
    return { ...stationSnap.data(), id: stationSnap.id } as Station;
  }

  // Create station with defaults for missing data
  const defaultScores: StationScores = {
    fuelQuality: 0,
    service: 0,
    staffBehaviour: 0,
    cleanliness: 0,
    washroom: 0,
    airFilling: 0,
  };

  const station: Station = {
    id: stationData.id,
    name: stationData.name || 'Unknown Station',
    brand: stationData.brand || '',
    operator: stationData.operator || '',
    address: stationData.address || '',
    addressComponents: stationData.addressComponents || {},
    lat: stationData.lat || 0,
    lng: stationData.lng || 0,
    phone: stationData.phone || '',
    website: stationData.website || '',
    openingHours: stationData.openingHours || '',
    fuelTypes: stationData.fuelTypes || [],
    osmTags: stationData.osmTags || {},
    avgRating: 0,
    reviewCount: 0,
    complaintCount: 0,
    scores: defaultScores,
    lastUpdated: new Date().toISOString(),
  };

  try {
    await setDoc(stationRef, removeUndefined(station));
  } catch (error) {
    console.warn('Failed to cache station in Firestore (user may be unauthenticated):', error);
  }
  return station;
}

/** Get a station by ID */
export async function getStation(stationId: string): Promise<Station | null> {
  if (isMockMode()) {
    return {
      id: stationId,
      name: 'Mock Fuel Station',
      brand: 'Shell',
      operator: 'Shell Retail',
      address: 'Abids Road, Hyderabad, Telangana, IN',
      addressComponents: {},
      lat: 17.3887027,
      lng: 78.4753829,
      phone: '+914012345678',
      website: 'https://shell.in',
      openingHours: '24/7',
      fuelTypes: [],
      osmTags: {},
      avgRating: 4.5,
      reviewCount: 1,
      complaintCount: 0,
      scores: {
        fuelQuality: 4.5,
        service: 4.5,
        staffBehaviour: 4.5,
        cleanliness: 4.5,
        washroom: 4.5,
        airFilling: 4.5,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  const stationRef = doc(db, 'stations', stationId);
  const stationSnap = await getDoc(stationRef);
  return stationSnap.exists() ? ({ ...stationSnap.data(), id: stationSnap.id } as Station) : null;
}

// ────────────────────────────────────────────────────────────────
// REVIEWS
// ────────────────────────────────────────────────────────────────

export async function createReview(
  stationId: string,
  userId: string,
  userName: string,
  userPhoto: string,
  formData: ReviewFormData
): Promise<string> {
  if (isMockMode()) {
    console.log('MOCK: createReview called', { stationId, userId, userName, formData });
    if (typeof window !== 'undefined') {
      const key = `fuelvoice:mock_user_reviews:${stationId}`;
      const mockReviewsStr = localStorage.getItem(key) || '[]';
      const userReviews = JSON.parse(mockReviewsStr);
      const nowMs = Date.now() + 100000;
      const newReview: Review = {
        id: `mock-user-review-${Date.now()}`,
        stationId,
        userId,
        userName: formData.isAnonymous ? 'Anonymous' : userName,
        userPhoto: formData.isAnonymous ? '' : userPhoto,
        rating: formData.rating,
        fuelQuality: formData.fuelQuality,
        service: formData.service,
        staffBehaviour: formData.staffBehaviour,
        cleanliness: formData.cleanliness,
        washroom: formData.washroom,
        airFilling: formData.airFilling,
        title: formData.title,
        content: formData.content,
        likeCount: 0,
        reportCount: 0,
        isHidden: false,
        isFeatured: false,
        isAnonymous: formData.isAnonymous,
        suggestions: formData.suggestions,
        createdAt: Timestamp.fromMillis(nowMs),
        updatedAt: Timestamp.fromMillis(nowMs),
        tags: formData.tags,
      };
      userReviews.unshift(newReview);
      localStorage.setItem(key, JSON.stringify(userReviews));
    }
    return 'mock-review-id-123';
  }
  // Ensure the station exists in Firestore before running updates on it
  const stationRef = doc(db, 'stations', stationId);
  const stationSnap = await getDoc(stationRef);
  if (!stationSnap.exists()) {
    const [osmType, osmIdStr] = stationId.split('_');
    const osmId = parseInt(osmIdStr, 10);
    if (osmType && !isNaN(osmId)) {
      try {
        const { getStationByOsmId } = await import('@/lib/api/overpass');
        const element = await getStationByOsmId(osmType, osmId);
        if (element) {
          const tags = element.tags || {};
          const lat = element.lat ?? element.center?.lat ?? 0;
          const lng = element.lon ?? element.center?.lon ?? 0;
          const addressParts = [tags['addr:street'], tags['addr:city'], tags['addr:state'], tags['addr:country']].filter(Boolean);
          
          await getOrCreateStation({
            id: stationId,
            name: tags.name || tags.brand || tags.operator || 'Fuel Station',
            brand: tags.brand || tags.operator || '',
            operator: tags.operator || '',
            address: addressParts.join(', '),
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
      } catch (err) {
        console.error('Failed to create station during review submission:', err);
      }
    }
  }

  const batch = writeBatch(db);

  // Create review document
  const reviewRef = doc(db, 'reviews', `${stationId}__${userId}`);
  const review = {
    ...formData,
    id: reviewRef.id,
    stationId,
    userName: formData.isAnonymous ? 'Anonymous' : userName,
    userPhoto: formData.isAnonymous ? '' : userPhoto,
    likeCount: 0,
    reportCount: 0,
    isHidden: false,
    isFeatured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  batch.set(reviewRef, removeUndefined(review));

  // Update station counters and scores
  batch.update(stationRef, {
    reviewCount: increment(1),
    // Tags with negative sentiments count as complaints
    complaintCount: formData.tags.some(t => ['fraud', 'overcharging', 'short-measure', 'adulteration'].includes(t))
      ? increment(1)
      : increment(0),
    lastUpdated: new Date().toISOString(),
  });

  // Update user counters and rate limit timestamp
  const userRef = doc(db, 'users', userId);
  batch.update(userRef, {
    reviewCount: increment(1),
    lastReviewAt: serverTimestamp(),
  });

  await batch.commit();

  // Recalculate station averages (done separately to avoid read-in-batch)
  await recalculateStationScores(stationId);

  return reviewRef.id;
}

/** Fetch paginated reviews for a station */
export async function getReviews(
  stationId: string,
  sortBy: ReviewSortOption = 'newest',
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot
): Promise<{ reviews: Review[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  if (isMockMode()) {
    let mockUserReviews: Review[] = [];
    if (typeof window !== 'undefined') {
      const key = `fuelvoice:mock_user_reviews:${stationId}`;
      const mockReviewsStr = localStorage.getItem(key) || '[]';
      mockUserReviews = JSON.parse(mockReviewsStr).map((r: any) => ({
        ...r,
        createdAt: Timestamp.fromMillis(r.createdAt?.seconds ? r.createdAt.seconds * 1000 : Date.now()),
        updatedAt: Timestamp.fromMillis(r.updatedAt?.seconds ? r.updatedAt.seconds * 1000 : Date.now()),
      }));
    }

    // Generate 45 mock reviews to test infinite scroll and sorting
    const generatedReviews: Review[] = Array.from({ length: 45 }, (_, index) => {
      const idNum = index + 1;
      const ratings = [5, 4, 3, 2, 1];
      const rating = ratings[index % ratings.length];
      const likeCount = (index * 7) % 15;
      const createdAtMs = Date.now() - index * 24 * 60 * 60 * 1000; // 1 day apart
      return {
        id: `mock-review-${idNum}`,
        stationId,
        userId: `test-user-${idNum}`,
        userName: `User ${idNum}`,
        userPhoto: idNum === 1 ? 'https://lh3.googleusercontent.com/a/ACg8ocKD6k78CQfNv1nsWh1CVLzzRQusp8Cl7vuewBvCtcdfyeiVmFazwA=s96-c' : '',
        rating,
        fuelQuality: rating,
        service: rating,
        staffBehaviour: rating,
        cleanliness: rating,
        washroom: rating,
        airFilling: rating,
        title: `Mock Review #${idNum}`,
        content: `This is the body content for mock review #${idNum}. The service was ${rating >= 4 ? 'exceptional' : 'average'}.`,
        likeCount,
        reportCount: 0,
        isHidden: false,
        isFeatured: false,
        isAnonymous: false,
        suggestions: '',
        createdAt: Timestamp.fromMillis(createdAtMs),
        updatedAt: Timestamp.fromMillis(createdAtMs),
        tags: index % 2 === 0 ? ['good-quality'] : ['poor-service'],
      };
    });

    const mockReviews = [...mockUserReviews, ...generatedReviews];

    // Sort mock reviews based on selected sortBy criteria
    let sorted = [...mockReviews];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        break;
      case 'oldest':
        sorted.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating || b.createdAt.toMillis() - a.createdAt.toMillis());
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating || b.createdAt.toMillis() - a.createdAt.toMillis());
        break;
      case 'most-liked':
        sorted.sort((a, b) => b.likeCount - a.likeCount || b.createdAt.toMillis() - a.createdAt.toMillis());
        break;
    }

    // Paginate mock reviews based on lastDoc cursor (mocked as index)
    const startIndex = lastDoc ? parseInt(lastDoc.id.replace('mock-doc-', ''), 10) : 0;
    const pageDocs = sorted.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < sorted.length;
    const nextLastDoc = hasMore 
      ? ({ id: `mock-doc-${startIndex + pageSize}` } as any as DocumentSnapshot)
      : null;

    return {
      reviews: pageDocs,
      lastDoc: nextLastDoc,
      hasMore,
    };
  }

  const constraints: QueryConstraint[] = [
    where('stationId', '==', stationId),
    where('isHidden', '==', false),
  ];

  // Sort order
  switch (sortBy) {
    case 'newest':
      constraints.push(orderBy('createdAt', 'desc'));
      break;
    case 'oldest':
      constraints.push(orderBy('createdAt', 'asc'));
      break;
    case 'highest':
      constraints.push(orderBy('rating', 'desc'), orderBy('createdAt', 'desc'));
      break;
    case 'lowest':
      constraints.push(orderBy('rating', 'asc'), orderBy('createdAt', 'desc'));
      break;
    case 'most-liked':
      constraints.push(orderBy('likeCount', 'desc'), orderBy('createdAt', 'desc'));
      break;
  }

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  constraints.push(limit(pageSize + 1)); // Fetch one extra to check hasMore

  const q = query(collection(db, 'reviews'), ...constraints);
  const snapshot = await getDocs(q);
  const docs = snapshot.docs;
  const hasMore = docs.length > pageSize;
  const reviewDocs = hasMore ? docs.slice(0, pageSize) : docs;

  return {
    reviews: reviewDocs.map(d => ({ ...d.data(), id: d.id } as Review)),
    lastDoc: reviewDocs.length > 0 ? reviewDocs[reviewDocs.length - 1] : null,
    hasMore,
  };
}

/** Check if user already reviewed a station */
export async function hasUserReviewed(stationId: string, userId: string): Promise<boolean> {
  if (isMockMode()) {
    return false;
  }

  const deterministic = await getDoc(doc(db, 'reviews', `${stationId}__${userId}`));
  if (deterministic.exists()) return true;

  // Legacy reviews used random IDs and stored userId. Keep this fallback so
  // existing reviewers do not accidentally get a second review slot.
  const legacyQuery = query(
    collection(db, 'reviews'),
    where('stationId', '==', stationId),
    where('userId', '==', userId),
    limit(1)
  );
  const legacySnapshot = await getDocs(legacyQuery);
  return !legacySnapshot.empty;
}

/** Recalculate visible review aggregates for a station. Optional category ratings
 * are averaged only across reviews that actually supplied that category. */
async function recalculateStationScores(stationId: string): Promise<void> {
  const q = query(
    collection(db, 'reviews'),
    where('stationId', '==', stationId),
    where('isHidden', '==', false)
  );
  const snapshot = await getDocs(q);
  const reviews = snapshot.docs.map(d => d.data() as Review);

  const average = (values: number[]) => {
    const supplied = values.filter((value) => Number.isFinite(value) && value > 0);
    if (supplied.length === 0) return 0;
    return Math.round((supplied.reduce((sum, value) => sum + value, 0) / supplied.length) * 10) / 10;
  };

  const negativeTags = new Set(['fraud', 'overcharging', 'short-measure', 'adulteration']);
  const scores: StationScores = {
    fuelQuality: average(reviews.map(r => r.fuelQuality)),
    service: average(reviews.map(r => r.service)),
    staffBehaviour: average(reviews.map(r => r.staffBehaviour)),
    cleanliness: average(reviews.map(r => r.cleanliness)),
    washroom: average(reviews.map(r => r.washroom)),
    airFilling: average(reviews.map(r => r.airFilling)),
  };

  const stationRef = doc(db, 'stations', stationId);
  await updateDoc(stationRef, {
    avgRating: average(reviews.map(r => r.rating)),
    reviewCount: reviews.length,
    complaintCount: reviews.filter(r => r.tags?.some(tag => negativeTags.has(tag))).length,
    scores,
  });
}

// ────────────────────────────────────────────────────────────────
// LIKES
// ────────────────────────────────────────────────────────────────

export async function toggleLike(reviewId: string, userId: string): Promise<boolean> {
  if (isMockMode()) {
    const mockLikes: { reviewId: string; userId: string }[] = JSON.parse(
      localStorage.getItem('fuelvoice:mock_likes') || '[]'
    );
    const index = mockLikes.findIndex(like => like.reviewId === reviewId && like.userId === userId);
    if (index >= 0) mockLikes.splice(index, 1);
    else mockLikes.push({ reviewId, userId });
    localStorage.setItem('fuelvoice:mock_likes', JSON.stringify(mockLikes));
    return index < 0;
  }

  const likeRef = doc(db, 'likes', `${reviewId}__${userId}`);
  const reviewRef = doc(db, 'reviews', reviewId);

  return runTransaction(db, async (transaction) => {
    const likeSnap = await transaction.get(likeRef);
    const reviewSnap = await transaction.get(reviewRef);
    if (!reviewSnap.exists()) throw new Error('Review no longer exists');

    const currentCount = Math.max(0, Number(reviewSnap.data().likeCount) || 0);
    if (likeSnap.exists()) {
      transaction.delete(likeRef);
      transaction.update(reviewRef, { likeCount: Math.max(0, currentCount - 1) });
      return false;
    }

    transaction.set(likeRef, { reviewId, userId, createdAt: serverTimestamp() });
    transaction.update(reviewRef, { likeCount: currentCount + 1 });
    return true;
  });
}

/** Check if user has liked a review */
export async function hasUserLiked(reviewId: string, userId: string): Promise<boolean> {
  if (isMockMode()) {
    if (typeof window !== 'undefined') {
      const mockLikesStr = localStorage.getItem('fuelvoice:mock_likes') || '[]';
      const mockLikes: { reviewId: string; userId: string }[] = JSON.parse(mockLikesStr);
      return mockLikes.some(l => l.reviewId === reviewId && l.userId === userId);
    }
    return false;
  }

  const likeId = `${reviewId}__${userId}`;
  const likeRef = doc(db, 'likes', likeId);
  const likeSnap = await getDoc(likeRef);
  return likeSnap.exists();
}

/** Batch check likes for multiple reviews */
export async function getUserLikes(reviewIds: string[], userId: string): Promise<Set<string>> {
  if (isMockMode()) {
    const likedSet = new Set<string>();
    if (typeof window !== 'undefined') {
      const mockLikesStr = localStorage.getItem('fuelvoice:mock_likes') || '[]';
      const mockLikes: { reviewId: string; userId: string }[] = JSON.parse(mockLikesStr);
      mockLikes.forEach(l => {
        if (l.userId === userId) {
          likedSet.add(l.reviewId);
        }
      });
    }
    return likedSet;
  }

  const likedSet = new Set<string>();
  // Firestore has a 10-document limit for batched reads, chunk accordingly
  const chunks = [];
  for (let i = 0; i < reviewIds.length; i += 10) {
    chunks.push(reviewIds.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (reviewId) => {
      const likeId = `${reviewId}__${userId}`;
      const likeRef = doc(db, 'likes', likeId);
      const likeSnap = await getDoc(likeRef);
      if (likeSnap.exists()) likedSet.add(reviewId);
    });
    await Promise.all(promises);
  }

  return likedSet;
}

// ────────────────────────────────────────────────────────────────
// REPORTS
// ────────────────────────────────────────────────────────────────

/** Submit a report for a review */
export async function createReport(
  reviewId: string,
  stationId: string,
  reporterId: string,
  reason: ReportReason,
  details: string
): Promise<string> {
  if (isMockMode()) {
    console.log('MOCK: createReport called', { reviewId, stationId, reporterId, reason, details });
    return `${reviewId}__${reporterId}`;
  }

  const reportRef = doc(db, 'reports', `${reviewId}__${reporterId}`);
  const reviewRef = doc(db, 'reviews', reviewId);

  await runTransaction(db, async (transaction) => {
    const reportSnap = await transaction.get(reportRef);
    const reviewSnap = await transaction.get(reviewRef);
    if (reportSnap.exists()) throw new Error('You already reported this review');
    if (!reviewSnap.exists()) throw new Error('Review no longer exists');

    const report = {
      id: reportRef.id,
      reviewId,
      stationId,
      reporterId,
      reason,
      details,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null,
    };
    transaction.set(reportRef, report);
    transaction.update(reviewRef, {
      reportCount: Math.max(0, Number(reviewSnap.data().reportCount) || 0) + 1,
    });
  });

  return reportRef.id;
}

// ────────────────────────────────────────────────────────────────
// ADMIN
// ────────────────────────────────────────────────────────────────

/** Hide a review (admin action) */
export async function hideReview(reviewId: string): Promise<void> {
  if (isMockMode()) {
    console.log('MOCK: hideReview called', reviewId);
    return;
  }
  const reviewRef = doc(db, 'reviews', reviewId);
  const reviewSnap = await getDoc(reviewRef);
  if (!reviewSnap.exists()) throw new Error('Review not found');
  await updateDoc(reviewRef, { isHidden: true });
  await recalculateStationScores(reviewSnap.data().stationId);
}

/** Unhide a review (admin action) */
export async function unhideReview(reviewId: string): Promise<void> {
  if (isMockMode()) {
    console.log('MOCK: unhideReview called', reviewId);
    return;
  }
  const reviewRef = doc(db, 'reviews', reviewId);
  const reviewSnap = await getDoc(reviewRef);
  if (!reviewSnap.exists()) throw new Error('Review not found');
  await updateDoc(reviewRef, { isHidden: false });
  await recalculateStationScores(reviewSnap.data().stationId);
}

/** Feature a review (admin action) */
export async function featureReview(reviewId: string, featured: boolean): Promise<void> {
  if (isMockMode()) {
    console.log('MOCK: featureReview called', { reviewId, featured });
    return;
  }
  const reviewRef = doc(db, 'reviews', reviewId);
  await updateDoc(reviewRef, { isFeatured: featured });
}

/** Ban a user (admin action) */
export async function banUser(userId: string, banned: boolean): Promise<void> {
  if (isMockMode()) {
    console.log('MOCK: banUser called', { userId, banned });
    return;
  }
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { isBanned: banned });
}

/** Get pending reports (admin) */
export async function getPendingReports(pageSize: number = 20): Promise<Report[]> {
  if (isMockMode()) {
    return [
      {
        id: 'mock-report-1',
        reviewId: 'mock-review-2',
        stationId: 'node_6254336890',
        reporterId: 'test-user-123',
        reason: 'spam',
        details: 'Spam link in content',
        status: 'pending',
        createdAt: Timestamp.now(),
        reviewedAt: null,
        reviewedBy: null,
      }
    ];
  }
  const q = query(
    collection(db, 'reports'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Report));
}

/** Update report status (admin) */
export async function updateReportStatus(
  reportId: string,
  status: 'reviewed' | 'dismissed',
  adminId: string
): Promise<void> {
  if (isMockMode()) {
    console.log('MOCK: updateReportStatus called', { reportId, status, adminId });
    return;
  }
  const reportRef = doc(db, 'reports', reportId);
  await updateDoc(reportRef, {
    status,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminId,
  });
}

/** Get all reviews for admin (including hidden) */
export async function getAdminReviews(pageSize: number = 20): Promise<Review[]> {
  if (isMockMode()) {
    return [
      {
        id: 'mock-review-1',
        stationId: 'node_6254336890',
        userId: 'test-user-123',
        userName: 'Test User',
        userPhoto: 'https://lh3.googleusercontent.com/a/ACg8ocKD6k78CQfNv1nsWh1CVLzzRQusp8Cl7vuewBvCtcdfyeiVmFazwA=s96-c',
        rating: 5,
        fuelQuality: 5,
        service: 5,
        staffBehaviour: 5,
        cleanliness: 5,
        washroom: 5,
        airFilling: 5,
        title: 'Great experience',
        content: 'The fuel quality was excellent and the service was super fast. Highly recommended!',
        likeCount: 2,
        reportCount: 0,
        isHidden: false,
        isFeatured: false,
        isAnonymous: false,
        suggestions: '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        tags: ['good-quality'],
      },
      {
        id: 'mock-review-2',
        stationId: 'node_6254336890',
        userId: 'test-user-456',
        userName: 'Spammer Bob',
        userPhoto: '',
        rating: 1,
        fuelQuality: 1,
        service: 1,
        staffBehaviour: 1,
        cleanliness: 1,
        washroom: 1,
        airFilling: 1,
        title: 'Terrible place',
        content: 'Buy cheap fuel at this link spam-link.com !!',
        likeCount: 0,
        reportCount: 1,
        isHidden: false,
        isFeatured: false,
        isAnonymous: false,
        suggestions: '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        tags: ['fraud'],
      }
    ];
  }
  const q = query(
    collection(db, 'reviews'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Review));
}

/** Get all users (admin) */
export async function getAdminUsers(pageSize: number = 50): Promise<UserProfile[]> {
  if (isMockMode()) {
    return [
      {
        uid: 'test-user-123',
        displayName: 'Test User',
        photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocKD6k78CQfNv1nsWh1CVLzzRQusp8Cl7vuewBvCtcdfyeiVmFazwA=s96-c',
        role: 'user',
        createdAt: Timestamp.now(),
        reviewCount: 5,
        likeCount: 2,
        isBanned: false,
        lastReviewAt: null,
      },
      {
        uid: 'test-user-456',
        displayName: 'Spammer Bob',
        photoURL: '',
        role: 'user',
        createdAt: Timestamp.now(),
        reviewCount: 1,
        likeCount: 0,
        isBanned: false,
        lastReviewAt: null,
      }
    ];
  }
  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => d.data() as UserProfile);
}

/** Get featured reviews for landing page */
export async function getFeaturedReviews(limitCount: number = 6): Promise<Review[]> {
  // Try featured first
  let q = query(
    collection(db, 'reviews'),
    where('isFeatured', '==', true),
    where('isHidden', '==', false),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  let snapshot = await getDocs(q);

  // Fall back to most-liked if no featured reviews
  if (snapshot.empty) {
    q = query(
      collection(db, 'reviews'),
      where('isHidden', '==', false),
      orderBy('likeCount', 'desc'),
      limit(limitCount)
    );
    snapshot = await getDocs(q);
  }

  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Review));
}
