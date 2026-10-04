import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const STATION_ID = 'node_6254336890';
const OUTPUT = path.join(process.cwd(), 'ux-audit', 'final', 'axe-results');

async function installNetwork(page, mode = 'default') {
  await page.route('https://ipwho.is/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, latitude: 17.3887027, longitude: 78.4753829 }),
  }));
  await page.route('https://photon.komoot.io/api**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mode === 'search-empty' ? { features: [] } : {
      features: [{
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
      }],
    }),
  }));
  await page.route('**/api/overpass', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ elements: [] }),
  }));
  await page.route('**/api/osm-element**', route => {
    if (mode === 'station-error') {
      return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Unavailable' }) });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        element: {
          type: 'node',
          id: 6254336890,
          lat: 17.3887027,
          lon: 78.4753829,
          tags: { amenity: 'fuel', name: 'Shell Fuel Station', brand: 'Shell', 'addr:city': 'Hyderabad', 'addr:country': 'IN' },
        },
      }),
    });
  });
  await page.route('https://api.maptiler.com/**', route => route.abort());
  await page.route('https://*.tile.openstreetmap.org/**', route => route.abort());
}

async function setState(page, auth = 'none', theme = 'dark') {
  await page.addInitScript(({ authMode, selectedTheme }) => {
    localStorage.setItem('fuelvoice-theme', selectedTheme);
    if (authMode === 'admin') localStorage.setItem('fuelvoice:mock_user', 'admin');
    else if (authMode === 'user') localStorage.setItem('fuelvoice:mock_user', 'true');
    else {
      localStorage.removeItem('fuelvoice:mock_user');
      localStorage.setItem('fuelvoice:mock_guest_data', 'true');
    }
  }, { authMode: auth, selectedTheme: theme });
}

async function scan(page, testInfo, scenario) {
  const results = await new AxeBuilder({ page }).analyze();
  fs.mkdirSync(OUTPUT, { recursive: true });
  const record = {
    project: testInfo.project.name,
    scenario,
    url: page.url(),
    violations: results.violations,
  };
  fs.writeFileSync(
    path.join(OUTPUT, testInfo.project.name + '-' + scenario + '.json'),
    JSON.stringify(record, null, 2) + '\n',
  );
  const compact = results.violations.map(v => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map(n => n.target),
  }));
  expect(results.violations, JSON.stringify(compact, null, 2)).toEqual([]);
}

const scenarios = [
  {
    name: 'home-dark',
    route: '/',
    auth: 'none',
    theme: 'dark',
    prepare: async () => {},
  },
  {
    name: 'search-results-dark',
    route: '/search',
    auth: 'none',
    theme: 'dark',
    prepare: async page => {
      await page.getByRole('combobox', { name: /search fuel stations/i }).fill('Shell');
      await expect(page.getByRole('option', { name: /Shell Fuel Station/i })).toBeVisible();
    },
  },
  {
    name: 'search-empty-light',
    route: '/search',
    auth: 'none',
    theme: 'light',
    mode: 'search-empty',
    prepare: async page => {
      await page.getByRole('combobox', { name: /search fuel stations/i }).fill('NoSuchStation');
      await expect(page.getByText('No fuel stations found for “NoSuchStation”', { exact: true })).toBeVisible();
    },
  },
  {
    name: 'station-default-dark',
    route: '/station/' + STATION_ID,
    auth: 'none',
    theme: 'dark',
    prepare: async page => {
      await expect(page.getByRole('heading', { name: 'Reviews', exact: true })).toBeVisible();
    },
  },
  {
    name: 'station-review-form-light',
    route: '/station/' + STATION_ID,
    auth: 'user',
    theme: 'light',
    prepare: async page => {
      await page.locator('#write-review').getByRole('button', { name: /^Write a review/ }).click();
      await expect(page.locator('#review-form-panel')).toBeVisible();
    },
  },
  {
    name: 'station-error-dark',
    route: '/station/' + STATION_ID,
    auth: 'none',
    theme: 'dark',
    mode: 'station-error',
    prepare: async page => {
      await expect(page.getByRole('heading', { name: /could not load|could not find/i })).toBeVisible();
    },
  },
  {
    name: 'admin-signed-out-light',
    route: '/admin',
    auth: 'none',
    theme: 'light',
    prepare: async page => {
      await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
    },
  },
  {
    name: 'admin-content-dark',
    route: '/admin',
    auth: 'admin',
    theme: 'dark',
    prepare: async page => {
      await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
    },
  },
  {
    name: 'not-found-dark',
    route: '/does-not-exist',
    auth: 'none',
    theme: 'dark',
    prepare: async page => {
      await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
    },
  },
];

for (const scenario of scenarios) {
  test(scenario.name, async ({ page }, testInfo) => {
    await setState(page, scenario.auth, scenario.theme);
    await installNetwork(page, scenario.mode);
    await page.goto(scenario.route, { waitUntil: 'domcontentloaded' });
    await scenario.prepare(page);
    await scan(page, testInfo, scenario.name);
  });
}
