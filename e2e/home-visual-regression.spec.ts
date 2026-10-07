import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';

const STATION_ID = 'node_6254336890';

function screenshotPath(testInfo: TestInfo, name: string) {
  const project = testInfo.project.name.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
  return `e2e/screenshots/visual-${project}-${name}.png`;
}

async function contrastRatio(locator: Locator) {
  return locator.evaluate((element) => {
    const parseRgb = (value: string) => {
      const match = value.match(/[\d.]+/g);
      if (!match || match.length < 3) throw new Error('Expected CSS color: ' + value);
      const channels = match.slice(0, 3).map(Number);
      return value.startsWith('color(srgb ') ? channels.map((channel) => channel * 255) : channels;
    };
    const luminance = ([r, g, b]: number[]) => {
      const linear = [r, g, b].map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    const style = getComputedStyle(element);
    const foreground = luminance(parseRgb(style.color));
    const background = luminance(parseRgb(style.backgroundColor));
    const lighter = Math.max(foreground, background);
    const darker = Math.min(foreground, background);
    return (lighter + 0.05) / (darker + 0.05);
  });
}

async function installNetwork(page: Page) {
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
      body: JSON.stringify({
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
            },
          },
        ],
      }),
    });
  });

  await page.route('https://nominatim.openstreetmap.org/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        display_name: 'Hyderabad, Telangana, India',
        address: { country: 'India', country_code: 'in' },
      }),
    });
  });
  await page.route('https://api.maptiler.com/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/geocoding/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            text: 'Abids Road',
            place_name: '5-9-22 Abids Road, Abids, Hyderabad, Telangana 500001, India',
            place_type: ['address'],
            context: [
              { text: 'Hyderabad' },
              { text: 'Telangana' },
              { text: 'India' },
            ],
          }],
          query: [],
          attribution: '© MapTiler © OpenStreetMap contributors',
        }),
      });
      return;
    }

    await route.abort();
  });
  await page.route('https://*.tile.openstreetmap.org/**', (route) => route.abort());
}

test.beforeEach(async ({ page }) => {
  await installNetwork(page);
});

test.describe('Community-first visual regression', () => {
  test('homepage keeps the search hero fast while nearby stations load below it', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const heading = page.getByRole('heading', { level: 1 });
    const search = page.getByRole('combobox', { name: /search fuel stations/i });

    await expect(heading).toBeVisible();
    await expect(search).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/dark/);

    const headingBox = await heading.boundingBox();
    expect(headingBox).not.toBeNull();
    expect(headingBox!.y).toBeLessThan(360);

    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);

    await expect(page.locator('.leaflet-container')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Stations around you', exact: true })).toBeVisible();
    const stationHeading = page.getByRole('heading', { name: 'Shell Fuel Station', exact: true });
    await expect(stationHeading).toBeVisible();
    await expect(page.getByText('5-9-22 Abids Road, Abids, Hyderabad, Telangana 500001, India')).toBeVisible();
    await expect(page.getByText('Approx. mapped address')).toBeVisible();
    const stationBox = await stationHeading.boundingBox();
    const viewport = page.viewportSize();
    expect(stationBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (testInfo.project.name === 'mobile') {
      expect(stationBox!.y).toBeLessThan(viewport!.height);
    }

    await page.screenshot({
      path: screenshotPath(testInfo, 'homepage'),
      fullPage: false,
      caret: 'initial',
    });

    const nearby = page.locator('#nearby-stations');
    await nearby.scrollIntoViewIfNeeded();
    await expect(nearby.getByRole('heading', { name: 'Stations around you', exact: true })).toBeVisible();
    await page.screenshot({
      path: screenshotPath(testInfo, 'nearby-stations'),
      fullPage: false,
      caret: 'initial',
    });
  });

  test('light theme keeps homepage surfaces coherent', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const toggle = page.getByRole('button', { name: /switch to light mode/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await expect.poll(
      () => page.locator('.community-home-hero').evaluate((element) => getComputedStyle(element).backgroundColor),
    ).not.toBe('rgb(8, 9, 10)');
    await expect.poll(
      () => page.getByRole('combobox', { name: /search fuel stations/i }).evaluate((element) => getComputedStyle(element).backgroundColor),
    ).not.toBe('rgb(17, 19, 21)');

    await expect(page.locator('.station-card-community-title').first()).toBeVisible();

    const brandPill = page.locator('.station-card-brand').first();
    await expect(brandPill).toBeVisible();
    expect(await contrastRatio(brandPill)).toBeGreaterThanOrEqual(4.5);

    const stationTitleLink = page.locator('.station-card-title-link').first();
    await expect(stationTitleLink).toBeVisible();
    const stationTitleBox = await stationTitleLink.boundingBox();
    expect(stationTitleBox).not.toBeNull();
    expect(stationTitleBox!.width).toBeGreaterThanOrEqual(24);
    expect(stationTitleBox!.height).toBeGreaterThanOrEqual(24);

    const mapTilerAttribution = page.getByRole('link', { name: '© MapTiler' });
    await expect(mapTilerAttribution).toBeVisible();
    const attributionBox = await mapTilerAttribution.boundingBox();
    expect(attributionBox).not.toBeNull();
    expect(attributionBox!.height).toBeGreaterThanOrEqual(24);

    await page.screenshot({
      path: screenshotPath(testInfo, 'homepage-light-theme'),
      fullPage: false,
      caret: 'initial',
    });
  });

  test('station page prioritizes trust and review evidence', async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      localStorage.setItem('fuelvoice:mock_user', 'true');
      localStorage.setItem('fuelvoice-theme', 'dark');
    });

    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Trust Score', { exact: true })).toBeVisible();
    await expect(page.getByText('82', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reviews', exact: true })).toBeVisible();

    const reviewHeading = await page.getByRole('heading', { name: 'Reviews', exact: true }).boundingBox();
    const detailsHeading = await page.getByRole('heading', { name: /Useful details/i }).boundingBox();
    expect(reviewHeading).not.toBeNull();
    expect(detailsHeading).not.toBeNull();
    expect(reviewHeading!.y).toBeLessThan(detailsHeading!.y);

    await page.screenshot({
      path: screenshotPath(testInfo, 'station-trust-first'),
      fullPage: false,
      caret: 'initial',
    });
  });

  test('mobile keeps both primary actions visible without covering content', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only visual guard');

    await page.addInitScript(() => {
      localStorage.setItem('fuelvoice:mock_user', 'true');
      localStorage.setItem('fuelvoice-theme', 'dark');
    });
    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    const bar = page.locator('.station-mobile-actions');
    await expect(bar).toBeVisible();
    await expect(bar.getByRole('link', { name: 'Write a review' })).toBeVisible();
    await expect(bar.getByRole('link', { name: 'File a complaint' })).toBeVisible();

    const barBox = await bar.boundingBox();
    const viewport = page.viewportSize();
    expect(barBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(barBox!.y + barBox!.height).toBeLessThanOrEqual(viewport!.height + 1);

    await page.screenshot({
      path: screenshotPath(testInfo, 'station-mobile-actions'),
      fullPage: false,
      caret: 'initial',
    });
  });

  test('complaint section remains visually secondary to reviews but explicit', async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      localStorage.setItem('fuelvoice:mock_user', 'true');
      localStorage.setItem('fuelvoice-theme', 'dark');
    });
    await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });

    const complaints = page.locator('#complaints');
    await complaints.scrollIntoViewIfNeeded();

    await expect(complaints.getByText('Official link verified')).toBeVisible();
    await expect(complaints.getByRole('link', { name: /Contact station \/ brand support/i })).toBeVisible();
    await expect(complaints.getByRole('link', { name: /Escalate to consumer protection/i })).toBeVisible();

    await page.screenshot({
      path: screenshotPath(testInfo, 'station-complaints'),
      fullPage: false,
      caret: 'initial',
    });
  });

  test('search workspace has no horizontal overflow after theme replacement', async ({ page }, testInfo) => {
    await page.goto('/search', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);

    await page.screenshot({
      path: screenshotPath(testInfo, 'search'),
      fullPage: false,
      caret: 'initial',
    });
  });
});
