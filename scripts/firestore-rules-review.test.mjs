import fs from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';

const PROJECT_ID = 'fuelvoice-rules-test';
const OWNER_UID = 'googleUser123';
const OTHER_UID = 'differentUser456';
const STATION_ID = 'node_11774365338';
const REVIEW_ID = `${STATION_ID}__${OWNER_UID}__1`;
const JOINED_AT = Timestamp.fromMillis(1_700_000_000_000);

const rules = fs.readFileSync('firestore.rules', 'utf8');

const env = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: { rules },
});

try {
  await env.clearFirestore();

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await setDoc(doc(db, 'users', OWNER_UID), {
      uid: OWNER_UID,
      displayName: 'Owner',
      photoURL: '',
      role: 'user',
      createdAt: JOINED_AT,
      reviewCount: 0,
      likeCount: 0,
      isBanned: false,
      lastReviewAt: null,
    });

    await setDoc(doc(db, 'users', OTHER_UID), {
      uid: OTHER_UID,
      displayName: 'Other user',
      photoURL: '',
      role: 'user',
      createdAt: JOINED_AT,
      reviewCount: 0,
      likeCount: 0,
      isBanned: false,
      lastReviewAt: null,
    });

    await setDoc(doc(db, 'stations', STATION_ID), {
      id: STATION_ID,
      name: 'Bharat Petroleum',
      brand: 'Bharat Petroleum',
      operator: '',
      address: '',
      addressComponents: {},
      lat: 17.4,
      lng: 78.4,
      phone: '',
      website: '',
      openingHours: '',
      fuelTypes: [],
      osmTags: {},
      avgRating: 0,
      reviewCount: 0,
      complaintCount: 0,
      scores: {
        fuelQuality: 0,
        service: 0,
        staffBehaviour: 0,
        cleanliness: 0,
        washroom: 0,
        airFilling: 0,
      },
      lastUpdated: new Date(0).toISOString(),
    });
  });

  const ownerDb = env.authenticatedContext(OWNER_UID).firestore();
  const otherDb = env.authenticatedContext(OTHER_UID).firestore();
  const publicDb = env.unauthenticatedContext().firestore();

  // This was the production regression: the client probes deterministic slots
  // before creating a review. Missing own slots must be readable as "not found".
  const missingOwnSlot = await assertSucceeds(getDoc(doc(ownerDb, 'reviews', REVIEW_ID)));
  if (missingOwnSlot.exists()) {
    throw new Error('Expected the seeded review slot to be empty');
  }

  // A different authenticated user must not gain access to that private slot probe.
  await assertFails(getDoc(doc(otherDb, 'reviews', REVIEW_ID)));

  // Exercise the same transaction shape used by createReviewV2.
  await assertSucceeds(runTransaction(ownerDb, async (transaction) => {
    const reviewRef = doc(ownerDb, 'reviews', REVIEW_ID);
    const userRef = doc(ownerDb, 'users', OWNER_UID);

    const [reviewSnap, userSnap] = await Promise.all([
      transaction.get(reviewRef),
      transaction.get(userRef),
    ]);

    if (reviewSnap.exists()) throw new Error('Review slot unexpectedly occupied');
    if (!userSnap.exists()) throw new Error('Owner profile missing');

    transaction.set(reviewRef, {
      id: REVIEW_ID,
      stationId: STATION_ID,
      userName: 'Owner',
      userPhoto: '',
      rating: 3,
      content: 'good',
      complaintCategories: [],
      reviewerJoinedAt: JOINED_AT,
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
  }));

  // Public read behavior remains unchanged for published non-anonymous reviews.
  const visibleQuery = query(
    collection(publicDb, 'reviews'),
    where('stationId', '==', STATION_ID),
    where('isHidden', '==', false),
    where('isAnonymous', '==', false),
  );
  const visible = await assertSucceeds(getDocs(visibleQuery));
  if (visible.size !== 1) {
    throw new Error(`Expected one public review, found ${visible.size}`);
  }

  console.log('Firestore review-slot security regression passed.');
} finally {
  await env.cleanup();
}
