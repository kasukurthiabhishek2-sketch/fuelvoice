import { expect, test, type Page } from '@playwright/test';

const STATION_ID = 'node_6254336890';

const PHOTON_RESPONSE = {
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
};

async function installNetwork(page: Page) {
  await page.route('https://ipwho.is/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, latitude: 17.3887027, longitude: 78.4753829 }),
  }));

  await page.route('https://photon.komoot.io/api**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(PHOTON_RESPONSE),
  }));

  await page.route('**/api/overpass', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ elements: [] }),
  }));

  await page.route('**/api/osm-element**', async route => {
    const url = new URL(route.request().url());
    const id = Number(url.searchParams.get('id')) || 6254336890;
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
          },
        },
      }),
    });
  });

  await page.route('**/api/station-addresses', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ addresses: {} }),
  }));

  await page.route('https://nominatim.openstreetmap.org/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      display_name: 'Hyderabad, Telangana, India',
      address: { city: 'Hyderabad', state: 'Telangana', country: 'India', country_code: 'in' },
    }),
  }));

  await page.route('https://api.maptiler.com/**', route => route.abort());
  await page.route('https://*.tile.openstreetmap.org/**', route => route.abort());
}

async function guestData(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('fuelvoice:mock_user');
    localStorage.setItem('fuelvoice:mock_guest_data', 'true');
    localStorage.setItem('fuelvoice-theme', 'dark');
  });
}

async function signedIn(page: Page, role: 'user' | 'admin' = 'user') {
  await page.addInitScript((mockRole) => {
    localStorage.setItem('fuelvoice:mock_user', mockRole === 'admin' ? 'admin' : 'true');
    localStorage.setItem('fuelvoice-theme', 'dark');
  }, role);
}

test.beforeEach(async ({ page }) => {
  await installNetwork(page);
});

test('history and refresh preserve the primary search to station journey', async ({ page }) => {
  await guestData(page);
  await page.goto('/search', { waitUntil: 'domcontentloaded' });

  const input = page.getByRole('combobox', { name: /search fuel stations/i });
  await input.pressSequentially('Shell', { delay: 40 });
  const result = page.getByRole('option', { name: /Shell Fuel Station/i });
  await expect(result).toBeVisible({ timeout: 10000 });
  await result.click();

  await expect(page).toHaveURL(new RegExp('/station/' + STATION_ID + '$'));
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Shell|Mock Fuel Station|Fuel Station/);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.goBack({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/search$/);
  await expect(page.getByRole('combobox', { name: /search fuel stations/i })).toBeVisible();

  await page.goForward({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(new RegExp('/station/' + STATION_ID + '$'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('slow station data keeps truthful loading feedback stable and contained', async ({ page }) => {
  await guestData(page);
  await page.unroute('**/api/osm-element**');
  await page.route('**/api/osm-element**', async route => {
    await new Promise(resolve => setTimeout(resolve, 1500));
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

  await page.goto('/station/' + STATION_ID, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.skeleton').first()).toBeVisible();

  const loadingMetrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(loadingMetrics.scrollWidth).toBeLessThanOrEqual(loadingMetrics.innerWidth + 1);

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Shell Fuel Station', { timeout: 10000 });
});

test('keyboard-only navigation reaches search results and returns focus from the user disclosure', async ({ page }) => {
  await signedIn(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const userMenu = page.getByRole('button', { name: 'User menu' });
  await userMenu.focus();
  await userMenu.press('Enter');
  await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(userMenu).toBeFocused();
  await expect(page.getByRole('button', { name: 'Sign Out' })).toHaveCount(0);

  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: /Switch to light mode/i })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('link', { name: 'Contribute a fuel station review' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('link', { name: 'Search fuel stations' })).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/search$/);

  const input = page.getByRole('combobox', { name: /search fuel stations/i });
  let inputFocused = false;
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab');
    inputFocused = await input.evaluate((element) => element === document.activeElement);
    if (inputFocused) break;
  }
  expect(inputFocused).toBe(true);
  await input.pressSequentially('Shell', { delay: 40 });
  const keyboardResult = page.getByRole('option', { name: /Shell Fuel Station/i });
  await expect(keyboardResult).toBeVisible({ timeout: 10000 });
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', 'search-result-' + STATION_ID);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp('/station/' + STATION_ID + '$'));
});

test('rapid repeated review publish does not create duplicate user reviews', async ({ page }) => {
  await signedIn(page);
  await page.goto('/station/' + STATION_ID, { waitUntil: 'domcontentloaded' });

  const composer = page.locator('#write-review');
  await composer.getByRole('button', { name: /^Write a review/ }).click();
  await composer.getByRole('radio', { name: '5 stars', exact: true }).click();

  const publish = composer.getByRole('button', { name: 'Publish review', exact: true });
  await publish.evaluate((element) => {
    const button = element as HTMLButtonElement;
    button.click();
    button.click();
  });

  await expect(page.getByText('Review published').first()).toBeVisible();

  const storedCount = await page.evaluate((stationId) => {
    const raw = localStorage.getItem('fuelvoice:mock_user_reviews:' + stationId);
    if (!raw) return 0;
    return JSON.parse(raw).length;
  }, STATION_ID);

  expect(storedCount).toBe(1);
});

test('admin route reconstructs after refresh without blank or false-zero state', async ({ page }) => {
  await signedIn(page, 'admin');
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Pending Reports/ })).toBeVisible();

  await page.reload({ waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recent Reviews' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
});
