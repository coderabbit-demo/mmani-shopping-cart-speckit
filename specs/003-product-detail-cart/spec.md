# Feature Specification: Product Detail and Cart

**Feature Branch**: `003-product-detail-cart` (spec directory; work lands on `main` through one PR)

**Created**: 2026-10-29

**Status**: Clarified

**Input**: User description: "Product detail pages with color and quantity selection and add to bag, and the cart page with quantity changes, line removal, the DESK15 coupon and the delivery choice, proving cart rules 1–4 in the browser."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose a color and quantity, add to bag (Priority: P1) — rule 1

A shopper opens a product, picks a color and quantity, and adds it; the bag keeps that color.

**Why this priority**: the primary way products enter the bag with a chosen color.

**Independent Test**: e2e on `/products/arc-desk-lamp`, then `/cart`.

**Acceptance Scenarios**:

1. **Given** `/products/arc-desk-lamp`, **When** it loads, **Then** it shows the name (h1), subtitle, description, price, rating, badge, details list and a color radio group with Terracotta selected.
2. **Given** the lamp page, **When** Sage and quantity 2 are chosen and "Add to bag" is clicked, **Then** the page confirms "Added to bag" in a polite live region, the header reads "Bag (2)", and `/cart` shows one line with the name "Arc desk lamp", "Color: Sage" and quantity 2 (rule 1).
3. **Given** a Sage line exists, **When** the shopper adds Terracotta × 1, **Then** `/cart` shows two lines (rule 1).
4. **Given** the quantity stepper, **When** decrement is pressed at 1 or increment at 10, **Then** it stays at 1 or 10; typed values are clamped the same way on blur.
5. **Given** `/products/slow-time-clock`, **When** it loads, **Then** "Add to bag" is disabled and the page says "Out of stock".
6. **Given** `/products/not-a-product`, **When** it loads, **Then** the not-found page renders with status 404.
7. **Given** the detail page, **When** the wishlist toggle is pressed, **Then** the header wishlist count updates.

---

### User Story 2 - Manage the bag (Priority: P1) — rule 2

A shopper changes quantities and removes lines; line totals and the subtotal update at once.

**Why this priority**: rule 2 and the core cart task.

**Independent Test**: e2e on `/cart` after adding items.

**Acceptance Scenarios**:

1. **Given** a lamp line at quantity 1, **When** its quantity is increased to 3, **Then** the line total reads $204 and the subtotal updates (rule 2).
2. **Given** a quantity field, **When** 15 is typed and the field loses focus, **Then** it shows 10 and totals use 10.
3. **Given** two lines, **When** "Remove" is clicked on one, **Then** only the other remains and totals update.
4. **Given** an empty bag, **When** `/cart` loads, **Then** it shows "Your bag is empty." and a "Continue shopping" link to `/`, and no Checkout link.
5. **Given** a non-empty bag, **When** `/cart` loads, **Then** each line shows art, name (linking to the product), color, unit price, quantity control, line total and a "Remove" button named "Remove <name> (<color>)".

---

### User Story 3 - DESK15 in the bag (Priority: P2) — rule 3

A shopper applies DESK15; the discount follows cart changes and is removed with an explanation
below $100.

**Independent Test**: e2e applying the code and changing quantities.

**Acceptance Scenarios**:

1. **Given** a $136 bag, **When** "desk15" is applied, **Then** a discount line "DESK15 (15%) −$20.40" shows and the total drops accordingly.
2. **Given** a $68 bag, **When** DESK15 is applied, **Then** the error "DESK15 needs a subtotal of $100 or more." shows next to the field (associated via `aria-describedby`) and no discount line shows.
3. **Given** DESK15 on $136, **When** the quantity drops to 1, **Then** the discount line disappears and the notice "DESK15 was removed because your subtotal is below $100." appears in a polite live region (rule 3).
4. **Given** DESK15 applied, **When** "Remove code" is clicked, **Then** the discount line disappears with no removal notice.
5. **Given** an unknown code, **When** it is applied, **Then** "That code isn't valid." shows.

---

### User Story 4 - Delivery choice and totals in the bag (Priority: P2) — rule 4

The bag offers standard (free) and express ($12) delivery, and the summary shows subtotal,
discount, delivery and total.

**Independent Test**: e2e toggling the delivery radio on `/cart`.

**Acceptance Scenarios**:

1. **Given** a $94 bag, **When** the cart loads, **Then** "Standard — Free" is selected and the total is $94.
2. **Given** the same bag, **When** "Express — $12" is chosen, **Then** the delivery row reads $12 and the total $106 (rule 4).
3. **Given** a non-empty bag, **When** "Checkout" is clicked, **Then** the browser navigates to `/checkout`.

---

### User Story 5 - Pinned pages (Priority: P3)

**Acceptance Scenarios**:

1. **Given** the e2e suite, **When** `@golden` tests run, **Then** aria snapshots of `/products/arc-desk-lamp`, the empty `/cart`, and `/cart` holding lamp/Sage × 2 match `tests/golden/pages/`.

### Edge Cases

- Coupon input containing markup is shown as typed; error messages are fixed strings.
- Unit price on a line stays as added even if the catalog changes later.
- Quantity field accepts only digits; an empty field on blur restores the previous value.
- `/products/<id>` is statically generated for the eight IDs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `/products/[slug]` MUST render the catalog product for `slug`, or the not-found page with 404.
- **FR-002**: The color choice MUST be a labeled radio group of color names defaulting to the first color (catalog `hex` values are not rendered; any swatch uses tokens only); quantity MUST be a stepper bounded 1–10.
- **FR-003**: "Add to bag" MUST call the shared store's `addItem` with the chosen color and quantity and announce success or the store's error.
- **FR-004**: `/cart` MUST list every line with the controls in story 2 and recompute totals on every change through the shared store.
- **FR-005**: The coupon form MUST apply and remove DESK15 through the shared store and show the domain's exact messages and notice.
- **FR-006**: The delivery choice MUST be a radio group bound to the shared store's delivery method.
- **FR-007**: The summary MUST show subtotal, discount (only when non-zero), delivery and total, using Hack for amounts per `docs/BRAND.md`.
- **FR-008**: This feature MUST NOT change `components/store-provider.tsx`, `components/shell.tsx` or `app/globals.css`; its styles live in CSS modules next to its components and use only the spec 002 tokens.
- **FR-009**: Empty states ("Your bag is empty.") MUST render only once the store reports `hydrated`, so a reload never flashes an empty bag after spec 005.

### Key Entities

Reuses Product, CartLine, Totals and StoreState (spec 001).

## Success Criteria *(mandatory)*

- **SC-001**: Cart rules 1–4 each have a passing e2e test that fails when the rule is broken.
- **SC-002**: A shopper goes from a product page to a bag with a chosen color in at most three interactions.
- **SC-003**: Every acceptance scenario maps to at least one passing test.

## Clarifications

### Session 2026-10-29

- Q: Is delivery chosen in the cart or only at checkout? → A: Both, bound to one shared value; the cart shows it so rule 4 holds in all three totals.
- Q: Does adding from the detail page navigate to the cart? → A: No; it stays and announces "Added to bag".
- Q: How is the discount labeled? → A: "DESK15 (15%)" with a minus-sign amount.

## Assumptions

- Depends on spec 002's store provider, shell and tokens; state is in memory until spec 005.
- E2E tests reach `/cart` through in-app links after adding, because state does not survive a reload yet.
