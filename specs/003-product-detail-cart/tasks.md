---
description: "Task list for product detail and cart"
---

# Tasks: Product Detail and Cart

**Input**: `specs/003-product-detail-cart/`

**Tests**: required. **PR**: Phases 1–6 → PR 6. Depends on PR 5 (spec 002).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Foundational — shared components

- [ ] T001 [P] Create `components/quantity-stepper.tsx` and `components/quantity-stepper.module.css` (research.md R2)
- [ ] T002 [P] Create `components/order-summary.tsx` and `components/order-summary.module.css` (research.md R3)

---

## Phase 2: User Story 1 — Choose a color and quantity, add to bag (P1, rule 1)

- [ ] T003 [US1] Write e2e for US1 scenarios 1–7 and the stepper edge cases (digits only; empty field on blur restores the previous value) in `tests/e2e/detail-cart.spec.ts`
- [ ] T004 [US1] Create `app/products/[slug]/page.tsx` (research.md R1) and `components/product-detail.tsx` + `components/product-detail.module.css` per contracts/ui-copy.md

---

## Phase 3: User Story 2 — Manage the bag (P1, rule 2)

- [ ] T005 [US2] Add e2e for US2 scenarios 1–5 to `tests/e2e/detail-cart.spec.ts`
- [ ] T006 [US2] Create `app/cart/page.tsx` and `components/cart-view.tsx` + `components/cart-view.module.css` with lines, the summary, and the empty state gated on `hydrated` (FR-009)

---

## Phase 4: User Story 3 — DESK15 in the bag (P2, rule 3)

- [ ] T007 [US3] Add e2e for US3 scenarios 1–5 and the markup-in-coupon edge case to `tests/e2e/detail-cart.spec.ts`
- [ ] T008 [US3] Add the coupon form, error (via `aria-describedby`) and removal notice (polite live region) to `components/cart-view.tsx`

---

## Phase 5: User Story 4 — Delivery choice and totals (P2, rule 4)

- [ ] T009 [US4] Add e2e for US4 scenarios 1–3 to `tests/e2e/detail-cart.spec.ts` (scenario 3 asserts the URL becomes `/checkout`; the checkout page itself is spec 004)
- [ ] T010 [US4] Add the delivery radio group and the Checkout link to `components/cart-view.tsx`

---

## Phase 6: User Story 5 — Pinned pages (P3)

- [ ] T011 [US5] Add `@golden` aria snapshots of `/products/arc-desk-lamp`, the empty `/cart` and `/cart` with lamp/Sage × 2 to `tests/e2e/pages.golden.spec.ts`
- [ ] T012 [US5] Run `npm run golden:capture:pages`; only the three new files under `tests/golden/pages/` appear; existing page and domain goldens are byte-identical
- [ ] T013 Confirm `components/store-provider.tsx`, `components/shell.tsx` and `app/globals.css` are unchanged (FR-008); run `npm run typecheck`, `npm test`, `npm run golden:check` and `npm run test:e2e`; all pass

---

## Dependencies & Execution Order

Phase 1 → US1 → US2 → US3 and US4 (either order) → US5. T001 and T002 in parallel.
