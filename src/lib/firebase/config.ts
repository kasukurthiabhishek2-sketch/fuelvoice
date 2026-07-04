/**
 * Firebase Client SDK Configuration
 * 
 * This file initializes the Firebase client-side SDK.
 * All NEXT_PUBLIC_ env vars are safe to expose — they're project identifiers, not secrets.
 * Security is enforced via Firestore Security Rules, not by hiding these keys.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Singleton Firebase app — prevent re-initialization in hot reload */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/** Firebase Authentication instance */
export const auth = getAuth(app);

/** Firestore Database instance */
export const db = getFirestore(app);

export default app;
