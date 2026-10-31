# Brief 10b — `test: assert two quick-adds give one bag line`

**Mode:** test-only coverage, lane B. Goldens stay byte-identical. **Jira:** SC-30 (convergence follow-up to PR 5, the storefront)
**Read first:** `specs/002-storefront-browse/spec.md` (US2), `specs/002-storefront-browse/tasks.md`, `.specify/memory/constitution.md`, `AGENTS.md`.

## Tasks in scope

Implement T023 of `specs/002-storefront-browse/tasks.md` (Phase 8: Convergence), which `/speckit-converge` appended on main 4402649. Mark it done when finished. Leave every other task untouched.

This brief takes T023 over from `docs/briefs/10-convergence.md`, which combined two features against constitution IV. The orchestrator commits this file in this PR's branch.

## Assumptions (verified 2026-10-31 on main a8e9e4f)

- `tests/e2e/storefront.spec.ts:57-64` quick-adds the Arc desk lamp twice and asserts only "Bag (2)". No test asserts the result is one Terracotta line at quantity 2 (US2/AC1: "one line, Terracotta × 2").
- The code already behaves correctly: `components/product-card.tsx` quick-adds the product's first colour through `useStore().addItem`, and `lib/store.ts` merges lines with the same product and colour.
- The same test routes `**/products/arc-desk-lamp` to a 404; `/cart` is not routed, so the bag page can be visited from it.

## Why red-then-green does not apply

Constitution II requires red-then-green for a *regression guard*, a test that guards a bug fix. This PR fixes no bug and changes no product code: it adds a missing assertion for behavior that already meets US2/AC1, so the test passes on the base by design. It satisfies constitution II's first two rules (an observable-behavior test that maps the acceptance scenario). Its strength is proven by mutation instead, as below. If you still read this as a conflict, stop and report it; do not change product code to manufacture a red.

## Goal

The storefront e2e proves that two quick-adds of the Arc desk lamp give exactly one bag line, colour Terracotta, quantity 2. No product code changes.

## Deliverables

1. `tests/e2e/storefront.spec.ts`: after the two quick-adds, assert the bag holds exactly one Arc desk lamp line, colour Terracotta, quantity 2. Keep the rest of the test's flow and assertions.

## Golden changes this PR is allowed to make

None. Every domain and page golden stays byte-identical.

## Mutation proof

Show the new assertion fails when `components/product-card.tsx` quick-adds the second colour instead of the first, and when the second quick-add uses a different colour from the first. Revert both mutations; neither may be in the patch.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## ALLOW

```
ALLOW: tests/e2e/storefront.spec.ts
ALLOW: specs/002-storefront-browse/tasks.md
ALLOW: docs/briefs/10b-quickadd-line.md
```

Only the orchestrator writes `docs/briefs/10b-quickadd-line.md`. Every other file must not change.

## Required checks

- `npm run typecheck`
- `npm test`
- `npm run golden:check`
- `PLAYWRIGHT_PORT=<lane port> npm run test:e2e`

## Report

Changed files with the count, the output of each check, the mutation evidence, and the CLI review status.
