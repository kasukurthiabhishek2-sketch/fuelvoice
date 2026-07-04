/**
 * Footer Component
 * 
 * Minimal, elegant footer with useful links and attribution.
 */

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⛽</span>
              <span className="text-lg font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                FuelVoice
              </span>
            </div>
            <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
              A community-driven platform for honest petrol pump and gas station reviews.
              Empowering consumers to make informed choices about fuel quality and service.
            </p>
            <p className="text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}>
              Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-500 transition-colors">OpenStreetMap</a> contributors
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
              Explore
            </h3>
            <ul className="space-y-2">
              <FooterLink href="/#nearby-stations" label="Nearby Stations" />
              <FooterLink href="/#explore-map" label="Explore Map" />
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
              Resources
            </h3>
            <ul className="space-y-2">
              <FooterLink href="https://consumerhelpline.gov.in" label="Consumer Helpline (India)" external />
              <FooterLink href="https://reportfraud.ftc.gov" label="Report Fraud (USA)" external />
              <FooterLink href="https://www.citizensadvice.org.uk" label="Citizens Advice (UK)" external />
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} FuelVoice. Built with community data.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <span>Powered by OpenStreetMap</span>
            <span>•</span>
            <span>Zero cost to run</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const linkProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  const Component = external ? 'a' : Link;

  return (
    <li>
      <Component
        href={href}
        className="text-sm transition-colors hover:text-brand-500"
        style={{ color: 'var(--text-secondary)' }}
        {...linkProps}
      >
        {label}
        {external && <span className="ml-1 text-xs">↗</span>}
      </Component>
    </li>
  );
}
