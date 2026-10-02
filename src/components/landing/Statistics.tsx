/** Product trust pillars backed by actual FuelVoice behavior. */

'use client';

import { motion } from 'framer-motion';

const pillars = [
  {
    number: '01',
    label: 'Mapped discovery',
    title: 'Open map data, presented clearly',
    description: 'FuelVoice uses OpenStreetMap-backed station data for discovery instead of a closed station directory.',
  },
  {
    number: '02',
    label: 'Community context',
    title: 'Reviews beyond a single score',
    description: 'Category ratings help separate fuel quality, service, staff behaviour, cleanliness, washrooms and air filling.',
  },
  {
    number: '03',
    label: 'Consumer action',
    title: 'Useful when something goes wrong',
    description: 'Station pages connect people with country-aware consumer complaint resources instead of burying the next step.',
  },
  {
    number: '04',
    label: 'Open access',
    title: 'Browse before you sign in',
    description: 'Search and station discovery stay available without a subscription or forced account wall.',
  },
];

export function Statistics() {
  return (
    <section className="section-shell border-y" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
      <div className="page-shell">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <span className="eyebrow">Trust by design</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Powered by Community
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              A useful station review product should make its data source, limitations and consumer actions obvious. These are the parts FuelVoice is built around.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {pillars.map((pillar, index) => (
              <motion.article
                key={pillar.number}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="rounded-[22px] border p-5 sm:p-6"
                style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black tracking-[0.14em] text-brand-500">{pillar.number}</span>
                  <span className="rounded-full bg-surface-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] dark:bg-surface-800"
                    style={{ color: 'var(--text-tertiary)' }}>
                    {pillar.label}
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{pillar.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
