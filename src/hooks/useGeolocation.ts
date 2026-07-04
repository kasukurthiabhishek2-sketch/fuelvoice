/**
 * useGeolocation Hook
 * 
 * Wraps the Browser Geolocation API with:
 * - Permission state management
 * - Session storage caching (avoids repeated prompts)
 * - Error handling
 * - Loading states
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  permissionState: PermissionState | 'unknown';
}

const CACHE_KEY = 'fuelvoice-geolocation';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
    permissionState: 'unknown',
  });

  // Check permission state on mount
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return;

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        setState((prev) => ({ ...prev, permissionState: result.state }));

        result.addEventListener('change', () => {
          setState((prev) => ({ ...prev, permissionState: result.state }));
        });
      })
      .catch(() => {
        // Permissions API not supported
      });
  }, []);

  // Try to load from cache on mount
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { latitude, longitude, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setState((prev) => ({ ...prev, latitude, longitude }));
          return;
        }
      }
    } catch {
      // Session storage not available
    }
  }, []);



  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Cache in session storage
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ latitude, longitude, timestamp: Date.now() })
          );
        } catch {
          // Ignore storage errors
        }

        setState({
          latitude,
          longitude,
          loading: false,
          error: null,
          permissionState: 'granted',
        });
      },
      (error) => {
        let errorMessage: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission was denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          permissionState: error.code === error.PERMISSION_DENIED ? 'denied' : prev.permissionState,
        }));
      },
      {
        enableHighAccuracy: true, // Use high accuracy (GPS/WiFi mapping) for precise pump discovery
        timeout: 15000,
        maximumAge: 1 * 60 * 1000, // Accept cached position up to 1 min old
      }
    );
  }, []);

  // Auto-request location if permission is already granted
  useEffect(() => {
    if (state.permissionState === 'granted' && state.latitude === null && state.longitude === null && !state.loading) {
      requestLocation();
    }
  }, [state.permissionState, state.latitude, state.longitude, state.loading, requestLocation]);

  return {
    ...state,
    requestLocation,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
}
