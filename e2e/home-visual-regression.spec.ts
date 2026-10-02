import { expect, test, type Page, type TestInfo } from '@playwright/test';

const OSM_STATION = {
  type: 'node',
  id: 6254336890,
  lat: 17.3887027,
  lon: 78.4753829,
  tags: {
    amenity: 'fuel',
    name: 'Fuel Station',
    brand: 'Shell',
    operator: 'Shell Retail',
    'addr:street': 'Abids Road',
    'addr:city': 'Hyderabad',
    'addr:state': 'Telangana',
    'addr:country': 'IN',
  },
};

function screenshotPath(testInfo: TestInfo, name: string) {
  const project = testInfo.project.name.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
  return `e2e/screenshots/visual-${project}-${name}.png`;
}

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

  await page.route('**/api/overpass', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ elements: [OSM_STATION] }),
    });
  });

  // Visual QA is about FuelVoice layout and map lifecycle, not third-party tile uptime.
  await page.route('https://api.maptiler.com/**', route => route.abort());
  await page.route('https://*.tile.openstreetmap.org/**', route => route.abort());
}

test.beforeEach(async ({ page }) => {
  await installDeterministicNetwork(page);
});

test.describe('Homepage visual stability and map performance', () => {
  test('phase 1: first paint remains above the fold and does not jump', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop geometry guard');

    await page.addInitScript(() => localStorage.setItem('fuelvoice-theme', 'light'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const heading = page.getByRole('heading', { level: 1 });
    const search = page.getByRole('combobox', { name: /search fuel stations/i });

    await expect(heading).toBeVisible();
    await expect(search).toBeVisible();

    const firstBox = await heading.boundingBox();
    expect(firstBox).not.toBeNull();
    expect(firstBox!.y).toBeLessThan(360);

    // The regression in production rendered decorative blocks as normal-flow
    // elements. Keep a direct guard so that failure cannot silently return.
    await expect(page.locator('.brand-orb')).toHaveCount(0);

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-1-first-paint'),
      fullPage: false,
    });

    await page.waitForTimeout(1200);
    const settledBox = await heading.boundingBox();
    expect(settledBox).not.toBeNull();
    expect(Math.abs(settledBox!.y - firstBox!.y)).toBeLessThan(8);

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-1-settled'),
      fullPage: false,
    });
  });

  test('phase 2: map initializes promptly inside a stable shell', async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('fuelvoice-theme', 'light'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const mapSection = page.locator('#explore-map');
    await mapSection.scrollIntoViewIfNeeded();

    const mapShell = mapSection.locator('.map-shell');
    await expect(mapShell).toBeVisible();
    const shellOpacity = await mapShell.evaluate((element) => getComputedStyle(element).opacity);
    expect(shellOpacity).toBe('1');

    const start = Date.now();
    const map = page.getByRole('application', { name: /interactive map of nearby fuel stations/i });
    await expect(map).toBeVisible({ timeout: 5000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);

    const mapBox = await map.boundingBox();
    expect(mapBox).not.toBeNull();
    expect(mapBox!.height).toBeGreaterThanOrEqual(390);
    expect(mapBox!.width).toBeGreaterThan(250);

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-2-map-ready'),
      fullPage: false,
    });
  });

  test('phase 3: soothing neutral palette works in both light and dark modes', async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('fuelvoice-theme', 'light'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const lightColors = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        bg: styles.getPropertyValue('--bg-primary').trim(),
        brand: styles.getPropertyValue('--color-brand-500').trim(),
      };
    });
    expect(lightColors.bg.toUpperCase()).toBe('#F8F9F8');
    expect(lightColors.brand.toUpperCase()).toBe('#67897D');

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-3-neutral-light'),
      fullPage: false,
    });

    const toggle = page.getByRole('button', { name: /switch to dark mode/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.waitForTimeout(350);

    const darkBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
    );
    expect(darkBg.toUpperCase()).toBe('#111614');

    const signIn = page.getByRole('button', { name: /sign in with google/i });
    if (await signIn.count()) {
      await expect.poll(async () => signIn.evaluate((element) => {
        const styles = getComputedStyle(element);
        return { background: styles.backgroundColor, color: styles.color };
      })).toEqual({
        background: 'rgb(30, 38, 34)',
        color: 'rgb(237, 241, 239)',
      });
    }

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-3-neutral-dark'),
      fullPage: false,
    });
  });

  test('phase 4: viewport has no horizontal overflow or clipped hero content', async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('fuelvoice-theme', 'light'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(metrics.innerWidth + 1);

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-4-responsive-viewport'),
      fullPage: false,
    });
  });
});
