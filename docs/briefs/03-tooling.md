# Brief 03 — `chore: golden harness and contrast helper`

**Mode:** brownfield tooling, lane B (parallel with PR 2). No goldens exist yet. **Jira:** SC-28
**Read first:** `specs/001-catalog-cart-domain/spec.md`, `plan.md`, `tasks.md` and `contracts/`; `.specify/memory/constitution.md`; `AGENTS.md`; `docs/BRAND.md` for visual work.

## Tasks in scope (Spec Kit only)

Implement tasks T024–T028 of `specs/001-catalog-cart-domain/tasks.md`. Mark each task done in tasks.md as you finish it. Leave tasks outside this range untouched.

## Assumptions (to verify before start)

<!-- The orchestrator re-verifies each line against main right before start-task and rewrites the heading as "verified <date> on main <sha>". -->

- PR 1 is merged; PR 2 may not be. Nothing here may import `lib/store.ts` or `lib/catalog.ts`.
- `scripts/golden/` holds the orchestrator's gate scripts; golden tooling goes in `scripts/goldens/`.
- CI runs `npm run --if-present golden:check`, so adding the script makes the golden job live.

## Goal

The golden harness in `contracts/goldens.md` works with an empty scenario list, the npm scripts exist, and `lib/contrast.ts` computes WCAG ratios for spec 002's contrast e2e.

## Pre-flight

Check this brief against the code on `main`. If any assumption is false, or a task needs a file outside ALLOW, stop and report the conflict. Otherwise implement without waiting.

## Golden changes this PR is allowed to make

- None. `tests/golden/` must not exist after this PR.

## Red-then-green

Brand-new modules: exempt; proven by mutation.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## ALLOW

```
ALLOW: scripts/goldens/capture.mjs
ALLOW: scripts/goldens/scenarios.mjs
ALLOW: lib/contrast.ts
ALLOW: tests/goldens-harness.test.mjs
ALLOW: tests/contrast.test.mjs
ALLOW: package.json
ALLOW: specs/001-catalog-cart-domain/tasks.md
```

Everything else must not change, in particular `.github/**`, `scripts/golden/**`, `.coderabbit.yaml`, `AGENTS.md`, `.specify/**` and the other files under `specs/`.

## Required checks

- `npm run typecheck`
- `npm test`
- `npm run golden:check`
- `PLAYWRIGHT_PORT=<lane port> npm run test:e2e`

## Report

Changed files with the count, the output of each check, red-then-green evidence, the tasks ticked, and the CLI review status.
