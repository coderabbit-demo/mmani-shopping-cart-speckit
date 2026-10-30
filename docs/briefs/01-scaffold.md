# Brief 01 — `chore: scaffold and QA startup scripts`

**Mode:** greenfield (approved scaffold exception; run with `--plan-first`). No goldens exist. **Jira:** SC-26
**Read first:** `specs/001-catalog-cart-domain/spec.md`, `plan.md`, `tasks.md` and `contracts/`; `.specify/memory/constitution.md`; `AGENTS.md`; `docs/BRAND.md` for visual work.

## Tasks in scope (Spec Kit only)

Implement tasks T001–T008 of `specs/001-catalog-cart-domain/tasks.md`. Mark each task done in tasks.md as you finish it. Leave tasks outside this range untouched.

## Assumptions (verified 2026-10-30 on main 4659e55)


- `main` carries a maintainer-approved boilerplate startup scaffold (4659e55), not Coding Agent work: a dependency-free `package.json` and lockfile, `bootstrap/server.mjs`, `tests/server.test.mjs`, `.gitignore`, and `scripts/qa/setup.sh` / `scripts/qa/start.sh`. There is no `app/`, `lib/`, `tsconfig.json` or `playwright.config.ts`.
- The QA scripts already have the target interface (`npm ci`; `npm run build`, then `exec npm run start -- --port 3100`, both `cd` to the repository root). Keep that interface; change them only if a task requires it.
- CI runs its npm steps because a lockfile exists, skips its e2e steps until `playwright.config.ts` exists, and runs `npm run --if-present golden:check`. CI on 4659e55 is green.
- `main` has the ruleset "main: Golden Framework gate": a PR with resolved threads, merge commits only, and `typecheck`, `unit`, `golden`, `e2e` and `CodeRabbit Security` passing on an up-to-date branch. All four CI job names must keep their names.
- The exact versions in research.md R2 exist on the npm registry (checked 2026-10-30 with `npm view`; lucide-react 1.63.0 confirmed from the reference lockfile because the local npm cache is not readable).
- Node on the orchestrator machine is ≥ 22.6.0; macOS ships bash 3.2, so the QA scripts must not use bash 4 features.

## Goal

Replace the boilerplate with the real Next.js scaffold. From a clean checkout, `scripts/qa/setup.sh` then `scripts/qa/start.sh` serve `/` on `0.0.0.0:3100` with a top-level heading "DeskDrop", and typecheck, unit and e2e commands pass, so the QA Agent environment can be prepared from `main`.

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
ALLOW: bootstrap/**
ALLOW: tests/server.test.mjs
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

`bootstrap/` and `tests/server.test.mjs` must be deleted (the new smoke and script tests replace them). Everything else must not change, in particular `.github/**`, `scripts/golden/**`, `.coderabbit.yaml`, `AGENTS.md`, `.specify/**` and the other files under `specs/`.

## Required checks

- `scripts/qa/setup.sh && scripts/qa/start.sh` then `curl -s localhost:3100/` shows the heading
- `npm run typecheck`
- `npm test`
- `npm run test:e2e`

## Report

Changed files with the count, the output of each check, red-then-green evidence, the tasks ticked, and the CLI review status.
