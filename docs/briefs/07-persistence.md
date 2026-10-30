# Brief 07 — `feat: persistence module`

**Mode:** brownfield, pure logic, lane B (parallel with PRs 6 and 8). Goldens stay byte-identical. **Jira:** SC-32
**Read first:** `specs/005-account-persistence/spec.md`, `plan.md`, `tasks.md` and `contracts/`; `.specify/memory/constitution.md`; `AGENTS.md`; `docs/BRAND.md` for visual work.

## Tasks in scope (Spec Kit only)

Implement tasks T001–T003 of `specs/005-account-persistence/tasks.md`. Mark each task done in tasks.md as you finish it. Leave tasks outside this range untouched.

## Assumptions (to verify before start)

<!-- The orchestrator re-verifies each line against main right before start-task and rewrites the heading as "verified <date> on main <sha>". -->

- PR 2 is merged; `lib/store.ts` exports `StoreState`, `initialState`, `clampQuantity` and `totals`.
- Nothing in `components/` or `app/` changes in this PR; wiring is PR 9.

## Goal

`lib/persistence.ts` per `contracts/persistence.md`: a versioned snapshot under `deskdrop-demo-v1`, a parser that returns a valid state for any input, and a storage adapter that falls back to memory.

## Pre-flight

Check this brief against the code on `main`. If any assumption is false, or a task needs a file outside ALLOW, stop and report the conflict. Otherwise implement without waiting.

## Golden changes this PR is allowed to make

- None.

## Red-then-green

Brand-new module: exempt; the tests judge proves `tests/persistence.test.mjs` by mutation of each parse rule.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## ALLOW

```
ALLOW: lib/persistence.ts
ALLOW: tests/persistence.test.mjs
ALLOW: specs/005-account-persistence/tasks.md
```

Everything else must not change, in particular `.github/**`, `scripts/golden/**`, `.coderabbit.yaml`, `AGENTS.md`, `.specify/**` and the other files under `specs/`.

## Required checks

- `npm run typecheck`
- `npm test`
- `npm run golden:check`
- `PLAYWRIGHT_PORT=<lane port> npm run test:e2e`

## Report

Changed files with the count, the output of each check, red-then-green evidence, the tasks ticked, and the CLI review status.
