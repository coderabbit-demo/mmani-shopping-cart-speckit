# Implementation Plan: Checkout, Receipt and Orders

**Branch**: `004-checkout-orders` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

## Summary

Add a pure validation module, `/checkout`, `/checkout/success` and `/orders` over the shared
store, reusing `OrderSummary`; e2e proofs of rules 4 and 6, validation, safe rendering and no PII
in URLs or the console; three page goldens.

## Technical Context

**Language/Version**: TypeScript 7.0.2, React 19.3.1, Next.js 16.4.3 · **Primary Dependencies**: existing set only · **Storage**: shared in-memory store · **Testing**: `node --test` for `lib/checkout-validation.ts`; Playwright for journeys, security and goldens · **Project Type**: Next.js web application · **Constraints**: no edits to provider, shell, `OrderSummary`, `app/globals.css`; under 30 files

## Constitution Check

| Principle | Status | Notes |
| --- | --- | --- |
| I. One writer | PASS | Coding Agent writes all files. |
| II. Test-first evidence | PASS | Unit tests for validation (new module, mutation-proven); e2e per scenario. |
| III. Pinned behavior | PASS | The brief allows adding exactly `checkout.aria.yml`, `checkout-success.aria.yml`, `orders-empty.aria.yml`. |
| IV. Scoped changes | PASS | About 14 files. |
| VI. Security by default | PASS | Text rendering only; no query parameters; e2e checks URL and console for field values with benign markers. |
| VII. Brand and accessibility | PASS | Labeled fields, `aria-invalid`, `aria-describedby`, focus to the first error; CSS modules on tokens. |
| V. Strict gate | PASS | Merge only through `strict-gate.sh`. |
| VIII. No noise | PASS | Enforced by review and judges. |

Post-design re-check: PASS.

## Project Structure

```text
lib/checkout-validation.ts           # validateShipping(input): { values, errors }
app/checkout/page.tsx                # <CheckoutView>
app/checkout/success/page.tsx        # <Receipt>
app/orders/page.tsx                  # <OrderHistory>
components/checkout-view.tsx (+ .module.css)
components/receipt.tsx (+ .module.css)
components/order-history.tsx (+ .module.css)
tests/checkout-validation.test.mjs
tests/e2e/checkout-orders.spec.ts
tests/e2e/checkout-security.spec.ts
tests/e2e/pages.golden.spec.ts       # add three snapshots
tests/golden/pages/checkout.aria.yml, checkout-success.aria.yml, orders-empty.aria.yml
```

The success-page golden needs a fixed order: the test places an order through the UI and the
snapshot masks the order ID and date (regex in the aria snapshot), so the golden is stable.

## PR mapping

| Tasks phases | PR | Lane |
| --- | --- | --- |
| Phases 1–7 | PR 8 `feat: checkout, receipt and orders` | A (after PR 6; parallel with PR 7) |

## Complexity Tracking

No violations.
