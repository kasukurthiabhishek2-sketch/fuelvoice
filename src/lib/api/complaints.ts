/**
 * Verified complaint destinations.
 *
 * Only official brand/operator or government/consumer-protection destinations
 * belong here. Unknown countries and unverified brands intentionally return no
 * route rather than sending a frustrated user somewhere questionable.
 */

export interface ComplaintRoute {
  name: string;
  description: string;
  url: string;
  kind: 'brand' | 'government';
  verified: true;
}

export interface CountryComplaints {
  country: string;
  portals: ComplaintRoute[];
}

const GOVERNMENT_ROUTES: Record<string, { country: string; route: ComplaintRoute }> = {
  in: {
    country: 'India',
    route: {
      name: 'National Consumer Helpline',
      description: 'Government of India consumer grievance portal.',
      url: 'https://consumerhelpline.gov.in/public/',
      kind: 'government',
      verified: true,
    },
  },
  us: {
    country: 'United States',
    route: {
      name: 'State consumer protection office',
      description: 'USAGov directory for official state consumer protection offices.',
      url: 'https://www.usa.gov/state-consumer',
      kind: 'government',
      verified: true,
    },
  },
  gb: {
    country: 'United Kingdom',
    route: {
      name: 'Consumer rights help',
      description: 'GOV.UK consumer rights and complaint guidance.',
      url: 'https://www.gov.uk/consumer-protection-rights',
      kind: 'government',
      verified: true,
    },
  },
  au: {
    country: 'Australia',
    route: {
      name: 'ACCC consumer issue',
      description: 'Australian Competition and Consumer Commission reporting and complaint guidance.',
      url: 'https://www.accc.gov.au/about-us/contact-us-or-report-an-issue',
      kind: 'government',
      verified: true,
    },
  },
  ca: {
    country: 'Canada',
    route: {
      name: 'Consumer Complaint Roadmap',
      description: 'Government of Canada guidance to the correct complaint-handling body.',
      url: 'https://ised-isde.canada.ca/site/office-consumer-affairs/en/complaint-roadmap',
      kind: 'government',
      verified: true,
    },
  },
};

const BRAND_ROUTES: Record<string, ComplaintRoute> = {
  shell: {
    name: 'Shell customer support',
    description: 'Official Shell contact and country support directory.',
    url: 'https://www.shell.com/who-we-are/contact-us.html',
    kind: 'brand',
    verified: true,
  },
  'indian oil': {
    name: 'IndianOil customer care',
    description: 'Official complaints and queries for IndianOil products and petrol pumps.',
    url: 'https://www.iocl.com/contact-us/',
    kind: 'brand',
    verified: true,
  },
  iocl: {
    name: 'IndianOil customer care',
    description: 'Official complaints and queries for IndianOil products and petrol pumps.',
    url: 'https://www.iocl.com/contact-us/',
    kind: 'brand',
    verified: true,
  },
  'hindustan petroleum': {
    name: 'HPCL retail grievance',
    description: 'Official public grievance route for HPCL retail fuel services.',
    url: 'https://www.hindustanpetroleum.com/retailpgr',
    kind: 'brand',
    verified: true,
  },
  hpcl: {
    name: 'HPCL retail grievance',
    description: 'Official public grievance route for HPCL retail fuel services.',
    url: 'https://www.hindustanpetroleum.com/retailpgr',
    kind: 'brand',
    verified: true,
  },
};

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function getVerifiedBrandComplaintRoute(brand: string): ComplaintRoute | null {
  if (!brand.trim()) return null;
  return BRAND_ROUTES[normalize(brand)] || null;
}

export function getGovernmentComplaintRoute(countryCode: string): ComplaintRoute | null {
  if (!countryCode.trim()) return null;
  return GOVERNMENT_ROUTES[normalize(countryCode)]?.route || null;
}

export function getComplaintPortals(countryCode: string): CountryComplaints | null {
  const data = GOVERNMENT_ROUTES[normalize(countryCode)];
  if (!data) return null;
  return { country: data.country, portals: [data.route] };
}

export function getSupportedCountries(): { code: string; name: string }[] {
  return Object.entries(GOVERNMENT_ROUTES).map(([code, data]) => ({
    code,
    name: data.country,
  }));
}
