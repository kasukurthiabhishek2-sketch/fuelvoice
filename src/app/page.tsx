/**
 * Landing Page
 * 
 * FuelVoice home page with hero (search), interactive map, nearby station cards,
 * and statistics. Everything is accessible from one page.
 */

'use client';

import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { ExploreMapSection } from '@/components/landing/ExploreMapSection';
import { NearbyStations } from '@/components/landing/NearbyStations';
import { Statistics } from '@/components/landing/Statistics';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function HomePage() {
  const { latitude, longitude } = useGeolocation();

  return (
    <>
      <Hero userLat={latitude} userLng={longitude} />
      
      {/* <NearbyStations /> */}
      <Statistics />
    </>
  );
}
