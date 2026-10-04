# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.mjs >> station-default-dark
- Location: ux-audit/final/accessibility.spec.mjs:185:3

# Error details

```
Error: [
  {
    "id": "landmark-main-is-top-level",
    "impact": "moderate",
    "help": "Main landmark should not be contained in another landmark",
    "nodes": [
      [
        ".mx-auto > main"
      ]
    ]
  },
  {
    "id": "landmark-no-duplicate-main",
    "impact": "moderate",
    "help": "Document should not have more than one main landmark",
    "nodes": [
      [
        "body > main"
      ]
    ]
  },
  {
    "id": "landmark-unique",
    "impact": "moderate",
    "help": "Landmarks should have a unique role or role/label/title (i.e. accessible name) combination",
    "nodes": [
      [
        "body > main"
      ]
    ]
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 120

- Array []
+ Array [
+   Object {
+     "description": "Ensure the main landmark is at top level",
+     "help": "Main landmark should not be contained in another landmark",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/landmark-main-is-top-level?application=playwright",
+     "id": "landmark-main-is-top-level",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "role": "main",
+             },
+             "id": "landmark-is-top-level",
+             "impact": "moderate",
+             "message": "The main landmark is contained in another landmark.",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   The main landmark is contained in another landmark.",
+         "html": "<main class=\"min-w-0\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".mx-auto > main",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+   Object {
+     "description": "Ensure the document has at most one main landmark",
+     "help": "Document should not have more than one main landmark",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/landmark-no-duplicate-main?application=playwright",
+     "id": "landmark-no-duplicate-main",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "page-no-duplicate-main",
+             "impact": "moderate",
+             "message": "Document has more than one main landmark",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<main class=\"min-w-0\">",
+                 "target": Array [
+                   ".mx-auto > main",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Document has more than one main landmark",
+         "html": "<main class=\"flex-1\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "body > main",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+   Object {
+     "description": "Ensure landmarks are unique",
+     "help": "Landmarks should have a unique role or role/label/title (i.e. accessible name) combination",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/landmark-unique?application=playwright",
+     "id": "landmark-unique",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "accessibleText": null,
+               "role": "main",
+             },
+             "id": "landmark-is-unique",
+             "impact": "moderate",
+             "message": "The landmark must have a unique aria-label, aria-labelledby, or title to make landmarks distinguishable",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<main class=\"min-w-0\">",
+                 "target": Array [
+                   ".mx-auto > main",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   The landmark must have a unique aria-label, aria-labelledby, or title to make landmarks distinguishable",
+         "html": "<main class=\"flex-1\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "body > main",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "FuelVoice home" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e10]: FuelVoice
      - generic [ref=e11]:
        - link "Search fuel stations" [ref=e12] [cursor=pointer]:
          - /url: /search
          - generic [ref=e16]: Search
        - button "Switch to light mode" [ref=e17]
        - button "Sign in with Google" [ref=e21]: Sign In
  - main [ref=e27]:
    - generic [ref=e28]:
      - generic [ref=e30]:
        - generic [ref=e31]:
          - link "Search" [ref=e32] [cursor=pointer]:
            - /url: /search
          - button "Share" [ref=e35]
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e40]:
              - generic [ref=e41]: Shell
              - generic [ref=e42]: Mapped station
            - heading "Shell Fuel Station" [level=1] [ref=e43]
            - paragraph [ref=e44]: Hyderabad, IN
            - generic [ref=e45]:
              - link "Get directions" [ref=e46] [cursor=pointer]:
                - /url: https://www.google.com/maps/dir/?api=1&destination=17.3887027,78.4753829
              - link "Read reviews" [ref=e47] [cursor=pointer]:
                - /url: "#reviews"
          - generic "Trust Score unavailable" [ref=e48]:
            - paragraph [ref=e49]: Trust Score
            - paragraph [ref=e50]: Insufficient data
            - paragraph [ref=e51]: 0 of 5 reviews needed
      - main [ref=e54]:
        - generic [ref=e55]:
          - generic [ref=e57]:
            - paragraph [ref=e58]: Customer experiences
            - heading "Reviews" [level=2] [ref=e59]
          - paragraph [ref=e60]: Risk-heavy experiences appear first by default. Filter by issue when you need something specific.
          - generic [ref=e62]:
            - generic [ref=e63]:
              - group "Review sort order" [ref=e64]:
                - button "Risk first" [pressed] [ref=e65]
                - button "Newest" [ref=e66]
                - button "Most helpful" [ref=e67]
              - group "Filter reviews by issue" [ref=e68]:
                - button "All issues" [pressed] [ref=e69]
                - button "Fuel quality" [ref=e70]
                - button "Quantity / short-filling" [ref=e71]
                - button "Pricing / billing" [ref=e72]
                - button "Staff behavior" [ref=e73]
                - button "Payment issue" [ref=e74]
                - button "Facilities" [ref=e75]
                - button "Safety" [ref=e76]
                - button "Other" [ref=e77]
            - generic [ref=e78]:
              - article [ref=e79]:
                - generic [ref=e80]:
                  - generic [ref=e81]: D
                  - generic [ref=e82]:
                    - generic [ref=e83]:
                      - generic [ref=e84]: Driver 1
                      - generic [ref=e85]: less than a minute ago
                    - 'img "Rating: 1 out of 5 stars" [ref=e87]'
                - generic [ref=e98]: Fuel quality
                - paragraph [ref=e100]: The visit had issues that other drivers may want to know about.
                - generic [ref=e101]:
                  - button "Helpful" [ref=e102]
                  - button "Not helpful" [ref=e103]
              - article [ref=e104]:
                - generic [ref=e105]:
                  - generic [ref=e106]: D
                  - generic [ref=e107]:
                    - generic [ref=e108]:
                      - generic [ref=e109]: Driver 7
                      - generic [ref=e110]: about 6 hours ago
                    - 'img "Rating: 1 out of 5 stars" [ref=e112]'
                - generic [ref=e123]: Fuel quality
                - paragraph [ref=e125]: The visit had issues that other drivers may want to know about.
                - generic [ref=e126]:
                  - button "Helpful 2" [ref=e127]:
                    - text: Helpful
                    - generic [ref=e128]: "2"
                  - button "Not helpful" [ref=e129]
              - article [ref=e130]:
                - generic [ref=e131]:
                  - generic [ref=e132]: D
                  - generic [ref=e133]:
                    - generic [ref=e134]:
                      - generic [ref=e135]: Driver 2
                      - generic [ref=e136]: about 1 hour ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e138]'
                - generic [ref=e149]: Quantity / short-filling
                - paragraph [ref=e151]: The visit had issues that other drivers may want to know about.
                - generic [ref=e152]:
                  - button "Helpful 3" [ref=e153]:
                    - text: Helpful
                    - generic [ref=e154]: "3"
                  - button "Not helpful 1" [ref=e155]:
                    - text: Not helpful
                    - generic [ref=e156]: "1"
              - generic [ref=e157]:
                - generic [ref=e158]:
                  - paragraph [ref=e159]: Review collapsed
                  - paragraph [ref=e160]: At least 65% of 5+ reactions marked this review Not helpful.
                - button "Show review" [ref=e161]
              - article [ref=e162]:
                - generic [ref=e163]:
                  - generic [ref=e164]: D
                  - generic [ref=e165]:
                    - generic [ref=e166]:
                      - generic [ref=e167]: Driver 8
                      - generic [ref=e168]: about 7 hours ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e170]'
                - generic [ref=e181]: Quantity / short-filling
                - paragraph [ref=e183]: The visit had issues that other drivers may want to know about.
                - generic [ref=e184]:
                  - button "Helpful 5" [ref=e185]:
                    - text: Helpful
                    - generic [ref=e186]: "5"
                  - button "Not helpful 1" [ref=e187]:
                    - text: Not helpful
                    - generic [ref=e188]: "1"
              - article [ref=e189]:
                - generic [ref=e190]:
                  - generic [ref=e191]: D
                  - generic [ref=e192]:
                    - generic [ref=e193]:
                      - generic [ref=e194]: Driver 9
                      - generic [ref=e195]: about 8 hours ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e197]'
                - generic [ref=e208]: Fuel quality
                - paragraph [ref=e210]: The visit had issues that other drivers may want to know about.
                - generic [ref=e211]:
                  - button "Helpful" [ref=e212]
                  - button "Not helpful 2" [ref=e213]:
                    - text: Not helpful
                    - generic [ref=e214]: "2"
              - article [ref=e215]:
                - generic [ref=e216]:
                  - generic [ref=e217]: D
                  - generic [ref=e218]:
                    - generic [ref=e219]:
                      - generic [ref=e220]: Driver 4
                      - generic [ref=e221]: about 3 hours ago
                    - 'img "Rating: 3 out of 5 stars" [ref=e223]'
                - paragraph [ref=e234]: Straightforward visit with no major issue to report.
                - generic [ref=e235]:
                  - button "Helpful 1" [ref=e236]:
                    - text: Helpful
                    - generic [ref=e237]: "1"
                  - button "Not helpful" [ref=e238]
              - article [ref=e239]:
                - generic [ref=e240]:
                  - generic [ref=e241]: D
                  - generic [ref=e242]:
                    - generic [ref=e243]:
                      - generic [ref=e244]: Driver 10
                      - generic [ref=e245]: about 9 hours ago
                    - 'img "Rating: 3 out of 5 stars" [ref=e247]'
                - paragraph [ref=e258]: Straightforward visit with no major issue to report.
                - generic [ref=e259]:
                  - button "Helpful 3" [ref=e260]:
                    - text: Helpful
                    - generic [ref=e261]: "3"
                  - button "Not helpful" [ref=e262]
              - article [ref=e263]:
                - generic [ref=e264]:
                  - generic [ref=e265]: D
                  - generic [ref=e266]:
                    - generic [ref=e267]:
                      - generic [ref=e268]: Driver 5
                      - generic [ref=e269]: about 4 hours ago
                    - 'img "Rating: 4 out of 5 stars" [ref=e271]'
                - paragraph [ref=e282]: Straightforward visit with no major issue to report.
                - generic [ref=e283]:
                  - button "Helpful 4" [ref=e284]:
                    - text: Helpful
                    - generic [ref=e285]: "4"
                  - button "Not helpful 1" [ref=e286]:
                    - text: Not helpful
                    - generic [ref=e287]: "1"
              - article [ref=e288]:
                - generic [ref=e289]:
                  - generic [ref=e290]: D
                  - generic [ref=e291]:
                    - generic [ref=e292]:
                      - generic [ref=e293]: Driver 11
                      - generic [ref=e294]: about 10 hours ago
                    - 'img "Rating: 4 out of 5 stars" [ref=e296]'
                - paragraph [ref=e307]: Straightforward visit with no major issue to report.
                - generic [ref=e308]:
                  - button "Helpful 6" [ref=e309]:
                    - text: Helpful
                    - generic [ref=e310]: "6"
                  - button "Not helpful 1" [ref=e311]:
                    - text: Not helpful
                    - generic [ref=e312]: "1"
              - article [ref=e313]:
                - generic [ref=e314]:
                  - generic [ref=e315]: D
                  - generic [ref=e316]:
                    - generic [ref=e317]:
                      - generic [ref=e318]: Driver 6
                      - generic [ref=e319]: about 5 hours ago
                    - 'img "Rating: 5 out of 5 stars" [ref=e321]'
                - paragraph [ref=e332]: Straightforward visit with no major issue to report.
                - generic [ref=e333]:
                  - button "Helpful 7" [ref=e334]:
                    - text: Helpful
                    - generic [ref=e335]: "7"
                  - button "Not helpful 2" [ref=e336]:
                    - text: Not helpful
                    - generic [ref=e337]: "2"
              - article [ref=e338]:
                - generic [ref=e339]:
                  - generic [ref=e340]: D
                  - generic [ref=e341]:
                    - generic [ref=e342]:
                      - generic [ref=e343]: Driver 12
                      - generic [ref=e344]: about 11 hours ago
                    - 'img "Rating: 5 out of 5 stars" [ref=e346]'
                - paragraph [ref=e357]: Straightforward visit with no major issue to report.
                - generic [ref=e358]:
                  - button "Helpful 1" [ref=e359]:
                    - text: Helpful
                    - generic [ref=e360]: "1"
                  - button "Not helpful 2" [ref=e361]:
                    - text: Not helpful
                    - generic [ref=e362]: "2"
        - generic [ref=e365]:
          - paragraph [ref=e366]: Share your experience
          - paragraph [ref=e367]: Reading is open to everyone. Sign in only when you want to add a review.
          - button "Sign in with Google" [ref=e369]: Continue with Google
        - region [ref=e376]:
          - generic [ref=e377]:
            - generic [ref=e378]:
              - paragraph [ref=e379]: Need to complain?
              - heading "Go straight to an official channel." [level=2] [ref=e380]
              - paragraph [ref=e381]: FuelVoice only shows destinations we have verified as official brand or consumer-protection sources.
            - generic [ref=e382]: Official link verified
          - generic [ref=e386]:
            - link "Contact station / brand support Shell customer support" [ref=e387] [cursor=pointer]:
              - /url: https://www.shell.com/who-we-are/contact-us.html
              - generic [ref=e388]:
                - generic [ref=e389]: Contact station / brand support
                - generic [ref=e390]: Shell customer support
            - link "Escalate to consumer protection National Consumer Helpline" [ref=e393] [cursor=pointer]:
              - /url: https://consumerhelpline.gov.in/public/
              - generic [ref=e394]:
                - generic [ref=e395]: Escalate to consumer protection
                - generic [ref=e396]: National Consumer Helpline
        - generic [ref=e399]:
          - generic [ref=e400]:
            - paragraph [ref=e401]: Station details
            - heading "Useful details, after the reviews." [level=2] [ref=e402]
          - generic [ref=e403]:
            - generic [ref=e404]:
              - term [ref=e405]: Brand
              - definition [ref=e406]:
                - generic [ref=e407]: Shell
            - generic [ref=e408]:
              - term [ref=e409]: Operator
              - definition [ref=e410]:
                - generic [ref=e411]: Not available
            - generic [ref=e412]:
              - term [ref=e413]: Opening hours
              - definition [ref=e414]:
                - generic [ref=e415]: Not available
            - generic [ref=e416]:
              - term [ref=e417]: Phone
              - definition [ref=e418]:
                - generic [ref=e419]: Not available
            - generic [ref=e420]:
              - term [ref=e421]: Website
              - definition [ref=e422]:
                - generic [ref=e423]: Not available
            - generic [ref=e424]:
              - term [ref=e425]: Fuel types
              - definition [ref=e426]:
                - generic [ref=e427]: Not available
          - generic [ref=e428]:
            - generic [ref=e429]:
              - generic [ref=e430]:
                - paragraph [ref=e431]: Location
                - paragraph [ref=e432]: Interactive map loads only when you reach it.
              - link "Directions ↗" [ref=e433] [cursor=pointer]:
                - /url: https://www.google.com/maps/dir/?api=1&destination=17.3887027,78.4753829
            - generic [ref=e435]:
              - generic [ref=e436]:
                - paragraph [ref=e437]: Map loads when you reach it.
                - paragraph [ref=e438]: Reviews and trust information stay fast even on a slow connection.
              - link "Get directions" [ref=e439] [cursor=pointer]:
                - /url: https://www.google.com/maps/dir/?api=1&destination=17.3887027,78.4753829
        - generic [ref=e440]: Station identity and mapped facts come from OpenStreetMap. Customer experiences and Trust Score are FuelVoice community data.
  - contentinfo [ref=e441]:
    - generic [ref=e442]:
      - generic [ref=e443]:
        - link "FuelVoice" [ref=e444] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e445]: Reviews and verified complaint paths for fuel stations worldwide.
      - generic [ref=e446]:
        - link "Search stations" [ref=e447] [cursor=pointer]:
          - /url: /search
        - link "OpenStreetMap" [ref=e448] [cursor=pointer]:
          - /url: https://www.openstreetmap.org/copyright
  - alert [ref=e449]
```

# Test source

```ts
  1   | import fs from 'node:fs';
  2   | import path from 'node:path';
  3   | import { expect, test } from '@playwright/test';
  4   | import AxeBuilder from '@axe-core/playwright';
  5   | 
  6   | const STATION_ID = 'node_6254336890';
  7   | const OUTPUT = path.join(process.cwd(), 'ux-audit', 'final', 'axe-results');
  8   | 
  9   | async function installNetwork(page, mode = 'default') {
  10  |   await page.route('https://ipwho.is/**', route => route.fulfill({
  11  |     status: 200,
  12  |     contentType: 'application/json',
  13  |     body: JSON.stringify({ success: true, latitude: 17.3887027, longitude: 78.4753829 }),
  14  |   }));
  15  |   await page.route('https://photon.komoot.io/api**', route => route.fulfill({
  16  |     status: 200,
  17  |     contentType: 'application/json',
  18  |     body: JSON.stringify(mode === 'search-empty' ? { features: [] } : {
  19  |       features: [{
  20  |         type: 'Feature',
  21  |         geometry: { type: 'Point', coordinates: [78.4753829, 17.3887027] },
  22  |         properties: {
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
> 94  |   expect(results.violations, JSON.stringify(compact, null, 2)).toEqual([]);
      |                                                                ^ Error: [
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
  123 |       await expect(page.getByText(/No fuel stations found/)).toBeVisible();
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