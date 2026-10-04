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
        - button "Switch to light mode" [ref=e16]
        - button "Sign in with Google" [ref=e20]: Sign In
  - main [ref=e26]:
    - generic [ref=e27]:
      - generic [ref=e29]:
        - generic [ref=e30]:
          - link "Search" [ref=e31] [cursor=pointer]:
            - /url: /search
          - button "Share" [ref=e34]
        - generic [ref=e37]:
          - generic [ref=e38]:
            - generic [ref=e39]:
              - generic [ref=e40]: Shell
              - generic [ref=e41]: Mapped station
            - heading "Shell Fuel Station" [level=1] [ref=e42]
            - paragraph [ref=e43]: Hyderabad, IN
            - generic [ref=e44]:
              - link "Get directions" [ref=e45] [cursor=pointer]:
                - /url: https://www.google.com/maps/dir/?api=1&destination=17.3887027,78.4753829
              - link "Read reviews" [ref=e46] [cursor=pointer]:
                - /url: "#reviews"
          - generic "Trust Score unavailable" [ref=e47]:
            - paragraph [ref=e48]: Trust Score
            - paragraph [ref=e49]: Insufficient data
            - paragraph [ref=e50]: 0 of 5 reviews needed
      - main [ref=e53]:
        - generic [ref=e54]:
          - generic [ref=e56]:
            - paragraph [ref=e57]: Customer experiences
            - heading "Reviews" [level=2] [ref=e58]
          - paragraph [ref=e59]: Risk-heavy experiences appear first by default. Filter by issue when you need something specific.
          - generic [ref=e61]:
            - generic [ref=e62]:
              - group "Review sort order" [ref=e63]:
                - button "Risk first" [pressed] [ref=e64]
                - button "Newest" [ref=e65]
                - button "Most helpful" [ref=e66]
              - group "Filter reviews by issue" [ref=e67]:
                - button "All issues" [pressed] [ref=e68]
                - button "Fuel quality" [ref=e69]
                - button "Quantity / short-filling" [ref=e70]
                - button "Pricing / billing" [ref=e71]
                - button "Staff behavior" [ref=e72]
                - button "Payment issue" [ref=e73]
                - button "Facilities" [ref=e74]
                - button "Safety" [ref=e75]
                - button "Other" [ref=e76]
            - generic [ref=e77]:
              - article [ref=e78]:
                - generic [ref=e79]:
                  - generic [ref=e80]: D
                  - generic [ref=e81]:
                    - generic [ref=e82]:
                      - generic [ref=e83]: Driver 1
                      - generic [ref=e84]: less than a minute ago
                    - 'img "Rating: 1 out of 5 stars" [ref=e86]'
                - generic [ref=e97]: Fuel quality
                - paragraph [ref=e99]: The visit had issues that other drivers may want to know about.
                - generic [ref=e100]:
                  - button "Helpful" [ref=e101]
                  - button "Not helpful" [ref=e102]
              - article [ref=e103]:
                - generic [ref=e104]:
                  - generic [ref=e105]: D
                  - generic [ref=e106]:
                    - generic [ref=e107]:
                      - generic [ref=e108]: Driver 7
                      - generic [ref=e109]: about 6 hours ago
                    - 'img "Rating: 1 out of 5 stars" [ref=e111]'
                - generic [ref=e122]: Fuel quality
                - paragraph [ref=e124]: The visit had issues that other drivers may want to know about.
                - generic [ref=e125]:
                  - button "Helpful 2" [ref=e126]:
                    - text: Helpful
                    - generic [ref=e127]: "2"
                  - button "Not helpful" [ref=e128]
              - article [ref=e129]:
                - generic [ref=e130]:
                  - generic [ref=e131]: D
                  - generic [ref=e132]:
                    - generic [ref=e133]:
                      - generic [ref=e134]: Driver 2
                      - generic [ref=e135]: about 1 hour ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e137]'
                - generic [ref=e148]: Quantity / short-filling
                - paragraph [ref=e150]: The visit had issues that other drivers may want to know about.
                - generic [ref=e151]:
                  - button "Helpful 3" [ref=e152]:
                    - text: Helpful
                    - generic [ref=e153]: "3"
                  - button "Not helpful 1" [ref=e154]:
                    - text: Not helpful
                    - generic [ref=e155]: "1"
              - generic [ref=e156]:
                - generic [ref=e157]:
                  - paragraph [ref=e158]: Review collapsed
                  - paragraph [ref=e159]: At least 65% of 5+ reactions marked this review Not helpful.
                - button "Show review" [ref=e160]
              - article [ref=e161]:
                - generic [ref=e162]:
                  - generic [ref=e163]: D
                  - generic [ref=e164]:
                    - generic [ref=e165]:
                      - generic [ref=e166]: Driver 8
                      - generic [ref=e167]: about 7 hours ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e169]'
                - generic [ref=e180]: Quantity / short-filling
                - paragraph [ref=e182]: The visit had issues that other drivers may want to know about.
                - generic [ref=e183]:
                  - button "Helpful 5" [ref=e184]:
                    - text: Helpful
                    - generic [ref=e185]: "5"
                  - button "Not helpful 1" [ref=e186]:
                    - text: Not helpful
                    - generic [ref=e187]: "1"
              - article [ref=e188]:
                - generic [ref=e189]:
                  - generic [ref=e190]: D
                  - generic [ref=e191]:
                    - generic [ref=e192]:
                      - generic [ref=e193]: Driver 9
                      - generic [ref=e194]: about 8 hours ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e196]'
                - generic [ref=e207]: Fuel quality
                - paragraph [ref=e209]: The visit had issues that other drivers may want to know about.
                - generic [ref=e210]:
                  - button "Helpful" [ref=e211]
                  - button "Not helpful 2" [ref=e212]:
                    - text: Not helpful
                    - generic [ref=e213]: "2"
              - article [ref=e214]:
                - generic [ref=e215]:
                  - generic [ref=e216]: D
                  - generic [ref=e217]:
                    - generic [ref=e218]:
                      - generic [ref=e219]: Driver 4
                      - generic [ref=e220]: about 3 hours ago
                    - 'img "Rating: 3 out of 5 stars" [ref=e222]'
                - paragraph [ref=e233]: Straightforward visit with no major issue to report.
                - generic [ref=e234]:
                  - button "Helpful 1" [ref=e235]:
                    - text: Helpful
                    - generic [ref=e236]: "1"
                  - button "Not helpful" [ref=e237]
              - article [ref=e238]:
                - generic [ref=e239]:
                  - generic [ref=e240]: D
                  - generic [ref=e241]:
                    - generic [ref=e242]:
                      - generic [ref=e243]: Driver 10
                      - generic [ref=e244]: about 9 hours ago
                    - 'img "Rating: 3 out of 5 stars" [ref=e246]'
                - paragraph [ref=e257]: Straightforward visit with no major issue to report.
                - generic [ref=e258]:
                  - button "Helpful 3" [ref=e259]:
                    - text: Helpful
                    - generic [ref=e260]: "3"
                  - button "Not helpful" [ref=e261]
              - article [ref=e262]:
                - generic [ref=e263]:
                  - generic [ref=e264]: D
                  - generic [ref=e265]:
                    - generic [ref=e266]:
                      - generic [ref=e267]: Driver 5
                      - generic [ref=e268]: about 4 hours ago
                    - 'img "Rating: 4 out of 5 stars" [ref=e270]'
                - paragraph [ref=e281]: Straightforward visit with no major issue to report.
                - generic [ref=e282]:
                  - button "Helpful 4" [ref=e283]:
                    - text: Helpful
                    - generic [ref=e284]: "4"
                  - button "Not helpful 1" [ref=e285]:
                    - text: Not helpful
                    - generic [ref=e286]: "1"
              - article [ref=e287]:
                - generic [ref=e288]:
                  - generic [ref=e289]: D
                  - generic [ref=e290]:
                    - generic [ref=e291]:
                      - generic [ref=e292]: Driver 11
                      - generic [ref=e293]: about 10 hours ago
                    - 'img "Rating: 4 out of 5 stars" [ref=e295]'
                - paragraph [ref=e306]: Straightforward visit with no major issue to report.
                - generic [ref=e307]:
                  - button "Helpful 6" [ref=e308]:
                    - text: Helpful
                    - generic [ref=e309]: "6"
                  - button "Not helpful 1" [ref=e310]:
                    - text: Not helpful
                    - generic [ref=e311]: "1"
              - article [ref=e312]:
                - generic [ref=e313]:
                  - generic [ref=e314]: D
                  - generic [ref=e315]:
                    - generic [ref=e316]:
                      - generic [ref=e317]: Driver 6
                      - generic [ref=e318]: about 5 hours ago
                    - 'img "Rating: 5 out of 5 stars" [ref=e320]'
                - paragraph [ref=e331]: Straightforward visit with no major issue to report.
                - generic [ref=e332]:
                  - button "Helpful 7" [ref=e333]:
                    - text: Helpful
                    - generic [ref=e334]: "7"
                  - button "Not helpful 2" [ref=e335]:
                    - text: Not helpful
                    - generic [ref=e336]: "2"
              - article [ref=e337]:
                - generic [ref=e338]:
                  - generic [ref=e339]: D
                  - generic [ref=e340]:
                    - generic [ref=e341]:
                      - generic [ref=e342]: Driver 12
                      - generic [ref=e343]: about 11 hours ago
                    - 'img "Rating: 5 out of 5 stars" [ref=e345]'
                - paragraph [ref=e356]: Straightforward visit with no major issue to report.
                - generic [ref=e357]:
                  - button "Helpful 1" [ref=e358]:
                    - text: Helpful
                    - generic [ref=e359]: "1"
                  - button "Not helpful 2" [ref=e360]:
                    - text: Not helpful
                    - generic [ref=e361]: "2"
        - generic [ref=e364]:
          - paragraph [ref=e365]: Share your experience
          - paragraph [ref=e366]: Reading is open to everyone. Sign in only when you want to add a review.
          - button "Sign in with Google" [ref=e368]: Continue with Google
        - generic [ref=e374]:
          - region [ref=e375]:
            - generic [ref=e376]:
              - generic [ref=e377]:
                - paragraph [ref=e378]: Need to complain?
                - heading "Go straight to an official channel." [level=2] [ref=e379]
                - paragraph [ref=e380]: FuelVoice only shows destinations we have verified as official brand or consumer-protection sources.
              - generic [ref=e381]: Official link verified
            - generic [ref=e385]:
              - link "Contact station / brand support Shell customer support" [ref=e386] [cursor=pointer]:
                - /url: https://www.shell.com/who-we-are/contact-us.html
                - generic [ref=e387]:
                  - generic [ref=e388]: Contact station / brand support
                  - generic [ref=e389]: Shell customer support
              - link "Escalate to consumer protection National Consumer Helpline" [ref=e392] [cursor=pointer]:
                - /url: https://consumerhelpline.gov.in/public/
                - generic [ref=e393]:
                  - generic [ref=e394]: Escalate to consumer protection
                  - generic [ref=e395]: National Consumer Helpline
          - generic [ref=e398]:
            - link "Write a review" [ref=e399] [cursor=pointer]:
              - /url: "#write-review"
            - link "File a complaint" [ref=e400] [cursor=pointer]:
              - /url: https://www.shell.com/who-we-are/contact-us.html
        - generic [ref=e401]:
          - generic [ref=e402]:
            - paragraph [ref=e403]: Station details
            - heading "Useful details, after the reviews." [level=2] [ref=e404]
          - generic [ref=e405]:
            - generic [ref=e406]:
              - term [ref=e407]: Brand
              - definition [ref=e408]:
                - generic [ref=e409]: Shell
            - generic [ref=e410]:
              - term [ref=e411]: Operator
              - definition [ref=e412]:
                - generic [ref=e413]: Not available
            - generic [ref=e414]:
              - term [ref=e415]: Opening hours
              - definition [ref=e416]:
                - generic [ref=e417]: Not available
            - generic [ref=e418]:
              - term [ref=e419]: Phone
              - definition [ref=e420]:
                - generic [ref=e421]: Not available
            - generic [ref=e422]:
              - term [ref=e423]: Website
              - definition [ref=e424]:
                - generic [ref=e425]: Not available
            - generic [ref=e426]:
              - term [ref=e427]: Fuel types
              - definition [ref=e428]:
                - generic [ref=e429]: Not available
          - generic [ref=e430]:
            - generic [ref=e431]:
              - generic [ref=e432]:
                - paragraph [ref=e433]: Location
                - paragraph [ref=e434]: Interactive map loads only when you reach it.
              - link "Directions ↗" [ref=e435] [cursor=pointer]:
                - /url: https://www.google.com/maps/dir/?api=1&destination=17.3887027,78.4753829
            - generic [ref=e437]:
              - generic [ref=e438]:
                - paragraph [ref=e439]: Map loads when you reach it.
                - paragraph [ref=e440]: Reviews and trust information stay fast even on a slow connection.
              - link "Get directions" [ref=e441] [cursor=pointer]:
                - /url: https://www.google.com/maps/dir/?api=1&destination=17.3887027,78.4753829
        - generic [ref=e442]: Station identity and mapped facts come from OpenStreetMap. Customer experiences and Trust Score are FuelVoice community data.
  - contentinfo [ref=e443]:
    - generic [ref=e444]:
      - generic [ref=e445]:
        - link "FuelVoice" [ref=e446] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e447]: Reviews and verified complaint paths for fuel stations worldwide.
      - generic [ref=e448]:
        - link "Search stations" [ref=e449] [cursor=pointer]:
          - /url: /search
        - link "OpenStreetMap" [ref=e450] [cursor=pointer]:
          - /url: https://www.openstreetmap.org/copyright
  - alert [ref=e451]
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