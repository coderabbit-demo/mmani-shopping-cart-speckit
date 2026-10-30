# Feature Specification: Catalog and Cart Domain

**Feature Branch**: `001-catalog-cart-domain` (spec directory; work lands on `main` through one PR per task phase)

**Created**: 2026-10-29

**Status**: Clarified

**Input**: User description: "DeskDrop runnable app skeleton plus the catalog and cart domain: eight products, cart lines by product and color, quantity clamping, the DESK15 coupon, standard and express delivery, orders, wishlist and demo sign-in, as pure state rules with no UI; then pin the domain outputs with goldens."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Runnable app for review and QA (Priority: P1)

A maintainer or the QA Agent installs the app from a clean checkout, starts it on port 3100, and
sees a page headed "DeskDrop". No styling or shopping yet.

**Why this priority**: every later story, the CI checks and the QA Agent environment need an app
that installs and starts from `main`.

**Independent Test**: run the setup script, then the start script, and request `/`.

**Acceptance Scenarios**:

1. **Given** a clean checkout, **When** the setup script runs, **Then** dependencies install from the lockfile and the script exits 0 (proven by CI, whose jobs run the same `npm ci`, and by a unit test of the script's contents).
2. **Given** setup has run, **When** the start script runs, **Then** a production build starts listening on `0.0.0.0:3100`, and `GET /` returns 200 with a top-level heading "DeskDrop".
3. **Given** a clean checkout, **When** the typecheck, unit test and e2e commands run, **Then** each exits 0 (proven by the CI `typecheck`, `unit` and `e2e` jobs passing on the PR head).

---

### User Story 2 - Catalog (Priority: P1)

The store offers exactly the eight products in `contracts/catalog.json`, grouped into four
categories plus "All objects", with names, prices, colors, details and stock state as listed.

**Why this priority**: every cart rule operates on catalog products.

**Independent Test**: unit tests read the catalog and look products up by ID.

**Acceptance Scenarios**:

1. **Given** the catalog, **When** it is listed, **Then** it has 8 products in the contract's order with unique IDs, positive whole-dollar prices and at least one color each.
2. **Given** the catalog, **When** stock is inspected, **Then** exactly one product (`slow-time-clock`) is out of stock.
3. **Given** an unknown ID, **When** it is looked up, **Then** no product is returned.
4. **Given** amounts 68, 1022 and 57.8, **When** they are formatted as money, **Then** they read "$68", "$1,022" and "$57.80".

---

### User Story 3 - Cart lines and quantities (Priority: P1) — cart rules 1 and 2

A shopper adds products in chosen colors, changes quantities and removes lines; the cart always
shows correct line totals and subtotal.

**Why this priority**: the core of the cart and two of the six required rules.

**Independent Test**: unit tests drive the cart state functions and check lines and totals.

**Acceptance Scenarios**:

1. **Given** an empty cart, **When** the Arc desk lamp is added in Terracotta and then in Sage, **Then** the cart has two lines, one per color (rule 1).
2. **Given** a cart with Arc desk lamp / Sage × 1, **When** the same product and color is added with quantity 2, **Then** the cart still has one line for that pair, with quantity 3.
3. **Given** a product, **When** it is added in a color the product does not offer, **Then** the add is rejected and the cart is unchanged.
4. **Given** the out-of-stock Slow time clock, **When** it is added, **Then** the add is rejected and the cart is unchanged.
5. **Given** a line with quantity 2 at $68, **When** its quantity is set to 4, **Then** the line total is $272 and the subtotal is recomputed (rule 2).
6. **Given** a line, **When** its quantity is set to 0, -3, 11 or 2.5, **Then** it is stored as 1, 1, 10 and 2 respectively (clamped to 1–10, fractions truncated).
7. **Given** a line at quantity 9, **When** the same product and color is added with quantity 5, **Then** the merged quantity is 10.
8. **Given** a cart with two lines, **When** one line is removed by product and color, **Then** only the other line remains.

---

### User Story 4 - DESK15 coupon (Priority: P2) — cart rule 3

A shopper applies DESK15 for 15% off a subtotal of $100 or more. The discount follows every cart
change and is removed, with an explanation, when the subtotal falls below $100.

**Why this priority**: a required rule, built on story 3.

**Independent Test**: unit tests apply the coupon, change the cart and check the discount and messages.

**Acceptance Scenarios**:

1. **Given** a $129 subtotal, **When** " desk15 " is applied, **Then** the coupon is accepted (trimmed, case-insensitive) and the discount is $19.35.
2. **Given** a $68 subtotal, **When** DESK15 is applied, **Then** it is rejected with "DESK15 needs a subtotal of $100 or more." and no discount applies.
3. **Given** any subtotal, **When** an unknown code is applied, **Then** it is rejected with "That code isn't valid." and any previously applied coupon is kept.
4. **Given** DESK15 applied on $136 (lamp × 2), **When** quantity rises to 3, **Then** the discount is recomputed to $30.60.
5. **Given** DESK15 applied on $136, **When** quantity drops to 1 ($68), **Then** the coupon is removed and the cart carries the notice "DESK15 was removed because your subtotal is below $100."
6. **Given** the coupon was removed below $100, **When** the subtotal later returns to $100 or more, **Then** the coupon stays removed until the shopper applies it again.
7. **Given** DESK15 applied, **When** the shopper removes it, **Then** the discount is $0 and no removal notice is shown.

---

### User Story 5 - Delivery and totals (Priority: P2) — cart rule 4

Standard delivery is free; express costs $12. Every total the shopper sees (cart, checkout,
receipt) is subtotal − discount + delivery fee.

**Why this priority**: a required rule shared by three pages.

**Independent Test**: unit tests compute totals for each delivery method with and without the coupon.

**Acceptance Scenarios**:

1. **Given** a $94 cart with standard delivery, **When** totals are computed, **Then** delivery is $0 and the total is $94.
2. **Given** the same cart, **When** express is selected, **Then** delivery is $12 and the total is $106.
3. **Given** a $129 cart with DESK15 and express, **When** totals are computed, **Then** the total is $129 − $19.35 + $12 = $121.65.
4. **Given** a new cart, **When** no method is chosen, **Then** delivery defaults to standard.

---

### User Story 6 - Orders (Priority: P2) — cart rule 6

Placing an order records every line, the totals and the delivery method, clears the cart and adds
the order to history, newest first.

**Why this priority**: a required rule, and the receipt and history pages read these records.

**Independent Test**: unit tests place multi-line orders and inspect history.

**Acceptance Scenarios**:

1. **Given** a cart with three lines, two of them the same product in different colors, **When** an order is placed, **Then** the order holds all three lines with product name, color, quantity, unit price and line total (rule 6).
2. **Given** a placed order, **When** it is inspected, **Then** it carries the subtotal, discount, delivery method, delivery fee and total that the cart showed at placement, the shipping details, a placement time and an order ID of the form `DD-` followed by 6 digits.
3. **Given** an order was placed, **When** the cart is inspected, **Then** it is empty, the coupon is cleared and delivery is reset to standard.
4. **Given** two orders were placed, **When** history is read, **Then** both are present, newest first, each with all its items.
5. **Given** an empty cart, **When** an order is placed, **Then** it is rejected and history is unchanged.

---

### User Story 7 - Wishlist and demo sign-in (Priority: P3) — cart rule 5

A shopper saves favorites, then signs in with the demo account; the wishlist survives sign-in and
sign-out.

**Why this priority**: a required rule; its UI arrives with the account feature.

**Independent Test**: unit tests toggle the wishlist and sign in and out.

**Acceptance Scenarios**:

1. **Given** an empty wishlist, **When** a product is toggled twice, **Then** it is saved, then removed.
2. **Given** a guest wishlist with two products, **When** the shopper signs in as `alex@deskdrop.demo` / `deskdrop123`, **Then** the shopper is signed in as Alex and the wishlist still has both products (rule 5).
3. **Given** wrong credentials, **When** sign-in is attempted, **Then** it is rejected with "Email or password is incorrect." and the state is unchanged.
4. **Given** a signed-in shopper, **When** they sign out, **Then** they are a guest again and the wishlist, cart and order history are kept.
5. **Given** the email " Alex@DeskDrop.demo ", **When** sign-in is attempted with the right password, **Then** it succeeds (email trimmed and case-insensitive; password exact).

---

### User Story 8 - Pinned domain behavior (Priority: P3)

A maintainer pins the accepted domain outputs so later PRs cannot change them unnoticed.

**Why this priority**: from here on every PR is brownfield; needs stories 2–7.

**Independent Test**: run the golden capture in check mode on an unchanged tree, then on a deliberately changed domain function.

**Acceptance Scenarios**:

1. **Given** the fixture scenarios, **When** capture runs, **Then** it writes one JSON golden per scenario under `tests/golden/domain/`, plus a `MANIFEST.sha256` and a `BASELINE` naming the source commit.
2. **Given** unchanged code, **When** the check runs, **Then** it exits 0.
3. **Given** a domain change that alters any scenario's output, **When** the check runs, **Then** it exits non-zero and names the scenario.
4. **Given** the scenarios, **When** they are listed, **Then** they cover each of cart rules 1, 2, 3, 4 and 6 and the wishlist part of rule 5.

### Edge Cases

- Quantity input that is not a finite number (NaN, Infinity, a string) is treated as 1.
- A discount is rounded to whole cents; totals never show fractions of a cent.
- Applying DESK15 when it is already applied is accepted and changes nothing.
- Removing a line that is not in the cart leaves the cart unchanged.
- Changing quantity on a line not in the cart leaves the cart unchanged.
- A cart line keeps the unit price at the time it was first added; merging into an existing line keeps that line's unit price.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST provide a setup script that installs dependencies from the lockfile, and a start script that builds and serves the app on `0.0.0.0:3100`.
- **FR-002**: `GET /` MUST return 200 with a top-level heading "DeskDrop" from the first PR on.
- **FR-003**: The catalog MUST contain exactly the categories and products in `contracts/catalog.json`, field for field, in order.
- **FR-004**: The system MUST format money in US dollars, without cents for whole amounts and with two decimals otherwise.
- **FR-005**: A cart line MUST be identified by product and color; adding an existing pair MUST merge quantities, and a new pair MUST add a line.
- **FR-006**: Adding a color the product lacks, or an out-of-stock product, MUST be rejected without changing the cart.
- **FR-007**: Every stored quantity MUST be an integer from 1 to 10, clamped as in story 3.
- **FR-008**: The line total MUST equal unit price × quantity and the subtotal MUST equal the sum of line totals, recomputed after every change.
- **FR-009**: DESK15 MUST give 15% off the subtotal, rounded to cents, only while the subtotal is $100 or more; it MUST be recomputed after every cart change.
- **FR-010**: When a cart change drops the subtotal below $100, the coupon MUST be removed and the exact removal notice MUST be available to the UI until the next `applyCoupon` (accepted or rejected), `removeCoupon` or order.
- **FR-011**: Delivery MUST be standard ($0, default) or express ($12); the total MUST be subtotal − discount + delivery fee.
- **FR-012**: Placing an order MUST snapshot every line and all totals, store it newest first in history, and reset the cart, coupon and delivery.
- **FR-013**: The wishlist MUST toggle products by ID and MUST be unchanged by sign-in and sign-out.
- **FR-014**: Sign-in MUST accept only the demo account in `contracts/domain-api.md`, with the exact error message for any other credentials.
- **FR-015**: All domain functions MUST be pure: they take state and inputs (including time and order ID sources) and return new state without mutating their inputs.
- **FR-016**: Domain goldens MUST be captured from fixture scenarios and checked byte-for-byte in CI.

### Key Entities

- **Product**: catalog item with ID (slug), name, subtitle, description, price, category, art key, colors (name and swatch), optional badge, rating, details and stock state.
- **Cart line**: product ID, color name, quantity (1–10) and unit price.
- **Cart**: lines, applied coupon (or none), coupon notice (or none) and delivery method.
- **Totals**: subtotal, discount, delivery fee and total, derived from the cart.
- **Order**: ID, placement time, item snapshots, totals, delivery method and shipping details.
- **Account session**: guest, or signed in with name and email.
- **Wishlist**: ordered set of product IDs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every acceptance scenario in stories 2–7 maps to at least one passing unit test.
- **SC-002**: From a clean checkout, build plus start serve `/` within the Playwright web-server timeout of 180 seconds in CI.
- **SC-003**: The golden check detects a one-cent change in any pinned total.
- **SC-004**: Each of cart rules 1–6 has at least one test that fails when the rule is broken (shown by mutation).

## Clarifications

### Session 2026-10-29

- Q: When DESK15 was removed below $100 and the subtotal returns above $100, is it re-applied? → A: No; the shopper must apply it again (story 4, scenario 6).
- Q: Is the coupon code case-sensitive? → A: No; it is trimmed and compared case-insensitively.
- Q: Does sign-out clear the wishlist or cart? → A: No; sign-out only ends the session.
- Q: Does checkout require sign-in? → A: No; guests can order, and history lists every order placed on the device.
- Q: How are fractional or out-of-range quantities stored? → A: Truncated, then clamped to 1–10; non-numbers become 1.

## Assumptions

- Product copy, prices and colors come from the reference storefront `coderabbit-demo/qa-agent-demo` (product scope only; none of its code). Its beige product backgrounds are dropped: product art uses brand tokens (spec 002).
- One currency (USD), no tax, no inventory counts beyond in-stock or out-of-stock.
- The demo account is fixture data, not real authentication.
- The scaffold's dependency set is the reference manifest's set; adding to it needs maintainer approval.
