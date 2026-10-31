# Brief 09b — `test: make the checkout-success golden independent of the route announcer`

**Mode:** test fix, lane A, after PR 9. Golden changes allowed as listed. **Jira:** SC-34
**Read first:** `specs/004-checkout-orders/spec.md` (the pinned-pages user story), `specs/001-catalog-cart-domain/contracts/goldens.md`, `.specify/memory/constitution.md`, `AGENTS.md`.

## Tasks in scope

A follow-up to PR 9 (merged as PR #13). It changes no Spec Kit task, and `tasks.md` stays untouched.

This brief is not on `main` yet. Main's CI fails on the flake below, so a docs PR carrying the brief cannot merge first. The orchestrator adds this file to `docs/briefs/` in this PR's own branch.

## Assumptions (verified 2026-10-31 on main 24617f6)

- `tests/e2e/pages.golden.spec.ts:84-94` ("@golden checkout success accessible structure"):
  - It places an order and waits for the "Thank you, Alex!" heading.
  - Line 92 then asserts `#__next-route-announcer__` has the text "Thank you, Alex!".
  - It then matches `body` against `checkout-success.aria.yml`, which records `alert: Thank you, Alex!` (line 44).
- Next.js fills that announcer on its own timing after a client navigation. In CI the text is sometimes still empty after the 5 s timeout:
  - docs PR #14 failed twice in a row with `Expected: "Thank you, Alex!"`, `Received: ""`.
  - The same test also failed locally in about 1 of 3 full e2e runs.
- `main`'s own CI passed on 24617f6, so the failure is intermittent rather than constant.

## Goal

The checkout-success golden is deterministic. It pins the receipt page's own accessible structure and does not depend on Next.js's route announcer. Every other golden and test is unchanged.

## Pre-flight

Check this brief against the code on `main`. If any assumption is false, or the fix needs a file outside ALLOW, stop and report the conflict. Otherwise implement without waiting.

## Golden changes this PR is allowed to make

- `tests/golden/pages/checkout-success.aria.yml`: remove only the route-announcer node, or narrow what the snapshot covers so the node is excluded. Recapture with `npm run golden:capture:pages`, and explain each changed line in the commit message. Keep the `- /children: deep-equal` strictness. Every other page golden and every domain golden stays byte-identical.

## Red-then-green

There is no product behavior to change. Prove the flake is gone:
- Run the checkout-success golden at least 20 times with `--repeat-each` while the full e2e suite runs in parallel on another port. Report the pass count on main (expect failures) and on the head (expect 20 of 20).
- Show that the golden still fails when the receipt heading text changes, then revert that change.

## ALLOW

```
ALLOW: tests/e2e/pages.golden.spec.ts
ALLOW: tests/golden/pages/checkout-success.aria.yml
ALLOW: docs/briefs/09b-success-golden.md
```

Only the orchestrator writes `docs/briefs/09b-success-golden.md`. Everything else must not change.

## Required checks

- `npm run typecheck`
- `npm test`
- `npm run golden:check`
- `PLAYWRIGHT_PORT=<lane port> npm run test:e2e`

## Report

Changed files, the output of each check, the repeat-run counts, and the golden diff with reasons.
