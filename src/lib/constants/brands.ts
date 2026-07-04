/**
 * Fuel Brand Constants
 * 
 * Brand colors and display names for known fuel companies.
 * Used for station cards, brand filtering, and visual accents.
 */

export interface FuelBrand {
  name: string;
  color: string;
  bgColor: string;
}

/** Known fuel brands with their visual identifiers */
export const FUEL_BRANDS: Record<string, FuelBrand> = {
  // India
  'indian oil': { name: 'Indian Oil', color: '#E31937', bgColor: '#FEE2E2' },
  'iocl': { name: 'Indian Oil', color: '#E31937', bgColor: '#FEE2E2' },
  'hindustan petroleum': { name: 'Hindustan Petroleum', color: '#003DA5', bgColor: '#DBEAFE' },
  'hpcl': { name: 'Hindustan Petroleum', color: '#003DA5', bgColor: '#DBEAFE' },
  'bharat petroleum': { name: 'Bharat Petroleum', color: '#FFD700', bgColor: '#FEF3C7' },
  'bpcl': { name: 'Bharat Petroleum', color: '#FFD700', bgColor: '#FEF3C7' },
  'reliance': { name: 'Reliance', color: '#0057B8', bgColor: '#DBEAFE' },
  'nayara': { name: 'Nayara Energy', color: '#FF6600', bgColor: '#FFF7ED' },
  'nayara energy': { name: 'Nayara Energy', color: '#FF6600', bgColor: '#FFF7ED' },

  // International
  'shell': { name: 'Shell', color: '#FFD500', bgColor: '#FEF3C7' },
  'bp': { name: 'BP', color: '#007B33', bgColor: '#DCFCE7' },
  'exxonmobil': { name: 'ExxonMobil', color: '#E31937', bgColor: '#FEE2E2' },
  'exxon': { name: 'Exxon', color: '#E31937', bgColor: '#FEE2E2' },
  'mobil': { name: 'Mobil', color: '#E31937', bgColor: '#FEE2E2' },
  'chevron': { name: 'Chevron', color: '#0054A6', bgColor: '#DBEAFE' },
  'texaco': { name: 'Texaco', color: '#E31937', bgColor: '#FEE2E2' },
  'total': { name: 'TotalEnergies', color: '#FF4500', bgColor: '#FFF7ED' },
  'totalenergies': { name: 'TotalEnergies', color: '#FF4500', bgColor: '#FFF7ED' },
  'esso': { name: 'Esso', color: '#E31937', bgColor: '#FEE2E2' },
  'petronas': { name: 'Petronas', color: '#00A19C', bgColor: '#CCFBF1' },
  'caltex': { name: 'Caltex', color: '#E31937', bgColor: '#FEE2E2' },
  'sinopec': { name: 'Sinopec', color: '#E31937', bgColor: '#FEE2E2' },
  'petrobras': { name: 'Petrobras', color: '#006B35', bgColor: '#DCFCE7' },
  'eni': { name: 'Eni', color: '#FFCC00', bgColor: '#FEF3C7' },
  'repsol': { name: 'Repsol', color: '#FF6600', bgColor: '#FFF7ED' },
  'aral': { name: 'Aral', color: '#003399', bgColor: '#DBEAFE' },
  'circle k': { name: 'Circle K', color: '#E31937', bgColor: '#FEE2E2' },
  'costco': { name: 'Costco', color: '#E31937', bgColor: '#FEE2E2' },
  'sunoco': { name: 'Sunoco', color: '#0055A5', bgColor: '#DBEAFE' },
  'marathon': { name: 'Marathon', color: '#E31937', bgColor: '#FEE2E2' },
  'valero': { name: 'Valero', color: '#005BAA', bgColor: '#DBEAFE' },
  'speedway': { name: 'Speedway', color: '#E31937', bgColor: '#FEE2E2' },
};

/** Get brand info by name (case-insensitive lookup) */
export function getBrand(name: string): FuelBrand {
  const key = name.toLowerCase().trim();
  return FUEL_BRANDS[key] || { name: name || 'Unknown', color: '#6B7280', bgColor: '#F3F4F6' };
}

/** Get unique brand names for filter dropdown */
export function getUniqueBrands(): string[] {
  const seen = new Set<string>();
  return Object.values(FUEL_BRANDS)
    .filter((b) => {
      if (seen.has(b.name)) return false;
      seen.add(b.name);
      return true;
    })
    .map((b) => b.name)
    .sort();
}
