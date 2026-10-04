# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fuelvoice.spec.ts >> Station trust page >> labels owner review fields and announces edit validation errors
- Location: e2e/fuelvoice.spec.ts:502:7

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('#review-node_6254336890__test-user-123').getByRole('button', { name: 'Save changes', exact: true })
    - locator resolved to <button type="button" class="primary-action disabled:opacity-50">Save changes</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <a target="_blank" rel="noopener noreferrer" class="station-mobile-primary" href="https://www.shell.com/who-we-are/contact-us.html">File a complaint</a> from <section class="mt-10">…</section> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <a target="_blank" rel="noopener noreferrer" class="station-mobile-primary" href="https://www.shell.com/who-we-are/contact-us.html">File a complaint</a> from <section class="mt-10">…</section> subtree intercepts pointer events
  - retrying click action
    - waiting 100ms
    22 × waiting for element to be visible, enabled and stable
       - element is not stable
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <a href="/search" class="header-action " aria-label="Search fuel stations">…</a> from <header class="product-header">…</header> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is not stable
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <a target="_blank" rel="noopener noreferrer" class="station-mobile-primary" href="https://www.shell.com/who-we-are/contact-us.html">File a complaint</a> from <section class="mt-10">…</section> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "FuelVoice home" [ref=e4] [cursor=pointer]:
        - /url: /
        - img [ref=e6]
        - generic [ref=e10]: FuelVoice
      - generic [ref=e11]:
        - link "Search fuel stations" [ref=e12] [cursor=pointer]:
          - /url: /search
          - img [ref=e13]
          - generic [ref=e16]: Search
        - button "Switch to light mode" [ref=e17]:
          - img [ref=e19]
        - button "User menu" [ref=e22]:
          - generic [ref=e23]: T
  - main [ref=e24]:
    - generic [ref=e25]:
      - generic [ref=e27]:
        - generic [ref=e28]:
          - link "Search" [ref=e29] [cursor=pointer]:
            - /url: /search
            - img [ref=e30]
            - text: Search
          - button "Share" [ref=e32]:
            - text: Share
            - img [ref=e33]
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
                    - 'img "Rating: 1 out of 5 stars" [ref=e89]':
                      - img [ref=e90]
                      - img [ref=e92]
                      - img [ref=e94]
                      - img [ref=e96]
                      - img [ref=e98]
                - generic [ref=e101]: Fuel quality
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
                    - 'img "Rating: 1 out of 5 stars" [ref=e114]':
                      - img [ref=e115]
                      - img [ref=e117]
                      - img [ref=e119]
                      - img [ref=e121]
                      - img [ref=e123]
                - generic [ref=e126]: Fuel quality
                - paragraph [ref=e127]: The visit had issues that other drivers may want to know about.
                - generic [ref=e128]:
                  - button "Helpful 2" [ref=e129]:
                    - text: Helpful
                    - generic [ref=e130]: "2"
                  - button "Not helpful" [ref=e131]
              - article [ref=e132]:
                - generic [ref=e133]:
                  - generic [ref=e134]: T
                  - generic [ref=e135]:
                    - generic [ref=e136]:
                      - generic [ref=e137]: Test User
                      - generic [ref=e138]: less than a minute ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e140]':
                      - img [ref=e141]
                      - img [ref=e143]
                      - img [ref=e145]
                      - img [ref=e147]
                      - img [ref=e149]
                  - generic [ref=e151]:
                    - button "Edit your review" [ref=e152]:
                      - img [ref=e153]
                    - button "Delete your review" [ref=e156]:
                      - img [ref=e157]
                - generic [ref=e160]: Fuel quality
                - paragraph [ref=e161]: Owner review context
                - generic [ref=e162]:
                  - paragraph [ref=e163]: Edit review
                  - radiogroup "Edit rating" [ref=e165]:
                    - radio "1 star" [ref=e166] [cursor=pointer]:
                      - img [ref=e167]
                    - radio "2 stars" [checked] [ref=e169] [cursor=pointer]:
                      - img [ref=e170]
                    - radio "3 stars" [ref=e172] [cursor=pointer]:
                      - img [ref=e173]
                    - radio "4 stars" [ref=e175] [cursor=pointer]:
                      - img [ref=e176]
                    - radio "5 stars" [ref=e178] [cursor=pointer]:
                      - img [ref=e179]
                  - generic [ref=e181]:
                    - button "Fuel quality" [active] [ref=e182]
                    - button "Quantity / short-filling" [ref=e183]
                    - button "Pricing / billing" [ref=e184]
                    - button "Staff behavior" [ref=e185]
                    - button "Payment issue" [ref=e186]
                    - button "Facilities" [ref=e187]
                    - button "Safety" [ref=e188]
                    - button "Other" [ref=e189]
                  - generic [ref=e190]: Review context (optional)
                  - textbox "Review context (optional)" [ref=e191]:
                    - /placeholder: Add context (optional)
                    - text: Owner review context
                  - generic [ref=e192]:
                    - button "Cancel" [ref=e193]
                    - button "Save changes" [ref=e194]
                - generic [ref=e195]:
                  - button "Helpful" [ref=e196]
                  - button "Not helpful" [ref=e197]
              - article [ref=e198]:
                - generic [ref=e199]:
                  - generic [ref=e200]: D
                  - generic [ref=e201]:
                    - generic [ref=e202]:
                      - generic [ref=e203]: Driver 2
                      - generic [ref=e204]: about 1 hour ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e206]':
                      - img [ref=e207]
                      - img [ref=e209]
                      - img [ref=e211]
                      - img [ref=e213]
                      - img [ref=e215]
                - generic [ref=e218]: Quantity / short-filling
                - paragraph [ref=e219]: The visit had issues that other drivers may want to know about.
                - generic [ref=e220]:
                  - button "Helpful 3" [ref=e221]:
                    - text: Helpful
                    - generic [ref=e222]: "3"
                  - button "Not helpful 1" [ref=e223]:
                    - text: Not helpful
                    - generic [ref=e224]: "1"
              - generic [ref=e225]:
                - generic [ref=e226]:
                  - paragraph [ref=e227]: Review collapsed
                  - paragraph [ref=e228]: At least 65% of 5+ reactions marked this review Not helpful.
                - button "Show review" [ref=e229]
              - article [ref=e230]:
                - generic [ref=e231]:
                  - generic [ref=e232]: D
                  - generic [ref=e233]:
                    - generic [ref=e234]:
                      - generic [ref=e235]: Driver 8
                      - generic [ref=e236]: about 7 hours ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e238]':
                      - img [ref=e239]
                      - img [ref=e241]
                      - img [ref=e243]
                      - img [ref=e245]
                      - img [ref=e247]
                - generic [ref=e250]: Quantity / short-filling
                - paragraph [ref=e251]: The visit had issues that other drivers may want to know about.
                - generic [ref=e252]:
                  - button "Helpful 5" [ref=e253]:
                    - text: Helpful
                    - generic [ref=e254]: "5"
                  - button "Not helpful 1" [ref=e255]:
                    - text: Not helpful
                    - generic [ref=e256]: "1"
              - article [ref=e257]:
                - generic [ref=e258]:
                  - generic [ref=e259]: D
                  - generic [ref=e260]:
                    - generic [ref=e261]:
                      - generic [ref=e262]: Driver 9
                      - generic [ref=e263]: about 8 hours ago
                    - 'img "Rating: 2 out of 5 stars" [ref=e265]':
                      - img [ref=e266]
                      - img [ref=e268]
                      - img [ref=e270]
                      - img [ref=e272]
                      - img [ref=e274]
                - generic [ref=e277]: Fuel quality
                - paragraph [ref=e278]: The visit had issues that other drivers may want to know about.
                - generic [ref=e279]:
                  - button "Helpful" [ref=e280]
                  - button "Not helpful 2" [ref=e281]:
                    - text: Not helpful
                    - generic [ref=e282]: "2"
              - article [ref=e283]:
                - generic [ref=e284]:
                  - generic [ref=e285]: D
                  - generic [ref=e286]:
                    - generic [ref=e287]:
                      - generic [ref=e288]: Driver 4
                      - generic [ref=e289]: about 3 hours ago
                    - 'img "Rating: 3 out of 5 stars" [ref=e291]':
                      - img [ref=e292]
                      - img [ref=e294]
                      - img [ref=e296]
                      - img [ref=e298]
                      - img [ref=e300]
                - paragraph [ref=e302]: Straightforward visit with no major issue to report.
                - generic [ref=e303]:
                  - button "Helpful 1" [ref=e304]:
                    - text: Helpful
                    - generic [ref=e305]: "1"
                  - button "Not helpful" [ref=e306]
              - article [ref=e307]:
                - generic [ref=e308]:
                  - generic [ref=e309]: D
                  - generic [ref=e310]:
                    - generic [ref=e311]:
                      - generic [ref=e312]: Driver 10
                      - generic [ref=e313]: about 9 hours ago
                    - 'img "Rating: 3 out of 5 stars" [ref=e315]':
                      - img [ref=e316]
                      - img [ref=e318]
                      - img [ref=e320]
                      - img [ref=e322]
                      - img [ref=e324]
                - paragraph [ref=e326]: Straightforward visit with no major issue to report.
                - generic [ref=e327]:
                  - button "Helpful 3" [ref=e328]:
                    - text: Helpful
                    - generic [ref=e329]: "3"
                  - button "Not helpful" [ref=e330]
              - article [ref=e331]:
                - generic [ref=e332]:
                  - generic [ref=e333]: D
                  - generic [ref=e334]:
                    - generic [ref=e335]:
                      - generic [ref=e336]: Driver 5
                      - generic [ref=e337]: about 4 hours ago
                    - 'img "Rating: 4 out of 5 stars" [ref=e339]':
                      - img [ref=e340]
                      - img [ref=e342]
                      - img [ref=e344]
                      - img [ref=e346]
                      - img [ref=e348]
                - paragraph [ref=e350]: Straightforward visit with no major issue to report.
                - generic [ref=e351]:
                  - button "Helpful 4" [ref=e352]:
                    - text: Helpful
                    - generic [ref=e353]: "4"
                  - button "Not helpful 1" [ref=e354]:
                    - text: Not helpful
                    - generic [ref=e355]: "1"
              - article [ref=e356]:
                - generic [ref=e357]:
                  - generic [ref=e358]: D
                  - generic [ref=e359]:
                    - generic [ref=e360]:
                      - generic [ref=e361]: Driver 11
                      - generic [ref=e362]: about 10 hours ago
                    - 'img "Rating: 4 out of 5 stars" [ref=e364]':
                      - img [ref=e365]
                      - img [ref=e367]
                      - img [ref=e369]
                      - img [ref=e371]
                      - img [ref=e373]
                - paragraph [ref=e375]: Straightforward visit with no major issue to report.
                - generic [ref=e376]:
                  - button "Helpful 6" [ref=e377]:
                    - text: Helpful
                    - generic [ref=e378]: "6"
                  - button "Not helpful 1" [ref=e379]:
                    - text: Not helpful
                    - generic [ref=e380]: "1"
              - article [ref=e381]:
                - generic [ref=e382]:
                  - generic [ref=e383]: D
                  - generic [ref=e384]:
                    - generic [ref=e385]:
                      - generic [ref=e386]: Driver 6
                      - generic [ref=e387]: about 5 hours ago
                    - 'img "Rating: 5 out of 5 stars" [ref=e389]':
                      - img [ref=e390]
                      - img [ref=e392]
                      - img [ref=e394]
                      - img [ref=e396]
                      - img [ref=e398]
                - paragraph [ref=e400]: Straightforward visit with no major issue to report.
                - generic [ref=e401]:
                  - button "Helpful 7" [ref=e402]:
                    - text: Helpful
                    - generic [ref=e403]: "7"
                  - button "Not helpful 2" [ref=e404]:
                    - text: Not helpful
                    - generic [ref=e405]: "2"
              - article [ref=e406]:
                - generic [ref=e407]:
                  - generic [ref=e408]: D
                  - generic [ref=e409]:
                    - generic [ref=e410]:
                      - generic [ref=e411]: Driver 12
                      - generic [ref=e412]: about 11 hours ago
                    - 'img "Rating: 5 out of 5 stars" [ref=e414]':
                      - img [ref=e415]
                      - img [ref=e417]
                      - img [ref=e419]
                      - img [ref=e421]
                      - img [ref=e423]
                - paragraph [ref=e425]: Straightforward visit with no major issue to report.
                - generic [ref=e426]:
                  - button "Helpful 1" [ref=e427]:
                    - text: Helpful
                    - generic [ref=e428]: "1"
                  - button "Not helpful 2" [ref=e429]:
                    - text: Not helpful
                    - generic [ref=e430]: "2"
        - button "Write a review Rate this station and add context if it helps. 2 review slots remaining." [ref=e434]:
          - generic [ref=e435]:
            - paragraph [ref=e436]: Write a review
            - paragraph [ref=e437]: Rate this station and add context if it helps. 2 review slots remaining.
          - img [ref=e439]
        - generic [ref=e441]:
          - region "Go straight to an official channel." [ref=e442]:
            - generic [ref=e443]:
              - generic [ref=e444]:
                - paragraph [ref=e445]: Need to complain?
                - heading "Go straight to an official channel." [level=2] [ref=e446]
                - paragraph [ref=e447]: FuelVoice only shows destinations we have verified as official brand or consumer-protection sources.
              - generic [ref=e448]:
                - img [ref=e449]
                - text: Official link verified
            - generic [ref=e452]:
              - link "Contact station / brand support Shell customer support" [ref=e453] [cursor=pointer]:
                - /url: https://www.shell.com/who-we-are/contact-us.html
                - generic [ref=e454]:
                  - generic [ref=e455]: Contact station / brand support
                  - generic [ref=e456]: Shell customer support
                - img [ref=e457]
              - link "Escalate to consumer protection National Consumer Helpline" [ref=e459] [cursor=pointer]:
                - /url: https://consumerhelpline.gov.in/public/
                - generic [ref=e460]:
                  - generic [ref=e461]: Escalate to consumer protection
                  - generic [ref=e462]: National Consumer Helpline
                - img [ref=e463]
          - generic [ref=e465]:
            - link "Write a review" [ref=e466] [cursor=pointer]:
              - /url: "#write-review"
            - link "File a complaint" [ref=e467] [cursor=pointer]:
              - /url: https://www.shell.com/who-we-are/contact-us.html
        - generic [ref=e468]:
          - generic [ref=e469]:
            - paragraph [ref=e470]: Station details
            - heading "Useful details, after the reviews." [level=2] [ref=e471]
          - generic [ref=e472]:
            - generic [ref=e473]:
              - term [ref=e474]: Brand
              - definition [ref=e475]:
                - generic [ref=e476]: Shell
            - generic [ref=e477]:
              - term [ref=e478]: Operator
              - definition [ref=e479]:
                - generic [ref=e480]: Shell Retail
            - generic [ref=e481]:
              - term [ref=e482]: Opening hours
              - definition [ref=e483]:
                - generic [ref=e484]: 24/7
            - generic [ref=e485]:
              - term [ref=e486]: Phone
              - definition [ref=e487]:
                - link "+914012345678" [ref=e488] [cursor=pointer]:
                  - /url: tel:+914012345678
            - generic [ref=e489]:
              - term [ref=e490]: Website
              - definition [ref=e491]:
                - link "shell.in" [ref=e492] [cursor=pointer]:
                  - /url: https://shell.in/
            - generic [ref=e493]:
              - term [ref=e494]: Fuel types
              - definition [ref=e495]:
                - generic [ref=e496]: Not available
          - generic [ref=e497]:
            - generic [ref=e498]:
              - generic [ref=e499]:
                - paragraph [ref=e500]: Location
                - paragraph [ref=e501]: Interactive map loads only when you reach it.
              - link "Directions ↗" [ref=e502] [cursor=pointer]:
                - /url: https://www.google.com/maps/dir/?api=1&destination=17.3887027,78.4753829
            - generic [ref=e504]:
              - generic [ref=e505]:
                - paragraph [ref=e506]: Map loads when you reach it.
                - paragraph [ref=e507]: Reviews and trust information stay fast even on a slow connection.
              - link "Get directions" [ref=e508] [cursor=pointer]:
                - /url: https://www.google.com/maps/dir/?api=1&destination=17.3887027,78.4753829
        - generic [ref=e509]: Station identity and mapped facts come from OpenStreetMap. Customer experiences and Trust Score are FuelVoice community data.
  - contentinfo [ref=e510]:
    - generic [ref=e511]:
      - generic [ref=e512]:
        - link "FuelVoice" [ref=e513] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e514]: Reviews and verified complaint paths for fuel stations worldwide.
      - generic [ref=e515]:
        - link "Search stations" [ref=e516] [cursor=pointer]:
          - /url: /search
        - link "OpenStreetMap" [ref=e517] [cursor=pointer]:
          - /url: https://www.openstreetmap.org/copyright
  - alert [ref=e518]
```

# Test source

```ts
  430 |     const brandSupport = page.getByRole('link', { name: /Contact station \/ brand support/i });
  431 |     await expect(brandSupport).toHaveAttribute('href', /shell\.com/);
  432 | 
  433 |     const consumerRoute = page.getByRole('link', { name: /Escalate to consumer protection/i });
  434 |     await expect(consumerRoute).toHaveAttribute('href', /consumerhelpline\.gov\.in/);
  435 | 
  436 |     await expect(page.getByRole('button', { name: /submit complaint/i })).toHaveCount(0);
  437 |   });
  438 | 
  439 |   test('loads the interactive map only after the user reaches the map area', async ({ page }) => {
  440 |     await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });
  441 | 
  442 |     await expect(page.locator('.leaflet-container')).toHaveCount(0);
  443 |     await page.getByText('Location', { exact: true }).scrollIntoViewIfNeeded();
  444 | 
  445 |     await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
  446 |   });
  447 | 
  448 |   test('keeps station and review actions comfortably tappable', async ({ page }) => {
  449 |     await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });
  450 | 
  451 |     for (const control of [
  452 |       page.getByRole('link', { name: 'Search', exact: true }),
  453 |       page.getByRole('button', { name: 'Share', exact: true }),
  454 |       page.getByRole('button', { name: 'Helpful' }).first(),
  455 |       page.getByRole('button', { name: 'Not helpful' }).first(),
  456 |     ]) {
  457 |       const box = await control.boundingBox();
  458 |       expect(box).not.toBeNull();
  459 |       expect(box!.height).toBeGreaterThanOrEqual(44);
  460 |     }
  461 |   });
  462 | 
  463 |   test('negative reviews require an explicit complaint category while text stays optional', async ({ page }) => {
  464 |     await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });
  465 | 
  466 |     const composer = page.locator('#write-review');
  467 |     const openComposer = composer.getByRole('button', { name: /^Write a review/ });
  468 |     await expect(openComposer).toHaveAttribute('aria-expanded', 'false');
  469 |     await openComposer.click();
  470 |     await expect(composer.locator('#review-form-panel')).toBeVisible();
  471 | 
  472 |     const rating = composer.getByRole('radiogroup', { name: 'Your rating' });
  473 |     const oneStar = rating.getByRole('radio', { name: '1 star', exact: true });
  474 |     const starBox = await oneStar.boundingBox();
  475 |     expect(starBox).not.toBeNull();
  476 |     expect(starBox!.width).toBeGreaterThanOrEqual(44);
  477 |     expect(starBox!.height).toBeGreaterThanOrEqual(44);
  478 | 
  479 |     await oneStar.click();
  480 |     await expect(oneStar).toHaveAttribute('aria-checked', 'true');
  481 | 
  482 |     await oneStar.press('ArrowRight');
  483 |     const twoStars = rating.getByRole('radio', { name: '2 stars', exact: true });
  484 |     await expect(twoStars).toHaveAttribute('aria-checked', 'true');
  485 |     await expect(twoStars).toBeFocused();
  486 | 
  487 |     await twoStars.press('ArrowLeft');
  488 |     await expect(oneStar).toHaveAttribute('aria-checked', 'true');
  489 |     await expect(oneStar).toBeFocused();
  490 |     await composer.getByRole('button', { name: 'Publish review', exact: true }).click();
  491 | 
  492 |     await expect(composer.getByText('Choose at least one complaint category.')).toBeVisible();
  493 | 
  494 |     const fuelQuality = composer.getByRole('button', { name: 'Fuel quality', exact: true });
  495 |     await fuelQuality.click();
  496 |     await expect(fuelQuality).toHaveAttribute('aria-pressed', 'true');
  497 |     await composer.getByRole('button', { name: 'Publish review', exact: true }).click();
  498 | 
  499 |     await expect(page.getByText('Review published')).toBeVisible();
  500 |   });
  501 | 
  502 |   test('labels owner review fields and announces edit validation errors', async ({ page }) => {
  503 |     await page.addInitScript(({ stationId }) => {
  504 |       localStorage.setItem(
  505 |         `fuelvoice:mock_user_reviews:${stationId}`,
  506 |         JSON.stringify([
  507 |           {
  508 |             id: `${stationId}__test-user-123`,
  509 |             stationId,
  510 |             userId: 'test-user-123',
  511 |             userName: 'Test User',
  512 |             rating: 2,
  513 |             content: 'Owner review context',
  514 |             complaintCategories: ['fuel-quality'],
  515 |             helpfulCount: 0,
  516 |             notHelpfulCount: 0,
  517 |           },
  518 |         ]),
  519 |       );
  520 |     }, { stationId: STATION_ID });
  521 | 
  522 |     await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });
  523 | 
  524 |     const ownerReview = page.locator(`#review-${STATION_ID}__test-user-123`);
  525 |     await ownerReview.getByRole('button', { name: 'Edit your review' }).click();
  526 |     const editContext = ownerReview.getByRole('textbox', { name: 'Review context (optional)' });
  527 |     await expect(editContext).toBeVisible();
  528 | 
  529 |     await ownerReview.getByRole('button', { name: 'Fuel quality', exact: true }).click();
> 530 |     await ownerReview.getByRole('button', { name: 'Save changes', exact: true }).click();
      |                                                                                  ^ Error: locator.click: Test timeout of 45000ms exceeded.
  531 | 
  532 |     const editError = ownerReview.getByRole('alert').filter({
  533 |       hasText: 'Choose at least one complaint category for a 1-2 rating.',
  534 |     });
  535 |     await expect(editError).toBeVisible();
  536 |     await expect(editContext).toHaveAttribute('aria-invalid', 'true');
  537 | 
  538 |     await ownerReview.getByRole('button', { name: 'Cancel', exact: true }).click();
  539 |     await ownerReview.getByRole('button', { name: 'Delete your review' }).click();
  540 | 
  541 |     const deleteReason = ownerReview.getByRole('textbox', { name: 'Reason for deleting review' });
  542 |     await expect(deleteReason).toBeVisible();
  543 |     await expect(deleteReason).toHaveAttribute('aria-describedby', /review-delete-help-/);
  544 |   });
  545 | 
  546 |   test('collapses a review after the configured Not helpful threshold', async ({ page }) => {
  547 |     await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });
  548 | 
  549 |     const collapsed = page.getByText('Review collapsed');
  550 |     await expect(collapsed.first()).toBeVisible();
  551 |     await expect(page.getByRole('button', { name: 'Show review' }).first()).toBeVisible();
  552 |     await expect(page.getByRole('button', { name: /Report review/i })).toHaveCount(0);
  553 |   });
  554 | 
  555 |   test('does not introduce console errors in the primary station journey', async ({ page }) => {
  556 |     const consoleErrors: string[] = [];
  557 |     const pageErrors: string[] = [];
  558 | 
  559 |     page.on('console', (message) => {
  560 |       if (message.type() === 'error') consoleErrors.push(message.text());
  561 |     });
  562 |     page.on('pageerror', (error) => pageErrors.push(error.message));
  563 | 
  564 |     await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });
  565 |     await expect(page.getByRole('heading', { name: 'Reviews', exact: true })).toBeVisible();
  566 |     await expect(page.getByText('Trust Score', { exact: true })).toBeVisible();
  567 |     await page.waitForTimeout(300);
  568 | 
  569 |     expect(pageErrors).toEqual([]);
  570 |     expect(consoleErrors).toEqual([]);
  571 |   });
  572 | });
  573 | 
  574 | test.describe('Mobile station actions', () => {
  575 |   test('keeps review and complaint actions reachable', async ({ page }, testInfo) => {
  576 |     test.skip(testInfo.project.name !== 'mobile', 'Mobile-only layout');
  577 | 
  578 |     await enableMockUser(page);
  579 |     await page.goto(`/station/${STATION_ID}`, { waitUntil: 'domcontentloaded' });
  580 | 
  581 |     const write = page.getByRole('link', { name: 'Write a review', exact: true });
  582 |     const complaint = page.getByRole('link', { name: 'File a complaint', exact: true });
  583 | 
  584 |     await expect(write).toBeVisible();
  585 |     await expect(complaint).toBeVisible();
  586 |     await expect(complaint).toHaveAttribute('href', /shell\.com/);
  587 |     await expect(page.getByRole('link', { name: 'Search fuel stations' })).toBeVisible();
  588 |     await expect(page.locator('.review-controls')).toHaveCSS('position', 'static');
  589 | 
  590 |     const metrics = await page.evaluate(() => ({
  591 |       innerWidth: window.innerWidth,
  592 |       scrollWidth: document.documentElement.scrollWidth,
  593 |     }));
  594 |     expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  595 | 
  596 |     await page.screenshot({
  597 |       path: 'e2e/screenshots/station-mobile-sticky-actions.png',
  598 |       fullPage: false,
  599 |       caret: 'initial',
  600 |     });
  601 |   });
  602 | });
  603 | 
  604 | test.describe('Admin query feedback', () => {
  605 |   test('does not show a false reports zero while reports are still loading', async ({ page }) => {
  606 |     await page.addInitScript(() => {
  607 |       localStorage.setItem('fuelvoice:mock_user', 'admin');
  608 |       localStorage.setItem('fuelvoice-theme', 'dark');
  609 |       localStorage.setItem('fuelvoice:mock_admin_reports', 'slow');
  610 |     });
  611 | 
  612 |     await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  613 | 
  614 |     await expect(page.getByText('Loading reports…')).toBeVisible();
  615 |     await expect(page.getByText('No pending reports.')).toHaveCount(0);
  616 | 
  617 |     const reviewsSection = page.locator('section').filter({
  618 |       has: page.getByRole('heading', { name: 'Recent Reviews' }),
  619 |     });
  620 |     const usersSection = page.locator('section').filter({
  621 |       has: page.getByRole('heading', { name: 'Users' }),
  622 |     });
  623 |     await expect(reviewsSection.getByText('The fuel quality was excellent and the service was super fast. Highly recommended!')).toBeVisible();
  624 |     await expect(usersSection.getByRole('cell', { name: 'Test User', exact: true })).toBeVisible();
  625 | 
  626 |     await expect(page.getByRole('heading', { name: 'Pending Reports (1)' })).toBeVisible({ timeout: 8000 });
  627 |   });
  628 | 
  629 |   for (const dataset of ['reports', 'reviews', 'users'] as const) {
  630 |     test(`isolates a failed ${dataset} query from successful admin sections`, async ({ page }) => {
```