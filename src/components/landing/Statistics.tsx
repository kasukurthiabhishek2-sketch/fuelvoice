/** Product/data-source facts without unverifiable vanity metrics. */

'use client';

import { motion } from 'framer-motion';

const stats = [
  { icon: '🗺️', label: 'Map Data', value: 'OpenStreetMap', description: 'Community-maintained station locations and metadata' },
  { icon: '⭐', label: 'Reviews', value: 'Community-led', description: 'Experiences shared by FuelVoice users' },
  { icon: '🌍', label: 'Coverage', value: 'Global', description: 'Where OpenStreetMap has mapped fuel stations' },
  { icon: '🔎', label: 'Discovery', value: 'Open access', description: 'Browse and search without a subscription' },
];

export function Statistics() {
  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Powered by Community</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Open map data paired with community reviews</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: index * 0.08, duration: 0.35 }} className="card p-6 text-center">
              <div className="text-3xl mb-3" aria-hidden="true">{stat.icon}</div>
              <p className="text-xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{stat.label}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
