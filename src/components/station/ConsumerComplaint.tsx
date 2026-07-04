/**
 * Consumer Complaint Component
 * 
 * Shows relevant consumer protection links based on station country.
 * Auto-detects country or uses station address data.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getComplaintPortals, type CountryComplaints } from '@/lib/api/complaints';
import { reverseGeocode } from '@/lib/api/nominatim';

interface ConsumerComplaintProps {
  lat: number;
  lng: number;
  countryCode?: string;
}

export function ConsumerComplaint({ lat, lng, countryCode: initialCode }: ConsumerComplaintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [complaints, setComplaints] = useState<CountryComplaints | null>(null);

  useEffect(() => {
    if (initialCode) {
      setComplaints(getComplaintPortals(initialCode));
      return;
    }
    // Auto-detect country from coordinates
    reverseGeocode(lat, lng).then((result) => {
      if (result) {
        setComplaints(getComplaintPortals(result.countryCode));
      }
    }).catch(() => {
      setComplaints(getComplaintPortals(''));
    });
  }, [lat, lng, initialCode]);

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-colors hover:border-danger-400/30"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>File Consumer Complaint</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {complaints ? `Resources for ${complaints.country}` : 'Loading…'}
            </p>
          </div>
        </div>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-tertiary)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && complaints && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">
              {complaints.portals.map((portal) => (
                <div key={portal.name} className="card p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{portal.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{portal.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{portal.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {portal.url && (
                          <a href={portal.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
                            Visit Website ↗
                          </a>
                        )}
                        {portal.phone && (
                          <a href={`tel:${portal.phone}`}
                            className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
                            📞 {portal.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
