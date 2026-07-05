/**
 * Station Map Component
 * 
 * Leaflet map with OpenStreetMap tiles. Dynamically imported (no SSR)
 * because Leaflet requires the window object.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface StationMapProps {
  lat: number;
  lng: number;
  name: string;
  userLat?: number | null;
  userLng?: number | null;
  className?: string;
}

export function StationMapInner({ lat, lng, name, userLat, userLng, className = '' }: StationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = require('leaflet') as typeof import('leaflet');

    // Fix Leaflet's default icon issue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current).setView([lat, lng], 15);

    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerKey}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20,
      tileSize: 512,
      zoomOffset: -1,
      crossOrigin: true,
    }).addTo(map);

    // Station marker
    const stationIcon = L.divIcon({
      html: '<div style="font-size:24px;text-align:center;">⛽</div>',
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    L.marker([lat, lng], { icon: stationIcon })
      .addTo(map)
      .bindPopup(`<strong>${name}</strong>`);

    // User location marker
    if (userLat && userLng) {
      const userIcon = L.divIcon({
        html: '<div style="width:12px;height:12px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.5);"></div>',
        className: 'custom-marker',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup('Your Location');

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([lat, lng], [userLat, userLng]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, name, userLat, userLng]);

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      <div ref={mapRef} style={{ height: 300, width: '100%' }} />
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 shadow-lg transition-colors z-[1000]"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Get Directions
      </a>
    </div>
  );
}
