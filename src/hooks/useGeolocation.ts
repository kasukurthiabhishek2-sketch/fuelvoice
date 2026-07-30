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
  isIpLocation: boolean;
}

const CACHE_KEY = 'fuelvoice-geolocation';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function fetchIpLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return { latitude: data.latitude, longitude: data.longitude };
      }
    }
  } catch {
    // Ignore and try fallback
  }

  try {
    const res = await fetch('http://ip-api.com/json/', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && typeof data.lat === 'number' && typeof data.lon === 'number') {
        return { latitude: data.lat, longitude: data.lon };
      }
    }
  } catch {
    // Ignore error
  }

  return null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
    permissionState: 'unknown',
    isIpLocation: false,
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
        const { latitude, longitude, isIpLocation, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setState((prev) => ({ ...prev, latitude, longitude, isIpLocation: !!isIpLocation }));
          return;
        }
      }
    } catch {
      // Session storage not available
    }
  }, []);

  // Fetch IP-based location if no precise location exists
  useEffect(() => {
    let active = true;
    if (state.latitude !== null && state.longitude !== null && !state.isIpLocation) return;

    fetchIpLocation().then((ipCoords) => {
      if (!active) return;
      if (ipCoords) {
        setState((prev) => {
          // If we already have a precise location, don't overwrite with IP location
          if (prev.latitude !== null && prev.longitude !== null && !prev.isIpLocation) return prev;
          return {
            ...prev,
            latitude: ipCoords.latitude,
            longitude: ipCoords.longitude,
            isIpLocation: true,
          };
        });
      }
    });

    return () => {
      active = false;
    };
  }, [state.latitude, state.longitude, state.isIpLocation]);

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
            JSON.stringify({ latitude, longitude, isIpLocation: false, timestamp: Date.now() })
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
          isIpLocation: false,
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
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1 * 60 * 1000,
      }
    );
  }, []);

  // Auto-request location if permission is already granted
  useEffect(() => {
    if (state.permissionState === 'granted' && state.isIpLocation && !state.loading) {
      requestLocation();
    }
  }, [state.permissionState, state.isIpLocation, state.loading, requestLocation]);

  return {
    ...state,
    requestLocation,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
}
