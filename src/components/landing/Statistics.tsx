/** Transparent product principles without vanity metrics. */

'use client';

const principles = [
  {
    number: '01',
    label: 'Mapped source',
    value: 'OpenStreetMap',
    description: 'Station identity and public metadata stay connected to a source users can verify.',
  },
  {
    number: '02',
    label: 'Review signal',
    value: 'Community-led',
    description: 'Ratings are submitted experiences, not generated filler when source data is missing.',
  },
  {
    number: '03',
    label: 'Coverage',
    value: 'Global',
    description: 'Discovery works wherever OpenStreetMap has usable mapped fuel-station data.',
  },
  {
    number: '04',
    label: 'Access',
    value: 'Open',
    description: 'Basic discovery remains available without forcing users through a subscription wall.',
  },
];

export function Statistics() {
  return (
    <section className="pb-20 pt-4 sm:pb-24 lg:pb-28">
      <div className="app-frame">
        <div className="premium-shell overflow-hidden">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:p-10">
            <div className="max-w-xl">
              <p className="section-kicker">Powered by Community</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] sm:text-4xl lg:text-[2.8rem]" style={{ color: 'var(--text-primary)' }}>
                Trust starts with knowing what each signal means.
              </h2>
              <p className="mt-4 text-sm leading-7 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                FuelVoice separates mapped facts from driver opinions, so the interface can be useful without pretending every data point has the same authority.
              </p>

              <div className="mt-8 flex items-center gap-3 border-t border-[var(--border-primary)] pt-5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 3.5 19 6v5.3c0 4.4-2.7 7.6-7 9.2-4.3-1.6-7-4.8-7-9.2V6l7-2.5Z" strokeLinejoin="round" />
                    <path d="m9.3 12 1.7 1.7 3.8-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="max-w-sm text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>
                  Source outages remain visible instead of being masked with invented station or review data.
                </p>
              </div>
            </div>

            <div className="principle-strip divide-y divide-[var(--border-primary)]">
              {principles.map((principle) => (
                <article key={principle.label} className="grid gap-3 py-5 sm:grid-cols-[54px_1fr_auto] sm:items-center sm:gap-5">
                  <span className="text-[10px] font-black tracking-[0.15em] text-brand-600 dark:text-brand-300">
                    {principle.number}
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.11em]" style={{ color: 'var(--text-tertiary)' }}>
                      {principle.label}
                    </p>
                    <p className="mt-1 text-base font-black tracking-[-0.025em]" style={{ color: 'var(--text-primary)' }}>
                      {principle.value}
                    </p>
                  </div>
                  <p className="max-w-sm text-xs leading-5 sm:text-right" style={{ color: 'var(--text-secondary)' }}>
                    {principle.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
