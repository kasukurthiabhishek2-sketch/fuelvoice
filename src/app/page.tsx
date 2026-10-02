/** FuelVoice landing page. */

'use client';

import { Hero } from '@/components/landing/Hero';
import { NearbyStations } from '@/components/landing/NearbyStations';
import { Statistics } from '@/components/landing/Statistics';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function HomePage() {
  const geolocation = useGeolocation();

  return (
    <>
      <Hero geolocation={geolocation} />
      <NearbyStations geolocation={geolocation} />
      <Statistics />
    </>
  );
}
