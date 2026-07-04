/**
 * Consumer Complaint Portal Links
 * 
 * Maps country codes to relevant consumer protection organizations
 * and complaint filing URLs. Auto-detected via user's geolocation.
 */

export interface ComplaintPortal {
  name: string;
  description: string;
  url: string;
  phone?: string;
  icon: string; // emoji
}

export interface CountryComplaints {
  country: string;
  portals: ComplaintPortal[];
}

/** Complaint portals by country code (ISO 3166-1 alpha-2, lowercase) */
const COMPLAINT_PORTALS: Record<string, CountryComplaints> = {
  in: {
    country: 'India',
    portals: [
      {
        name: 'National Consumer Helpline',
        description: 'File consumer complaints online or call 1915',
        url: 'https://consumerhelpline.gov.in',
        phone: '1915',
        icon: '📞',
      },
      {
        name: 'MoPNG e-Seva',
        description: 'Ministry of Petroleum & Natural Gas grievance portal',
        url: 'https://mopnge-seva.in',
        icon: '🏛️',
      },
      {
        name: 'PNGRB Consumer Portal',
        description: 'Petroleum & Natural Gas Regulatory Board',
        url: 'https://pngrb.gov.in',
        icon: '⚖️',
      },
      {
        name: 'Consumer Affairs (INGRAM)',
        description: 'Department of Consumer Affairs online portal',
        url: 'https://consumerhelpline.gov.in/user/signup.php',
        icon: '🛡️',
      },
    ],
  },
  us: {
    country: 'United States',
    portals: [
      {
        name: 'FTC Report Fraud',
        description: 'Federal Trade Commission — report fraud and scams',
        url: 'https://reportfraud.ftc.gov',
        phone: '1-877-382-4357',
        icon: '🏛️',
      },
      {
        name: 'State Consumer Protection',
        description: 'Find your state attorney general\'s consumer protection office',
        url: 'https://www.usa.gov/state-consumer',
        icon: '⚖️',
      },
      {
        name: 'Better Business Bureau',
        description: 'File a complaint with the BBB',
        url: 'https://www.bbb.org/file-a-complaint',
        icon: '📋',
      },
    ],
  },
  gb: {
    country: 'United Kingdom',
    portals: [
      {
        name: 'Citizens Advice',
        description: 'Free consumer rights advice and complaint guidance',
        url: 'https://www.citizensadvice.org.uk/consumer',
        phone: '0808 223 1133',
        icon: '🏛️',
      },
      {
        name: 'Trading Standards',
        description: 'Report unfair trading to local Trading Standards',
        url: 'https://www.gov.uk/find-local-trading-standards-office',
        icon: '⚖️',
      },
    ],
  },
  au: {
    country: 'Australia',
    portals: [
      {
        name: 'ACCC',
        description: 'Australian Competition & Consumer Commission',
        url: 'https://www.accc.gov.au/contact-us/contact-the-accc',
        phone: '1300 302 502',
        icon: '🏛️',
      },
      {
        name: 'Fair Trading',
        description: 'State/territory fair trading office',
        url: 'https://www.accc.gov.au/about-us/australian-consumer-law/state-territory-consumer-agencies',
        icon: '⚖️',
      },
    ],
  },
  ca: {
    country: 'Canada',
    portals: [
      {
        name: 'Competition Bureau',
        description: 'Report anti-competitive activity or fraud',
        url: 'https://www.competitionbureau.gc.ca/eic/site/cb-bc.nsf/eng/h_00125.html',
        phone: '1-800-348-5358',
        icon: '🏛️',
      },
      {
        name: 'Consumer Protection',
        description: 'Provincial consumer protection offices',
        url: 'https://www.canada.ca/en/financial-consumer-agency.html',
        icon: '⚖️',
      },
    ],
  },
  de: {
    country: 'Germany',
    portals: [
      {
        name: 'Verbraucherzentrale',
        description: 'German Consumer Advice Centre',
        url: 'https://www.verbraucherzentrale.de',
        icon: '🏛️',
      },
    ],
  },
  fr: {
    country: 'France',
    portals: [
      {
        name: 'DGCCRF',
        description: 'Direction Générale de la Concurrence — consumer protection',
        url: 'https://www.economie.gouv.fr/dgccrf/contacter-dgccrf',
        icon: '🏛️',
      },
    ],
  },
};

/** Generic complaint instructions for countries not in our database */
const GENERIC_COMPLAINTS: CountryComplaints = {
  country: 'Your Country',
  portals: [
    {
      name: 'Local Consumer Protection',
      description: 'Contact your national or local consumer protection agency',
      url: '',
      icon: '🏛️',
    },
    {
      name: 'Police / Law Enforcement',
      description: 'For fraud or criminal activity, file a report with local police',
      url: '',
      icon: '🚔',
    },
    {
      name: 'Online Consumer Forums',
      description: 'Post your experience on consumer forums for community support',
      url: '',
      icon: '💬',
    },
  ],
};

/**
 * Get complaint portals for a country.
 * @param countryCode - ISO 3166-1 alpha-2 code (lowercase)
 */
export function getComplaintPortals(countryCode: string): CountryComplaints {
  return COMPLAINT_PORTALS[countryCode.toLowerCase()] || {
    ...GENERIC_COMPLAINTS,
    country: countryCode.toUpperCase(),
  };
}

/** Get all supported countries */
export function getSupportedCountries(): { code: string; name: string }[] {
  return Object.entries(COMPLAINT_PORTALS).map(([code, data]) => ({
    code,
    name: data.country,
  }));
}
