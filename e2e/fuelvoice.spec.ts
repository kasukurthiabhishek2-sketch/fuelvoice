import { expect, test, type Page } from '@playwright/test';

const STATION_ID = 'node_6254336890';
const REGRESSION_STATION_ID = 'node_2817379324';

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

const OVERPASS_NEARBY_RESPONSE = {
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

async function installDeterministicNetwork(page: Page) {
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
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(OVERPASS_NEARBY_RESPONSE),
    });
  });

  await page.route('**/api/osm-element**', async (route) => {
    const url = new URL(route.request().url());
    const osmId = Number(url.searchParams.get('id'));
    const isRegressionStation = osmId === 2817379324;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        element: {
          type: 'node',
          id: osmId,
          lat: isRegressionStation ? 17.4419 : 17.3887027,
          lon: isRegressionStation ? 78.4983 : 78.4753829,
          tags: {
            amenity: 'fuel',
            name: isRegressionStation ? 'Regression Fuel Station' : 'Fuel Station',
            brand: 'Shell',
            operator: 'Shell Retail',
            'addr:street': isRegressionStation ? 'Regression Road' : 'Abids Road',
            'addr:city': 'Hyderabad',
            'addr:state': 'Telangana',
            'addr:country': 'IN',
            'addr:country_code': 'IN',
            opening_hours: '24/7',
          },
        },
      }),
    });
  });

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

async function enableGuestDataMocks(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('fuelvoice:mock_user');
    localStorage.setItem('fuelvoice:mock_guest_data', 'true');
    localStorage.setItem('fuelvoice-theme', 'dark');
  });
}

test.beforeEach(async ({ page }) => {
  await installDeterministicNetwork(page);
});

test.describe('Minimal homepage', () => {
  test('loads nearby stations from approximate location without eager map work', async ({ page }) => {
    let ipLocationRequests = 0;
    let nearbyRequests = 0;
    page.on('request', (request) => {
      if (request.url().includes('ipwho.is')) ipLocationRequests += 1;
      if (request.url().includes('/api/overpass')) nearbyRequests += 1;
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Know the station');
    await expect(page.getByRole('combobox', { name: /search fuel stations/i })).toBeVisible();
    await expect(page.getByText('Fuel station trust, without the noise.')).toBeVisible();

    await expect(page.getByRole('heading', { name: /Nearby Fuel Stations/i })).toBeVisible();
    const shellStation = page.locator(`a[href="/station/${STATION_ID}"]`);
    const indianOilStation = page.locator('a[href="/station/node_6254336891"]');
    await expect(shellStation.getByRole('heading', { name: 'Shell Fuel Station' })).toBeVisible();
    await expect(indianOilStation.getByRole('heading', { name: 'IndianOil Station' })).toBeVisible();

    expect(ipLocationRequests).toBeGreaterThan(0);
    expect(nearbyRequests).toBeGreaterThan(0);
    await expect(page.locator('.leaflet-container')).toHaveCount(0);
    await expect(page.locator('#explore-map')).toHaveCount(0);

    await page.screenshot({
      path: 'e2e/screenshots/home-location-stations.png',
      fullPage: true,
      caret: 'initial',
    });
  });

  test('autocomplete navigates toward a station page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const input = page.getByRole('combobox', { name: /search fuel stations/i });
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    await input.pressSequentially('Shell', { delay: 40 });

    const result = page.getByRole('option', { name: /Shell Fuel Station/i });
    await expect(result).toBeVisible({ timeout: 10000 });

    await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', `search-result-${STATION_ID}`);
    await expect(result).toHaveAttribute('aria-selected', 'true');

    await input.press('Enter');
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

test.describe('Signed-out station loading', () => {
  test('keeps the station loading state inside a 375px viewport', async ({ page }) => {
    await enableGuestDataMocks(page);
    await page.setViewportSize({ width: 375, height: 812 });

    await page.unroute('**/api/osm-element**');
    await page.route('**/api/osm-element**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          element: {
            type: 'node',
            id: 6254336890,
            lat: 17.3887027,
            lon: 78.4753829,
            tags: { amenity: 'fuel', name: 'Shell Fuel Station' },
          },
        }),
      });
    });

    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.skeleton').first()).toBeVisible();

    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  });

  test('loads an uncached mapped station without requiring a Firestore write', async ({ page }, testInfo) => {
    await enableGuestDataMocks(page);

    let firestoreRequests = 0;
    page.on('request', (request) => {
      if (request.url().includes('firestore.googleapis.com')) firestoreRequests += 1;
    });

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Fuel Station');
    await expect(page.getByText('Trust Score', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reviews', exact: true })).toBeVisible();
    await expect(page.getByText('Insufficient data', { exact: true })).toBeVisible();

    await page.waitForTimeout(300);
    expect(firestoreRequests).toBe(0);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);

    await page.screenshot({
      path: `e2e/screenshots/station-signed-out-uncached-${testInfo.project.name}.png`,
      fullPage: false,
      caret: 'initial',
    });
  });


  test('keeps a real-world station page usable when Overpass is unavailable', async ({ page }, testInfo) => {
    await enableGuestDataMocks(page);

    await page.unroute('**/api/overpass');
    await page.route('**/api/overpass', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Simulated Overpass outage' }),
      });
    });

    let overpassRequests = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/overpass')) overpassRequests += 1;
    });

    await page.goto(`/station/${REGRESSION_STATION_ID}`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Regression Fuel Station');
    await expect(page.getByText('Trust Score', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reviews', exact: true })).toBeVisible();
    await expect(page.getByText('Station data could not be loaded.')).toHaveCount(0);
    expect(overpassRequests).toBe(0);

    await page.screenshot({
      path: `e2e/screenshots/station-overpass-outage-${testInfo.project.name}.png`,
      fullPage: false,
      caret: 'initial',
    });
  });

  test('falls back to Overpass if the official OSM exact lookup is unavailable', async ({ page }) => {
    await enableGuestDataMocks(page);

    await page.unroute('**/api/osm-element**');
    await page.route('**/api/osm-element**', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Simulated OSM API outage' }),
      });
    });

    let overpassRequests = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/overpass')) overpassRequests += 1;
    });

    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Shell Fuel Station');
    await expect(page.getByRole('heading', { name: 'Reviews', exact: true })).toBeVisible();
    expect(overpassRequests).toBeGreaterThan(0);
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
    await expect(page.getByRole('heading', { name: 'Reviews', exact: true })).toBeVisible();

    const reviewsBox = await page.getByRole('heading', { name: 'Reviews', exact: true }).boundingBox();
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

    const composer = page.locator('#write-review');
    const openComposer = composer.getByRole('button', { name: /^Write a review/ });
    await expect(openComposer).toHaveAttribute('aria-expanded', 'false');
    await openComposer.click();
    await expect(composer.locator('#review-form-panel')).toBeVisible();

    const rating = composer.getByRole('radiogroup', { name: 'Your rating' });
    const oneStar = rating.getByRole('radio', { name: '1 star', exact: true });
    const starBox = await oneStar.boundingBox();
    expect(starBox).not.toBeNull();
    expect(starBox!.width).toBeGreaterThanOrEqual(44);
    expect(starBox!.height).toBeGreaterThanOrEqual(44);

    await oneStar.click();
    await expect(oneStar).toHaveAttribute('aria-checked', 'true');

    await oneStar.press('ArrowRight');
    const twoStars = rating.getByRole('radio', { name: '2 stars', exact: true });
    await expect(twoStars).toHaveAttribute('aria-checked', 'true');
    await expect(twoStars).toBeFocused();

    await twoStars.press('ArrowLeft');
    await expect(oneStar).toHaveAttribute('aria-checked', 'true');
    await expect(oneStar).toBeFocused();
    await composer.getByRole('button', { name: 'Publish review', exact: true }).click();

    await expect(composer.getByText('Choose at least one complaint category.')).toBeVisible();

    const fuelQuality = composer.getByRole('button', { name: 'Fuel quality', exact: true });
    await fuelQuality.click();
    await expect(fuelQuality).toHaveAttribute('aria-pressed', 'true');
    await composer.getByRole('button', { name: 'Publish review', exact: true }).click();

    await expect(page.getByText('Review published')).toBeVisible();
  });

  test('labels owner review fields and announces edit validation errors', async ({ page }) => {
    await page.addInitScript(({ stationId }) => {
      localStorage.setItem(
        `fuelvoice:mock_user_reviews:${stationId}`,
        JSON.stringify([
          {
            id: `${stationId}__test-user-123`,
            stationId,
            userId: 'test-user-123',
            userName: 'Test User',
            rating: 2,
            content: 'Owner review context',
            complaintCategories: ['fuel-quality'],
            helpfulCount: 0,
            notHelpfulCount: 0,
          },
        ]),
      );
    }, { stationId: STATION_ID });

    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Edit your review' }).click();
    const editContext = page.getByRole('textbox', { name: 'Review context (optional)' });
    await expect(editContext).toBeVisible();

    await page.getByRole('button', { name: 'Fuel quality', exact: true }).click();
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();

    const editError = page.getByRole('alert').filter({
      hasText: 'Choose at least one complaint category for a 1-2 rating.',
    });
    await expect(editError).toBeVisible();
    await expect(editContext).toHaveAttribute('aria-invalid', 'true');

    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Delete your review' }).click();

    const deleteReason = page.getByRole('textbox', { name: 'Reason for deleting review' });
    await expect(deleteReason).toBeVisible();
    await expect(deleteReason).toHaveAttribute('aria-describedby', /review-delete-help-/);
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
    await expect(page.getByRole('heading', { name: 'Reviews', exact: true })).toBeVisible();
    await expect(page.getByText('Trust Score', { exact: true })).toBeVisible();
    await page.waitForTimeout(300);

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Mobile station actions', () => {
  test('keeps review and complaint actions reachable', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only layout');

    await enableMockUser(page);
    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    const write = page.getByRole('link', { name: 'Write a review', exact: true });
    const complaint = page.getByRole('link', { name: 'File a complaint', exact: true });

    await expect(write).toBeVisible();
    await expect(complaint).toBeVisible();
    await expect(complaint).toHaveAttribute('href', /shell\.com/);
    await expect(page.getByRole('link', { name: 'Search fuel stations' })).toBeVisible();
    await expect(page.locator('.review-controls')).toHaveCSS('position', 'static');

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

test.describe('Admin responsiveness', () => {
  test('contains authenticated admin content inside a 375px viewport', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('fuelvoice:mock_user', 'admin');
      localStorage.setItem('fuelvoice-theme', 'dark');
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Pending Reports/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Users/ })).toBeVisible();

    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
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
