import { test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const STATION_ID = 'node_6254336890';
const OUTPUT_RELATIVE = process.env.UX_AUDIT_OUTPUT || path.join('ux-audit', 'baseline');
const OUTPUT = path.join(process.cwd(), OUTPUT_RELATIVE);
const SCREENSHOTS = path.join(OUTPUT, 'screenshots');

const widths = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1280, height: 900 },
  { width: 1920, height: 1080 },
] as const;

type AuthMode = 'none' | 'guest-data' | 'user' | 'admin';
type NetworkMode =
  | 'default'
  | 'nearby-loading'
  | 'nearby-empty'
  | 'nearby-error'
  | 'station-loading'
  | 'station-error'
  | 'search-loading'
  | 'search-empty';

interface CaptureEntry {
  width: number;
  height: number;
  scenario: string;
  route: string;
  screenshot: string;
  status: 'ok' | 'error';
  error?: string;
  consoleErrors: string[];
  pageErrors: string[];
  viewport?: unknown;
}

interface Scenario {
  name: string;
  route: string;
  auth?: AuthMode;
  network?: NetworkMode;
  theme?: 'dark' | 'light';
  prepare?: (page: Page) => Promise<void>;
}

const PHOTON_RESPONSE = {
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [78.4753829, 17.3887027] },
      properties: {
        osm_id: 6254336890,
        osm_type: 'N',
        osm_key: 'amenity',
        osm_value: 'fuel',
        name: 'Shell Fuel Station',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        countrycode: 'IN',
      },
    },
  ],
};

const NEARBY_RESPONSE = {
  elements: [
    {
      type: 'node',
      id: 6254336890,
      lat: 17.3887027,
      lon: 78.4753829,
      tags: {
        amenity: 'fuel',
        name: 'Shell Fuel Station',
        brand: 'Shell',
        operator: 'Shell Retail',
        'addr:street': 'Abids Road',
        'addr:city': 'Hyderabad',
        'addr:state': 'Telangana',
        'addr:country': 'IN',
      },
    },
    {
      type: 'node',
      id: 6254336891,
      lat: 17.3901,
      lon: 78.478,
      tags: {
        amenity: 'fuel',
        name: 'IndianOil Station',
        brand: 'IndianOil',
        'addr:city': 'Hyderabad',
        'addr:state': 'Telangana',
        'addr:country': 'IN',
      },
    },
  ],
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function installNetwork(page: Page, mode: NetworkMode) {
  await page.route('https://ipwho.is/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        latitude: 17.3887027,
        longitude: 78.4753829,
      }),
    });
  });

  await page.route('**/api/overpass', async (route) => {
    if (mode === 'nearby-loading') await sleep(3500);

    if (mode === 'nearby-error' || mode === 'station-error') {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'UX audit simulated source outage' }),
      });
      return;
    }

    const body = mode === 'nearby-empty'
      ? { elements: [] }
      : NEARBY_RESPONSE;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  await page.route('**/api/osm-element**', async (route) => {
    if (mode === 'station-loading') await sleep(3500);

    if (mode === 'station-error') {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'UX audit simulated exact-source outage' }),
      });
      return;
    }

    const url = new URL(route.request().url());
    const id = Number(url.searchParams.get('id') || 6254336890);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        element: {
          type: 'node',
          id,
          lat: 17.3887027,
          lon: 78.4753829,
          tags: {
            amenity: 'fuel',
            name: 'Shell Fuel Station',
            brand: 'Shell',
            operator: 'Shell Retail',
            'addr:street': 'Abids Road',
            'addr:city': 'Hyderabad',
            'addr:state': 'Telangana',
            'addr:country': 'IN',
            'addr:country_code': 'IN',
            opening_hours: '24/7',
            phone: '+91 40 5555 0101',
            website: 'https://www.shell.in/',
            'fuel:diesel': 'yes',
            'fuel:petrol': 'yes',
          },
        },
      }),
    });
  });

  await page.route('https://photon.komoot.io/api**', async (route) => {
    if (mode === 'search-loading') await sleep(3500);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mode === 'search-empty' ? { features: [] } : PHOTON_RESPONSE),
    });
  });

  await page.route('https://nominatim.openstreetmap.org/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        display_name: 'Hyderabad, Telangana, India',
        address: {
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          country_code: 'in',
        },
      }),
    });
  });

  await page.route('https://api.maptiler.com/**', (route) => route.abort());
  await page.route('https://*.tile.openstreetmap.org/**', (route) => route.abort());
}

async function createContext(browser: Browser, width: number, height: number, auth: AuthMode, theme: 'dark' | 'light') {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });

  await context.addInitScript((config: { auth: AuthMode; theme: 'dark' | 'light' }) => {
    localStorage.setItem('fuelvoice-theme', config.theme);
    localStorage.removeItem('fuelvoice:mock_user');
    localStorage.removeItem('fuelvoice:mock_guest_data');

    if (config.auth === 'guest-data') {
      localStorage.setItem('fuelvoice:mock_guest_data', 'true');
    } else if (config.auth === 'user') {
      localStorage.setItem('fuelvoice:mock_user', 'true');
    } else if (config.auth === 'admin') {
      localStorage.setItem('fuelvoice:mock_user', 'admin');
    }
  }, { auth, theme });

  return context;
}

async function inventory(page: Page) {
  return page.evaluate(() => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const selector = 'header,main,section,footer,h1,h2,h3,a,button,input,textarea,[role]';

    const visible = Array.from(document.querySelectorAll<HTMLElement>(selector))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const intersects = rect.bottom > 0
          && rect.right > 0
          && rect.top < viewportHeight
          && rect.left < viewportWidth;
        const rendered = style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity) !== 0
          && rect.width > 0
          && rect.height > 0;

        if (!intersects || !rendered) return null;

        const text = (element.getAttribute('aria-label')
          || element.textContent
          || element.getAttribute('placeholder')
          || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 180);

        return {
          tag: element.tagName.toLowerCase(),
          role: element.getAttribute('role'),
          text,
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      })
      .filter(Boolean)
      .slice(0, 100);

    const active = document.activeElement as HTMLElement | null;

    return {
      url: location.pathname + location.search,
      title: document.title,
      viewportWidth,
      viewportHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      activeElement: active
        ? {
            tag: active.tagName.toLowerCase(),
            ariaLabel: active.getAttribute('aria-label'),
            text: (active.textContent || '').trim().slice(0, 120),
          }
        : null,
      visible,
    };
  });
}

async function settle(page: Page, scenario: string) {
  if (scenario.includes('loading')) {
    await page.waitForTimeout(250);
    return;
  }

  await page.waitForTimeout(450);
}

const scenarios: Scenario[] = [
  {
    name: 'home-default-signed-out',
    route: '/',
    prepare: async (page) => {
      await page.getByRole('heading', { level: 1 }).waitFor();
      await page.getByRole('heading', { name: /Nearby Fuel Stations/i }).waitFor();
      await page.getByRole('heading', { name: 'Shell Fuel Station' }).waitFor();
    },
  },
  {
    name: 'home-search-focus',
    route: '/',
    prepare: async (page) => {
      const input = page.getByRole('combobox', { name: /search fuel stations/i });
      await input.waitFor();
      await input.focus();
    },
  },
  {
    name: 'home-search-results-hover',
    route: '/',
    prepare: async (page) => {
      const input = page.getByRole('combobox', { name: /search fuel stations/i });
      await input.fill('Shell');
      const option = page.getByRole('option', { name: /Shell Fuel Station/i });
      await option.waitFor();
      await option.hover();
    },
  },
  {
    name: 'home-nearby-loading',
    route: '/',
    network: 'nearby-loading',
    prepare: async (page) => {
      await page.getByRole('heading', { name: /Nearby Fuel Stations/i }).waitFor();
      await page.locator('#nearby-stations').scrollIntoViewIfNeeded();
    },
  },
  {
    name: 'home-nearby-empty',
    route: '/',
    network: 'nearby-empty',
    prepare: async (page) => {
      await page.getByText('No Stations Nearby').waitFor();
      await page.locator('#nearby-stations').scrollIntoViewIfNeeded();
    },
  },
  {
    name: 'home-nearby-error',
    route: '/',
    network: 'nearby-error',
    prepare: async (page) => {
      await page.getByText('Station data could not be loaded').waitFor();
      await page.locator('#nearby-stations').scrollIntoViewIfNeeded();
    },
  },
  {
    name: 'home-signed-in-user-menu-open',
    route: '/',
    auth: 'user',
    prepare: async (page) => {
      const menu = page.getByRole('button', { name: 'User menu' });
      await menu.waitFor();
      await menu.click();
      await page.getByRole('button', { name: 'Sign Out' }).waitFor();
    },
  },
  {
    name: 'home-nearby-card-hover',
    route: '/',
    prepare: async (page) => {
      const card = page.locator(`a[href="/station/${STATION_ID}"]`);
      await card.getByRole('heading', { name: 'Shell Fuel Station' }).waitFor();
      await card.scrollIntoViewIfNeeded();
      await card.hover();
    },
  },
  {
    name: 'search-default',
    route: '/search',
    prepare: async (page) => {
      await page.getByRole('heading', { level: 1 }).waitFor();
    },
  },
  {
    name: 'search-results-open',
    route: '/search',
    prepare: async (page) => {
      const input = page.getByRole('combobox', { name: /search fuel stations/i });
      await input.fill('Shell');
      await page.getByRole('option', { name: /Shell Fuel Station/i }).waitFor();
      await input.press('ArrowDown');
    },
  },
  {
    name: 'search-loading',
    route: '/search',
    network: 'search-loading',
    prepare: async (page) => {
      const input = page.getByRole('combobox', { name: /search fuel stations/i });
      await input.fill('Shell');
      await page.getByLabel('Searching').waitFor();
    },
  },
  {
    name: 'search-no-results',
    route: '/search',
    network: 'search-empty',
    prepare: async (page) => {
      const input = page.getByRole('combobox', { name: /search fuel stations/i });
      await input.fill('NoSuchStation');
      await page.getByText(/No fuel stations found for/i).waitFor();
    },
  },
  {
    name: 'station-signed-out',
    route: `/station/${STATION_ID}`,
    auth: 'guest-data',
    prepare: async (page) => {
      await page.getByRole('heading', { level: 1 }).waitFor();
      await page.getByRole('heading', { name: 'Reviews', exact: true }).waitFor();
    },
  },
  {
    name: 'station-signed-in',
    route: `/station/${STATION_ID}`,
    auth: 'user',
    prepare: async (page) => {
      await page.getByText('Trust Score', { exact: true }).waitFor();
      await page.getByRole('heading', { name: 'Reviews', exact: true }).waitFor();
    },
  },
  {
    name: 'station-review-form-open',
    route: `/station/${STATION_ID}`,
    auth: 'user',
    prepare: async (page) => {
      const composer = page.locator('#write-review');
      const button = composer.getByRole('button', { name: /^Write a review/ });
      await button.waitFor();
      await button.click();
      await composer.locator('#review-form-panel').waitFor();
      await composer.scrollIntoViewIfNeeded();
    },
  },
  {
    name: 'station-review-validation-error',
    route: `/station/${STATION_ID}`,
    auth: 'user',
    prepare: async (page) => {
      const composer = page.locator('#write-review');
      await composer.getByRole('button', { name: /^Write a review/ }).click();
      await composer.getByRole('radio', { name: '1 star', exact: true }).click();
      await composer.getByRole('button', { name: 'Publish review', exact: true }).click();
      await composer.getByText('Choose at least one complaint category.').waitFor();
      await composer.scrollIntoViewIfNeeded();
    },
  },
  {
    name: 'station-keyboard-focus',
    route: `/station/${STATION_ID}`,
    auth: 'guest-data',
    prepare: async (page) => {
      const link = page.getByRole('link', { name: 'Get directions' }).first();
      await link.waitFor();
      await link.focus();
    },
  },
  {
    name: 'station-loading',
    route: `/station/${STATION_ID}`,
    auth: 'guest-data',
    network: 'station-loading',
  },
  {
    name: 'station-error',
    route: `/station/${STATION_ID}`,
    auth: 'guest-data',
    network: 'station-error',
    prepare: async (page) => {
      await page.getByText('Station data could not be loaded.').waitFor({ timeout: 12000 });
    },
  },
  {
    name: 'admin-signed-out',
    route: '/admin',
    auth: 'guest-data',
    prepare: async (page) => {
      await page.getByRole('heading', { name: 'Access Denied' }).waitFor();
    },
  },
  {
    name: 'admin-non-admin',
    route: '/admin',
    auth: 'user',
    prepare: async (page) => {
      await page.getByRole('heading', { name: 'Admin Only' }).waitFor();
    },
  },
  {
    name: 'admin-admin',
    route: '/admin',
    auth: 'admin',
    prepare: async (page) => {
      await page.getByRole('heading', { name: 'Admin Panel' }).waitFor();
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'home-light-theme',
    route: '/',
    theme: 'light',
    prepare: async (page) => {
      await page.getByRole('heading', { level: 1 }).waitFor();
      await page.getByRole('heading', { name: /Nearby Fuel Stations/i }).waitFor();
    },
  },
  {
    name: 'search-light-theme',
    route: '/search',
    theme: 'light',
    prepare: async (page) => {
      await page.getByRole('heading', { level: 1 }).waitFor();
    },
  },
  {
    name: 'station-light-theme',
    route: `/station/${STATION_ID}`,
    auth: 'guest-data',
    theme: 'light',
    prepare: async (page) => {
      await page.getByRole('heading', { level: 1 }).waitFor();
      await page.getByRole('heading', { name: 'Reviews', exact: true }).waitFor();
    },
  },
  {
    name: 'admin-light-theme',
    route: '/admin',
    auth: 'admin',
    theme: 'light',
    prepare: async (page) => {
      await page.getByRole('heading', { name: 'Admin Panel' }).waitFor();
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'not-found-light-theme',
    route: '/ux-audit-intentional-404-light',
    theme: 'light',
    prepare: async (page) => {
      await page.getByRole('heading').first().waitFor();
    },
  },
  {
    name: 'not-found',
    route: '/ux-audit-intentional-404',
    prepare: async (page) => {
      await page.getByRole('heading').first().waitFor();
    },
  },
];

async function capture(
  browser: Browser,
  viewport: (typeof widths)[number],
  scenario: Scenario,
): Promise<CaptureEntry> {
  const auth = scenario.auth ?? 'none';
  const network = scenario.network ?? 'default';
  const theme = scenario.theme ?? 'dark';
  const context: BrowserContext = await createContext(browser, viewport.width, viewport.height, auth, theme);
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await installNetwork(page, network);

  const fileName = `${viewport.width}-${scenario.name}.jpg`;
  const screenshot = path.join(OUTPUT_RELATIVE, 'screenshots', fileName);
  const diskScreenshot = path.join(SCREENSHOTS, fileName);

  const entry: CaptureEntry = {
    width: viewport.width,
    height: viewport.height,
    scenario: scenario.name,
    route: scenario.route,
    screenshot,
    status: 'ok',
    consoleErrors,
    pageErrors,
  };

  try {
    await page.goto(scenario.route, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await settle(page, scenario.name);
    if (scenario.prepare) await scenario.prepare(page);
    await page.waitForTimeout(150);

    entry.viewport = await inventory(page);

    await page.screenshot({
      path: diskScreenshot,
      fullPage: true,
      type: 'jpeg',
      quality: 76,
      caret: 'initial',
      animations: 'disabled',
    });
  } catch (error) {
    entry.status = 'error';
    entry.error = error instanceof Error ? error.message : String(error);
    try {
      entry.viewport = await inventory(page);
      await page.screenshot({
        path: diskScreenshot,
        fullPage: true,
        type: 'jpeg',
        quality: 76,
        caret: 'initial',
        animations: 'disabled',
      });
    } catch {
      // The manifest preserves the original capture failure.
    }
  } finally {
    await context.close();
  }

  return entry;
}

fs.mkdirSync(SCREENSHOTS, { recursive: true });

test.describe.configure({ mode: 'serial' });

for (const viewport of widths) {
  test(`capture UX baseline at ${viewport.width}px`, async ({ browser }) => {
    test.setTimeout(10 * 60 * 1000);
    const entries: CaptureEntry[] = [];

    for (const scenario of scenarios) {
      entries.push(await capture(browser, viewport, scenario));
    }

    const manifestPath = path.join(OUTPUT, `manifest-${viewport.width}.json`);
    fs.writeFileSync(
      manifestPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baselineCommit: process.env.UX_AUDIT_BASELINE_SHA || 'unknown',
          viewport,
          entries,
        },
        null,
        2,
      ) + '\n',
    );
  });
}
