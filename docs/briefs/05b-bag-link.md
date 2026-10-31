# Brief 05b — `fix: point the header bag link at /cart`

**Mode:** bug fix, lane A, before PR 6. Golden changes allowed as listed. **Jira:** SC-30
**Read first:** `specs/002-storefront-browse/spec.md`, `specs/003-product-detail-cart/spec.md` (FR-004, FR-008 and the Assumptions section), `.specify/memory/constitution.md`, `AGENTS.md`.

## Tasks in scope

A follow-up to PR 5 (merged as PR #7). It changes no Spec Kit task, and `tasks.md` stays untouched.

## Assumptions (verified 2026-10-31 on main 9cb7b05)

- The header bag link points to `/bag` (`components/shell.tsx:53`). Both page goldens record that link as `/url: /bag` (`tests/golden/pages/home.aria.yml:15`, `tests/golden/pages/not-found.aria.yml:15`).
- Spec 003 serves the bag at `/cart` and reaches it through in-app links (spec 003 Assumptions; FR-004). Spec 003 FR-008 forbids PR 6 from changing `components/shell.tsx`, so the link must be corrected first, in this PR.
- `tests/e2e/storefront.spec.ts:137` lists `["Bag (1)", "/bag"]` in the synthetic-404 navigation test and routes `/bag` with `page.route`.

## Goal

The header "Bag (<n>)" link points to `/cart`. No other behavior changes.

## Pre-flight

Check this brief against the code on `main`. If any assumption is false, or a task needs a file outside ALLOW, stop and report the conflict. Otherwise implement without waiting.

## Golden changes this PR is allowed to make

- In `home.aria.yml` and `not-found.aria.yml`, change only the bag link's `/url: /bag` to `/url: /cart`. Recapture with `npm run golden:capture:pages`. All other lines and all domain goldens stay byte-identical.

## Red-then-green

`tests/e2e/storefront.spec.ts`: assert that the header bag link's `href` is `/cart`. It must be red on main and green on the head. Update line 137 to `/cart`, and add `cart` to that test's `page.route` matcher (`/\/(wishlist|orders|account|bag)(?:\?|$)/`). There is no `/cart` route before PR 6, so without the matcher change the click would not be rewritten to `/`.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit.

## ALLOW

```
ALLOW: components/shell.tsx
ALLOW: tests/e2e/storefront.spec.ts
ALLOW: tests/golden/pages/home.aria.yml
ALLOW: tests/golden/pages/not-found.aria.yml
```

Everything else must not change.

## Required checks

- `npm run typecheck`
- `npm test`
- `npm run golden:check`
- `PLAYWRIGHT_PORT=<lane port> npm run test:e2e`

## Report

Changed files with the count, the output of each check, red-then-green evidence, and the golden diff.
