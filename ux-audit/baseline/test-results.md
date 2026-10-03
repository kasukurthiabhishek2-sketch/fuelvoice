# Phase 0 baseline test results

Baseline product commit: `a9b7f0dbf6c9a081f1c2f21f6d687e597dd4a442`

The ChatGPT execution container could not resolve `github.com` / the npm registry, so the executable baseline was obtained from GitHub Actions rather than pretending local commands had run. The exact baseline commit's normal CI run (CI #114) had already passed lint, type-check, production build, Playwright E2E, production-dependency audit, and Firestore-rules tests.

This branch contains audit-only capture tooling and no product-code changes at baseline time.

| Check | Outcome |
| --- | --- |
| npm ci | success |
| Playwright Chromium install | success |
| npm run lint | success |
| npm run typecheck | success |
| npm run build | success |
| deterministic 375/768/1280/1920 capture | success |
| deterministic screenshots | 108/108 rendered |
| page exceptions | 0 |
| expected console network errors | 36 (simulated 503/404 states only) |

Existing baseline production smoke run #36 failed before this audit because `https://fuelvoice.vercel.app/api/health` did not converge to the exact main commit. Its homepage/station smoke steps were skipped. This is recorded as pre-existing operational evidence, not attributed to UX changes.

## Baseline responsive defects found by the capture harness

- `/admin` as an authenticated administrator expands the document to 582 px at a 375 px viewport.
- `/station/[id]` loading state expands the document to 400 px at a 375 px viewport.
- No other captured scenario reported document-level horizontal overflow.
