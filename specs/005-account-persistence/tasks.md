---
description: "Task list for account, wishlist, persistence and demo reset"
---

# Tasks: Account, Wishlist, Persistence and Demo Reset

**Input**: `specs/005-account-persistence/`

**Tests**: required. **PRs**: Phase 1 → PR 7 (lane B; needs only PR 2) · Phases 2–7 → PR 9 (needs PR 7 and PR 8).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Foundational — storage module (US2 logic) · PR 7

- [x] T001 [US2] Write `tests/persistence.test.mjs`: round-trip of a full state; every corrupt case in US2 scenarios 1, 2, 4 and 5 and research.md R2 (non-string, oversize, invalid JSON, wrong version, each bad field including every order and session field); `couponNotice` not restored; `createStorage` falls back to memory when the getter or any call throws, and `save` then `load` returns the value; no password in the serialized output of a signed-in state
- [x] T002 [US2] Create `lib/persistence.ts` per contracts/persistence.md
- [x] T003 Run `npm run typecheck`, `npm test` and `npm run golden:check`; all pass

---

## Phase 2: User Story 1 — Survive a reload (P1) · PR 9

- [x] T004 [US1] Write e2e for US1 scenarios 1–4 in `tests/e2e/account-persistence.spec.ts`, including reloads of `/cart`, `/checkout` and `/checkout/success` asserting "Your bag is empty." and "No recent order." never appear
- [x] T005 [US1] Update `components/store-provider.tsx`: load after mount, save after changes once hydrated, set `hydrated`, and make `resetAll()` clear storage and skip the next save (research.md R1); member signatures unchanged

---

## Phase 3: User Story 2 — Bad or missing storage in the browser (P1) · PR 9

- [x] T006 [US2] Add e2e for US2 scenarios 1–5 to `tests/e2e/account-persistence.spec.ts` (research.md R4), including the full journey with storage disabled

---

## Phase 4: User Story 3 — Sign in and keep the wishlist (P1, rule 5) · PR 9

- [x] T007 [US3] Add e2e for US3 scenarios 1–7 to `tests/e2e/account-persistence.spec.ts`
- [x] T008 [US3] Create `app/account/page.tsx` and `components/account-panel.tsx` + `.module.css` per contracts/ui-copy.md, with `method="post"` and submit disabled until `hydrated` (FR-009)

---

## Phase 5: User Story 4 — Wishlist page (P2) · PR 9

- [x] T009 [US4] Add e2e for US4 scenarios 1–2 to `tests/e2e/account-persistence.spec.ts`
- [x] T010 [US4] Create `app/wishlist/page.tsx` and `components/wishlist-view.tsx` + `.module.css`, reusing `components/product-card.tsx` without editing it

---

## Phase 6: User Story 5 — Reset the demo (P2) · PR 9

- [x] T011 [US5] Add e2e for US5 scenarios 1–2 to `tests/e2e/account-persistence.spec.ts` (accept and dismiss the dialog; after reset, the key is still absent after one more navigation)
- [x] T012 [US5] Create `app/demo/page.tsx` and `components/demo-reset.tsx` + `.module.css` (calls `resetAll()` only; the provider clears storage)

---

## Phase 7: User Story 6 — Pinned pages (P3) · PR 9

- [x] T013 [US6] Add `@golden` aria snapshots of guest `/account`, empty `/wishlist` and `/demo` to `tests/e2e/pages.golden.spec.ts`
- [x] T014 [US6] Run `npm run golden:capture:pages`; only the three new files appear; every earlier golden is byte-identical
- [x] T015 Run `npm run typecheck`, `npm test`, `npm run golden:check` and `npm run test:e2e`; all pass

---

## Dependencies & Execution Order

PR 7 (Phase 1) any time after PR 2. PR 9: T004–T005 first (persistence wiring), then US2, US3, US4, US5 in any order, US6 last.
