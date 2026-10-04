# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ux-audit-phase4.spec.ts >> keyboard-only navigation reaches search results and returns focus from the user disclosure
- Location: e2e/ux-audit-phase4.spec.ts:158:5

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('button', { name: /Switch to light mode/i })
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" with timeout 5000ms
  - waiting for getByRole('button', { name: /Switch to light mode/i })
    14 × locator resolved to <button title="Switch to light mode" aria-label="Switch to light mode" class="relative grid h-11 w-11 place-items-center rounded-xl transition-colors hover:bg-surface-100 dark:hover:bg-surface-700">…</button>
       - unexpected value "inactive"

```

```yaml
- button "Switch to light mode":
  - img
```

# Test source

```ts
  70  |     status: 200,
  71  |     contentType: 'application/json',
  72  |     body: JSON.stringify({
  73  |       display_name: 'Hyderabad, Telangana, India',
  74  |       address: { city: 'Hyderabad', state: 'Telangana', country: 'India', country_code: 'in' },
  75  |     }),
  76  |   }));
  77  | 
  78  |   await page.route('https://api.maptiler.com/**', route => route.abort());
  79  |   await page.route('https://*.tile.openstreetmap.org/**', route => route.abort());
  80  | }
  81  | 
  82  | async function guestData(page: Page) {
  83  |   await page.addInitScript(() => {
  84  |     localStorage.removeItem('fuelvoice:mock_user');
  85  |     localStorage.setItem('fuelvoice:mock_guest_data', 'true');
  86  |     localStorage.setItem('fuelvoice-theme', 'dark');
  87  |   });
  88  | }
  89  | 
  90  | async function signedIn(page: Page, role: 'user' | 'admin' = 'user') {
  91  |   await page.addInitScript((mockRole) => {
  92  |     localStorage.setItem('fuelvoice:mock_user', mockRole === 'admin' ? 'admin' : 'true');
  93  |     localStorage.setItem('fuelvoice-theme', 'dark');
  94  |   }, role);
  95  | }
  96  | 
  97  | test.beforeEach(async ({ page }) => {
  98  |   await installNetwork(page);
  99  | });
  100 | 
  101 | test('history and refresh preserve the primary search to station journey', async ({ page }) => {
  102 |   await guestData(page);
  103 |   await page.goto('/search', { waitUntil: 'domcontentloaded' });
  104 | 
  105 |   const input = page.getByRole('combobox', { name: /search fuel stations/i });
  106 |   await input.fill('Shell');
  107 |   const result = page.getByRole('option', { name: /Shell Fuel Station/i });
  108 |   await expect(result).toBeVisible();
  109 |   await result.click();
  110 | 
  111 |   await expect(page).toHaveURL(new RegExp('/station/' + STATION_ID + '$'));
  112 |   await expect(page.getByRole('heading', { level: 1 })).toContainText(/Shell|Mock Fuel Station|Fuel Station/);
  113 | 
  114 |   await page.reload({ waitUntil: 'domcontentloaded' });
  115 |   await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  116 | 
  117 |   await page.goBack({ waitUntil: 'domcontentloaded' });
  118 |   await expect(page).toHaveURL(/\/search$/);
  119 |   await expect(page.getByRole('combobox', { name: /search fuel stations/i })).toBeVisible();
  120 | 
  121 |   await page.goForward({ waitUntil: 'domcontentloaded' });
  122 |   await expect(page).toHaveURL(new RegExp('/station/' + STATION_ID + '$'));
  123 |   await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  124 | });
  125 | 
  126 | test('slow station data keeps truthful loading feedback stable and contained', async ({ page }) => {
  127 |   await guestData(page);
  128 |   await page.unroute('**/api/osm-element**');
  129 |   await page.route('**/api/osm-element**', async route => {
  130 |     await new Promise(resolve => setTimeout(resolve, 1500));
  131 |     await route.fulfill({
  132 |       status: 200,
  133 |       contentType: 'application/json',
  134 |       body: JSON.stringify({
  135 |         element: {
  136 |           type: 'node',
  137 |           id: 6254336890,
  138 |           lat: 17.3887027,
  139 |           lon: 78.4753829,
  140 |           tags: { amenity: 'fuel', name: 'Shell Fuel Station' },
  141 |         },
  142 |       }),
  143 |     });
  144 |   });
  145 | 
  146 |   await page.goto('/station/' + STATION_ID, { waitUntil: 'domcontentloaded' });
  147 |   await expect(page.locator('.skeleton').first()).toBeVisible();
  148 | 
  149 |   const loadingMetrics = await page.evaluate(() => ({
  150 |     innerWidth: window.innerWidth,
  151 |     scrollWidth: document.documentElement.scrollWidth,
  152 |   }));
  153 |   expect(loadingMetrics.scrollWidth).toBeLessThanOrEqual(loadingMetrics.innerWidth + 1);
  154 | 
  155 |   await expect(page.getByRole('heading', { level: 1 })).toContainText('Shell Fuel Station', { timeout: 10000 });
  156 | });
  157 | 
  158 | test('keyboard-only navigation reaches search results and returns focus from the user disclosure', async ({ page }) => {
  159 |   await signedIn(page);
  160 |   await page.goto('/', { waitUntil: 'domcontentloaded' });
  161 | 
  162 |   const userMenu = page.getByRole('button', { name: 'User menu' });
  163 |   await userMenu.focus();
  164 |   await userMenu.press('Enter');
  165 |   await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
  166 |   await page.keyboard.press('Escape');
  167 |   await expect(userMenu).toBeFocused();
  168 | 
  169 |   await page.keyboard.press('Shift+Tab');
> 170 |   await expect(page.getByRole('button', { name: /Switch to light mode/i })).toBeFocused();
      |                                                                             ^ Error: expect(locator).toBeFocused() failed
  171 |   await page.keyboard.press('Shift+Tab');
  172 |   await expect(page.getByRole('link', { name: 'Search fuel stations' })).toBeFocused();
  173 | 
  174 |   await page.keyboard.press('Enter');
  175 |   await expect(page).toHaveURL(/\/search$/);
  176 | 
  177 |   const input = page.getByRole('combobox', { name: /search fuel stations/i });
  178 |   let inputFocused = false;
  179 |   for (let i = 0; i < 8; i += 1) {
  180 |     await page.keyboard.press('Tab');
  181 |     inputFocused = await input.evaluate((element) => element === document.activeElement);
  182 |     if (inputFocused) break;
  183 |   }
  184 |   expect(inputFocused).toBe(true);
  185 |   await page.keyboard.type('Shell');
  186 |   await expect(page.getByRole('option', { name: /Shell Fuel Station/i })).toBeVisible();
  187 |   await page.keyboard.press('ArrowDown');
  188 |   await page.keyboard.press('Enter');
  189 |   await expect(page).toHaveURL(new RegExp('/station/' + STATION_ID + '$'));
  190 | });
  191 | 
  192 | test('rapid repeated review publish does not create duplicate user reviews', async ({ page }) => {
  193 |   await signedIn(page);
  194 |   await page.goto('/station/' + STATION_ID, { waitUntil: 'domcontentloaded' });
  195 | 
  196 |   const composer = page.locator('#write-review');
  197 |   await composer.getByRole('button', { name: /^Write a review/ }).click();
  198 |   await composer.getByRole('radio', { name: '5 stars', exact: true }).click();
  199 | 
  200 |   const publish = composer.getByRole('button', { name: 'Publish review', exact: true });
  201 |   await publish.evaluate((element) => {
  202 |     const button = element as HTMLButtonElement;
  203 |     button.click();
  204 |     button.click();
  205 |   });
  206 | 
  207 |   await expect(page.getByText('Review published').first()).toBeVisible();
  208 | 
  209 |   const storedCount = await page.evaluate((stationId) => {
  210 |     const raw = localStorage.getItem('fuelvoice:mock_user_reviews:' + stationId);
  211 |     if (!raw) return 0;
  212 |     return JSON.parse(raw).length;
  213 |   }, STATION_ID);
  214 | 
  215 |   expect(storedCount).toBe(1);
  216 | });
  217 | 
  218 | test('admin route reconstructs after refresh without blank or false-zero state', async ({ page }) => {
  219 |   await signedIn(page, 'admin');
  220 |   await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  221 | 
  222 |   await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
  223 |   await expect(page.getByRole('heading', { name: /Pending Reports/ })).toBeVisible();
  224 | 
  225 |   await page.reload({ waitUntil: 'domcontentloaded' });
  226 | 
  227 |   await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
  228 |   await expect(page.getByRole('heading', { name: 'Recent Reviews' })).toBeVisible();
  229 |   await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  230 | });
  231 | 
```