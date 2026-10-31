# Brief 06 — `feat: product detail and cart`

**Mode:** brownfield feature, lane A (parallel with PR 7). Golden changes allowed as listed. **Jira:** SC-31
**Read first:** `specs/003-product-detail-cart/spec.md`, `plan.md`, `tasks.md` and `contracts/`; `.specify/memory/constitution.md`; `AGENTS.md`; `docs/BRAND.md` for visual work.

## Tasks in scope (Spec Kit only)

Implement tasks T001–T013 of `specs/003-product-detail-cart/tasks.md`. Mark each task done in tasks.md as you finish it. Leave tasks outside this range untouched.

## Assumptions (to verify before start)

<!-- The orchestrator re-verifies each line against main right before start-task and rewrites the heading as "verified <date> on main <sha>". -->

- PR 5 is merged; `useStore()` exposes every member in `specs/002-storefront-browse/contracts/store-provider.md`.
- Next.js 16.4.3 passes route `params` as a Promise (research.md R1).
- PR 5b is merged: the header "Bag (<n>)" link points to `/cart` (`components/shell.tsx`), so e2e can reach `/cart` through it without changing the shell (FR-008).

## Goal

`/products/[slug]` and `/cart` per `specs/003-product-detail-cart/spec.md`, with e2e proving cart rules 1–4 in the browser.

## Pre-flight

Check this brief against the code on `main`. If any assumption is false, or a task needs a file outside ALLOW, stop and report the conflict. Otherwise implement without waiting.

## Golden changes this PR is allowed to make

- Add `tests/golden/pages/product-arc-desk-lamp.aria.yml`, `cart-empty.aria.yml`, `cart-filled.aria.yml`. All other goldens byte-identical.

## Red-then-green

Rule e2e tests fail on `main` (no routes) and pass on the head; record both runs.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## Storefront tests

Once `/products/arc-desk-lamp` exists, the spec 002 synthetic-404 tests in `tests/e2e/storefront.spec.ts` can no longer reach the not-found view through the lamp link. This PR may edit that file for this purpose only: each test must reach a missing product some other way (for example a `page.route` that returns 404), keep every assertion, and change nothing else. The pre-flight surfaced this conflict.

## ALLOW

```
ALLOW: app/products/**
ALLOW: app/cart/page.tsx
ALLOW: components/product-detail.tsx
ALLOW: components/product-detail.module.css
ALLOW: components/quantity-stepper.tsx
ALLOW: components/quantity-stepper.module.css
ALLOW: components/cart-view.tsx
ALLOW: components/cart-view.module.css
ALLOW: components/order-summary.tsx
ALLOW: components/order-summary.module.css
ALLOW: tests/e2e/detail-cart.spec.ts
ALLOW: tests/e2e/pages.golden.spec.ts
ALLOW: tests/golden/pages/product-arc-desk-lamp.aria.yml
ALLOW: tests/golden/pages/cart-empty.aria.yml
ALLOW: tests/golden/pages/cart-filled.aria.yml
ALLOW: specs/003-product-detail-cart/tasks.md
ALLOW: tests/e2e/storefront.spec.ts
```

Everything else must not change, in particular `.github/**`, `scripts/golden/**`, `.coderabbit.yaml`, `AGENTS.md`, `.specify/**` and the other files under `specs/`.

## Required checks

- `npm run typecheck`
- `npm test`
- `npm run golden:check`
- `PLAYWRIGHT_PORT=<lane port> npm run test:e2e`

## Report

Changed files with the count, the output of each check, red-then-green evidence, the tasks ticked, and the CLI review status.
