---
description: "Task list for checkout, receipt and orders"
---

# Tasks: Checkout, Receipt and Orders

**Input**: `specs/004-checkout-orders/`

**Tests**: required. **PR**: Phases 1–7 → PR 8. Depends on PR 6 (spec 003).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Foundational — validation

- [x] T001 Write `tests/checkout-validation.test.mjs` covering every row of contracts/validation.md (valid, empty, whitespace-only, too long, non-string), trimming, and `SHIPPING_FIELDS` order
- [x] T002 Create `lib/checkout-validation.ts` per contracts/validation.md and research.md R1

---

## Phase 2: User Story 1 — Place an order (P1)

- [x] T003 [US1] Write e2e for US1 scenarios 1–5 in `tests/e2e/checkout-orders.spec.ts` (reach checkout through quick-add → Bag → Checkout), plus the edge cases: a double click on "Place order" places one order, and changing delivery at checkout changes what the bag shows
- [x] T004 [US1] Create `app/checkout/page.tsx` and `components/checkout-view.tsx` + `.module.css`: form, delivery radios bound to the store, payment notice, `OrderSummary`, single submission (research.md R2), `method="post"` and submit disabled until `hydrated`, empty state gated on `hydrated` (FR-010)

---

## Phase 3: User Story 2 — Validation (P1)

- [x] T005 [US2] Add e2e for US2 scenarios 1–4 to `tests/e2e/checkout-orders.spec.ts`
- [x] T006 [US2] Wire `validateShipping` into `components/checkout-view.tsx`: inline errors via `aria-describedby`, `aria-invalid`, focus to the first invalid field in `SHIPPING_FIELDS` order; a field's error clears on blur once it is valid

---

## Phase 4: User Story 3 — Confirmation and receipt (P1, rules 4 and 6)

- [x] T007 [US3] Add e2e for US3 scenarios 1–3 to `tests/e2e/checkout-orders.spec.ts`
- [x] T008 [US3] Create `app/checkout/success/page.tsx` and `components/receipt.tsx` + `.module.css` reading `state.orders[0]`, rendering "No recent order." only once `hydrated`

---

## Phase 5: User Story 4 — Order history (P2, rule 6)

- [x] T009 [US4] Add e2e for US4 scenarios 1–3 to `tests/e2e/checkout-orders.spec.ts`
- [x] T010 [US4] Create `app/orders/page.tsx` and `components/order-history.tsx` + `.module.css`

---

## Phase 6: User Story 5 — Safe handling of input (P2)

- [x] T011 [US5] Write `tests/e2e/checkout-security.spec.ts` for US5 scenarios 1–2 with benign markers (research.md R4)

---

## Phase 7: User Story 6 — Pinned pages (P3)

- [x] T012 [US6] Add `@golden` aria snapshots of `/checkout`, `/checkout/success` and the empty `/orders` to `tests/e2e/pages.golden.spec.ts` (research.md R3)
- [x] T013 [US6] Run `npm run golden:capture:pages`; only the three new files appear; other goldens are byte-identical
- [x] T014 Run `npm run typecheck`, `npm test`, `npm run golden:check` and `npm run test:e2e`; all pass

---

## Dependencies & Execution Order

Phase 1 → US1 → US2 → US3 → US4; US5 after US3; US6 last.
