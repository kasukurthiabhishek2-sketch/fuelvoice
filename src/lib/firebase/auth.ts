/**
 * Firebase Authentication Helpers
 * 
 * Handles Google sign-in/sign-out and user profile creation in Firestore.
 * On first login, a user document is created with safe defaults.
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { UserProfile } from '@/types/user';

const googleProvider = new GoogleAuthProvider();

/**
 * Ensures a user profile exists in Firestore and returns it.
 */
export async function getOrCreateUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
  const role = user.email && adminEmails.includes(user.email) ? 'admin' : 'user';

  const profile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName || 'Anonymous User',
    photoURL: user.photoURL || '',
    role,
    createdAt: Timestamp.now(),
    reviewCount: 0,
    likeCount: 0,
    isBanned: false,
    lastReviewAt: null,
  };

  await setDoc(userRef, profile);
  return profile;
}

/**
 * Sign in with Google popup.
 * Creates a Firestore user profile on first login.
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await getOrCreateUserProfile(result.user);
  return result.user;
}

/** Sign out the current user */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/** Subscribe to auth state changes */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/** Get the current user's Firestore profile */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
}
