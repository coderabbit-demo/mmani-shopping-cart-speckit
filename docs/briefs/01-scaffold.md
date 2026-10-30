# Brief 01 — `chore: scaffold and QA startup scripts`

**Mode:** greenfield (approved scaffold exception; run with `--plan-first`). No goldens exist. **Jira:** SC-26
**Read first:** `specs/001-catalog-cart-domain/spec.md`, `plan.md`, `tasks.md` and `contracts/`; `.specify/memory/constitution.md`; `AGENTS.md`; `docs/BRAND.md` for visual work.

## Tasks in scope (Spec Kit only)

Implement tasks T001–T008 of `specs/001-catalog-cart-domain/tasks.md`. Mark each task done in tasks.md as you finish it. Leave tasks outside this range untouched.

## Assumptions (to verify before start)

<!-- The orchestrator re-verifies each line against main right before start-task and rewrites the heading as "verified <date> on main <sha>". -->

- `main` holds only docs and config: no `package.json`, `app/`, `lib/` or `tests/`.
- CI (`.github/workflows/ci.yml`) skips its npm steps until `package-lock.json` exists, and its e2e steps until `playwright.config.ts` exists; it runs `npm run --if-present golden:check`.
- The exact versions in research.md R2 exist on the npm registry (checked 2026-10-30 with `npm view`; lucide-react 1.63.0 confirmed from the reference lockfile because the local npm cache is not readable).
- Node on the orchestrator machine is ≥ 22.6.0; macOS ships bash 3.2, so the QA scripts must not use bash 4 features.

## Goal

From a clean checkout, `scripts/qa/setup.sh` then `scripts/qa/start.sh` serve `/` on `0.0.0.0:3100` with a top-level heading "DeskDrop", and typecheck, unit and e2e commands pass, so the QA Agent environment can be prepared from `main`.

## Pre-flight

Check this brief against the code on `main`. If any assumption is false, or a task needs a file outside ALLOW, stop and report the conflict. Otherwise implement without waiting.

## Golden changes this PR is allowed to make

- None. Do not create `tests/golden/`.

## Red-then-green

Brand-new repository: exempt. The tests judge proves `tests/qa-scripts.test.mjs` and `tests/e2e/smoke.spec.ts` by mutation.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## ALLOW

```
ALLOW: package.json
ALLOW: package-lock.json
ALLOW: tsconfig.json
ALLOW: next.config.ts
ALLOW: next-env.d.ts
ALLOW: .gitignore
ALLOW: README.md
ALLOW: app/layout.tsx
ALLOW: app/page.tsx
ALLOW: scripts/qa/setup.sh
ALLOW: scripts/qa/start.sh
ALLOW: playwright.config.ts
ALLOW: tests/qa-scripts.test.mjs
ALLOW: tests/e2e/smoke.spec.ts
ALLOW: specs/001-catalog-cart-domain/tasks.md
```

Everything else must not change, in particular `.github/**`, `scripts/golden/**`, `.coderabbit.yaml`, `AGENTS.md`, `.specify/**` and the other files under `specs/`.

## Required checks

- `scripts/qa/setup.sh && scripts/qa/start.sh` then `curl -s localhost:3100/` shows the heading
- `npm run typecheck`
- `npm test`
- `npm run test:e2e`

## Report

Changed files with the count, the output of each check, red-then-green evidence, the tasks ticked, and the CLI review status.
