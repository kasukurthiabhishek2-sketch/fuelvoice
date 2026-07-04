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
  deleteDoc,
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
  DocumentSnapshot,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Station, StationScores } from '@/types/station';
import type { Review, ReviewFormData, ReviewSortOption } from '@/types/review';
import type { UserProfile, Report, ReportReason } from '@/types/user';

const isMockMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const mockVal = localStorage.getItem('fuelvoice:mock_user');
  return mockVal === 'true' || mockVal === 'admin';
};

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
    await setDoc(stationRef, station);
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
  const reviewRef = doc(collection(db, 'reviews'));
  const review = {
    ...formData,
    id: reviewRef.id,
    stationId,
    userId,
    userName: formData.isAnonymous ? 'Anonymous' : userName,
    userPhoto: formData.isAnonymous ? '' : userPhoto,
    likeCount: 0,
    reportCount: 0,
    isHidden: false,
    isFeatured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  batch.set(reviewRef, review);

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
    return {
      reviews: [
        {
          id: 'mock-review-1',
          stationId,
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
        }
      ],
      lastDoc: null,
      hasMore: false,
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

  const q = query(
    collection(db, 'reviews'),
    where('stationId', '==', stationId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/** Recalculate station average scores from all reviews */
async function recalculateStationScores(stationId: string): Promise<void> {
  const q = query(
    collection(db, 'reviews'),
    where('stationId', '==', stationId),
    where('isHidden', '==', false)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const reviews = snapshot.docs.map(d => d.data() as Review);
  const count = reviews.length;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / count;
  const scores: StationScores = {
    fuelQuality: reviews.reduce((sum, r) => sum + (r.fuelQuality || 0), 0) / count,
    service: reviews.reduce((sum, r) => sum + (r.service || 0), 0) / count,
    staffBehaviour: reviews.reduce((sum, r) => sum + (r.staffBehaviour || 0), 0) / count,
    cleanliness: reviews.reduce((sum, r) => sum + (r.cleanliness || 0), 0) / count,
    washroom: reviews.reduce((sum, r) => sum + (r.washroom || 0), 0) / count,
    airFilling: reviews.reduce((sum, r) => sum + (r.airFilling || 0), 0) / count,
  };

  const stationRef = doc(db, 'stations', stationId);
  await updateDoc(stationRef, { avgRating: Math.round(avgRating * 10) / 10, scores });
}

// ────────────────────────────────────────────────────────────────
// LIKES
// ────────────────────────────────────────────────────────────────

/** Toggle like on a review. Returns true if now liked, false if unliked. */
export async function toggleLike(reviewId: string, userId: string): Promise<boolean> {
  if (isMockMode()) {
    return true;
  }

  const likeId = `${reviewId}__${userId}`;
  const likeRef = doc(db, 'likes', likeId);
  const likeSnap = await getDoc(likeRef);

  const batch = writeBatch(db);
  const reviewRef = doc(db, 'reviews', reviewId);

  if (likeSnap.exists()) {
    // Unlike
    batch.delete(likeRef);
    batch.update(reviewRef, { likeCount: increment(-1) });
    await batch.commit();
    return false;
  } else {
    // Like
    batch.set(likeRef, {
      reviewId,
      userId,
      createdAt: serverTimestamp(),
    });
    batch.update(reviewRef, { likeCount: increment(1) });
    await batch.commit();
    return true;
  }
}

/** Check if user has liked a review */
export async function hasUserLiked(reviewId: string, userId: string): Promise<boolean> {
  if (isMockMode()) {
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
    return new Set<string>();
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
    return 'mock-report-id-123';
  }
  const reportRef = doc(collection(db, 'reports'));
  const report: Omit<Report, 'id' | 'createdAt' | 'reviewedAt'> & {
    id: string;
    createdAt: ReturnType<typeof serverTimestamp>;
    reviewedAt: null;
  } = {
    id: reportRef.id,
    reviewId,
    stationId,
    reporterId,
    reason,
    details,
    status: 'pending',
    createdAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
  };

  const batch = writeBatch(db);
  batch.set(reportRef, report);

  // Increment report count on review
  const reviewRef = doc(db, 'reviews', reviewId);
  batch.update(reviewRef, { reportCount: increment(1) });

  await batch.commit();
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
  await updateDoc(reviewRef, { isHidden: true });
}

/** Unhide a review (admin action) */
export async function unhideReview(reviewId: string): Promise<void> {
  if (isMockMode()) {
    console.log('MOCK: unhideReview called', reviewId);
    return;
  }
  const reviewRef = doc(db, 'reviews', reviewId);
  await updateDoc(reviewRef, { isHidden: false });
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
