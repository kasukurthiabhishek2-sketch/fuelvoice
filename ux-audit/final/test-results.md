# Phase 4 final test results

Final product commit under test: 

| Gate | Outcome |
| --- | --- |
| npm ci | success |
| Chromium install | success |
| npm run lint | success |
| npm run typecheck | success |
| npm run build | success |
| product E2E at 375/768/1280/1920 | success |
| 112-state deterministic recapture | success |
| @axe-core/playwright 4.13.0 CI-only install | success |
| Chromium aligned to axe Playwright runtime | success |
| zero-violation axe audit | failure |
| baseline/final screenshot comparison | success |

 is installed only in this audit workflow. It is not added to production dependencies or the application bundle.
