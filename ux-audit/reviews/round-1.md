⚠️ DEGRADED: single-context (spawn_agent/Task tool unavailable in this session)

# Brutal review — Round 1

**Scope of score:** completeness and correctness of the Phase 1 audit/remediation plan against the baseline evidence. These are **not** scores for the current shipped product. Product scores belong after implementation.

The requested fresh-context reviewer cannot be spawned from the tools exposed in this session. This review therefore uses the same rubric sequentially and records that limitation rather than pretending independence.

## Scores

| Category | Score | Why it is not 10 |
| --- | ---: | --- |
| Placement and hierarchy | 7/10 | The report correctly finds the home/search competition, but its proposed fix of hiding global Search only on home breaks navigation consistency and is not adequately justified. |
| Component choice | 8/10 | Rating semantics, admin action sizing, false Search badge, and auth recovery are identified, but the report lacks a single inventory showing every important component's role/state/size. |
| Flow efficiency | 8/10 | Baseline click counts are useful, but expected post-change counts are not explicit and the proposed home-header change could make the dedicated search route less discoverable. |
| Consistency | 8/10 | Admin/404 drift and legacy terminology are covered. The plan itself would introduce route-specific header behavior without proving that tradeoff is better. |
| Feedback states | 8/10 | Admin missing loading/error is caught. Baseline evidence does not yet include the visible SearchBar no-results state even though that state exists and is cited from code. |
| Accessibility | 8/10 | Contrast, labels, focus, rating semantics and target sizing are strong findings. Required final axe execution is not yet operationalized and no unavoidable dependency decision is documented. |
| Responsiveness | 9/10 | The two measured overflow defects are concrete and acceptance criteria are good. The report needs explicit per-change visual-diff acceptance, not just final recapture. |
| Microcopy | 9/10 | Location and “likes” wording are caught. Exact replacement wording should be specified before implementation so review is about a defined change rather than taste during coding. |

## Concrete problems, ranked by severity

### Major 1 — The home Search recommendation solves the wrong problem

**Evidence:** `src/components/layout/Header.tsx`, `src/components/landing/Hero.tsx`, `375-home-default-signed-out.jpg`, `1280-home-default-signed-out.jpg`.

The header Search link and hero combobox are visually concurrent, but they are not identical functions: the header link navigates to a dedicated search workspace; the hero combobox can route directly to a station. Hiding a global navigation item only on `/` violates consistency and removes a predictable route-level affordance.

**Required correction:** classify them as **complementary but competing in emphasis**. Keep the global Search link. Remove the inert “SEARCH” badge inside the hero field, which is the actual false affordance. If visual competition remains after that, reduce home-header Search emphasis without removing its link or accessible name.

**What earns 10:** the report preserves global nav consistency and explains why the two search affordances differ.

### Major 2 — Final accessibility testing is promised but not executable yet

The user explicitly required an automated axe scan. The repository does not currently contain `axe-core` or `@axe-core/playwright`.

**Required correction:** identify `@axe-core/playwright` as the one unavoidable new **dev-only** dependency for the requested Phase 4 scan, unless a no-dependency equivalent is demonstrably already available. Record its purpose and keep it out of production runtime dependencies.

**What earns 10:** the plan names the exact test dependency/tool, test surfaces, failure threshold, and commit/changelog treatment.

### Major 3 — Baseline misses a visual no-results search state

The report correctly notes that `SearchBar` has a visible no-results panel, but Phase 0 evidence currently shows default, results and loading, not a rendered no-results screenshot.

**Required correction:** supplement the baseline with deterministic no-results search capture at all four widths. Because the same component is reused, one dedicated-route no-results scenario is sufficient if the report states why.

**What earns 10:** screenshots and manifests exist for the no-results state before product code changes.

### Moderate 4 — “Every component” evidence is dispersed rather than auditable

The route sections are detailed, but review requires too much cross-reading to verify all important component types, sizes and states.

**Required correction:** add a component inventory appendix covering global nav, SearchBar, nearby station card, station hero, trust panel, filters, rating, review card/actions, review composer, complaint actions, map shell, admin stat/report/review/user components, and 404 actions. Include current size/state evidence and proposed disposition.

### Moderate 5 — Post-change flow expectations are underspecified

The baseline flow table is good, but implementation acceptance should state whether each flow's click count changes.

**Required correction:** add an “expected after” column. Most flows should stay unchanged; signed-out admin body recovery should improve from “look elsewhere for Sign In” to a direct in-context sign-in action without increasing provider steps.

### Moderate 6 — Microcopy changes need exact text

“Clarify location copy” is directionally correct but not deterministic.

**Required correction:** specify exact proposed strings. For example:
- Search supporting copy: “Search by station name, brand, locality, or city. Search does not require precise browser-location permission.”
- Search principle: “Search works without precise location permission.”
- Home nearby copy should continue to state that ordering may use an approximate area and that precise location is opt-in.
- User profile statistic should not rename a stored counter to a meaning that cannot be proven. If `likeCount` semantically represents legacy likes rather than helpful reactions, label it neutrally or leave it unchanged and put semantic migration in Needs my decision.

### Moderate 7 — Per-change screenshot diff contract needs teeth

The user required reverting a change if unintended areas differ.

**Required correction:** define, for each implementation commit, which scenario names are expected to change and which are expected to remain pixel/geometry-stable. Store after screenshots by change id and record reviewed unexpected differences rather than merely saying “recapture.”

## Verification of previous round issues

Not applicable. This is Round 1.

## What a 10/10 plan requires

The next report revision must preserve global navigation, add no-results baseline evidence, name the axe test mechanism/dependency, add a compact component inventory, define exact microcopy, specify expected flow-count changes, and define per-change screenshot-diff allowlists. No score should rise because prose became longer; it should rise only when the plan becomes mechanically verifiable.
