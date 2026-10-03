import { expect, test, type Page, type TestInfo } from '@playwright/test';

const STATION_ID = 'node_6254336890';

function screenshotPath(testInfo: TestInfo, name: string) {
  const project = testInfo.project.name.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
  return `e2e/screenshots/visual-${project}-${name}.png`;
}

async function installNetwork(page: Page) {
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
  await page.route('https://api.maptiler.com/**', (route) => route.abort());
  await page.route('https://*.tile.openstreetmap.org/**', (route) => route.abort());
}

test.beforeEach(async ({ page }) => {
  await installNetwork(page);
});

test.describe('Station-first visual regression', () => {
  test('homepage stays minimal, dark and within the first viewport', async ({ page }, testInfo) => {
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

    await page.screenshot({
      path: screenshotPath(testInfo, 'homepage'),
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
    await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();

    const reviewHeading = await page.getByRole('heading', { name: 'Reviews' }).boundingBox();
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
