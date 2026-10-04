# UX audit changelog

Baseline product commit: `a9b7f0dbf6c9a081f1c2f21f6d687e597dd4a442`  
Final verified product commit: `e3b5df0ab5ee9cf2e711f45d97004110f6b87511`

This changelog contains only the approved UX/a11y implementation and its supporting tests. Business logic, routes, API contracts, data models and Trust Score/review calculations were kept out of scope.

| Commit | Change | Why |
| --- | --- | --- |
| `aa9924c7` | Raise tertiary text contrast in light/dark tokens | Normal 10–12 px helper text was below WCAG AA contrast |
| `d41b8aea` | Contain admin dashboard on mobile | 375 px admin document expanded to 582 px |
| `09b8e75c` | Make station loading skeleton fluid | 375 px loading document expanded to 400 px |
| `96d87c9d` | Correct rating semantics | Static ratings were disabled buttons; interactive rating lacked radio semantics |
| `a87f0763` | Label review-owner edit/delete fields and announce errors | Placeholders were acting as labels and validation was not announced |
| `35623986`, `ee9045fb` | Make admin query states truthful and independent | Loading/failure could masquerade as real zero/empty data |
| `640b6235` | Add in-context admin sign-in recovery | Guard asked users to sign in but only offered Back Home |
| `8e2435f0` | Remove inert SEARCH badge | It looked clickable but was only decorative |
| `57aa572d` | Add Escape close and trigger-focus return to user menu | Keyboard disclosure behavior was incomplete |
| `42517513` | Align 404 recovery with product UI and add Search recovery | Utility surface had older visual language and one recovery path |
| `4f7f5ef3` | Clarify search location-permission copy | Distinguishes precise browser permission from approximate location behavior |
| `4fd144a6` | Enlarge footer hit areas | Footer links were text-height targets on mobile |
| `b2392455` | Normalize important touch targets | Header, station, review and admin controls were inconsistent/small |
| `11d20969`, `bc427b07` | Align admin presentation with product system | Removed emoji-style operational UI and stale icon plumbing |
| `69542ee1` | Guard against rapid duplicate review publish activation | Prevents double UI submission during pending mutation |
| `428c9912` | Remove nested station main landmark | Axe exposed duplicate main-landmark structure |
| `b9a45da4` | Raise collapsed-review explanatory text contrast | Final axe review found insufficient contrast |
| `d0b8c625` | Only expose combobox `aria-controls` when results list exists | No-results state referenced a non-mounted listbox |
| `e3b5df0a` | Give loading spinner valid status semantics | Plain span carried a prohibited ARIA label |

## Verification and evidence tooling

Audit-only commits added deterministic baseline/current captures, four-width Phase 4 Playwright projects, independent admin slow/error mocks guarded by the explicit E2E flag, baseline/final comparison tooling, and a CI-only `@axe-core/playwright@4.13.0` scan. No new production dependency was added.

Final evidence is stored in:

- `ux-audit/baseline/` — 112 baseline screenshots + manifests
- `ux-audit/reviews/` — three review rounds
- `ux-audit/final/current/` — 112 final screenshots + manifests
- `ux-audit/final/axe-results/` — zero-violation representative scans
- `ux-audit/final/comparison.md` — before/after inventory and overflow/page-error gate
- `ux-audit/final/test-results.md` — final command/gate outcomes
