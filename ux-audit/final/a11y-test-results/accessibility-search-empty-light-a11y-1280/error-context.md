# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.mjs >> search-empty-light
- Location: ux-audit/final/accessibility.spec.mjs:185:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/No fuel stations found/)
Expected: visible
Error: strict mode violation: getByText(/No fuel stations found/) resolved to 2 elements:
    1) <div class="sr-only" aria-live="polite" aria-atomic="true">No fuel stations found</div> aka getByText('No fuel stations found', { exact: true })
    2) <p class="mt-3 text-sm font-semibold">No fuel stations found for “NoSuchStation”</p> aka getByText('No fuel stations found for “')

Call log:
  - Expect "toBeVisible" getByText(/No fuel stations found/) with timeout 5000ms
  - waiting for getByText(/No fuel stations found/)

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "FuelVoice home" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e10]: FuelVoice
      - generic [ref=e11]:
        - link "Search fuel stations" [ref=e12] [cursor=pointer]:
          - /url: /search
          - generic [ref=e16]: Search
        - button "Switch to dark mode" [ref=e17]
        - button "Sign in with Google" [ref=e21]: Sign In
  - main [ref=e27]:
    - generic [ref=e30]:
      - paragraph [ref=e31]: Station search
      - heading "Find the station. Then judge it by the evidence." [level=1] [ref=e32]:
        - text: Find the station.
        - generic [ref=e33]: Then judge it by the evidence.
      - paragraph [ref=e34]: Search by station name, brand, locality, or city. Search does not require precise browser-location permission.
      - generic [ref=e36]:
        - generic [ref=e37]:
          - combobox "Search fuel stations" [expanded] [active] [ref=e38]: NoSuchStation
          - button "Clear search" [ref=e40]
        - generic [ref=e43]: No fuel stations found
        - generic [ref=e44]:
          - paragraph [ref=e49]: No fuel stations found for “NoSuchStation”
          - paragraph [ref=e50]: Try a station name, brand, locality, or city.
      - generic [ref=e51]:
        - generic [ref=e52]:
          - paragraph [ref=e53]: No location gate
          - paragraph [ref=e54]: Search works without precise location permission.
        - generic [ref=e55]:
          - paragraph [ref=e56]: Trust over stars
          - paragraph [ref=e57]: Open a station to see its Trust Score and reviews.
        - generic [ref=e58]:
          - paragraph [ref=e59]: Official complaint paths
          - paragraph [ref=e60]: Verified destinations appear on supported station pages.
  - contentinfo [ref=e61]:
    - generic [ref=e62]:
      - generic [ref=e63]:
        - link "FuelVoice" [ref=e64] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e65]: Reviews and verified complaint paths for fuel stations worldwide.
      - generic [ref=e66]:
        - link "Search stations" [ref=e67] [cursor=pointer]:
          - /url: /search
        - link "OpenStreetMap" [ref=e68] [cursor=pointer]:
          - /url: https://www.openstreetmap.org/copyright
  - alert [ref=e69]
```

# Test source

```ts
  23  |           osm_id: 6254336890,
  24  |           osm_type: 'N',
  25  |           osm_key: 'amenity',
  26  |           osm_value: 'fuel',
  27  |           name: 'Shell Fuel Station',
  28  |           city: 'Hyderabad',
  29  |           state: 'Telangana',
  30  |           country: 'India',
  31  |           countrycode: 'IN',
  32  |         },
  33  |       }],
  34  |     }),
  35  |   }));
  36  |   await page.route('**/api/overpass', route => route.fulfill({
  37  |     status: 200,
  38  |     contentType: 'application/json',
  39  |     body: JSON.stringify({ elements: [] }),
  40  |   }));
  41  |   await page.route('**/api/osm-element**', route => {
  42  |     if (mode === 'station-error') {
  43  |       return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Unavailable' }) });
  44  |     }
  45  |     return route.fulfill({
  46  |       status: 200,
  47  |       contentType: 'application/json',
  48  |       body: JSON.stringify({
  49  |         element: {
  50  |           type: 'node',
  51  |           id: 6254336890,
  52  |           lat: 17.3887027,
  53  |           lon: 78.4753829,
  54  |           tags: { amenity: 'fuel', name: 'Shell Fuel Station', brand: 'Shell', 'addr:city': 'Hyderabad', 'addr:country': 'IN' },
  55  |         },
  56  |       }),
  57  |     });
  58  |   });
  59  |   await page.route('https://api.maptiler.com/**', route => route.abort());
  60  |   await page.route('https://*.tile.openstreetmap.org/**', route => route.abort());
  61  | }
  62  | 
  63  | async function setState(page, auth = 'none', theme = 'dark') {
  64  |   await page.addInitScript(({ authMode, selectedTheme }) => {
  65  |     localStorage.setItem('fuelvoice-theme', selectedTheme);
  66  |     if (authMode === 'admin') localStorage.setItem('fuelvoice:mock_user', 'admin');
  67  |     else if (authMode === 'user') localStorage.setItem('fuelvoice:mock_user', 'true');
  68  |     else {
  69  |       localStorage.removeItem('fuelvoice:mock_user');
  70  |       localStorage.setItem('fuelvoice:mock_guest_data', 'true');
  71  |     }
  72  |   }, { authMode: auth, selectedTheme: theme });
  73  | }
  74  | 
  75  | async function scan(page, testInfo, scenario) {
  76  |   const results = await new AxeBuilder({ page }).analyze();
  77  |   fs.mkdirSync(OUTPUT, { recursive: true });
  78  |   const record = {
  79  |     project: testInfo.project.name,
  80  |     scenario,
  81  |     url: page.url(),
  82  |     violations: results.violations,
  83  |   };
  84  |   fs.writeFileSync(
  85  |     path.join(OUTPUT, testInfo.project.name + '-' + scenario + '.json'),
  86  |     JSON.stringify(record, null, 2) + '\n',
  87  |   );
  88  |   const compact = results.violations.map(v => ({
  89  |     id: v.id,
  90  |     impact: v.impact,
  91  |     help: v.help,
  92  |     nodes: v.nodes.map(n => n.target),
  93  |   }));
  94  |   expect(results.violations, JSON.stringify(compact, null, 2)).toEqual([]);
  95  | }
  96  | 
  97  | const scenarios = [
  98  |   {
  99  |     name: 'home-dark',
  100 |     route: '/',
  101 |     auth: 'none',
  102 |     theme: 'dark',
  103 |     prepare: async () => {},
  104 |   },
  105 |   {
  106 |     name: 'search-results-dark',
  107 |     route: '/search',
  108 |     auth: 'none',
  109 |     theme: 'dark',
  110 |     prepare: async page => {
  111 |       await page.getByRole('combobox', { name: /search fuel stations/i }).fill('Shell');
  112 |       await expect(page.getByRole('option', { name: /Shell Fuel Station/i })).toBeVisible();
  113 |     },
  114 |   },
  115 |   {
  116 |     name: 'search-empty-light',
  117 |     route: '/search',
  118 |     auth: 'none',
  119 |     theme: 'light',
  120 |     mode: 'search-empty',
  121 |     prepare: async page => {
  122 |       await page.getByRole('combobox', { name: /search fuel stations/i }).fill('NoSuchStation');
> 123 |       await expect(page.getByText(/No fuel stations found/)).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  124 |     },
  125 |   },
  126 |   {
  127 |     name: 'station-default-dark',
  128 |     route: '/station/' + STATION_ID,
  129 |     auth: 'none',
  130 |     theme: 'dark',
  131 |     prepare: async page => {
  132 |       await expect(page.getByRole('heading', { name: 'Reviews', exact: true })).toBeVisible();
  133 |     },
  134 |   },
  135 |   {
  136 |     name: 'station-review-form-light',
  137 |     route: '/station/' + STATION_ID,
  138 |     auth: 'user',
  139 |     theme: 'light',
  140 |     prepare: async page => {
  141 |       await page.locator('#write-review').getByRole('button', { name: /^Write a review/ }).click();
  142 |       await expect(page.locator('#review-form-panel')).toBeVisible();
  143 |     },
  144 |   },
  145 |   {
  146 |     name: 'station-error-dark',
  147 |     route: '/station/' + STATION_ID,
  148 |     auth: 'none',
  149 |     theme: 'dark',
  150 |     mode: 'station-error',
  151 |     prepare: async page => {
  152 |       await expect(page.getByRole('heading', { name: /could not load|could not find/i })).toBeVisible();
  153 |     },
  154 |   },
  155 |   {
  156 |     name: 'admin-signed-out-light',
  157 |     route: '/admin',
  158 |     auth: 'none',
  159 |     theme: 'light',
  160 |     prepare: async page => {
  161 |       await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
  162 |     },
  163 |   },
  164 |   {
  165 |     name: 'admin-content-dark',
  166 |     route: '/admin',
  167 |     auth: 'admin',
  168 |     theme: 'dark',
  169 |     prepare: async page => {
  170 |       await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
  171 |     },
  172 |   },
  173 |   {
  174 |     name: 'not-found-dark',
  175 |     route: '/does-not-exist',
  176 |     auth: 'none',
  177 |     theme: 'dark',
  178 |     prepare: async page => {
  179 |       await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
  180 |     },
  181 |   },
  182 | ];
  183 | 
  184 | for (const scenario of scenarios) {
  185 |   test(scenario.name, async ({ page }, testInfo) => {
  186 |     await setState(page, scenario.auth, scenario.theme);
  187 |     await installNetwork(page, scenario.mode);
  188 |     await page.goto(scenario.route, { waitUntil: 'domcontentloaded' });
  189 |     await scenario.prepare(page);
  190 |     await scan(page, testInfo, scenario.name);
  191 |   });
  192 | }
  193 | 
```