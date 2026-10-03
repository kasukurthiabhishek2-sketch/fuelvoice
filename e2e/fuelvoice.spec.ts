import { expect, test, type Page } from '@playwright/test';

const STATION_ID = 'node_6254336890';

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

async function installDeterministicNetwork(page: Page) {
  await page.route('https://photon.komoot.io/api**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(PHOTON_RESPONSE),
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

async function enableMockUser(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('fuelvoice:mock_user', 'true');
    localStorage.setItem('fuelvoice-theme', 'dark');
  });
}

test.beforeEach(async ({ page }) => {
  await installDeterministicNetwork(page);
});

test.describe('Minimal homepage', () => {
  test('loads the search-first experience without location or map work', async ({ page }) => {
    let ipLocationRequests = 0;
    page.on('request', (request) => {
      if (request.url().includes('ipwho.is')) ipLocationRequests += 1;
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Know the station');
    await expect(page.getByRole('combobox', { name: /search fuel stations/i })).toBeVisible();
    await expect(page.getByText('Fuel station trust, without the noise.')).toBeVisible();

    await page.waitForTimeout(500);
    expect(ipLocationRequests).toBe(0);
    await expect(page.locator('.leaflet-container')).toHaveCount(0);
    await expect(page.locator('#explore-map')).toHaveCount(0);

    await page.screenshot({
      path: 'e2e/screenshots/home-minimal-dark.png',
      fullPage: false,
      caret: 'initial',
    });
  });

  test('autocomplete navigates toward a station page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const input = page.getByRole('combobox', { name: /search fuel stations/i });
    await input.fill('Shell');

    const result = page.getByRole('option', { name: /Shell Fuel Station/i });
    await expect(result).toBeVisible({ timeout: 5000 });
    await result.click();

    await expect(page).toHaveURL(new RegExp(`/station/${STATION_ID}$`));
  });

  test('defaults to dark while preserving the user theme toggle', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/dark/);

    const toggle = page.getByRole('button', { name: /switch to light mode/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});

test.describe('Station trust page', () => {
  test.beforeEach(async ({ page }) => {
    await enableMockUser(page);
  });

  test('puts Trust Score and reviews ahead of station details and map', async ({ page }) => {
    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Mock Fuel Station');
    await expect(page.getByText('Trust Score', { exact: true })).toBeVisible();
    await expect(page.getByText('82', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();

    const reviewsBox = await page.getByRole('heading', { name: 'Reviews' }).boundingBox();
    const detailsBox = await page.getByRole('heading', { name: /Useful details/i }).boundingBox();
    expect(reviewsBox).not.toBeNull();
    expect(detailsBox).not.toBeNull();
    expect(reviewsBox!.y).toBeLessThan(detailsBox!.y);

    // Map implementation and tiles must not compete with first-paint review content.
    await expect(page.locator('.leaflet-container')).toHaveCount(0);

    await page.screenshot({
      path: 'e2e/screenshots/station-reviews-first.png',
      fullPage: false,
      caret: 'initial',
    });
  });

  test('shows verified direct complaint routes without a FuelVoice form', async ({ page }) => {
    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Official link verified')).toBeVisible();
    const brandSupport = page.getByRole('link', { name: /Contact station \/ brand support/i });
    await expect(brandSupport).toHaveAttribute('href', /shell\.com/);

    const consumerRoute = page.getByRole('link', { name: /Escalate to consumer protection/i });
    await expect(consumerRoute).toHaveAttribute('href', /consumerhelpline\.gov\.in/);

    await expect(page.getByRole('button', { name: /submit complaint/i })).toHaveCount(0);
  });

  test('loads the interactive map only after the user reaches the map area', async ({ page }) => {
    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.leaflet-container')).toHaveCount(0);
    await page.getByText('Location', { exact: true }).scrollIntoViewIfNeeded();

    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
  });

  test('negative reviews require an explicit complaint category while text stays optional', async ({ page }) => {
    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Write a review', exact: true }).click();
    await page.getByRole('button', { name: '1 star' }).click();
    await page.getByRole('button', { name: 'Publish review' }).click();

    await expect(page.getByText('Choose at least one complaint category.')).toBeVisible();

    await page.getByRole('button', { name: 'Fuel quality', exact: true }).click();
    await page.getByRole('button', { name: 'Publish review' }).click();

    await expect(page.getByText('Review published')).toBeVisible();
  });

  test('collapses a review after the configured Not helpful threshold', async ({ page }) => {
    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    const collapsed = page.getByText('Review collapsed');
    await expect(collapsed.first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Show review' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Report review/i })).toHaveCount(0);
  });

  test('does not introduce console errors in the primary station journey', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
    await page.getByText('Location', { exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Mobile station actions', () => {
  test.skip(({ browserName }) => browserName !== 'webkit' && browserName !== 'chromium', 'Browser coverage guard');

  test('keeps review and complaint actions reachable', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only layout');

    await enableMockUser(page);
    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    const write = page.getByRole('link', { name: 'Write a review', exact: true });
    const complaint = page.getByRole('link', { name: 'File a complaint', exact: true });

    await expect(write).toBeVisible();
    await expect(complaint).toBeVisible();
    await expect(complaint).toHaveAttribute('href', /shell\.com/);

    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);

    await page.screenshot({
      path: 'e2e/screenshots/station-mobile-sticky-actions.png',
      fullPage: false,
      caret: 'initial',
    });
  });
});

test.describe('Fallbacks and metadata', () => {
  test('invalid station IDs fail clearly without invented station data', async ({ page }) => {
    await page.goto('/station/invalid_0', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /could not find this station/i })).toBeVisible();
  });

  test('has basic SEO metadata and crawl files', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FuelVoice/i);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Trust Scores/i);

    const robots = await page.request.get('/robots.txt');
    const sitemap = await page.request.get('/sitemap.xml');
    expect(robots.ok()).toBeTruthy();
    expect(sitemap.ok()).toBeTruthy();
  });
});
