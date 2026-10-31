# Brief 04 — `test: pin domain goldens`

**Mode:** behavior pin, lane B (parallel with PR 5). Golden changes allowed as listed. **Jira:** SC-29
**Read first:** `specs/001-catalog-cart-domain/spec.md`, `plan.md`, `tasks.md` and `contracts/`; `.specify/memory/constitution.md`; `AGENTS.md`; `docs/BRAND.md` for visual work.

## Tasks in scope (Spec Kit only)

Implement tasks T029–T031 of `specs/001-catalog-cart-domain/tasks.md`. Mark each task done in tasks.md as you finish it. Leave tasks outside this range untouched.

## Assumptions (verified 2026-10-31 on main 8430cfb)

<!-- The orchestrator re-verifies each line against main right before start-task and rewrites the heading as "verified <date> on main <sha>". -->

- PRs 2 and 3 are merged; `scripts/goldens/scenarios.mjs` exports an empty `scenarios` array.
- `npm run golden:check` exits 0 with no `tests/golden/domain/`.

## Goal

Every required scenario in `contracts/goldens.md` is captured and checked in CI, so later PRs cannot change domain outputs unnoticed.

## Pre-flight

Check this brief against the code on `main`. If any assumption is false, or a task needs a file outside ALLOW, stop and report the conflict. Otherwise implement without waiting.

## Golden changes this PR is allowed to make

- Add `tests/golden/domain/<scenario>.json` for exactly the 15 scenarios in `contracts/goldens.md`, plus `MANIFEST.sha256` and `BASELINE`. Nothing else under `tests/golden/`.

## Red-then-green

The scenario-name test in `tests/goldens-harness.test.mjs` must fail on `main` (no scenarios) and pass on the head. Also show that `golden:check` fails after a one-cent change to the DESK15 rate, then revert.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## ALLOW

```
ALLOW: scripts/goldens/scenarios.mjs
ALLOW: tests/goldens-harness.test.mjs
ALLOW: tests/golden/domain/**
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
