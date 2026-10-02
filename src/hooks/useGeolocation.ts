/** Browser geolocation with short-lived session caching and optional IP fallback. */

'use client';

import { useCallback, useEffect, useState } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  permissionState: PermissionState | 'unknown';
  isIpLocation: boolean;
}

interface CachedLocation {
  latitude: number;
  longitude: number;
  isIpLocation: boolean;
  timestamp: number;
}

const CACHE_KEY = 'fuelvoice-geolocation';
const CACHE_DURATION = 10 * 60 * 1000;
let ipLocationPromise: Promise<{ latitude: number; longitude: number } | null> | null = null;

function readCache(): CachedLocation | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null') as CachedLocation | null;
    if (!parsed || Date.now() - parsed.timestamp >= CACHE_DURATION) return null;
    if (!Number.isFinite(parsed.latitude) || !Number.isFinite(parsed.longitude)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(location: Omit<CachedLocation, 'timestamp'>) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...location, timestamp: Date.now() }));
  } catch {
    // Session storage may be unavailable in hardened/private browsing contexts.
  }
}

async function fetchIpLocation(): Promise<{ latitude: number; longitude: number } | null> {
  if (!ipLocationPromise) {
    ipLocationPromise = (async () => {
      try {
        const response = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
        if (!response.ok) return null;
        const data = await response.json();
        if (data.success && Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) {
          return { latitude: data.latitude, longitude: data.longitude };
        }
      } catch {
        // Approximate location is optional; search and manual map navigation still work.
      }
      return null;
    })().finally(() => {
      ipLocationPromise = null;
    });
  }
  return ipLocationPromise;
}

function getInitialState(): GeolocationState {
  if (typeof window === 'undefined') {
    return {
      latitude: null,
      longitude: null,
      loading: false,
      error: null,
      permissionState: 'unknown',
      isIpLocation: false,
    };
  }

  const cached = readCache();
  return {
    latitude: cached?.latitude ?? null,
    longitude: cached?.longitude ?? null,
    loading: false,
    error: null,
    permissionState: 'unknown',
    isIpLocation: cached?.isIpLocation ?? false,
  };
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(getInitialState);

  useEffect(() => {
    if (!navigator.permissions) return;

    let permission: PermissionStatus | null = null;
    const onChange = () => {
      if (permission) setState((prev) => ({ ...prev, permissionState: permission!.state }));
    };

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      permission = result;
      setState((prev) => ({ ...prev, permissionState: result.state }));
      result.addEventListener('change', onChange);
    }).catch(() => undefined);

    return () => permission?.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (state.latitude !== null && state.longitude !== null) return;

    let active = true;
    fetchIpLocation().then((location) => {
      if (!active || !location) return;
      writeCache({ ...location, isIpLocation: true });
      setState((prev) => {
        if (prev.latitude !== null && prev.longitude !== null && !prev.isIpLocation) return prev;
        return { ...prev, ...location, isIpLocation: true };
      });
    });
    return () => { active = false; };
  }, [state.latitude, state.longitude]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: 'Geolocation is not supported by your browser' }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const precise = { latitude: coords.latitude, longitude: coords.longitude, isIpLocation: false };
        writeCache(precise);
        setState({
          ...precise,
          loading: false,
          error: null,
          permissionState: 'granted',
        });
      },
      (error) => {
        const errorMessage = error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied'
          : error.code === error.POSITION_UNAVAILABLE
            ? 'Location information is unavailable'
            : error.code === error.TIMEOUT
              ? 'Location request timed out'
              : 'Unable to determine your location';
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          permissionState: error.code === error.PERMISSION_DENIED ? 'denied' : prev.permissionState,
        }));
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
    if (
      state.permissionState !== 'granted' ||
      state.loading ||
      (state.latitude !== null && state.longitude !== null && !state.isIpLocation)
    ) return;

    const timer = window.setTimeout(requestLocation, 0);
    return () => window.clearTimeout(timer);
  }, [state.permissionState, state.latitude, state.longitude, state.isIpLocation, state.loading, requestLocation]);

  return {
    ...state,
    requestLocation,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
}
