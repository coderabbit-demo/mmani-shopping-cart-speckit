# Implementation Plan: Account, Wishlist, Persistence and Demo Reset

**Branch**: `005-account-persistence` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

## Summary

First a pure storage module (serialize, defensive parse, adapter with in-memory fallback), which
needs only spec 001's types and runs in its own lane. Then wire it into the store provider and
add `/account`, `/wishlist` and `/demo`, with e2e for rule 5, reloads, reset, corrupt data and
disabled storage, and three page goldens.

## Technical Context

**Language/Version**: TypeScript 7.0.2, React 19.3.1, Next.js 16.4.3 · **Primary Dependencies**: existing set only · **Storage**: browser localStorage key `deskdrop-demo-v1`, in-memory fallback · **Testing**: `node --test` for `lib/persistence.ts`; Playwright for journeys (`addInitScript` to corrupt or disable storage) · **Project Type**: Next.js web application · **Constraints**: no hydration mismatch; password never stored; under 30 files per PR

## Constitution Check

| Principle | Status | Notes |
| --- | --- | --- |
| I. One writer | PASS | Coding Agent writes all files. |
| II. Test-first evidence | PASS | `lib/persistence.ts` is new (mutation-proven); provider changes are guarded by reload e2e that is red on the base. |
| III. Pinned behavior | PASS | PR 9's brief allows adding exactly `account-guest.aria.yml`, `wishlist-empty.aria.yml`, `demo.aria.yml`; earlier goldens unchanged. |
| IV. Scoped changes | PASS | PR 7 about 4 files; PR 9 about 16. |
| VI. Security by default | PASS | Defensive parsing (story 2); session holds name and email only; credentials labeled fixture-only. |
| VII. Brand and accessibility | PASS | CSS modules on tokens; `role="alert"` for sign-in errors. |
| V. Strict gate | PASS | Merge only through `strict-gate.sh`. |
| VIII. No noise | PASS | Enforced by review and judges. |

Post-design re-check: PASS.

## Project Structure

```text
lib/persistence.ts                  # PR 7: STORAGE_KEY, serialize, parseStored, createStorage
tests/persistence.test.mjs          # PR 7
components/store-provider.tsx       # PR 9: load after mount, save on change, hydrated
app/account/page.tsx, components/account-panel.tsx (+ .module.css)
app/wishlist/page.tsx, components/wishlist-view.tsx (+ .module.css)
app/demo/page.tsx, components/demo-reset.tsx (+ .module.css)
tests/e2e/account-persistence.spec.ts
tests/e2e/pages.golden.spec.ts      # add three snapshots
tests/golden/pages/account-guest.aria.yml, wishlist-empty.aria.yml, demo.aria.yml
```

## PR mapping

| Tasks phases | PR | Lane |
| --- | --- | --- |
| Phase 1 (storage module) | PR 7 `feat: persistence module` | B (after PR 2; parallel with PR 6 and PR 8) |
| Phases 2–7 | PR 9 `feat: account, wishlist, persistence and demo reset` | A (after PR 7 and PR 8) |

## Complexity Tracking

No violations.
