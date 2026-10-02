/** FuelVoice landing page. */

'use client';

import { Hero } from '@/components/landing/Hero';
import { NearbyStations } from '@/components/landing/NearbyStations';
import { Statistics } from '@/components/landing/Statistics';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function HomePage() {
  const { latitude, longitude } = useGeolocation();

  return (
    <>
      <Hero userLat={latitude} userLng={longitude} />
      <NearbyStations />
      <Statistics />
    </>
  );
}
