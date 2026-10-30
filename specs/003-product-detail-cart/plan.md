# Implementation Plan: Product Detail and Cart

**Branch**: `003-product-detail-cart` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

## Summary

Add `/products/[slug]` (statically generated for the eight IDs) and `/cart` as client components
over the spec 002 store provider, with CSS modules on the spec 002 tokens, e2e proofs of cart
rules 1–4, and three page goldens.

## Technical Context

**Language/Version**: TypeScript 7.0.2, React 19.3.1, Next.js 16.4.3 · **Primary Dependencies**: existing set only · **Storage**: shared in-memory store · **Testing**: Playwright (journeys, goldens); no new pure module, so no new unit test file · **Target Platform**: evergreen browsers, 375 px and up · **Project Type**: Next.js web application · **Constraints**: no edits to the provider, shell or `app/globals.css`; under 30 files

## Constitution Check

| Principle | Status | Notes |
| --- | --- | --- |
| I. One writer | PASS | Coding Agent writes all files below. |
| II. Test-first evidence | PASS | Each acceptance scenario maps to an e2e test; rule tests are regression guards red on the base (no `/cart` route). |
| III. Pinned behavior | PASS | The brief allows adding exactly `product-arc-desk-lamp.aria.yml`, `cart-empty.aria.yml`, `cart-filled.aria.yml`; existing goldens unchanged. |
| IV. Scoped changes | PASS | About 12 files. |
| VI. Security | PASS | Coupon input rendered as text; route params validated against the catalog. |
| VII. Brand and accessibility | PASS | CSS modules use tokens only; radio groups and steppers are labeled and keyboard-operable. |
| V. Strict gate | PASS | Merge only through `strict-gate.sh`. |
| VIII. No noise | PASS | Enforced by review and judges. |

Post-design re-check: PASS.

## Project Structure

```text
app/products/[slug]/page.tsx        # generateStaticParams, notFound() for unknown slugs, renders <ProductDetail>
app/cart/page.tsx                   # renders <CartView>
components/product-detail.tsx (+ .module.css)
components/quantity-stepper.tsx (+ .module.css)   # shared with the cart
components/cart-view.tsx (+ .module.css)          # lines, coupon form, delivery radios, summary
components/order-summary.tsx (+ .module.css)      # subtotal/discount/delivery/total; reused by spec 004
tests/e2e/detail-cart.spec.ts
tests/e2e/pages.golden.spec.ts                    # add three snapshots
tests/golden/pages/product-arc-desk-lamp.aria.yml, cart-empty.aria.yml, cart-filled.aria.yml
```

`components/order-summary.tsx` takes `Totals` and the delivery method as props so spec 004's
checkout and receipt reuse it without editing it.

## PR mapping

| Tasks phases | PR | Lane |
| --- | --- | --- |
| Phases 1–6 | PR 6 `feat: product detail and cart` | A (after PR 5; parallel with PR 7) |

## Complexity Tracking

No violations.
