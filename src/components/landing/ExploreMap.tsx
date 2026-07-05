/**
 * Explore Map — Interactive Homepage Map Dashboard
 * 
 * Responsive dual-column dashboard where users can:
 * - See visible stations in the current map viewport automatically updating in the sidebar
 * - Click any station to show its reviews directly in the sidebar as the highest priority
 * - Pan, zoom, and swipe the map to dynamically query and find new bunks
 * - Switch map styling/themes on the fly
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import type { StationSummary } from '@/types/station';
import { getReviews } from '@/lib/firebase/firestore';
import { findNearbyStations } from '@/lib/api/overpass';
import type { Review } from '@/types/review';

/** Escapes HTML special characters to prevent XSS in Leaflet popup HTML */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type MapTheme = 'default' | 'dark' | 'satellite' | 'terrain';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'YS3Y7JqKCXASxG1okJI2';

const THEMES = {
  default: {
    name: 'Road Map',
    url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: '',
    maxZoom: 20,
  },
  dark: {
    name: 'Dark Map',
    url: `https://api.maptiler.com/maps/dark-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: '',
    maxZoom: 20,
  },
  satellite: {
    name: 'Satellite',
    url: `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
    attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: '',
    maxZoom: 20,
  },
  terrain: {
    name: 'Terrain',
    url: `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: '',
    maxZoom: 20,
  },
};

const THEME_ICONS: Record<MapTheme, string> = {
  default: '🗺️',
  dark: '🌙',
  satellite: '🛰️',
  terrain: '🏔️',
};

interface ExploreMapInnerProps {
  lat: number | null;
  lng: number | null;
  hasLocation: boolean;
  stations: StationSummary[];
  onStationSelect?: (stationId: string) => void;
  requestLocation?: () => void;
  geoLoading?: boolean;
  permissionState?: 'prompt' | 'granted' | 'denied' | 'unknown';
  stationsLoading?: boolean;
}

export function ExploreMapInner({
  lat,
  lng,
  hasLocation,
  stations,
  onStationSelect,
  requestLocation,
  geoLoading = false,
  permissionState = 'prompt',
  stationsLoading = false,
}: ExploreMapInnerProps) {
  const [mapTheme, setMapTheme] = useState<MapTheme>('default');
  const [isOpen, setIsOpen] = useState(false);

  // Dashboard state variables
  const [visibleStations, setVisibleStations] = useState<StationSummary[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  // Local merged set: prop stations + dynamically fetched on drag
  const [allStations, setAllStations] = useState<StationSummary[]>(stations);
  const [isFetchingArea, setIsFetchingArea] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  // User location marker — added dynamically when location is granted
  const userMarkerRef = useRef<L.Marker | null>(null);
  // Always-current ref so map event listeners are never stale
  const allStationsRef = useRef<StationSummary[]>(allStations);
  // Last center we fetched stations for — avoid redundant API calls
  const lastFetchedCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  // Debounce timer ref
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether we've already panned to user location
  const hasPannedToUserRef = useRef(false);

  // Keep ref in sync on every render
  allStationsRef.current = allStations;

  // Sync prop stations into allStations when they first arrive / change
  useEffect(() => {
    if (stations.length > 0) {
      setAllStations(prev => {
        const ids = new Set(prev.map(s => s.id));
        const merged = [...prev, ...stations.filter(s => !ids.has(s.id))];
        return merged;
      });
    }
  }, [stations]);

  // Haversine distance in km between two lat/lng points
  const haversineKm = useCallback((a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }, []);

  // Fetch stations for the new map center, merge with existing (dedup by id)
  const fetchStationsForArea = useCallback(async (centerLat: number, centerLng: number) => {
    const last = lastFetchedCenterRef.current;
    // Only re-fetch if we've moved more than 8km from last fetch
    // (matches our 5km search radius so there's meaningful new coverage)
    if (last && haversineKm(last, { lat: centerLat, lng: centerLng }) < 8) return;

    // Don't queue another request while one is still running
    if (isFetchingArea) return;

    lastFetchedCenterRef.current = { lat: centerLat, lng: centerLng };
    setIsFetchingArea(true);
    try {
      const newStations = await findNearbyStations(centerLat, centerLng, 5000);
      if (newStations.length > 0) {
        setAllStations(prev => {
          const ids = new Set(prev.map(s => s.id));
          const merged = [...prev, ...newStations.filter(s => !ids.has(s.id))];
          return merged;
        });
      }
    } catch (err) {
      console.error('[FuelVoice] Failed to fetch stations for area:', err);
    } finally {
      setIsFetchingArea(false);
    }
  }, [haversineKm, isFetchingArea]);

  // Stable callback — reads from ref, never stale
  const updateVisibleStations = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    const visible = allStationsRef.current.filter((s) => bounds.contains([s.lat, s.lng]));
    setVisibleStations(visible);
  }, []); // no deps — intentionally stable

  // On drag/zoom: debounced fetch for the new center + update sidebar
  const handleMapMoveEnd = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    updateVisibleStations();
    // Debounce Overpass fetch by 2s — user must stop panning before we query
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => {
      const center = map.getCenter();
      fetchStationsForArea(center.lat, center.lng);
    }, 2000);
  }, [updateVisibleStations, fetchStationsForArea]);

  // Handle message listener from custom popup links
  const handleMessage = useCallback((e: MessageEvent) => {
    // Security: only accept messages from our own origin
    if (e.origin !== window.location.origin) return;

    if (e.data?.type === 'fuelvoice:navigate' && e.data.stationId) {
      onStationSelect?.(e.data.stationId);
    } else if (e.data?.type === 'fuelvoice:select' && e.data.stationId) {
      const selected = stations.find((s) => s.id === e.data.stationId);
      if (selected) {
        setSelectedStation(selected);
      }
    }
  }, [onStationSelect, stations]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Default to Hyderabad center at station-level zoom
  const defaultLat = lat || 17.3887;
  const defaultLng = lng || 78.4754;

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = require('leaflet') as typeof import('leaflet');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([defaultLat, defaultLng], hasLocation ? 14 : 13);

    const initialTileLayer = L.tileLayer(THEMES[mapTheme].url, {
      attribution: THEMES[mapTheme].attribution,
      subdomains: THEMES[mapTheme].subdomains || 'abcd',
      maxZoom: THEMES[mapTheme].maxZoom || 20,
      tileSize: 512,
      zoomOffset: -1,
      crossOrigin: true,
    }).addTo(map);
    tileLayerRef.current = initialTileLayer;

    // Pulse dot for user location (if already available at mount time)
    if (lat !== null && lng !== null) {
      const userIcon = L.divIcon({
        html: `
          <div style="position:relative;width:18px;height:18px;">
            <div style="position:absolute;inset:0;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.6);z-index:2;"></div>
            <div style="position:absolute;inset:-6px;background:rgba(59,130,246,0.15);border-radius:50%;animation:pulse 2s ease-out infinite;z-index:1;"></div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const marker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('<strong style="font-size:13px;">📍 Your Location</strong>');
      userMarkerRef.current = marker;
      hasPannedToUserRef.current = true;
    }

    markersRef.current = L.layerGroup().addTo(map);

    // Event hooks for map view transitions — use single handler for both
    map.on('moveend', handleMapMoveEnd);
    map.on('zoomend', handleMapMoveEnd);

    mapInstanceRef.current = map;

    // Immediately trigger station fetch for the default viewport center
    // so sidebar populates even without user location
    fetchStationsForArea(defaultLat, defaultLng);

    // Initial check after tiles load
    setTimeout(updateVisibleStations, 600);

    return () => {
      map.off('moveend', handleMapMoveEnd);
      map.off('zoomend', handleMapMoveEnd);
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to user location when it becomes available AFTER mount
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || lat === null || lng === null || hasPannedToUserRef.current) return;

    const L = require('leaflet') as typeof import('leaflet');

    // Add pulsing user location marker
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }
    const userIcon = L.divIcon({
      html: `
        <div style="position:relative;width:18px;height:18px;">
          <div style="position:absolute;inset:0;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.6);z-index:2;"></div>
          <div style="position:absolute;inset:-6px;background:rgba(59,130,246,0.15);border-radius:50%;animation:pulse 2s ease-out infinite;z-index:1;"></div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    const marker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup('<strong style="font-size:13px;">📍 Your Location</strong>');
    userMarkerRef.current = marker;
    hasPannedToUserRef.current = true;

    // Smoothly fly to user's location
    map.flyTo([lat, lng], 14, { duration: 1.5 });

    // Fetch stations for user's area
    lastFetchedCenterRef.current = null; // reset so it fetches for user area
    fetchStationsForArea(lat, lng);
  }, [lat, lng, fetchStationsForArea]);

  // Update map tile theme layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const currentTileLayer = tileLayerRef.current;
    if (!map) return;

    const L = require('leaflet') as typeof import('leaflet');

    if (currentTileLayer) {
      map.removeLayer(currentTileLayer);
    }

    const themeConfig = THEMES[mapTheme];
    const newTileLayer = L.tileLayer(themeConfig.url, {
      attribution: themeConfig.attribution,
      subdomains: themeConfig.subdomains || 'abcd',
      maxZoom: themeConfig.maxZoom || 20,
      tileSize: 512,
      zoomOffset: -1,
      crossOrigin: true,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [mapTheme]);

  // Re-render markers whenever allStations changes
  useEffect(() => {
    const L = require('leaflet') as typeof import('leaflet');
    const map = mapInstanceRef.current;
    const markerGroup = markersRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();

    allStations.forEach((station) => {
      const stationIcon = L.divIcon({
        html: `
          <div style="
            width:36px;height:36px;
            background:linear-gradient(135deg,#F97316,#EA580C);
            border-radius:50% 50% 50% 4px;
            transform:rotate(-45deg);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(249,115,22,0.4);
            border:2px solid white;
          ">
            <span style="transform:rotate(45deg);font-size:16px;line-height:1;">⛽</span>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const distanceText = station.distance !== undefined
        ? station.distance < 1
          ? `${Math.round(station.distance * 1000)}m away`
          : `${station.distance.toFixed(1)}km away`
        : '';

      const ratingStars = station.avgRating > 0
        ? `<div style="color:#F59E0B;font-size:12px;margin:2px 0;">${'★'.repeat(Math.round(station.avgRating))}${'☆'.repeat(5 - Math.round(station.avgRating))} <span style="color:#64748B;">${station.avgRating.toFixed(1)}</span></div>`
        : '<div style="font-size:11px;color:#94A3B8;margin:2px 0;">No reviews yet</div>';

      const reviewText = station.reviewCount > 0
        ? `${station.reviewCount} review${station.reviewCount > 1 ? 's' : ''}`
        : '';

      const safeName = escapeHtml(station.name);
      const safeBrand = escapeHtml(station.brand || '');
      const safeId = escapeHtml(station.id);

      const popupHtml = `
        <div style="min-width:200px;max-width:260px;font-family:system-ui,sans-serif;">
          <div style="font-size:14px;font-weight:700;color:#0F172A;line-height:1.3;">${safeName}</div>
          ${safeBrand ? `<div style="font-size:11px;color:#64748B;margin-top:2px;">${safeBrand}</div>` : ''}
          ${ratingStars}
          <div style="display:flex;gap:8px;align-items:center;margin-top:2px;">
            ${distanceText ? `<span style="font-size:11px;color:#94A3B8;">📍 ${distanceText}</span>` : ''}
            ${reviewText ? `<span style="font-size:11px;color:#94A3B8;">💬 ${reviewText}</span>` : ''}
          </div>
          <button onclick="window.postMessage({type: 'fuelvoice:select', stationId: '${safeId}'}, window.location.origin)"
             style="display:block;width:100%;margin-top:8px;padding:6px 12px;border:none;background:linear-gradient(135deg,#F97316,#EA580C);color:white;border-radius:8px;font-size:12px;font-weight:600;text-align:center;cursor:pointer;transition:opacity 0.2s;"
             onmouseover="this.style.opacity='0.9'"
             onmouseout="this.style.opacity='1'">
            View Reviews
          </button>
        </div>
      `;

      const marker = L.marker([station.lat, station.lng], { icon: stationIcon });
      marker.bindPopup(popupHtml, { maxWidth: 280, className: 'station-popup' });
      
      // Select station and open reviews on clicking marker
      marker.on('click', () => {
        setSelectedStation(station);
      });

      markerGroup.addLayer(marker);
    });

    // On first load only: fitbounds to show all markers, then update sidebar after animation
    // On subsequent drags we don't re-fitbounds (user is exploring freely)
    if (allStations.length > 0 && lastFetchedCenterRef.current === null) {
      const allPoints: [number, number][] = allStations.map((s) => [s.lat, s.lng] as [number, number]);
      if (lat !== null && lng !== null) {
        allPoints.push([lat, lng]);
      }
      const bounds = L.latLngBounds(allPoints);
      map.once('moveend', updateVisibleStations);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      updateVisibleStations();
    }
  }, [allStations, lat, lng, updateVisibleStations]);

  // Load reviews when selectedStation changes
  useEffect(() => {
    if (!selectedStation) {
      setReviews([]);
      return;
    }

    let active = true;
    const fetchReviewsList = async () => {
      setReviewsLoading(true);
      try {
        const res = await getReviews(selectedStation.id, 'newest', 10);
        if (active) {
          setReviews(res.reviews);
        }
      } catch (err) {
        console.error('Error fetching reviews for map:', err);
      } finally {
        if (active) {
          setReviewsLoading(false);
        }
      }
    };

    fetchReviewsList();

    return () => {
      active = false;
    };
  }, [selectedStation]);

  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full lg:h-[600px] h-auto">
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
        .station-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
          padding: 0 !important;
        }
        .station-popup .leaflet-popup-content {
          margin: 12px !important;
        }
        .station-popup .leaflet-popup-tip {
          box-shadow: 0 4px 8px rgba(0,0,0,0.08) !important;
        }
        /* Custom Scrollbar for Sidebar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-primary);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--text-tertiary);
        }
      `}</style>

      {/* Left Sidebar Panel (Bunks List & Reviews) */}
      <div 
        className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col h-[500px] lg:h-full rounded-2xl border shadow-lg overflow-hidden transition-all duration-300"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-primary)',
        }}
      >
        {selectedStation ? (
          /* Selected Bunk Reviews View (PRIORITY) */
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b flex flex-col gap-2 shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
              <button
                onClick={() => setSelectedStation(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors self-start"
              >
                ← Back to Bunks List
              </button>
              <div className="flex items-start justify-between gap-3 mt-1">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {selectedStation.name}
                  </h3>
                  {selectedStation.brand && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/5 dark:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                      {selectedStation.brand}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Summary card */}
              <div 
                className="p-4 rounded-xl border flex items-center justify-between gap-4" 
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
              >
                <div>
                  <div className="text-3xl font-black leading-none" style={{ color: 'var(--text-primary)' }}>
                    {selectedStation.avgRating > 0 ? selectedStation.avgRating.toFixed(1) : '—'}
                  </div>
                  <div className="flex items-center gap-0.5 text-xs text-amber-500 mt-1.5">
                    {selectedStation.avgRating > 0 ? (
                      <>
                        {'★'.repeat(Math.round(selectedStation.avgRating))}${'☆'.repeat(5 - Math.round(selectedStation.avgRating))}
                      </>
                    ) : (
                      '☆☆☆☆☆'
                    )}
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {selectedStation.reviewCount} user review{selectedStation.reviewCount === 1 ? '' : 's'}
                  </div>
                </div>
                <button
                  onClick={() => onStationSelect?.(selectedStation.id)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 transition-all shadow-md hover:shadow-lg"
                >
                  Write Review
                </button>
              </div>

              {/* Section Divider */}
              <div className="flex items-center justify-between mt-4">
                <h4 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  User Reviews
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
                  Priority View
                </span>
              </div>

              {/* Reviews Feed */}
              {reviewsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Loading community reviews…</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-2xl p-6" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="text-3xl mb-2 block">💬</span>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No reviews yet</p>
                  <p className="text-xs mb-4 mt-1" style={{ color: 'var(--text-secondary)' }}>Be the first to share your rating for this bunk</p>
                  <button
                    onClick={() => onStationSelect?.(selectedStation.id)}
                    className="py-2 px-4 rounded-xl text-xs font-bold text-brand-500 border border-brand-500/30 hover:bg-brand-500/5 transition-all"
                  >
                    Add First Review
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div 
                      key={review.id} 
                      className="p-3.5 rounded-xl border flex flex-col gap-2" 
                      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {review.userPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={review.userPhoto} alt={review.userName} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[10px] font-bold uppercase">
                              {review.userName.charAt(0)}
                            </div>
                          )}
                          <span className="text-xs font-bold truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>
                            {review.isAnonymous ? 'Anonymous' : review.userName}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-[9px] text-amber-500">
                          {'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>
                      
                      {review.title && (
                        <h5 className="font-bold text-xs line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                          {review.title}
                        </h5>
                      )}
                      
                      <p className="text-xs leading-relaxed line-clamp-4" style={{ color: 'var(--text-secondary)' }}>
                        {review.content}
                      </p>
                    </div>
                  ))}

                  <button
                    onClick={() => onStationSelect?.(selectedStation.id)}
                    className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-center border transition-all duration-200 animate-fadeIn"
                    style={{ 
                      color: 'var(--text-secondary)',
                      borderColor: 'var(--border-primary)',
                      background: 'var(--bg-secondary)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--text-tertiary)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
                  >
                    View All Reviews & Station details →
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Default Map Viewport Listing State */
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  Visible Bunks
                  {isFetchingArea && (
                    <span className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin inline-block" title="Searching area…" />
                  )}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {isFetchingArea ? 'Searching new area…' : 'Showing active stations inside current area'}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
                {visibleStations.length} Active
              </span>
            </div>

            {/* Non-blocking location prompt banner */}
            {!hasLocation && permissionState !== 'denied' && requestLocation && (
              <div className="mx-4 mt-3 mb-1">
                <button
                  onClick={requestLocation}
                  disabled={geoLoading}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border hover:shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(249,115,22,0.06))',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {geoLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>Detecting your location…</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">📍</span>
                      <span className="flex-1 text-left">Enable location for nearby bunks</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-brand-500/10 text-brand-500 font-bold">Optional</span>
                    </>
                  )}
                </button>
              </div>
            )}
            {!hasLocation && permissionState === 'denied' && (
              <div className="mx-4 mt-3 mb-1 px-3.5 py-2 rounded-xl text-[11px] border flex items-center gap-2"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-tertiary)',
                }}
              >
                <span>🔒</span>
                <span>Location denied — showing default area. Use search or pan the map to explore.</span>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {stationsLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 gap-3">
                  <span className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Loading fuel stations…</span>
                </div>
              ) : visibleStations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60 py-12 animate-fadeIn">
                  <span className="text-4xl mb-3 animate-float">🧭</span>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No bunks in viewport</p>
                  <p className="text-xs max-w-[200px] mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Swipe, drag or zoom out the map to find nearby stations.
                  </p>
                </div>
              ) : (
                visibleStations.map((station) => (
                  <div
                    key={station.id}
                    onClick={() => {
                      setSelectedStation(station);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([station.lat, station.lng], 16);
                      }
                    }}
                    className="p-3.5 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md hover:border-brand-500/40 flex flex-col gap-2 group animate-fadeIn"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-brand-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {station.name}
                      </h4>
                      {station.brand && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                          {station.brand}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        {station.avgRating > 0 ? (
                          <>
                            <span className="text-amber-500">★</span>
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                              {station.avgRating.toFixed(1)}
                            </span>
                            <span style={{ color: 'var(--text-tertiary)' }}>
                              ({station.reviewCount})
                            </span>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)' }}>No reviews yet</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <span>📍 {station.distance !== undefined ? (station.distance < 1 ? `${Math.round(station.distance * 1000)}m` : `${station.distance.toFixed(1)}km`) : ''}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Map Canvas Panel */}
      <div 
        className="flex-1 h-[400px] lg:h-full rounded-2xl overflow-hidden shadow-xl border relative"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <div
          ref={mapRef}
          style={{ height: '100%', width: '100%', minHeight: 400 }}
          role="application"
          aria-label="Interactive map of nearby fuel stations"
        />

        {/* Floating Theme Switcher */}
        <div 
          ref={switcherRef}
          className="absolute bottom-6 right-4 z-[1000] flex flex-col items-end"
        >
          {isOpen && (
            <div 
              className="mb-2 p-1.5 rounded-xl border shadow-xl flex flex-col gap-1 min-w-[130px] animate-fadeIn transition-all"
              style={{ 
                background: 'var(--bg-primary)', 
                borderColor: 'var(--border-primary)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {(Object.keys(THEMES) as MapTheme[]).map((theme) => {
                const isActive = mapTheme === theme;
                return (
                  <button
                    key={theme}
                    onClick={() => {
                      setMapTheme(theme);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-brand-500 to-brand-600 shadow-sm' 
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={!isActive ? { color: 'var(--text-secondary)' } : undefined}
                  >
                    <span className="text-base">{THEME_ICONS[theme]}</span>
                    <span>{THEMES[theme].name}</span>
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-11 h-11 rounded-full shadow-lg border transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ 
              background: 'var(--bg-primary)', 
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
            title="Switch Map Theme"
            aria-label="Switch Map Theme"
          >
            <span className="text-xl">{THEME_ICONS[mapTheme]}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
