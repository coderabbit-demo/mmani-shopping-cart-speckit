# Brief 10 — `fix: keep the demo key removed after reset and pin the quick-add bag line`

**Mode:** fix, lane A, after PR 9b. Goldens stay byte-identical. **Jira:** none (convergence follow-up)
**Read first:** `specs/005-account-persistence/spec.md` (US5), `specs/005-account-persistence/research.md` (R1), `specs/002-storefront-browse/spec.md` (US2), both features' `tasks.md`, `.specify/memory/constitution.md`, `AGENTS.md`.

## Tasks in scope

Implement T016 of `specs/005-account-persistence/tasks.md` and T023 of `specs/002-storefront-browse/tasks.md`. `/speckit-converge` appended both on main 4402649. Mark each task done as you finish it. Leave every other task untouched.

## Assumptions (verified 2026-10-31 on docs/converge 77c8114, code identical to main 4402649)

- `components/store-provider.tsx:35-40`: the hydration effect always runs `setState(parseStored(storage.current.load(), products, domain))`, even when `load()` returned `null`.
- `components/store-provider.tsx:41-45`: the save effect skips only when `state === skippedState.current`. After a full reload `skippedState` is `null`, so the restored initial state is saved.
- Result: after "Reset demo data" a `page.reload()` writes `deskdrop-demo-v1` back with no shopper change. A first visit does the same. Research R1 says "the key stays removed until the shopper changes something".
- `lib/persistence.ts:115`: `load()` returns `null` when the key is absent.
- `tests/e2e/account-persistence.spec.ts:226-229` asserts the key is null after reset only across client-side link navigation, never after `page.reload()`.
- `tests/e2e/account-persistence.spec.ts:160-166` (invalid JSON) expects a save only after the shopper adds an item. Lines 70-79 read the key after a reload that follows real changes. Neither depends on a save with no change.
- `tests/e2e/storefront.spec.ts:57-64` quick-adds the Arc desk lamp twice and asserts only "Bag (2)". No test asserts that the result is one Terracotta line at quantity 2 (US2/AC1).

## Goal

After a reset, the stored key stays absent across full reloads until the shopper changes state, and a first visit stores nothing until a change. The storefront test proves two quick-adds give one bag line, Terracotta × 2. Shopper-visible behavior is otherwise unchanged.

## Deliverables

1. `components/store-provider.tsx`: when `storage.current.load()` returns `null`, do not save the restored state. The next real state change saves as today. Keep the existing reset skip. Keep the change minimal: no new exports, no change to `lib/persistence.ts`.
2. `tests/e2e/account-persistence.spec.ts`: in the reset test, after the key is asserted null, call `page.reload()`, wait for the hydrated page ("Bag (0)"), and assert the key is still null. Then make one change (for example add an item) and assert the key is written again.
3. `tests/e2e/storefront.spec.ts`: after the two quick-adds, assert the bag holds exactly one Arc desk lamp line, colour Terracotta, quantity 2. Keep the rest of the test's flow and assertions.

## Golden changes this PR is allowed to make

None. Every domain and page golden stays byte-identical.

## Red-then-green

- The new reload assertion in `account-persistence.spec.ts` must fail on main 4402649 and pass on the head.
- The new storefront assertion is a coverage guard on code that already behaves correctly. Show it fails when `components/product-card.tsx` quick-adds the second colour instead of the first, then revert that mutation.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## ALLOW

```
ALLOW: components/store-provider.tsx
ALLOW: tests/e2e/account-persistence.spec.ts
ALLOW: tests/e2e/storefront.spec.ts
ALLOW: specs/005-account-persistence/tasks.md
ALLOW: specs/002-storefront-browse/tasks.md
```

`lib/persistence.ts`, the shell, every golden and every other file must not change.

## Required checks

- `npm run typecheck`
- `npm test`
- `npm run golden:check`
- `PLAYWRIGHT_PORT=<lane port> npm run test:e2e`

## Report

Changed files with the count, the output of each check, red-then-green evidence, and the CLI review status.
