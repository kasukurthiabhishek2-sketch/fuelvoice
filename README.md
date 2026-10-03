# FuelVoice

FuelVoice is a station-first fuel review product. The primary experience is an individual fuel-station page reached directly from search, a shared link, or FuelVoice search. That page should answer two questions quickly:

1. Can I trust this station?
2. If something went wrong, where can I file a real complaint?

The product is intentionally designed for users who may already be frustrated. Trust information, reviews, and complaint actions must not be blocked by maps, geolocation, decorative content, or unnecessary authentication.

## Product principles

- Station pages are the primary product surface.
- Anyone can read reviews and Trust Scores without signing in.
- Sign-in is required only to write a review or react Helpful / Not helpful.
- No anonymous reviews are accepted in the current product.
- Reviews appear before maps and secondary station metadata.
- Complaint CTAs go directly to verified official destinations. FuelVoice does not invent fallback URLs.
- Interactive maps are deferred until they approach the viewport.
- The homepage is deliberately minimal and does not automatically request location or load nearby-station/map data.
- The public station aggregate is the Trust Score. FuelVoice does not show a competing aggregate star rating.

## Stack

- Next.js 16 / React 19 / TypeScript
- Firebase Authentication + Firestore
- TanStack Query
- Leaflet / OpenStreetMap / MapTiler (optional)
- Playwright E2E tests

## Local setup

```bash
npm ci
npm run dev
```

Configure the Firebase client values used by `src/lib/firebase/config.ts` as `NEXT_PUBLIC_FIREBASE_*` environment variables. `NEXT_PUBLIC_MAPTILER_API_KEY` is optional; station maps fall back to OpenStreetMap tiles when it is absent.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

CI runs lint, typecheck and production build on every push to `main` and on pull requests.

## Trust Score

The station page exposes a single public **0–100 Trust Score**.

### Evidence threshold

A station must have at least **5 active, visible reviews** before a numeric Trust Score is shown.

- 0–4 reviews: the UI shows **Insufficient data**.
- 5+ reviews: the UI shows the numeric Trust Score.
- The final number is public; the formula breakdown and reviewer credibility score are not shown to users.

### Rating input

Every review requires a private 1–5 rating. The individual review card shows that reviewer’s rating, but FuelVoice does not display an aggregate star rating for the station.

The rating is mapped onto the Trust Score scale:

| Review rating | Trust input |
| --- | ---: |
| 1 | 0 |
| 2 | 25 |
| 3 | 50 |
| 4 | 75 |
| 5 | 100 |

### Reviewer credibility

Reviewer credibility is an **internal weighting signal**, not a public profile score and not proof that a person is genuine.

Today the available authenticity signal is the age of the authenticated FuelVoice account. The current credibility values are:

| Account age when review was created | Internal credibility |
| --- | ---: |
| under 7 days | 45 |
| 7–29 days | 55 |
| 30–179 days | 65 |
| 180–364 days | 75 |
| 1–2 years | 85 |
| 2+ years | 95 |
| missing / invalid age | 50 |

Credibility is converted into a deliberately narrow weight:

```text
weight = 0.75 + credibility / 200
```

That produces a practical range of roughly 0.98–1.23. An older account therefore carries moderately more influence, but account age cannot turn a bad rating into a good one or dominate the station score by itself.

The Trust Score is:

```text
sum(review trust input × reviewer weight)
-----------------------------------------
sum(reviewer weight)
```

rounded to the nearest whole number and clamped to 0–100.

### Future authenticity signals

The weighting function is intentionally isolated so future signals can be added without changing the station-page contract. Planned candidates include mobile verification and carefully scoped OSINT/account-footprint signals. Those signals must not be treated as identity proof merely because an email address has an old public footprint.

## Review rules

- Authentication is required to write a review.
- A user may have at most **3 active reviews per station**.
- Reviews may be posted back-to-back; there is no cooldown.
- Deleting a review frees that slot.
- Review text is optional and may be up to 2,000 characters.
- A 1–5 rating is required.
- Ratings of **1–2** require at least one explicit complaint category.
- FuelVoice does not infer complaint categories from review text.
- Multiple complaint categories may be selected.
- Current complaint categories:
  - Fuel quality
  - Quantity / short-filling
  - Pricing / billing
  - Staff behavior
  - Payment issue
  - Facilities
  - Safety
  - Other
- Review owners may edit their review. The public card shows **Edited** when `updatedAt` differs from `createdAt`.
- Review owners may delete their review only after providing a reason of at least **10 characters**. The reason is stored in `reviewDeletions` for audit purposes and is not shown publicly.

## Helpful / Not helpful

The old Like interaction is replaced by **Helpful / Not helpful**.

- Authentication is required.
- One reaction per user per review.
- Selecting the active reaction again removes it.
- Switching reaction changes the existing reaction rather than counting twice.
- A quality penalty is considered only after at least **5 total reactions**.
- When **65% or more** of those reactions are Not helpful, the review is demoted and collapsed by default.
- The review is not automatically deleted.

There is no separate public “Report review” flow in the current product.

## Review ordering

The default station review order is **Risk first**. Low ratings and complaint-heavy reviews are surfaced ahead of positive experiences so a user checking whether a station is trustworthy sees risk evidence quickly.

Users can also switch to:
- Newest
- Most helpful

Complaint-category filters are available within the review section.

## Complaint routing

FuelVoice can expose two direct outbound actions:

1. **Brand / station support**, when a verified official brand route exists.
2. **Government / consumer protection**, as the escalation route when a verified official destination exists for the station country.

Rules:

- No FuelVoice login gate.
- No intermediate complaint form.
- Links open the official destination directly.
- The UI marks mapped destinations as **Official link verified**.
- Verification dates are intentionally not shown in the normal interface.
- If a brand route cannot be verified, it is hidden.
- If a government route cannot be verified for that country, FuelVoice shows no invented substitute.

Verified routes live in `src/lib/api/complaints.ts` and should be expanded only with evidence from the organization’s own domain or an authoritative government source.

## Authorization

Firestore roles are the authorization source. New client-created profiles are always `role: "user"`; never use a `NEXT_PUBLIC_*` email allow-list as admin authority.

Bootstrap the first admin with a trusted Firebase Console/Admin SDK operation by changing that user’s `users/{uid}.role` to `admin`. After that, Firestore rules allow existing admins to perform moderation changes.

Deploy both `firestore.rules` and `firestore.indexes.json` with the application’s Firebase release process. Rules/index changes are part of the application release, not an optional follow-up.

## Data authenticity

Production Overpass failures return an unavailable state. FuelVoice does **not** generate fake nearby stations, ratings, addresses, complaint destinations, or OSM records as a production fallback. Deterministic mock data remains development/test-only.

Legacy anonymous reviews are excluded from the redesigned public review feed.

## Current trust boundary

Trust Score and review aggregates are still recomputed by the web client because the current product intentionally does not require a dedicated scoring server.

Firestore rules:
- enforce review ownership and the 3-active-review slot scheme,
- require negative-review complaint categories,
- constrain Helpful / Not helpful transitions,
- require deletion audit reasons,
- constrain aggregate field types and ranges.

However, a hostile authenticated client that already owns a review at a station can still attempt to manipulate client-computed aggregate values. **The Trust Score is not tamper-proof until aggregate computation moves to a trusted backend or Cloud Function.**

That is a known architecture boundary, not something the UI should disguise.
