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

    const hydrationWarnings: string[] = [];
    page.on('console', (message) => {
      const text = message.text();
      if (text.includes('hydrated but some attributes') || text.includes('Hydration failed')) {
        hydrationWarnings.push(text);
      }
    });

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
      caret: 'initial',
    });

    await page.waitForTimeout(1200);
    const settledBox = await heading.boundingBox();
    expect(settledBox).not.toBeNull();
    expect(Math.abs(settledBox!.y - firstBox!.y)).toBeLessThan(8);

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-1-settled'),
      fullPage: false,
      caret: 'initial',
    });

    await page.waitForTimeout(250);
    expect(hydrationWarnings).toEqual([]);
  });

  test('phase 1b: mobile initial paint keeps offscreen Leaflet unmounted', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile compositor guard');

    await page.addInitScript(() => localStorage.setItem('fuelvoice-theme', 'light'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(900);

    // The bundle may be preloaded, but no Leaflet DOM should exist until the
    // map workspace reaches the viewport. This guards the Chromium layer-bleed
    // regression that painted map content over the hero.
    await expect(page.locator('.leaflet-container')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-1b-mobile-no-offscreen-map'),
      fullPage: false,
      caret: 'initial',
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
      caret: 'initial',
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
    expect(lightColors.bg.toUpperCase()).toBe('#F5F5F1');
    expect(lightColors.brand.toUpperCase()).toBe('#67897D');

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-3-neutral-light'),
      fullPage: false,
      caret: 'initial',
    });

    const toggle = page.getByRole('button', { name: /switch to dark mode/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.waitForTimeout(350);

    const darkBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
    );
    expect(darkBg.toUpperCase()).toBe('#101512');

    const signIn = page.getByRole('button', { name: /sign in with google/i });
    if (await signIn.count()) {
      await expect.poll(async () => signIn.evaluate((element) => {
        const styles = getComputedStyle(element);
        return { background: styles.backgroundColor, color: styles.color };
      })).toEqual({
        background: 'rgb(30, 38, 34)',
        color: 'rgb(238, 242, 239)',
      });
    }

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-3-neutral-dark'),
      fullPage: false,
      caret: 'initial',
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
      caret: 'initial',
    });
  });
  test('phase 5: anchor navigation clears the sticky header', async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('fuelvoice-theme', 'light'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByRole('link', { name: 'Explore map', exact: true }).first().click();
    await expect(page.locator('#explore-map')).toBeInViewport();

    await expect.poll(async () => {
      return page.evaluate(() => {
        const header = document.querySelector('header')?.getBoundingClientRect();
        const section = document.querySelector('#explore-map')?.getBoundingClientRect();
        if (!header || !section) return false;
        return section.top >= header.bottom - 1;
      });
    }, { timeout: 5000 }).toBe(true);

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-5-anchor-offset'),
      fullPage: false,
      caret: 'initial',
    });
  });

  test('phase 6: nearby station data is visible when the section is reached', async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('fuelvoice-theme', 'light'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const nearby = page.locator('#nearby-stations');
    await nearby.scrollIntoViewIfNeeded();

    await expect(nearby.getByText('Fuel Station', { exact: true }).first()).toBeVisible({ timeout: 7000 });

    const hiddenContent = await nearby.evaluate((section) => {
      const stationLink = Array.from(section.querySelectorAll('a')).find((link) =>
        link.textContent?.includes('Fuel Station')
      );
      if (!stationLink) return null;
      const styles = getComputedStyle(stationLink);
      return { opacity: styles.opacity, visibility: styles.visibility };
    });

    expect(hiddenContent).not.toBeNull();
    expect(hiddenContent!.opacity).toBe('1');
    expect(hiddenContent!.visibility).toBe('visible');

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-6-nearby-visible'),
      fullPage: false,
      caret: 'initial',
    });
  });
  test('phase 7: premium UI primitives render as designed', async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('fuelvoice-theme', 'light'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const hero = page.locator('.command-surface');
    const workspace = page.locator('#explore-map .map-workspace');
    const footer = page.locator('.footer-shell');

    await expect(hero).toBeVisible();
    await expect(workspace).toBeVisible();
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    const radii = await Promise.all([
      hero.evaluate((el) => getComputedStyle(el).borderRadius),
      workspace.evaluate((el) => getComputedStyle(el).borderRadius),
      footer.evaluate((el) => getComputedStyle(el).borderRadius),
    ]);
    for (const radius of radii) {
      expect(parseFloat(radius)).toBeGreaterThanOrEqual(24);
    }

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-7-premium-full-page'),
      fullPage: true,
      caret: 'initial',
    });
  });

  test('phase 8: search workspace matches the premium system', async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('fuelvoice-theme', 'light'));
    await page.goto('/search', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Search less');
    await expect(page.locator('.command-surface')).toBeVisible();

    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);

    await page.screenshot({
      path: screenshotPath(testInfo, 'phase-8-search-workspace'),
      fullPage: false,
      caret: 'initial',
    });
  });


});
