/**
 * Hero Section
 * 
 * Landing page hero with animated gradient mesh background,
 * floating fuel icons, and a prominent search bar.
 */

'use client';

import { motion } from 'framer-motion';
import { SearchBar } from '@/components/search/SearchBar';
import { ExploreMapSection } from './ExploreMapSection';

interface HeroProps {
  userLat?: number | null;
  userLng?: number | null;
}

export function Hero({ userLat, userLng }: HeroProps) {
  return (
    <section className="relative overflow-hidden gradient-mesh">
      {/* Floating fuel icons */}
      <FloatingIcons />

      <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-5">
        <div className="text-center max-w-3xl mx-auto">
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Find Honest{' '}
            <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
              Fuel Station
            </span>{' '}
            Reviews
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg max-w-xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Search mapped fuel stations, read community reviews, and share first-hand experiences.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <SearchBar
              variant="hero"
              userLat={userLat}
              userLng={userLng}
              placeholder="Search fuel stations by name, brand, or city…"
            />
          </motion.div>
        </div>
      </div>
      <ExploreMapSection />
    </section>
  );
}

/** Subtle floating fuel-themed decorative icons */
function FloatingIcons() {
  const icons = [
    { emoji: '⛽', top: '15%', left: '8%', delay: 0, size: 'text-3xl' },
    { emoji: '🛢️', top: '25%', right: '10%', delay: 0.5, size: 'text-2xl' },
    { emoji: '🔧', bottom: '20%', left: '12%', delay: 1, size: 'text-xl' },
    { emoji: '🚗', bottom: '30%', right: '8%', delay: 1.5, size: 'text-2xl' },
    { emoji: '⭐', top: '40%', left: '5%', delay: 0.8, size: 'text-xl' },
    { emoji: '💧', top: '60%', right: '5%', delay: 1.2, size: 'text-xl' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {icons.map((icon, i) => (
        <motion.div
          key={i}
          className={`absolute ${icon.size} opacity-[0.08] dark:opacity-[0.05]`}
          style={{
            top: icon.top,
            left: icon.left,
            right: icon.right,
            bottom: icon.bottom,
          }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: icon.delay,
            ease: 'easeInOut',
          }}
        >
          {icon.emoji}
        </motion.div>
      ))}
    </div>
  );
}
