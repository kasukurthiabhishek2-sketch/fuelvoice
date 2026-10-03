/** FuelVoice landing page. */

'use client';

import { Hero } from '@/components/landing/Hero';
import { NearbyStations } from '@/components/landing/NearbyStations';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function HomePage() {
  const geolocation = useGeolocation();

  return (
    <>
      <Hero userLat={geolocation.latitude} userLng={geolocation.longitude} />
      <NearbyStations geolocation={geolocation} />
    </>
  );
}
