# UX audit Phase 0 baseline

Product baseline: 

Screenshots are deterministic Playwright captures using the repository's explicit E2E mock flag and mocked external station/geocoding sources. Product code is unchanged relative to the baseline commit; only the audit harness/workflow exists on the audit branch.

Widths: 375, 768, 1280, 1920 px.

State coverage includes signed-out/signed-in, autocomplete focus/results, hover, nearby loading/empty/error, station loading/error, review form and validation, admin authorization states, and 404.

Each  records first-viewport elements and their bounding boxes, focus state, horizontal overflow, console errors, and page errors. This is used to audit what is visible together without relying on memory.
