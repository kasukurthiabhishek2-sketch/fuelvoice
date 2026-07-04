/**
 * Statistics Section
 * 
 * Displays platform-wide statistics with animated counters.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  {
    icon: '⛽',
    label: 'Fuel Stations',
    value: '100K+',
    description: 'Mapped worldwide via OpenStreetMap',
  },
  {
    icon: '⭐',
    label: 'Community Reviews',
    value: 'Growing',
    description: 'Real experiences from real users',
  },
  {
    icon: '🌍',
    label: 'Countries Covered',
    value: '190+',
    description: 'Every country with OSM data',
  },
  {
    icon: '💰',
    label: 'Cost to Use',
    value: '$0',
    description: 'Free forever, open-source data',
  },
];

export function Statistics() {
  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Powered by Community
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Built on open data, free for everyone
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="card p-6 text-center"
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <p className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
                {stat.label}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
