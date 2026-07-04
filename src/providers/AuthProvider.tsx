/**
 * Auth Provider
 * 
 * React context that wraps Firebase onAuthStateChanged.
 * Provides user state, profile data, and auth actions to the entire app.
 * Also fetches the Firestore user profile (for role, ban status, etc.)
 */

'use client';

import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOut, getUserProfile, getOrCreateUserProfile } from '@/lib/firebase/auth';
import type { UserProfile } from '@/types/user';
import { Timestamp } from 'firebase/firestore';

interface AuthContextValue {
  /** Firebase user object (null if not logged in) */
  user: User | null;
  /** Firestore user profile (null if not loaded or not logged in) */
  profile: UserProfile | null;
  /** Whether auth state is still loading */
  loading: boolean;
  /** Whether the user is an admin */
  isAdmin: boolean;
  /** Sign in with Google */
  signIn: () => Promise<void>;
  /** Sign out */
  logOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signIn: async () => {},
  logOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we are running in Playwright E2E and want to mock auth
    const mockVal = typeof window !== 'undefined' ? localStorage.getItem('fuelvoice:mock_user') : null;
    const isMock = mockVal === 'true' || mockVal === 'admin';
    if (isMock) {
      setUser({
        uid: 'test-user-123',
        displayName: mockVal === 'admin' ? 'Test Admin' : 'Test User',
        photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocKD6k78CQfNv1nsWh1CVLzzRQusp8Cl7vuewBvCtcdfyeiVmFazwA=s96-c',
        email: mockVal === 'admin' ? 'admin@example.com' : 'test@example.com',
      } as any);
      setProfile({
        uid: 'test-user-123',
        displayName: mockVal === 'admin' ? 'Test Admin' : 'Test User',
        photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocKD6k78CQfNv1nsWh1CVLzzRQusp8Cl7vuewBvCtcdfyeiVmFazwA=s96-c',
        role: mockVal === 'admin' ? 'admin' : 'user',
        createdAt: Timestamp.now(),
        reviewCount: 5,
        likeCount: 2,
        isBanned: false,
        lastReviewAt: null,
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch Firestore profile for role, etc.
        let userProfile = await getUserProfile(firebaseUser.uid);
        if (!userProfile) {
          userProfile = await getOrCreateUserProfile(firebaseUser);
        }
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    try {
      const firebaseUser = await signInWithGoogle();
      const userProfile = await getUserProfile(firebaseUser.uid);
      setProfile(userProfile);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }, []);

  const logOut = useCallback(async () => {
    try {
      await signOut();
      setProfile(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }, []);

  const isAdmin =
    profile?.role === 'admin' ||
    (user?.email &&
      process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').includes(user.email)) === true;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
