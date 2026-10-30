---
description: "Task list for the catalog and cart domain"
---

# Tasks: Catalog and Cart Domain

**Input**: `specs/001-catalog-cart-domain/` (plan.md, spec.md, research.md, data-model.md, contracts/)

**Tests**: required by the constitution (Principle II). Each test task names the acceptance scenarios it covers; write it before the implementation task it guards.

**PRs**: Phase 1 → PR 1 · Phases 2–8 → PR 2 · Phase 9 → PR 3 · Phase 10 → PR 4 (see plan.md, "PR mapping").

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: the user story from spec.md

---

## Phase 1: Setup — runnable app and QA scripts (US1) · PR 1

**Goal**: the app installs, builds and serves `/` with the "DeskDrop" heading on `0.0.0.0:3100`.

**Independent Test**: `scripts/qa/setup.sh && scripts/qa/start.sh`, then `GET /`.

- [x] T001 [US1] Create `package.json` (name `deskdrop`, `"private": true`, `"type": "module"`, engines `node >=22.6.0`, exact dependency versions from research.md R2, scripts from R3) and generate `package-lock.json` with `npm install`
- [x] T002 [P] [US1] Create `tsconfig.json` (strict, `moduleResolution: "bundler"`, `noEmit`, Next.js plugin), `next.config.ts`, `next-env.d.ts` and `.gitignore` (`node_modules/`, `.next/`, `test-results/`, `playwright-report/`, `artifacts/`)
- [x] T003 [P] [US1] Create unstyled `app/layout.tsx` (`<html lang="en">`, title "DeskDrop") and `app/page.tsx` rendering a single `<h1>DeskDrop</h1>`
- [x] T004 [P] [US1] Create `scripts/qa/setup.sh` (`npm ci`) and `scripts/qa/start.sh` (`npm run build && npm run start -- --port 3100`, binding `0.0.0.0`), both executable, `set -euo pipefail`, changing to the repository root first (research.md R4)
- [x] T005 [P] [US1] Write `tests/qa-scripts.test.mjs`: both scripts exist, are executable, start with a bash shebang and `set -euo pipefail`; `setup.sh` runs `npm ci`; `start.sh` builds, then starts on port 3100; the `start` npm script binds `0.0.0.0` (US1 scenario 2)
- [x] T006 [US1] Create `playwright.config.ts` (Chromium; `webServer` runs `npm run build && npm run start -- --port $PLAYWRIGHT_PORT` with `PLAYWRIGHT_PORT` defaulting to 3100; `baseURL` from the same port; tests in `tests/e2e/`)
- [x] T007 [US1] Write `tests/e2e/smoke.spec.ts`: `GET /` returns 200 and has exactly one level-1 heading named "DeskDrop" (US1 scenario 2)
- [x] T008 [US1] Update `README.md` with run, check and QA-script instructions; run `npm run typecheck`, `npm test` and `npm run test:e2e` and confirm each exits 0; the CI `typecheck`, `unit` and `e2e` jobs on the PR head are the recorded evidence for US1 scenarios 1 and 3

**Checkpoint**: CI typecheck, unit and e2e jobs run for real and pass; the QA Agent environment can be prepared from `main`.

---

## Phase 2: Foundational — domain types (blocks US2–US7) · PR 2

- [x] T009 [US2] Create `lib/catalog.ts` exporting `Category`, `Art`, `Product` and `categories` per contracts/domain-api.md
- [x] T010 [US3] Create `lib/store.ts` exporting `CartLine`, `StoreState`, `Totals`, `ShippingDetails`, `Order`, `Result`, the constants and messages in contracts/domain-api.md, and `initialState()`; `lib/store.ts` imports from `lib/catalog.ts` with `import type` only (research.md R1)

---

## Phase 3: User Story 2 — Catalog (P1) · PR 2

**Independent Test**: `node --experimental-strip-types --test tests/catalog.test.mjs`

- [x] T011 [P] [US2] Write `tests/catalog.test.mjs` covering US2 scenarios 1–4, including a field-for-field comparison of `products` with `specs/001-catalog-cart-domain/contracts/catalog.json`
- [x] T012 [US2] Add `products`, `productById` and `money` to `lib/catalog.ts` (research.md R5)

---

## Phase 4: User Story 3 — Cart lines and quantities (P1, rules 1–2) · PR 2

- [x] T013 [P] [US3] Write `tests/cart.test.mjs` covering US3 scenarios 1–8, the quantity, missing-line and unit-price (including merge) edge cases, and the two `addItem` error constants
- [x] T014 [US3] Implement `clampQuantity`, `addItem`, `changeQuantity`, `removeItem` and `lineTotal` in `lib/store.ts`

---

## Phase 5: User Story 4 — DESK15 coupon (P2, rule 3) · PR 2

- [x] T015 [P] [US4] Write `tests/coupon.test.mjs` covering US4 scenarios 1–7, the "already applied" edge case, and that any `applyCoupon` or `removeCoupon` clears the removal notice, asserting the exact message strings
- [x] T016 [US4] Implement `applyCoupon`, `removeCoupon`, the discount in `totals`, and the removal rule inside every cart-changing function in `lib/store.ts`

---

## Phase 6: User Story 5 — Delivery and totals (P2, rule 4) · PR 2

- [x] T017 [P] [US5] Write `tests/totals.test.mjs` covering US5 scenarios 1–4 and cent rounding
- [x] T018 [US5] Implement `setDelivery` and the delivery fee and total in `totals` in `lib/store.ts`

---

## Phase 7: User Story 6 — Orders (P2, rule 6) · PR 2

- [x] T019 [P] [US6] Write `tests/orders.test.mjs` covering US6 scenarios 1–5, with fixed `now` and `orderId`, and asserting the input state is not mutated
- [x] T020 [US6] Implement `placeOrder` in `lib/store.ts`

---

## Phase 8: User Story 7 — Wishlist and demo sign-in (P3, rule 5) · PR 2

- [x] T021 [P] [US7] Write `tests/account.test.mjs` covering US7 scenarios 1–5
- [x] T022 [US7] Implement `toggleWishlist`, `signIn` and `signOut` in `lib/store.ts`; mark `DEMO_ACCOUNT` as fixture-only in its declaration's name or a single doc comment
- [x] T023 [US2] Run `npm run typecheck` and `npm test`; every test passes

**Checkpoint**: all six cart rules hold at the domain level.

---

## Phase 9: Tooling — golden harness and contrast helper · PR 3 (parallel with Phases 2–8)

**Depends on**: Phase 1 only. Touches no file that Phases 2–8 touch.

- [ ] T024 [P] Write `tests/goldens-harness.test.mjs`: with a temporary scenario list and output directory, capture writes one file per scenario plus `MANIFEST.sha256` and `BASELINE`; check exits 0 on a match, exits 1 naming the scenario on a changed, missing or extra file; zero scenarios and no directory exit 0; a `BASELINE` naming a different commit does not fail the check (contracts/goldens.md)
- [ ] T025 Create `scripts/goldens/capture.mjs` (capture and `--check`, with injectable scenario list and output directory for the test) and `scripts/goldens/scenarios.mjs` exporting an empty `scenarios` array
- [ ] T026 [P] Write `tests/contrast.test.mjs`: `contrastRatio("#000000", "#ffffff")` is 21, a color against itself is 1, the ratio is symmetric, `meetsAA(ratio, { largeText })` uses 4.5 and 3
- [ ] T027 Create `lib/contrast.ts` exporting `relativeLuminance`, `contrastRatio` and `meetsAA` (WCAG 2.x formulas)
- [ ] T028 Add `golden:capture`, `golden:check` and `golden:capture:pages` to `package.json` scripts (contracts/goldens.md); run `npm test` and `npm run golden:check`

---

## Phase 10: User Story 8 — Pinned domain behavior (P3) · PR 4

**Depends on**: Phases 2–9.

- [ ] T029 [US8] Add the required scenarios from contracts/goldens.md to `scripts/goldens/scenarios.mjs`, each using fixed times and order IDs
- [ ] T030 [US8] Run `npm run golden:capture` to create `tests/golden/domain/*.json`, `MANIFEST.sha256` and `BASELINE`; then `npm run golden:check` exits 0
- [ ] T031 [US8] Extend `tests/goldens-harness.test.mjs` with a test that the scenario list contains every required name from contracts/goldens.md (US8 scenario 4)

**Checkpoint**: CI's golden job enforces the domain; later PRs are brownfield.

---

## Dependencies & Execution Order

- Phase 1 blocks everything.
- Phases 2–8 (PR 2) and Phase 9 (PR 3) run in parallel lanes after Phase 1.
- Phase 10 (PR 4) needs PR 2 and PR 3.
- Within PR 2, each test task precedes its implementation task; T009–T010 come first.

## Parallel Example: PR 2

```text
T011 tests/catalog.test.mjs   T013 tests/cart.test.mjs   T015 tests/coupon.test.mjs
T017 tests/totals.test.mjs    T019 tests/orders.test.mjs T021 tests/account.test.mjs
```
