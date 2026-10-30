# Brief 02 — `feat: catalog and cart domain`

**Mode:** brownfield feature. No goldens exist yet. **Jira:** SC-27
**Read first:** `specs/001-catalog-cart-domain/spec.md`, `plan.md`, `tasks.md` and `contracts/`; `.specify/memory/constitution.md`; `AGENTS.md`; `docs/BRAND.md` for visual work.

## Tasks in scope (Spec Kit only)

Implement tasks T009–T023 of `specs/001-catalog-cart-domain/tasks.md`. Mark each task done in tasks.md as you finish it. Leave tasks outside this range untouched.

## Assumptions (to verify before start)

<!-- The orchestrator re-verifies each line against main right before start-task and rewrites the heading as "verified <date> on main <sha>". -->

- PR 1 is merged: `npm test` runs `node --experimental-strip-types --test tests/*.test.mjs` (`package.json`).
- `tsc --noEmit` rejects `.ts`-suffixed value imports without `allowImportingTsExtensions`; `lib/` files therefore import each other's types only (research.md R1). `tsconfig.json` stays as PR 1 left it.
- `contracts/catalog.json` matches the reference catalog (checked 2026-10-29).

## Goal

`lib/catalog.ts` and `lib/store.ts` implement `contracts/domain-api.md`, and the acceptance tests for spec stories 2–7 prove cart rules 1, 2, 3, 4, 6 and the wishlist part of 5.

## Pre-flight

Check this brief against the code on `main`. If any assumption is false, or a task needs a file outside ALLOW, stop and report the conflict. Otherwise implement without waiting.

## Golden changes this PR is allowed to make

- None.

## Red-then-green

`lib/catalog.ts` and `lib/store.ts` are brand-new modules: exempt; the tests judge proves each test file by mutation.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## ALLOW

```
ALLOW: lib/catalog.ts
ALLOW: lib/store.ts
ALLOW: tests/catalog.test.mjs
ALLOW: tests/cart.test.mjs
ALLOW: tests/coupon.test.mjs
ALLOW: tests/totals.test.mjs
ALLOW: tests/orders.test.mjs
ALLOW: tests/account.test.mjs
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
