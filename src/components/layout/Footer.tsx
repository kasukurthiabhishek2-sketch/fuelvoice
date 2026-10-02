/**
 * Compact, high-contrast product footer.
 */

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="px-0 pt-4 sm:px-4 lg:px-6">
      <div className="footer-shell mx-auto max-w-[1380px] px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr_0.8fr] lg:gap-14">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="FuelVoice footer">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-brand-500 text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M6.5 4.5h7.5v15H6.5z" strokeLinejoin="round" />
                  <path d="M8.5 7h3.5M14 8.5h2.2l1.8 2.1V17a1.5 1.5 0 0 0 3 0v-5.7l-1.8-2.1" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.5 15.5h7.5M5 19.5h10.5" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <span className="block text-xl font-black tracking-[-0.045em] text-white">FuelVoice</span>
                <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[0.14em] text-white/45">Better stops, informed by drivers</span>
              </span>
            </Link>

            <p className="mt-6 max-w-lg text-sm leading-7 text-white/60">
              Mapped station facts, community experiences, and practical consumer guidance in one calmer place to decide where to stop.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {['Mapped facts', 'Community reviews', 'Open access'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white/55">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <FooterGroup title="Discover">
            <FooterLink href="/#explore-map" label="Explore map" />
            <FooterLink href="/#nearby-stations" label="Nearby stations" />
            <FooterLink href="/search" label="Search stations" />
          </FooterGroup>

          <FooterGroup title="Consumer resources">
            <FooterLink href="https://consumerhelpline.gov.in" label="Consumer Helpline · India" external />
            <FooterLink href="https://reportfraud.ftc.gov" label="Report Fraud · USA" external />
            <FooterLink href="https://www.citizensadvice.org.uk" label="Citizens Advice · UK" external />
          </FooterGroup>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FuelVoice. Community reviews with mapped source data.</p>
          <p>
            Powered by OpenStreetMap · Map data ©{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white/60 underline decoration-white/20 underline-offset-4 transition hover:text-white"
            >
              OpenStreetMap contributors
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">{title}</h2>
      <ul className="mt-5 space-y-3.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const Component = external ? 'a' : Link;

  return (
    <li>
      <Component
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/65 transition-colors hover:text-white"
        {...linkProps}
      >
        {label}
        {external && (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 5h5v5M19 5l-8 8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 13v5H6V6h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </Component>
    </li>
  );
}
