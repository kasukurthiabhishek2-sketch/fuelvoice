⚠️ DEGRADED: single-context (spawn_agent/Task tool unavailable in this session)

# Brutal review — Round 2

**Scope of score:** audit/remediation-plan coverage, not the current product.  
**Rubric:** Nielsen heuristics, WCAG 2.2, responsive/product interaction norms, and the user's required test process.

## Verification of Round 1 issues

| Round 1 issue | Verified status | Evidence |
| --- | --- | --- |
| Do not hide global Search only on home | **Fixed** | Report now classifies header Search + hero combobox as complementary and keeps global nav stable. |
| Make axe testing executable | **Fixed with one remaining gate issue** | Report names `@axe-core/playwright` as dev-only and defines tested surfaces. Failure threshold is still too permissive. |
| Capture search no-results state | **In progress, not yet verified** | Deterministic `search-no-results` scenario has been added to the baseline harness; GitHub Actions must finish and commit the renders before this can be closed. |
| Add component inventory | **Fixed** | Section 15 provides role/size/state/disposition across global, public, review, complaint, admin and 404 components. |
| Define post-change flow impact | **Fixed** | Section 16 explicitly states expected click-count changes. |
| Specify exact microcopy | **Fixed** | Location strings are exact; uncertain legacy `likeCount` semantics were correctly moved out of the implementation scope. |
| Define screenshot-diff allowlists | **Fixed** | Section 18 defines expected scenario families per change. |

## Scores

| Category | Score | Remaining reason |
| --- | ---: | --- |
| Placement and hierarchy | 10/10 | Global navigation is preserved; false affordance is isolated as the actual problem. |
| Component choice | 10/10 | Inventory and semantic changes are concrete without replacing working primitives for fashion. |
| Flow efficiency | 10/10 | Baseline and expected-after click counts are explicit; no approved change adds friction. |
| Consistency | 10/10 | Public/admin/404 drift and terminology uncertainty are either addressed or correctly put behind a decision boundary. |
| Feedback states | 9/10 | Admin loading/error remediation is still described too globally; three independent datasets need independent state/retry behavior. |
| Accessibility | 9/10 | Axe is operationalized, but “fail serious/critical” would allow real moderate WCAG violations through. |
| Responsiveness | 10/10 | Measured defects and no-overflow acceptance criteria are precise, and screenshot allowlists prevent accidental collateral layout changes. |
| Microcopy | 10/10 | Exact replacement copy is specified and unsupported semantic relabelling was removed. |

## Remaining concrete problems

### Major 1 — Admin data feedback must be section-specific

Admin has three independent queries: reviews, reports and users. A single global error/loading gate would throw away useful successful data when only one query fails.

**Required correction:** the report must require independent loading/error/success/empty handling per dataset:
- stats must distinguish loading from a real zero;
- Pending Reports can retry reports without suppressing reviews/users;
- Recent Reviews can retry reviews independently;
- Users can retry users independently.

The retry operation may call the existing query `refetch`/invalidate mechanics; it must not change API contracts.

**What earns 10:** each admin dataset has a defined state machine and recovery target.

### Major 2 — Axe gate must not knowingly permit violations by severity label

Axe severity is useful triage, not a license to leave moderate accessibility violations in the tested surfaces.

**Required correction:** final test fails on **any axe violation** in the audited states unless the finding is demonstrated to be a false positive or explicitly placed in “needs my decision” with evidence. Serious/critical findings should still be highlighted as release blockers, but moderate/minor findings cannot silently pass.

**What earns 10:** zero unexplained axe violations in the audited final states.

### Major 3 — Phase 4 edge cases are not yet a mechanical test matrix

The user explicitly required slow network, rapid repeated clicks, refresh mid-flow, and browser back/forward. The report says these will be run but does not say where or what must remain true.

**Required correction:** add a final matrix with:
- slow external station/search responses: loading feedback remains stable and no duplicate request-driven UI;
- repeated publish/reaction/moderation click: pending controls prevent duplicate mutation where the current mutation API already exposes pending state; do not alter business contracts;
- refresh on station/review/admin routes: route reconstructs or shows explicit auth/data loading, never blank;
- Back/Forward after home/search → station: correct route/history without client exception;
- keyboard-only: header → search → results → station actions → review controls → complaint links, visible focus throughout;
- 375/768/1280/1920 for the primary flows.

### Moderate 4 — Phase 3 command gate should be explicit

“Run tests after each change” needs an exact command contract so individual commits cannot quietly skip a check.

**Required correction:** after every product commit, require `npm run lint`, `npm run typecheck`, `npm run build`, and existing Playwright tests. Use pull-request CI as the authoritative remote execution record in this environment, plus the per-change four-width capture.

### Moderate 5 — No-results baseline must actually land

The scenario exists in code but the evidence is not yet committed. Do not award the report a finished evidence count until the run succeeds.

## What earns the next all-10 review

1. The supplemental no-results run is green and its screenshots/manifests are present.
2. Admin feedback is specified per query/section.
3. Axe final gate is zero unexplained violations.
4. The Phase 4 edge-case matrix is explicit.
5. The per-commit command/CI gate is explicit.

Nothing else in the current remediation plan needs broader redesign. Do not invent more visual changes simply to justify another round.
