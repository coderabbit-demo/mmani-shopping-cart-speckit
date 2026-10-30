# Brief 08 — `feat: checkout, receipt and orders`

**Mode:** brownfield feature, lane A (parallel with PR 7). Golden changes allowed as listed. **Jira:** SC-33
**Read first:** `specs/004-checkout-orders/spec.md`, `plan.md`, `tasks.md` and `contracts/`; `.specify/memory/constitution.md`; `AGENTS.md`; `docs/BRAND.md` for visual work.

## Tasks in scope (Spec Kit only)

Implement tasks T001–T014 of `specs/004-checkout-orders/tasks.md`. Mark each task done in tasks.md as you finish it. Leave tasks outside this range untouched.

## Assumptions (to verify before start)

<!-- The orchestrator re-verifies each line against main right before start-task and rewrites the heading as "verified <date> on main <sha>". -->

- PR 6 is merged; `components/order-summary.tsx` takes `totals` and `delivery` props and the cart's Checkout link goes to `/checkout`.
- Playwright `toMatchAriaSnapshot` accepts regex values for the order ID and date (research.md R3).

## Goal

Checkout, receipt and order history per `specs/004-checkout-orders/spec.md`, with e2e proving rules 4 and 6, validation, safe rendering and no field values in URLs or the console.

## Pre-flight

Check this brief against the code on `main`. If any assumption is false, or a task needs a file outside ALLOW, stop and report the conflict. Otherwise implement without waiting.

## Golden changes this PR is allowed to make

- Add `tests/golden/pages/checkout.aria.yml`, `checkout-success.aria.yml`, `orders-empty.aria.yml`. All other goldens byte-identical.

## Red-then-green

Rule and validation e2e fail on `main` and pass on the head; `lib/checkout-validation.ts` is new and proven by mutation.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## ALLOW

```
ALLOW: lib/checkout-validation.ts
ALLOW: app/checkout/**
ALLOW: app/orders/page.tsx
ALLOW: components/checkout-view.tsx
ALLOW: components/checkout-view.module.css
ALLOW: components/receipt.tsx
ALLOW: components/receipt.module.css
ALLOW: components/order-history.tsx
ALLOW: components/order-history.module.css
ALLOW: tests/checkout-validation.test.mjs
ALLOW: tests/e2e/checkout-orders.spec.ts
ALLOW: tests/e2e/checkout-security.spec.ts
ALLOW: tests/e2e/pages.golden.spec.ts
ALLOW: tests/golden/pages/checkout.aria.yml
ALLOW: tests/golden/pages/checkout-success.aria.yml
ALLOW: tests/golden/pages/orders-empty.aria.yml
ALLOW: specs/004-checkout-orders/tasks.md
```

Everything else must not change, in particular `.github/**`, `scripts/golden/**`, `.coderabbit.yaml`, `AGENTS.md`, `.specify/**` and the other files under `specs/`.

## Required checks

- `npm run typecheck`
- `npm test`
- `npm run golden:check`
- `PLAYWRIGHT_PORT=<lane port> npm run test:e2e`

## Report

Changed files with the count, the output of each check, red-then-green evidence, the tasks ticked, and the CLI review status.
