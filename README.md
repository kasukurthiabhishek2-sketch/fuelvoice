# FuelVoice

FuelVoice is a Next.js community review app for fuel stations. Station discovery is based on OpenStreetMap/Overpass and Photon; authentication and review data use Firebase Authentication and Firestore.

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

Configure the Firebase client values used by `src/lib/firebase/config.ts` as `NEXT_PUBLIC_FIREBASE_*` environment variables. `NEXT_PUBLIC_MAPTILER_API_KEY` is optional; the station detail map falls back to OpenStreetMap tiles if it is absent.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

CI runs lint, typecheck and production build on every push to `main` and on pull requests.

## Authorization

Firestore roles are the authorization source. New client-created profiles are always `role: "user"`; never use a `NEXT_PUBLIC_*` email allow-list as admin authority.

Bootstrap the first admin with a trusted Firebase Console/Admin SDK operation by changing that user's `users/{uid}.role` to `admin`. After that, Firestore rules allow existing admins to perform moderation changes.

Deploy the included `firestore.rules` with your normal Firebase deployment process. Treat rules changes as part of the application release, not an optional follow-up.

## Data authenticity

Production Overpass failures return an unavailable state. FuelVoice does **not** generate fake nearby stations, ratings, addresses or OSM records as a fallback. Deterministic mock data remains development/test-only.

## Known architecture boundary

Station review aggregates are still computed by the web client. Rules limit aggregate mutation to users with a review at that station, but truly tamper-proof counters and averages require moving aggregate computation to a trusted server/Cloud Function. This should be the next backend hardening step if FuelVoice is exposed to hostile clients at scale.
