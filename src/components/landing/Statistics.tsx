/** Product and data-source facts without unverifiable vanity metrics. */

'use client';

import { motion } from 'framer-motion';

const principles = [
  {
    number: '01',
    label: 'Mapped source',
    value: 'OpenStreetMap',
    description: 'Station locations and public metadata come from community-maintained map data.',
  },
  {
    number: '02',
    label: 'Review signal',
    value: 'Community-led',
    description: 'FuelVoice ratings come from user-submitted experiences, not fabricated fallback scores.',
  },
  {
    number: '03',
    label: 'Coverage',
    value: 'Global',
    description: 'Discovery works wherever OpenStreetMap has mapped fuel stations and usable metadata.',
  },
  {
    number: '04',
    label: 'Access',
    value: 'Open',
    description: 'Search and browse mapped stations without putting basic discovery behind a subscription.',
  },
];

export function Statistics() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div className="max-w-xl">
            <p className="section-kicker">Powered by Community</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Useful because the source is clear.
            </h2>
            <p className="mt-4 text-sm leading-6 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              FuelVoice keeps mapped facts and community opinions distinct so users can understand what each signal represents.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {principles.map((principle, index) => (
              <motion.article
                key={principle.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="card relative overflow-hidden p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[11px] font-black tracking-[0.12em] text-brand-500">{principle.number}</span>
                  <span className="rounded-lg bg-[var(--bg-tertiary)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-tertiary)' }}>
                    {principle.label}
                  </span>
                </div>
                <p className="mt-6 text-xl font-extrabold tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
                  {principle.value}
                </p>
                <p className="mt-2 text-xs leading-5 sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {principle.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
