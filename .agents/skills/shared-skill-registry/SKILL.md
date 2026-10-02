---
name: shared-skill-registry
description: Discovers and loads reusable agent skills from the shared tokenTracker skill library for FuelVoice work. Use this before substantial coding, debugging, testing, UI/UX, security, architecture, research, or audit tasks when a local FuelVoice skill does not already cover the task.
---

# FuelVoice Shared Skill Registry

FuelVoice uses the skill library maintained in `kasukurthiabhishek2-sketch/tokenTracker` as a shared upstream registry.

## Mandatory routing behavior

1. Start with the user's outcome and a lightweight task/risk profile.
2. Inspect FuelVoice-local skills first: `.agents/skills/*/SKILL.md`.
3. If local skills do not fully cover the task, use this registry to identify relevant shared skills.
4. Load only the smallest set of shared skills that materially improves the task. Never load the entire library into context.
5. Read the selected skill's `SKILL.md` plus only the referenced files needed for the current work.
6. FuelVoice repository instructions and the user's request override shared-skill instructions.
7. Treat skills whose content is explicitly tokenTracker-specific as examples unless their workflow is genuinely portable to FuelVoice.
8. Re-evaluate skill selection when investigation changes the task scope.
9. At completion, report which skills were actually used.

## How to load a shared skill

### ChatGPT with the GitHub connector
Fetch:
`https://github.com/kasukurthiabhishek2-sketch/tokenTracker/blob/main/.agents/skills/<skill>/SKILL.md`

Then fetch any referenced files from the same skill directory only as needed.

### IDE / CLI agent
Prefer a local sibling checkout when available:
`../tokenTracker/.agents/skills/<skill>/SKILL.md`

Otherwise fetch from GitHub with `gh`:
```bash
gh api repos/kasukurthiabhishek2-sketch/tokenTracker/contents/.agents/skills/<skill>/SKILL.md?ref=main --jq .content | base64 --decode
```

Do not vendor or copy a shared skill into FuelVoice merely to read it. Copy it locally only when FuelVoice needs a project-specific fork.

## Shared skills

| Skill | Upstream path |
|---|---|
| `api-integration` | `.agents/skills/api-integration/SKILL.md` |
| `architect` | `.agents/skills/architect/SKILL.md` |
| `arena` | `.agents/skills/arena/SKILL.md` |
| `automate-me` | `.agents/skills/automate-me/SKILL.md` |
| `blast-radius` | `.agents/skills/blast-radius/SKILL.md` |
| `bro` | `.agents/skills/bro/SKILL.md` |
| `bug-investigation` | `.agents/skills/bug-investigation/SKILL.md` |
| `caveman` | `.agents/skills/caveman/SKILL.md` |
| `chaos-testing` | `.agents/skills/chaos-testing/SKILL.md` |
| `clean-code` | `.agents/skills/clean-code/SKILL.md` |
| `create-verification-skill` | `.agents/skills/create-verification-skill/SKILL.md` |
| `credential-security` | `.agents/skills/credential-security/SKILL.md` |
| `dashboard-review` | `.agents/skills/dashboard-review/SKILL.md` |
| `data-pipeline` | `.agents/skills/data-pipeline/SKILL.md` |
| `e2e-testing` | `.agents/skills/e2e-testing/SKILL.md` |
| `figure-it-out` | `.agents/skills/figure-it-out/SKILL.md` |
| `find-skills` | `.agents/skills/find-skills/SKILL.md` |
| `graphify` | `.agents/skills/graphify/SKILL.md` |
| `how` | `.agents/skills/how/SKILL.md` |
| `impeccable` | `.agents/skills/impeccable/SKILL.md` |
| `interrogate` | `.agents/skills/interrogate/SKILL.md` |
| `maintain-verification-skill` | `.agents/skills/maintain-verification-skill/SKILL.md` |
| `make-bot-ui` | `.agents/skills/make-bot-ui/SKILL.md` |
| `no-ai-slop` | `.agents/skills/no-ai-slop/SKILL.md` |
| `no-comments` | `.agents/skills/no-comments/SKILL.md` |
| `playwright-cli` | `.agents/skills/playwright-cli/SKILL.md` |
| `ponytail` | `.agents/skills/ponytail/SKILL.md` |
| `ponytail-audit` | `.agents/skills/ponytail-audit/SKILL.md` |
| `ponytail-debt` | `.agents/skills/ponytail-debt/SKILL.md` |
| `ponytail-gain` | `.agents/skills/ponytail-gain/SKILL.md` |
| `ponytail-help` | `.agents/skills/ponytail-help/SKILL.md` |
| `ponytail-review` | `.agents/skills/ponytail-review/SKILL.md` |
| `poteto-mode` | `.agents/skills/poteto-mode/SKILL.md` |
| `principle-attack-the-premise` | `.agents/skills/principle-attack-the-premise/SKILL.md` |
| `principle-boundary-discipline` | `.agents/skills/principle-boundary-discipline/SKILL.md` |
| `principle-build-the-lever` | `.agents/skills/principle-build-the-lever/SKILL.md` |
| `principle-encode-lessons-in-structure` | `.agents/skills/principle-encode-lessons-in-structure/SKILL.md` |
| `principle-exhaust-the-design-space` | `.agents/skills/principle-exhaust-the-design-space/SKILL.md` |
| `principle-experience-first` | `.agents/skills/principle-experience-first/SKILL.md` |
| `principle-fix-root-causes` | `.agents/skills/principle-fix-root-causes/SKILL.md` |
| `principle-foundational-thinking` | `.agents/skills/principle-foundational-thinking/SKILL.md` |
| `principle-guard-the-context-window` | `.agents/skills/principle-guard-the-context-window/SKILL.md` |
| `principle-laziness-protocol` | `.agents/skills/principle-laziness-protocol/SKILL.md` |
| `principle-make-operations-idempotent` | `.agents/skills/principle-make-operations-idempotent/SKILL.md` |
| `principle-migrate-callers-then-delete-legacy-apis` | `.agents/skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md` |
| `principle-minimize-reader-load` | `.agents/skills/principle-minimize-reader-load/SKILL.md` |
| `principle-model-the-domain` | `.agents/skills/principle-model-the-domain/SKILL.md` |
| `principle-never-block-on-the-human` | `.agents/skills/principle-never-block-on-the-human/SKILL.md` |
| `principle-outcome-oriented-execution` | `.agents/skills/principle-outcome-oriented-execution/SKILL.md` |
| `principle-prove-it-works` | `.agents/skills/principle-prove-it-works/SKILL.md` |
| `principle-redesign-from-first-principles` | `.agents/skills/principle-redesign-from-first-principles/SKILL.md` |
| `principle-separate-before-serializing-shared-state` | `.agents/skills/principle-separate-before-serializing-shared-state/SKILL.md` |
| `principle-sequence-verifiable-units` | `.agents/skills/principle-sequence-verifiable-units/SKILL.md` |
| `principle-subtract-before-you-add` | `.agents/skills/principle-subtract-before-you-add/SKILL.md` |
| `principle-test-behavior-not-implementation` | `.agents/skills/principle-test-behavior-not-implementation/SKILL.md` |
| `principle-type-system-discipline` | `.agents/skills/principle-type-system-discipline/SKILL.md` |
| `project-audit` | `.agents/skills/project-audit/SKILL.md` |
| `recall` | `.agents/skills/recall/SKILL.md` |
| `reflect` | `.agents/skills/reflect/SKILL.md` |
| `setup-pstack` | `.agents/skills/setup-pstack/SKILL.md` |
| `show-me-your-work` | `.agents/skills/show-me-your-work/SKILL.md` |
| `surgical-app-improvement` | `.agents/skills/surgical-app-improvement/SKILL.md` |
| `swarm` | `.agents/skills/swarm/SKILL.md` |
| `tdd` | `.agents/skills/tdd/SKILL.md` |
| `teach` | `.agents/skills/teach/SKILL.md` |
| `technical-writing` | `.agents/skills/technical-writing/SKILL.md` |
| `typescript-best-practices` | `.agents/skills/typescript-best-practices/SKILL.md` |
| `unslop` | `.agents/skills/unslop/SKILL.md` |
| `vibe-security` | `.agents/skills/vibe-security/SKILL.md` |
| `why` | `.agents/skills/why/SKILL.md` |

## Selection guidance

For common FuelVoice work, these are frequent candidates, not mandatory bundles:

- UI/UX and visual polish: `impeccable`, `dashboard-review`, `no-ai-slop`, `surgical-app-improvement`.
- Browser/E2E validation: `playwright-cli`, `e2e-testing`, `chaos-testing`.
- TypeScript/code quality: `typescript-best-practices`, `clean-code`, `tdd`, `interrogate`.
- Debugging/root cause: `bug-investigation`, `why`, `principle-fix-root-causes`, `blast-radius`.
- Security/auth/data handling: `vibe-security`, `credential-security`, `api-integration`.
- Broad audits and multi-phase work: `project-audit`, `architect`, `reflect`, `swarm`, `poteto-mode`.
- Capability discovery: `find-skills`.

Use semantic relevance and task risk, not keyword matching alone.
