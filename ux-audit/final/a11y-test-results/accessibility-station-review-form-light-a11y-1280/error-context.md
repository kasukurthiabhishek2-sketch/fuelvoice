# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.mjs >> station-review-form-light
- Location: ux-audit/final/accessibility.spec.mjs:185:3

# Error details

```
Error: [
  {
    "id": "color-contrast",
    "impact": "serious",
    "help": "Elements must meet minimum color contrast ratio thresholds",
    "nodes": [
      [
        "#review-mock-review-3 > div > .leading-5.mt-1.text-xs"
      ]
    ]
  },
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
+ Received  + 176

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ecefea",
+               "contrastRatio": 4.37,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#66716b",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 4.37 (foreground color: #66716b, background color: #ecefea, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"review-card-muted\" id=\"review-mock-review-3\">",
+                 "target": Array [
+                   "#review-mock-review-3",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 4.37 (foreground color: #66716b, background color: #ecefea, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"mt-1 text-xs leading-5 text-[var(--text-tertiary)]\">At least 65% of 5+ reactions marked this review Not helpful.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "#review-mock-review-3 > div > .leading-5.mt-1.text-xs",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
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
        - button "Switch to dark mode" [ref=e17]
        - button "User menu" [ref=e22]:
          - generic [ref=e23]: T
  - main [ref=e24]:
    - generic [ref=e25]:
      - generic [ref=e27]:
        - generic [ref=e28]:
          - link "Search" [ref=e29] [cursor=pointer]:
            - /url: /search
          - button "Share" [ref=e32]
        - generic [ref=e35]:
          - generic [ref=e36]:
            - generic [ref=e37]:
              - generic [ref=e38]: Shell
              - generic [ref=e39]: Mapped station
            - heading "Mock Fuel Station" [level=1] [ref=e40]
            - paragraph [ref=e41]: Abids Road, Hyderabad, Telangana, IN
            - generic [ref=e42]:
              - link "Get directions" [ref=e43] [cursor=pointer]:
                - /url: https://www.google.com/maps/dir/?api=1&destination=17.3887027,78.4753829
              - link "Read reviews" [ref=e44] [cursor=pointer]:
                - /url: "#reviews"
          - generic "Trust Score 82 out of 100" [ref=e45]:
            - paragraph [ref=e46]: Trust Score
            - generic [ref=e47]:
              - generic [ref=e48]: "82"
              - generic [ref=e49]: /100
            - paragraph [ref=e52]: 12 reviews
      - main [ref=e55]:
        - generic [ref=e56]:
          - generic [ref=e57]:
            - generic [ref=e58]:
              - paragraph [ref=e59]: Customer experiences
              - heading "Reviews" [level=2] [ref=e60]
            - generic [ref=e61]: 12 total
          - paragraph [ref=e62]: Risk-heavy experiences appear first by default. Filter by issue when you need something specific.
          - generic [ref=e64]:
            - generic [ref=e65]:
              - group "Review sort order" [ref=e66]:
                - button "Risk first" [pressed] [ref=e67]
                - button "Newest" [ref=e68]
                - button "Most helpful" [ref=e69]
              - group "Filter reviews by issue" [ref=e70]:
                - button "All issues" [pressed] [ref=e71]
                - button "Fuel quality" [ref=e72]
                - button "Quantity / short-filling" [ref=e73]
                - button "Pricing / billing" [ref=e74]
                - button "Staff behavior" [ref=e75]
                - button "Payment issue" [ref=e76]
                - button "Facilities" [ref=e77]
                - button "Safety" [ref=e78]
                - button "Other" [ref=e79]
            - generic [ref=e80]:
              - article [ref=e81]:
                - generic [ref=e82]:
                  - generic [ref=e83]: D
                  - generic [ref=e84]:
                    - generic [ref=e85]:
                      - generic [ref=e86]: Driver 1
                      - generic [ref=e87]: less than a minute ago
                    - 'img "Rating: 1 out of 5 stars" [ref=e89]'
                - generic [ref=e100]: Fuel quality
                - paragraph [ref=e102]: The visit had issues that other drivers may want to know about.
                - generic [ref=e103]:
                  - button "Helpful" [ref=e104]
                  - button "Not helpful" [ref=e105]
              - article [ref=e106]:
                - generic [ref=e107]:
                  - generic [ref=e108]: D
                  - generic [ref=e109]:
                    - generic [ref=e110]:
                      - generic [ref=e111]: Driver 7
                      - generic [ref=e112]: about 6 hours ago
                    - 'img "Rating: 1 out of 5 stars" [ref=e114]'
                - generic [ref=e125]: Fuel quality
                - paragraph [ref=e127]: The visit had issues that other drivers may want to know about.
                - generic [ref=e128]:
                  - button "Helpful 2" [ref=e129]:
                    - text: Helpful
                    - generic [ref=e130]: "2"
                  - button "Not helpful" [ref=e131]
              - article [ref=e132]:
                - generic [ref=e133]:
                  - generic [ref=e134]: D
                  - generic [ref=e135]:
                    - generic [ref=e136]:
                      - generic [ref=e137]: Driver 2
                      - generic [ref=e138]: about 1 hour ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e140]'
                - generic [ref=e151]: Quantity / short-filling
                - paragraph [ref=e153]: The visit had issues that other drivers may want to know about.
                - generic [ref=e154]:
                  - button "Helpful 3" [ref=e155]:
                    - text: Helpful
                    - generic [ref=e156]: "3"
                  - button "Not helpful 1" [ref=e157]:
                    - text: Not helpful
                    - generic [ref=e158]: "1"
              - generic [ref=e159]:
                - generic [ref=e160]:
                  - paragraph [ref=e161]: Review collapsed
                  - paragraph [ref=e162]: At least 65% of 5+ reactions marked this review Not helpful.
                - button "Show review" [ref=e163]
              - article [ref=e164]:
                - generic [ref=e165]:
                  - generic [ref=e166]: D
                  - generic [ref=e167]:
                    - generic [ref=e168]:
                      - generic [ref=e169]: Driver 8
                      - generic [ref=e170]: about 7 hours ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e172]'
                - generic [ref=e183]: Quantity / short-filling
                - paragraph [ref=e185]: The visit had issues that other drivers may want to know about.
                - generic [ref=e186]:
                  - button "Helpful 5" [ref=e187]:
                    - text: Helpful
                    - generic [ref=e188]: "5"
                  - button "Not helpful 1" [ref=e189]:
                    - text: Not helpful
                    - generic [ref=e190]: "1"
              - article [ref=e191]:
                - generic [ref=e192]:
                  - generic [ref=e193]: D
                  - generic [ref=e194]:
                    - generic [ref=e195]:
                      - generic [ref=e196]: Driver 9
                      - generic [ref=e197]: about 8 hours ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e199]'
                - generic [ref=e210]: Fuel quality
                - paragraph [ref=e212]: The visit had issues that other drivers may want to know about.
                - generic [ref=e213]:
                  - button "Helpful" [ref=e214]
                  - button "Not helpful 2" [ref=e215]:
                    - text: Not helpful
                    - generic [ref=e216]: "2"
              - article [ref=e217]:
                - generic [ref=e218]:
                  - generic [ref=e219]: D
                  - generic [ref=e220]:
                    - generic [ref=e221]:
                      - generic [ref=e222]: Driver 4
                      - generic [ref=e223]: about 3 hours ago
                    - 'img "Rating: 3 out of 5 stars" [ref=e225]'
                - paragraph [ref=e236]: Straightforward visit with no major issue to report.
                - generic [ref=e237]:
                  - button "Helpful 1" [ref=e238]:
                    - text: Helpful
                    - generic [ref=e239]: "1"
                  - button "Not helpful" [ref=e240]
              - article [ref=e241]:
                - generic [ref=e242]:
                  - generic [ref=e243]: D
                  - generic [ref=e244]:
                    - generic [ref=e245]:
                      - generic [ref=e246]: Driver 10
                      - generic [ref=e247]: about 9 hours ago
                    - 'img "Rating: 3 out of 5 stars" [ref=e249]'
                - paragraph [ref=e260]: Straightforward visit with no major issue to report.
                - generic [ref=e261]:
                  - button "Helpful 3" [ref=e262]:
                    - text: Helpful
                    - generic [ref=e263]: "3"
                  - button "Not helpful" [ref=e264]
              - article [ref=e265]:
                - generic [ref=e266]:
                  - generic [ref=e267]: D
                  - generic [ref=e268]:
                    - generic [ref=e269]:
                      - generic [ref=e270]: Driver 5
                      - generic [ref=e271]: about 4 hours ago
                    - 'img "Rating: 4 out of 5 stars" [ref=e273]'
                - paragraph [ref=e284]: Straightforward visit with no major issue to report.
                - generic [ref=e285]:
                  - button "Helpful 4" [ref=e286]:
                    - text: Helpful
                    - generic [ref=e287]: "4"
                  - button "Not helpful 1" [ref=e288]:
                    - text: Not helpful
                    - generic [ref=e289]: "1"
              - article [ref=e290]:
                - generic [ref=e291]:
                  - generic [ref=e292]: D
                  - generic [ref=e293]:
                    - generic [ref=e294]:
                      - generic [ref=e295]: Driver 11
                      - generic [ref=e296]: about 10 hours ago
                    - 'img "Rating: 4 out of 5 stars" [ref=e298]'
                - paragraph [ref=e309]: Straightforward visit with no major issue to report.
                - generic [ref=e310]:
                  - button "Helpful 6" [ref=e311]:
                    - text: Helpful
                    - generic [ref=e312]: "6"
                  - button "Not helpful 1" [ref=e313]:
                    - text: Not helpful
                    - generic [ref=e314]: "1"
              - article [ref=e315]:
                - generic [ref=e316]:
                  - generic [ref=e317]: D
                  - generic [ref=e318]:
                    - generic [ref=e319]:
                      - generic [ref=e320]: Driver 6
                      - generic [ref=e321]: about 5 hours ago
                    - 'img "Rating: 5 out of 5 stars" [ref=e323]'
                - paragraph [ref=e334]: Straightforward visit with no major issue to report.
                - generic [ref=e335]:
                  - button "Helpful 7" [ref=e336]:
                    - text: Helpful
                    - generic [ref=e337]: "7"
                  - button "Not helpful 2" [ref=e338]:
                    - text: Not helpful
                    - generic [ref=e339]: "2"
              - article [ref=e340]:
                - generic [ref=e341]:
                  - generic [ref=e342]: D
                  - generic [ref=e343]:
                    - generic [ref=e344]:
                      - generic [ref=e345]: Driver 12
                      - generic [ref=e346]: about 11 hours ago
                    - 'img "Rating: 5 out of 5 stars" [ref=e348]'
                - paragraph [ref=e359]: Straightforward visit with no major issue to report.
                - generic [ref=e360]:
                  - button "Helpful 1" [ref=e361]:
                    - text: Helpful
                    - generic [ref=e362]: "1"
                  - button "Not helpful 2" [ref=e363]:
                    - text: Not helpful
                    - generic [ref=e364]: "2"
        - generic [ref=e368]:
          - generic [ref=e369]:
            - generic [ref=e370]:
              - paragraph [ref=e371]: Review Mock Fuel Station
              - paragraph [ref=e372]: Your rating is used in the station Trust Score.
            - button "Close review form" [ref=e373]
          - generic [ref=e376]:
            - text: Your rating
            - radiogroup "Your rating" [ref=e378]:
              - radio "1 star" [ref=e379] [cursor=pointer]
              - radio "2 stars" [ref=e382] [cursor=pointer]
              - radio "3 stars" [ref=e385] [cursor=pointer]
              - radio "4 stars" [ref=e388] [cursor=pointer]
              - radio "5 stars" [ref=e391] [cursor=pointer]
          - generic [ref=e394]:
            - generic [ref=e395]: Add context (optional)
            - textbox "Add context (optional)" [ref=e396]:
              - /placeholder: What should another customer know?
            - generic [ref=e397]: 0/2000
          - generic [ref=e399]:
            - button "Cancel" [ref=e400]
            - button "Publish review" [ref=e401]
        - region [ref=e403]:
          - generic [ref=e404]:
            - generic [ref=e405]:
              - paragraph [ref=e406]: Need to complain?
              - heading "Go straight to an official channel." [level=2] [ref=e407]
              - paragraph [ref=e408]: FuelVoice only shows destinations we have verified as official brand or consumer-protection sources.
            - generic [ref=e409]: Official link verified
          - generic [ref=e413]:
            - link "Contact station / brand support Shell customer support" [ref=e414] [cursor=pointer]:
              - /url: https://www.shell.com/who-we-are/contact-us.html
              - generic [ref=e415]:
                - generic [ref=e416]: Contact station / brand support
                - generic [ref=e417]: Shell customer support
            - link "Escalate to consumer protection National Consumer Helpline" [ref=e420] [cursor=pointer]:
              - /url: https://consumerhelpline.gov.in/public/
              - generic [ref=e421]:
                - generic [ref=e422]: Escalate to consumer protection
                - generic [ref=e423]: National Consumer Helpline
        - generic [ref=e426]:
          - generic [ref=e427]:
            - paragraph [ref=e428]: Station details
            - heading "Useful details, after the reviews." [level=2] [ref=e429]
          - generic [ref=e430]:
            - generic [ref=e431]:
              - term [ref=e432]: Brand
              - definition [ref=e433]:
                - generic [ref=e434]: Shell
            - generic [ref=e435]:
              - term [ref=e436]: Operator
              - definition [ref=e437]:
                - generic [ref=e438]: Shell Retail
            - generic [ref=e439]:
              - term [ref=e440]: Opening hours
              - definition [ref=e441]:
                - generic [ref=e442]: 24/7
            - generic [ref=e443]:
              - term [ref=e444]: Phone
              - definition [ref=e445]:
                - link "+914012345678" [ref=e446] [cursor=pointer]:
                  - /url: tel:+914012345678
            - generic [ref=e447]:
              - term [ref=e448]: Website
              - definition [ref=e449]:
                - link "shell.in" [ref=e450] [cursor=pointer]:
                  - /url: https://shell.in/
            - generic [ref=e451]:
              - term [ref=e452]: Fuel types
              - definition [ref=e453]:
                - generic [ref=e454]: Not available
          - generic [ref=e455]:
            - generic [ref=e456]:
              - generic [ref=e457]:
                - paragraph [ref=e458]: Location
                - paragraph [ref=e459]: Interactive map loads only when you reach it.
              - link "Directions ↗" [ref=e460] [cursor=pointer]:
                - /url: https://www.google.com/maps/dir/?api=1&destination=17.3887027,78.4753829
            - generic [ref=e462]:
              - generic [ref=e463]:
                - paragraph [ref=e464]: Map loads when you reach it.
                - paragraph [ref=e465]: Reviews and trust information stay fast even on a slow connection.
              - link "Get directions" [ref=e466] [cursor=pointer]:
                - /url: https://www.google.com/maps/dir/?api=1&destination=17.3887027,78.4753829
        - generic [ref=e467]: Station identity and mapped facts come from OpenStreetMap. Customer experiences and Trust Score are FuelVoice community data.
  - contentinfo [ref=e468]:
    - generic [ref=e469]:
      - generic [ref=e470]:
        - link "FuelVoice" [ref=e471] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e472]: Reviews and verified complaint paths for fuel stations worldwide.
      - generic [ref=e473]:
        - link "Search stations" [ref=e474] [cursor=pointer]:
          - /url: /search
        - link "OpenStreetMap" [ref=e475] [cursor=pointer]:
          - /url: https://www.openstreetmap.org/copyright
  - alert [ref=e476]
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