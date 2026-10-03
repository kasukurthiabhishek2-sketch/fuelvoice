# FuelVoice UX audit and remediation plan

**Status:** Phase 1 draft, before brutal review  
**Product baseline:** `a9b7f0dbf6c9a081f1c2f21f6d687e597dd4a442`  
**Audit branch:** `ux-audit-2026-10-04`  
**Evidence:** 108 deterministic screenshots, four viewport manifests, source inspection, baseline CI  
**Viewports:** 375×812, 768×1024, 1280×900, 1920×1080

## 1. Method and evidence

This report describes the product that actually rendered from the baseline commit. It does not infer screens from a design system or from intended documentation.

The local ChatGPT execution container could not resolve GitHub/npm, so executable evidence was produced by GitHub Actions from this repository. Phase 0 passed `npm ci`, Chromium installation, `npm run lint`, `npm run typecheck`, `npm run build`, and the deterministic Playwright capture harness. All 108 scenarios rendered; there were zero page exceptions. The 36 console errors are expected network errors from the deliberately simulated 503 and 404 scenarios. See `ux-audit/baseline/test-results.md` and `ux-audit/baseline/summary.json`.

The baseline screenshot convention is:

`ux-audit/baseline/screenshots/<width>-<scenario>.jpg`

The corresponding DOM/viewport measurement evidence is:

- `ux-audit/baseline/manifest-375.json`
- `ux-audit/baseline/manifest-768.json`
- `ux-audit/baseline/manifest-1280.json`
- `ux-audit/baseline/manifest-1920.json`

The capture suite covers signed-out and signed-in navigation, an open user menu, search focus/results/loading, nearby loading/empty/error, station loading/error, review composer and validation, keyboard focus, administrator authorization states, 404, hover, and light/dark themes.

Reference principles used by this audit:

- Nielsen Norman Group, **10 Usability Heuristics for User Interface Design**, particularly visibility of system status, match between system and real world, user control, consistency, error prevention, recognition rather than recall, and recovery: https://www.nngroup.com/articles/ten-usability-heuristics/
- WCAG 2.2 SC 1.4.3 **Contrast (Minimum)**: normal text requires at least 4.5:1; https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- WCAG 2.2 SC 2.5.8 **Target Size (Minimum)**: 24×24 CSS px or sufficient spacing at AA; https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- WCAG 2.2 SC 2.5.5 **Target Size (Enhanced)**: 44×44 CSS px at AAA. FuelVoice's project audit guidance uses approximately 44 px as the mobile ergonomics target even when AA can technically be satisfied by smaller controls.

## 2. Product model as implemented

FuelVoice is a station-first fuel-review product. A visitor can search without signing in, open an OpenStreetMap-backed station, inspect a Trust Score and community reviews, open directions, and reach verified official complaint destinations. Authentication is deferred until write/reaction actions. The main public hierarchy is intentionally **station identity → Trust Score → reviews → review composer → official complaint routes → station details/map**.

The current public surfaces are materially more coherent than the administration and utility surfaces. The public station page uses a subdued monochrome dark system, clear section ordering, explicit recovery for source failures, and progressive map loading. The admin route and 404 retain older emoji/gradient patterns and smaller controls.

The repository currently exposes these user-facing route families:

| Route | Purpose | Entry paths | Main exit paths |
| --- | --- | --- | --- |
| `/` | Explain the product, search directly, and surface nearby mapped stations | direct URL, logo, back/home links | search result → station; nearby card → station; header Search → `/search` |
| `/search` | Dedicated station lookup workspace | header Search, station back link, footer | autocomplete result → station; logo/home |
| `/station/[id]` | Station evidence and actions | search result, nearby card, direct/search-engine URL | directions external; reviews anchor; official complaint external; Search |
| `/admin` | Moderation/user administration | admin user menu item, direct URL | moderation actions; logo/home |
| not-found | Recover from unknown route | invalid URL | Back to Home, header/footer navigation |

## 3. Global shell

### Header

**Code:** `src/components/layout/Header.tsx`, `src/components/ui/ThemeToggle.tsx`, `src/components/auth/LoginButton.tsx`, `src/components/auth/UserMenu.tsx`  
**Evidence:** every baseline screenshot; especially `375-home-default-signed-out.jpg`, `375-home-signed-in-user-menu-open.jpg`, `1280-home-default-signed-out.jpg`.

The sticky header is 74–75 px tall. Its left region is the FuelVoice home link, rendered as a 34×34 mark plus a 17 px wordmark. The right cluster is Search, theme, and authentication.

Measured signed-out controls:

| Width | FuelVoice home | Search | Theme | Sign in |
| --- | ---: | ---: | ---: | ---: |
| 375 | 119×34 at x16 | 42×40 at x155 | 40×40 at x203 | 110×38 at x249 |
| 768 | 119×34 at x24 | 96×40 at x486 | 40×40 at x588 | 110×38 at x634 |
| 1280 | 119×34 at x32 | 96×40 at x990 | 40×40 at x1092 | 110×38 at x1138 |
| 1920 | 119×34 at x320 | 96×40 at x1342 | 40×40 at x1444 | 110×38 at x1490 |

Search is icon-only below the `sm` breakpoint but retains `aria-label="Search fuel stations"`. The theme control exposes an action label such as “Switch to light mode.” Sign-in exposes “Sign in with Google” and a pending “Signing in…” state.

**User-menu state.** The signed-in trigger is 44×44. Opening it reveals a 256 px dropdown with identity, review/like counts, optional Admin Panel, and Sign Out. It closes on outside pointer click. It does **not** currently close on Escape or explicitly transfer/restore focus. Its trigger uses `aria-haspopup="true"`, but the popup is not implemented with menu semantics or as a clearly documented disclosure pattern. The copy “5 reviews • 2 likes” also uses legacy “likes” terminology while review actions use “Helpful / Not helpful.” Evidence: `375-home-signed-in-user-menu-open.jpg`; code `src/components/auth/UserMenu.tsx`.

**Hierarchy issue.** On the home page the header Search control and the hero search field are visible in the same first viewport at all four tested widths. They perform related discovery tasks. On 375 px the header Search is at y17 and the hero field at y530; on 1280 px the header Search is at y17 and the hero field at y539. This is redundant on home rather than complementary because the hero already provides the richer direct-search action. On station/admin/404, persistent header Search remains useful.

### Footer

**Code:** `src/components/layout/Footer.tsx`  
**Evidence:** `375-not-found.jpg`, `375-admin-signed-out.jpg`, `1280-not-found.jpg`.

The footer contains the FuelVoice home link, one-line purpose copy, Search stations, and OpenStreetMap attribution. At 375 it stacks and is 161 px tall; at 768+ it is approximately 109 px tall and distributes content horizontally. The links render at roughly 16–17 px high in the measured 375/1280 states. They can satisfy WCAG 2.5.8 through spacing/inline exceptions, but they miss the project's 44 px mobile ergonomics target and are materially smaller than the rest of the public navigation.

### Focus, motion, themes, and tokens

**Code:** `src/app/globals.css`, `src/providers/ThemeProvider.tsx`.

A global `:focus-visible` outline exists: 3 px with a 3 px offset. Reduced-motion handling exists through `prefers-reduced-motion`, and the capture suite includes both light and dark route renders.

The critical token defect is `--text-tertiary`. The specified light combination `#7C8781` on `#F5F5F1` is approximately **3.41:1**. The final dark override `#666B73` on `#08090A` is approximately **3.72:1**. FuelVoice uses this token repeatedly for 10–12 px informative copy such as section labels, metadata, location details, footer descriptions, trust-score support text, and autocomplete hints. Those values do not meet WCAG 2.2 SC 1.4.3's 4.5:1 requirement for normal text.

Proposed compliant replacements are `#66716B` in light mode (about **4.64:1**) and `#80868F` in the final dark override (about **5.43:1**). Final automated and manual contrast verification is still required after implementation because some text appears on derived/mixed backgrounds.

## 4. Home page — `/`

**Code:** `src/app/page.tsx`, `src/components/landing/Hero.tsx`, `src/components/landing/NearbyStations.tsx`, `src/components/search/SearchBar.tsx`.

### Purpose and layout

The page has two primary regions beneath the global shell:

1. A centered education/search hero with product kicker, headline, supporting copy, search field, and three numbered “Trust Score / Reviews first / Official help” signal cards.
2. “Nearby Fuel Stations, without the clutter,” showing location-context copy, a Search another area action, and mapped station cards.

The hero is explanatory but still action-first: the only substantial control in the region is station search.

### First-viewport composition by breakpoint

**375×812:** Header, full hero headline, supporting copy, and the hero search field are visible together; the signal cards continue below the fold. H1 is x16/y180, 343×195. The search input is x23/y530, 329×57. Screenshot: `375-home-default-signed-out.jpg`.

**768×1024:** Header, headline (720×143 at y303), copy, 706×62 hero search at y581, and some signal content fit in the first viewport. Screenshot: `768-home-default-signed-out.jpg`.

**1280×900:** Header, centered hero headline (896×182 at y222), copy, 754×62 search at y539, and signal cards are visible in the hero. Screenshot: `1280-home-default-signed-out.jpg`.

**1920×1080:** Same 896 px capped content width, centered inside the 1280 px app frame; hero search is 754×62 at y629. Screenshot: `1920-home-default-signed-out.jpg`.

No default home breakpoint exhibits document-level horizontal overflow.

### Components and states

**Hero search.** `SearchBar variant="hero"` is a combobox with search icon, loading spinner, clear button, autocomplete listbox, active-option tracking, ArrowUp/ArrowDown/Enter/Escape keyboard behavior, a polite result-count live region, no-results panel, and pointer/keyboard selection. Baseline states: `*-home-search-focus.jpg`, `*-home-search-results-hover.jpg`.

On `sm+`, the input also renders a bordered pill reading **“SEARCH”**. It is a `span`, not a control. Its styling resembles a compact button/keycap and its word duplicates the obvious input purpose. This is a false affordance.

**Signal cards.** The three `home-signal` cards are passive educational components. Hover lifts them by 2 px. They are not links and do not claim interactivity.

**Nearby section.** It has loading, empty, error, mapped-results, and card-hover evidence:
- `*-home-nearby-loading.jpg`
- `*-home-nearby-empty.jpg`
- `*-home-nearby-error.jpg`
- `*-home-nearby-card-hover.jpg`

The section makes approximate-location use visible in copy: “Ordered around your approximate area. Precise location improves distance accuracy when you choose to enable it.” The underlying `useGeolocation` also attempts an IP-based approximate location automatically when precise browser location is absent. This is functional behavior and is not changed by this UX pass.

### Hierarchy and duplicate controls

The hero search is correctly the dominant home action. The header Search shown at the same time is a competing duplicate on this route. The “Search another area” action later in Nearby Stations is complementary because it appears in a different task context.

### Navigation and flow

- Logo returns/stays on home.
- Header Search opens the dedicated search route.
- Hero autocomplete selects a station directly, eliminating an unnecessary intermediate results page.
- Nearby station cards open station detail.
- There is no dead-end in the normal state.
- Browser Back from a station selected from home returns to the prior home document, but exact scroll/selection restoration is browser-dependent; changing navigation state is outside this pass.

### Accessibility

Strengths: combobox/listbox semantics, active descendant, keyboard selection, live result count, visible focus, no precise-location permission gate to type in search.

Defects: tertiary helper text contrast fails; the desktop “SEARCH” badge is a false affordance; header action targets are mostly 38–40 px instead of the project's 44 px mobile ergonomics target.

## 5. Search page — `/search`

**Code:** `src/app/search/page.tsx`, `src/components/search/SearchBar.tsx`.  
**Evidence:** `*-search-default.jpg`, `*-search-results-open.jpg`, `*-search-loading.jpg`, `*-search-light-theme.jpg`.

### Purpose and layout

The page is a dedicated search workspace. Regions are: header, page kicker “Station search,” two-line H1 “Find the station. Then judge it by the evidence.”, supporting copy, hero-size autocomplete, a three-column principle strip on `sm+`, then footer.

### First-viewport composition

**375:** H1 x16/y168, 343×108; search field x23/y419, 329×57. The header Search icon and page search are both visible. Because this is the dedicated Search route, the header control also acts as active global-nav context via `aria-current="page"`; the duplication is less harmful than on home but still visually repetitive. Page height is 1029 px.

**768:** H1 720×180 at y192; input 706×62 at y487. Page height 1134 px.

**1280:** content is capped; H1 768×180 and input 754×62. Page height 1010 px.

**1920:** same capped content centered in the app frame. Page height 1190 px due viewport-relative section sizing.

No captured search state has document horizontal overflow.

### Components, states, feedback

The same SearchBar supports focused, searching, results, clear, selected-option, no-results, and Escape states. Loading uses an aria-labelled spinner plus `aria-busy`; successful selection routes to `/station/<id>`. The source component contains an explicit visible no-results panel even though a separate screenshot is not required to prove its presence.

The principle strip consists of:
- “No location gate” / “Search works without granting location permission.”
- “Trust over stars” / “Open a station to see its Trust Score and reviews.”
- “Official complaint paths” / “Verified destinations appear on supported station pages.”

The first statement is narrowly true for the dedicated search action, but elsewhere the app may automatically use approximate IP location for home nearby discovery. Proposed copy should preserve the claim about **precise permission** while making home behavior less easy to misread.

### Accessibility

The search interaction is one of the stronger components. Remaining issues are global tertiary contrast and the false desktop “SEARCH” badge. Search-result option buttons are generously padded. Keyboard navigation exists.

## 6. Station page — `/station/[id]`

**Code:** `src/app/station/[id]/page.tsx`, `src/components/review/ReviewList.tsx`, `src/components/review/ReviewForm.tsx`, `src/components/review/ReviewCard.tsx`, `src/components/ui/StarRating.tsx`, `src/components/station/ConsumerComplaint.tsx`, `src/components/station/LazyStationMap.tsx`.

**Evidence:** `*-station-signed-out.jpg`, `*-station-signed-in.jpg`, `*-station-loading.jpg`, `*-station-error.jpg`, `*-station-review-form-open.jpg`, `*-station-review-validation-error.jpg`, `*-station-keyboard-focus.jpg`, `*-station-light-theme.jpg`.

### Purpose and layout

This is the product's core evidence page and supports direct/search-engine landing. The order is:

1. Station hero: Search/back, Share, brand/source, station name/address, Directions, Reviews anchor, Trust Score.
2. Reviews title/copy, sticky-on-`sm+` sort/filter controls, review feed.
3. Review composer.
4. Verified complaint destinations.
5. Secondary station details.
6. Lazy interactive map and directions.
7. Data provenance note.

This order correctly prioritizes user evidence and high-stakes complaint recovery before maps and secondary metadata.

### First-viewport composition

**375:** Header ends at y75. Search/back and Share are 36 px high at y103. H1 is 343×38 at y215. Directions and Read reviews are 45 px high at y317. Reviews heading begins at y614; sort controls enter the first viewport at y734. A fixed mobile action bar can be visible at the viewport bottom while the longer document continues. Default page width remains exactly 375.

**768:** Hero consumes more vertical space; Reviews begins at y678. No document overflow.

**1280/1920:** Hero is shorter and reviews begin at y519. Station H1 is capped to 896 px; Trust Score occupies the right column. No document overflow.

### Station hero components

- **Search/back**: `.station-back-link`, min-height 36 px.
- **Share**: same class, min-height 36 px; uses native share when available, clipboard otherwise; clipboard success receives toast.
- **Brand/source pills**: compact status metadata; source pill reads “Mapped station.”
- **Get directions**: primary action, min-height 44 px, external Google Maps destination.
- **Read reviews**: secondary 44 px action anchored to `#reviews`.
- **Trust Score panel**: min-height 168 px desktop, 138 px on small screens. Below the minimum-review threshold it explicitly says “Insufficient data” and “N of 5 reviews needed,” avoiding invented certainty.

### Reviews and form states

Review sort options are “Risk first,” “Newest,” and “Most helpful.” Complaint-category filters include All issues plus Fuel quality, Quantity / short-filling, Pricing / billing, Staff behavior, Payment issue, Facilities, Safety, and Other.

Filter pills are min-height 40 px. The controls are horizontally scrollable rather than wrapping into an unbounded mobile wall, and sticky at `sm+`. Empty, loading, error/retry, content, and infinite-fetch skeleton states exist in `ReviewList`.

The review composer is gated only for writing, not reading. A 1–2 star rating requires at least one complaint category; validation feedback is visible in `375-station-review-validation-error.jpg`. Successful mutations use toasts.

### Accessibility defects in reviews

**Read-only StarRating semantics.** `StarRating` always renders five HTML buttons. When no `onChange` is supplied they become five disabled buttons, each labelled “1 star” through “5 stars.” In the 1280 station baseline those read-only buttons measure only 16×16 because the interactive 44×44 wrapper class is omitted. A static visual rating should not expose five disabled controls. This causes unnecessary tab/accessibility-tree complexity even though disabled controls are not normally tabbable.

**Interactive rating semantics.** Interactive stars are 44×44, which is good for touch, but five pressed buttons are a weaker semantic model for a mutually exclusive rating than a labelled radio group. Arrow-key radio behavior is not present.

**Review-owner fields.** The ReviewCard edit textarea and deletion-reason textarea rely on placeholders rather than a programmatically associated label. `editError` is plain text rather than an alert/live message. These are concrete form accessibility defects.

**Small controls.** Review icon buttons and reaction buttons are 34 px. Review filter pills are 40 px. These can pass WCAG 2.5.8 depending on spacing, but fall below the project's 44 px mobile ergonomics target.

### Error/loading behavior

The station data error state is strong: it distinguishes a provider outage from an invalid/missing station, explains that FuelVoice will not fabricate station data, offers Search stations, and offers Retry when appropriate.

The loading state currently uses generic `SkeletonPage`. At **375 px its document width is 400 px**, creating horizontal overflow. The likely source is the generic fixed `w-96` skeleton copy inside a content area narrower than 384 px. Evidence: `375-station-loading.jpg`, `manifest-375.json`; source `src/components/ui/Skeleton.tsx`.

### Duplicate actions

There are two directions affordances: a hero “Get directions” and a later “Directions ↗” beside the map. They are contextually separated and complementary rather than accidental duplication: one is an early primary action, the other accompanies the location/map region. They should remain.

On mobile the fixed “Write a review / File a complaint” bar duplicates later in-page actions, but it provides persistent access to the two core user actions and the page reserves bottom padding. It is intentional.

## 7. Admin page — `/admin`

**Code:** `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`.  
**Evidence:** `*-admin-signed-out.jpg`, `*-admin-non-admin.jpg`, `*-admin-admin.jpg`, `*-admin-light-theme.jpg`.

### Purpose and authorization states

The layout has three authorization states before the admin content:
- auth loading: spinner only;
- signed out: “Access Denied / Please sign in to access this page. / ← Back to Home”;
- signed in but not admin: “Admin Only / You do not have admin privileges. / ← Back to Home”.

The signed-out page tells the user to sign in but does not provide a sign-in action in the page body. The global header has Sign In, so it is not a literal dead end, but the recovery action presented beside the explanation goes somewhere else. This violates the local action expectation and adds unnecessary search/reorientation.

### Admin content hierarchy

Authenticated admin content renders:
- “Admin Panel” + Admin badge.
- Three large stat cards: Total Reviews, Pending Reports, Total Users.
- Pending Reports list.
- Recent Reviews moderation list.
- Users table.

The underlying actions include Accept/Dismiss report, Hide/Show review, Feature/Unfeature review, Ban/Unban user.

### Responsiveness

This is the largest baseline responsive defect.

At **375 px**, the document is **582 px wide**. The header itself is only 375 px wide, leaving visible overflow to the right in the full-page screenshot. The Pending Reports heading is measured at 524 px wide. The authenticated page is therefore not a contained horizontal scroller; the document itself overflows.

Evidence:
- `ux-audit/baseline/screenshots/375-admin-admin.jpg`
- `ux-audit/baseline/screenshots/375-admin-light-theme.jpg`
- `ux-audit/baseline/manifest-375.json`

At 768/1280/1920 there is no document-level overflow. The defect is a min-content/grid containment failure, likely requiring `min-w-0` on grid children/cards plus contained table scrolling.

### Component choice and consistency

Admin cards use emoji as their primary icons (📝, 🚩, 👥), while public surfaces use the FuelVoice monochrome SVG language. The signed-out guard uses 🔒 and the non-admin state uses 🛡️. The public product's subdued typography and action components are therefore not consistently applied to a sensitive operational surface.

Measured admin actions are also much smaller than public controls:
- Accept: 67×24
- Dismiss: 71×24
- Hide: 62×24
- Feature: 80×24
- Ban: approximately 22×16 in the desktop table measurement
- read-only rating stars: 16×16 disabled buttons

Some of these may narrowly pass WCAG 2.5.8 through spacing exceptions; they are still weak for an admin interface where accidental actions are costly and are far below the repository's 44 px touch target.

### Feedback states

The admin page's data queries currently destructure data but not query `isLoading`/error state. Before data resolves the UI can transiently present zeros/“No pending reports” rather than a real skeleton/loading status. Query failure likewise has no explicit in-page recovery. This conflicts with Nielsen's visibility-of-system-status heuristic.

Mutation pending states exist in the hooks, but destructive moderation operations do not add confirmation steps. Adding confirmation would alter interaction/functionality and is placed in **Needs my decision**, not silently introduced.

### Accessibility

The outer admin guard's loading spinner has no visible or programmatic status text. The signed-out guard recovery link is only about 17 px high. Admin actions are undersized. The same global tertiary contrast defect applies.

## 8. Not-found page

**Code:** `src/app/not-found.tsx`.  
**Evidence:** `*-not-found.jpg`, `*-not-found-light-theme.jpg`.

The 404 is a simple centered recovery state with 🔍, “Page Not Found,” explanatory copy, and a 44 px “← Back to Home” action. It keeps the global header/footer so Search remains available.

At all four widths it has no horizontal overflow and fits in one viewport. The main recovery action is adequate. The visual language is older than the rest of the product: emoji icon, gradient action, and centered generic error layout rather than the station/public action components. This is a consistency issue, not a functional failure.

A better 404 should keep Home as primary recovery and add a clear Search stations secondary option without changing the 404 route.

## 9. Cross-page consistency

### What is already consistent

- One global app frame and sticky header.
- Search input component reused on home/search.
- Station public page and home share the newer subdued surface/token system.
- `primary-action` and `secondary-action` establish clear action hierarchy.
- Errors generally explain recovery rather than dumping technical details.
- Dark/light theme support is real, not merely token definitions.

### Inconsistencies to correct

1. Admin and 404 use older emoji/gradient language.
2. Small action targets vary from 16 to 45 px with no clear interaction-size system.
3. “likes” remains in UserMenu while the product now uses Helpful/Not helpful reactions.
4. Informative tertiary copy is globally under-contrast in both themes.
5. Home shows two search entry points in the same first viewport.
6. The hero search contains an inert visual “SEARCH” element that resembles an affordance.
7. Generic station loading uses a different width discipline from the station page and overflows mobile.

## 10. Main user flows

Click counts count pointer activations, not text entry or external authentication-provider steps.

| Flow | Baseline path | Minimum clicks/taps | Friction |
| --- | --- | ---: | --- |
| Home → autocomplete → station | focus hero search → type → select result | 2 (focus + result) | Good direct path; header Search competes visually with hero search |
| Home nearby → station | scroll/read nearby → Open station/card | 1 | Good; approximate-location behavior should remain clearly explained |
| Header Search → station | Search nav → focus/type → result | 3 | Appropriate global path from non-home pages |
| Search page → station | focus/type → result | 2 | Good; strong keyboard path |
| Direct station → directions | Get directions | 1 | Strong primary action |
| Direct station → review reading | scroll or Read reviews anchor | 0–1 | Good; reviews appear before map |
| Signed-in station → write review | Write review → choose rating → category if 1–2 → optional context → Publish | 3–4+ | Validation is clear; semantics/labels need improvement |
| Signed-out station → write review | Write review → sign in → composer actions | 2 before provider + composer actions | Auth is deferred until write; good principle |
| Station → official complaint | File a complaint → destination if chooser exists | 1–2 | High-stakes route is prominent, particularly mobile |
| Signed-out direct admin → sign in | land on Admin → notice body asks sign-in → use header Sign In | 1 | The page-body recovery itself only offers Back Home, so the instruction/action pairing is poor |
| Unknown URL → recover | Back to Home | 1 | Works; Search should also be offered as a direct recovery |

Browser Back/Forward works through ordinary Next.js navigation. No custom history manipulation was found. Preserving precise prior scroll/result context across every origin is not guaranteed by product code and is not changed in this pass.

## 11. Prioritized problems and approved implementation candidates

### P1 — Systemic text contrast failure

**Before:** `--text-tertiary` is approximately 3.41:1 light and 3.72:1 dark against the primary page backgrounds, while frequently used for normal 10–12 px informational text.

**After:** move the light tertiary token to `#66716B` (~4.64:1) and final dark tertiary token to `#80868F` (~5.43:1), then verify mixed surfaces with axe/manual checks.

**Rationale:** WCAG 2.2 SC 1.4.3 and basic legibility.  
**Risk:** low; visual tone becomes slightly brighter/darker but hierarchy remains through size/weight.  
**Files:** `src/app/globals.css`.  
**Acceptance:** no normal tertiary text violation on tested core surfaces in both themes.

### P1 — Authenticated admin mobile overflow

**Before:** 375 px viewport expands to 582 px.

**After:** constrain admin grid/card children with `min-w-0`; constrain wide data regions to their own overflow container; allow text/actions to wrap without increasing document width.

**Rationale:** responsive correctness and WCAG reflow principles.  
**Risk:** medium; table/action layout can compress incorrectly if containment is applied blindly.  
**Files:** `src/app/admin/page.tsx`, possibly `src/app/admin/layout.tsx`.  
**Acceptance:** `documentElement.scrollWidth <= innerWidth + 1` at 375, 768, 1280, 1920; actions remain readable and operable.

### P1 — Station loading mobile overflow

**Before:** station loading state is 400 px wide at 375 px.

**After:** make generic skeleton text widths fluid (`max-width:100%`) or create a station-safe skeleton that never exceeds its container.

**Rationale:** loading is part of the real experience and must obey the same responsive contract.  
**Risk:** low.  
**Files:** `src/components/ui/Skeleton.tsx`.  
**Acceptance:** station loading state has no document-level overflow at all four widths.

### P1 — Rating semantics

**Before:** read-only ratings expose five disabled buttons; interactive ratings are five pressed buttons.

**After:** read-only state exposes one labelled static rating group with decorative stars; interactive state uses a labelled radiogroup/radio model with 44×44 hit areas, checked state, and standard Arrow-key movement while retaining pointer/hover preview.

**Rationale:** controls should represent actual interaction; mutually exclusive rating maps naturally to radio semantics.  
**Risk:** medium because ReviewForm/ReviewCard tests may rely on button roles/names. Tests must be updated without changing rating data.  
**Files:** `src/components/ui/StarRating.tsx`, affected e2e selectors.  
**Acceptance:** read-only ratings are not controls; interactive rating is fully operable by Tab/arrow/Space and pointer; submitted numeric values unchanged.

### P1 — Programmatic labels and review validation announcement

**Before:** owner edit/delete textareas rely on placeholders; edit error is not a live/alert message.

**After:** add visible or visually-hidden labels tied with `htmlFor`/id, explanatory deletion help, and `role="alert"` or an equivalent live error relationship.

**Rationale:** form purpose and error recovery cannot depend on placeholder text.  
**Risk:** low.  
**Files:** `src/components/review/ReviewCard.tsx`.  
**Acceptance:** axe has no form-label violation; error is announced; layout/functionality unchanged.

### P2 — Admin explicit loading/error states

**Before:** query data defaults can visually resemble valid zero/empty results; query failures have no explicit recovery.

**After:** render stable loading skeleton/status, explicit error message with retry, and only render zero/empty content once the corresponding query is successfully resolved.

**Rationale:** visibility of system status; prevents false “nothing to moderate” interpretations.  
**Risk:** medium; no data-fetch contract changes, but combined query state must be handled carefully.  
**Files:** `src/app/admin/page.tsx`.  
**Acceptance:** slow/error tests show unambiguous state and retry; successful content unchanged.

### P2 — Admin authorization recovery

**Before:** signed-out guard says “Please sign in” but its body action is only Back to Home.

**After:** place the existing Google `LoginButton` as the primary recovery action and keep Back to Home secondary.

**Rationale:** action should match the instruction and reduce reorientation.  
**Risk:** low; reuses existing sign-in behavior.  
**Files:** `src/app/admin/layout.tsx`.  
**Acceptance:** signed-out admin visitor can initiate sign-in directly in one body action.

### P2 — Small mobile/action targets

**Before:** header Search/theme/sign-in are 38–40 px high; station back/share are 36; review filters 40; reaction and review-icon controls 34; admin actions 16–24; footer links are text-height only.

**After:** normalize primary interactive surfaces toward a 44 px minimum hit area where layout allows, with particular priority to admin moderation, review reactions/edit/delete, header controls, and station back/share. Footer links receive padded hit areas without visually bloating text.

**Rationale:** touch ergonomics and stronger-than-minimum accessibility. WCAG AA minimum is 24 px with exceptions; this change intentionally targets the repository's 44 px product standard rather than mislabelling every 34–40 px control an AA failure.  
**Risk:** medium because header/mobile rows must still fit at 375 px.  
**Files:** `src/app/globals.css`, `src/components/ui/ThemeToggle.tsx`, `src/components/auth/LoginButton.tsx`, admin component styles, Footer.  
**Acceptance:** no important mobile control under 44×44 unless documented as an inline-link exception; no 375 px overflow.

### P2 — Home duplicate Search affordance

**Before:** header Search and hero station search are simultaneously visible on home at all breakpoints.

**After:** hide the header Search link on `/` while retaining theme/auth; retain header Search on every non-home route.

**Rationale:** one dominant search action on the landing page; persistent global Search remains where the hero is absent.  
**Risk:** low; route remains reachable through hero autocomplete but the dedicated `/search` route loses its one-click home-header entry. The Nearby “Search another area” still provides a route-level search entry.  
**Files:** `src/components/layout/Header.tsx`.  
**Acceptance:** home first viewport has one search affordance; station/admin/404 retain global Search.

### P2 — False “SEARCH” affordance inside hero field

**Before:** desktop hero input ends with an inert bordered `span` reading “Search.”

**After:** remove it and use the space for input/clear/loading only.

**Rationale:** clickable-looking objects should be clickable; search purpose is already explicit.  
**Risk:** very low.  
**Files:** `src/components/search/SearchBar.tsx`.  
**Acceptance:** no inert button-like badge; loading/clear controls still align.

### P2 — User menu keyboard/disclosure behavior and terminology

**Before:** outside click closes the popup, but Escape/focus return are not implemented; “likes” is legacy copy.

**After:** implement a clear disclosure pattern: Escape closes, focus returns to trigger, route/sign-out actions close; use “helpful” terminology consistent with review reactions. Do not invent unavailable profile data.

**Rationale:** predictable keyboard behavior and cross-page naming consistency.  
**Risk:** low/medium; avoid overusing ARIA menu roles unless full menu keyboard semantics are implemented.  
**Files:** `src/components/auth/UserMenu.tsx`.  
**Acceptance:** keyboard test can open, traverse, Escape-close, and regain trigger focus.

### P2 — Admin/404 component-system drift

**Before:** emoji symbols, gradient/error styling, and tiny inline actions differ from the newer public design.

**After:** replace decorative emoji UI with existing inline SVG language or text/status chips; use product action classes/surface tokens; restyle 404 with Home primary + Search stations secondary.

**Rationale:** consistency and professional high-stakes administration.  
**Risk:** low if only presentation/components change.  
**Files:** `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/not-found.tsx`.  
**Acceptance:** both themes read as the same product; no business actions/routes change.

### P2 — Location copy clarity

**Before:** dedicated Search says FuelVoice “does not request your location just to make search work,” while home nearby discovery can automatically use approximate IP location. The search claim is technically about permission, but the system behavior is easy to overgeneralize.

**After:** clarify that station search does not require **precise browser-location permission**, and keep home copy explicit that nearby ordering may use approximate area until the user enables precise distance.

**Rationale:** match between system and real world; privacy clarity.  
**Risk:** low; copy only.  
**Files:** `src/app/search/page.tsx`, only if home copy needs wording alignment.  
**Acceptance:** copy accurately distinguishes search, approximate network location, and precise permission.

### P3 — Footer hit areas

**Before:** mobile footer links are approximately 16–17 px high.

**After:** preserve typography but enlarge click/touch boxes through inline-flex/min-height padding.

**Rationale:** mobile ergonomics.  
**Risk:** low.  
**Files:** `src/components/layout/Footer.tsx`.  
**Acceptance:** links remain visually quiet while touch areas approach 44 px.

## 12. Planned implementation order

1. Fix contrast tokens and mobile overflow defects.
2. Correct StarRating semantics and review-form labels/errors.
3. Stabilize admin loading/error/auth recovery and responsive layout.
4. Normalize important hit targets.
5. Remove misleading/duplicate search affordances.
6. Harden user-menu keyboard behavior and terminology.
7. Bring admin/404/footer/copy into the current product system.
8. Run aggressive final e2e, keyboard, axe, edge-state, and screenshot-diff verification.

Each item is to be committed independently with lint/typecheck/build/tests and four-width recapture before the next product change.

## 13. Needs my decision

These items could improve UX but would change functionality or product policy, so they are deliberately **not approved for implementation** in this pass:

1. **Automatic IP-based approximate location.** `useGeolocation` attempts `ipwho.is` automatically when precise location is unavailable. Removing it or requiring explicit consent changes nearby-discovery behavior and privacy policy, not just presentation.
2. **Admin moderation confirmations.** Requiring a confirmation dialog for Ban/Hide/Dismiss/Accept adds an interaction step and changes moderation flow. The current pass can improve target sizing and feedback, but will not add confirmations without a product decision.
3. **Navigation-state preservation.** Guaranteeing exact return-to-results/scroll state after station visits would add explicit navigation state rather than styling-only behavior.
4. **Mobile sticky action priority.** Changing whether “File a complaint” or “Write a review” is visually dominant would express a product priority rather than fix a correctness defect. The existing pair will remain.
5. **Business/data model semantics for legacy profile likes.** The visible word can be aligned to current “helpful” terminology, but the meaning/storage of `profile.likeCount` will not be redefined.

## 14. Baseline strengths that must not regress

- Public reading/search works without authentication.
- Station source failures never invent fallback station facts.
- Direct station landings surface identity, Trust Score, and reviews before the map.
- Trust Score explicitly withholds a score below the minimum review count.
- Search has keyboard autocomplete, live status, clear, loading, and visible no-results behavior.
- Review validation is specific about low-rating complaint categories.
- Complaint destinations are visually distinct and verified where supported.
- Both themes work across public/admin routes.
- No normal home/search/station/404 state has document-level horizontal overflow.
- Existing URLs, data models, API contracts, review calculations, moderation behavior, and station-fetch logic remain out of scope for change.
