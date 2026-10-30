# Feature Specification: Checkout, Receipt and Orders

**Feature Branch**: `004-checkout-orders` (spec directory; work lands on `main` through one PR)

**Created**: 2026-10-29

**Status**: Clarified

**Input**: User description: "Checkout with a validated shipping form, standard or express delivery and a simulated payment; an order confirmation and receipt; and an order history page that lists every item of every order. Proves cart rules 4 and 6 in the browser; form input renders safely and no personal data goes into URLs or logs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Place an order (Priority: P1)

A shopper with a non-empty bag fills in shipping details, picks delivery, and places the order
with a simulated payment.

**Why this priority**: completes the purchase journey.

**Independent Test**: e2e from quick-add through `/checkout` to the confirmation.

**Acceptance Scenarios**:

1. **Given** a non-empty bag, **When** `/checkout` is reached from the bag, **Then** it shows the shipping form (Full name, Email, Address, City, Postal code), the delivery radio group with the bag's current choice, the order summary and the notice "Payment is simulated. No card is charged."
2. **Given** express was chosen on `/cart`, **When** checkout opens, **Then** express is selected and the total includes $12 (rule 4).
3. **Given** a valid form and a $94 bag, **When** "Express — $12" is chosen at checkout, **Then** the summary total reads $106 (rule 4).
4. **Given** a valid form, **When** "Place order" is clicked, **Then** the browser goes to `/checkout/success`, the bag count reads 0, and no form value appears in the URL.
5. **Given** an empty bag, **When** `/checkout` loads, **Then** it shows "Your bag is empty." with a "Continue shopping" link and no form.

---

### User Story 2 - Validation blocks bad input (Priority: P1)

**Acceptance Scenarios**:

1. **Given** an empty form, **When** "Place order" is clicked, **Then** no order is placed, each required field shows its error, the fields are marked `aria-invalid`, and focus moves to the first invalid field.
2. **Given** Email "alex@", **When** submitted, **Then** "Enter a valid email address." shows for Email.
3. **Given** Postal code "!!", **When** submitted, **Then** "Enter a valid postal code." shows.
4. **Given** errors are shown, **When** a field is corrected and loses focus, **Then** its error clears.

---

### User Story 3 - Confirmation and receipt (Priority: P1) — rules 4 and 6

**Acceptance Scenarios**:

1. **Given** an order was just placed, **When** `/checkout/success` renders, **Then** it shows "Thank you, <first name>!", the order ID, every item (name, color, quantity, line total), subtotal, discount (when non-zero), delivery and total equal to what checkout showed (rules 4 and 6).
2. **Given** a three-line order with express and DESK15, **When** the receipt renders, **Then** it lists three items and total = subtotal − discount + $12.
3. **Given** no order in history, **When** `/checkout/success` loads, **Then** it says "No recent order." with a link to the shop.

---

### User Story 4 - Order history (Priority: P2) — rule 6

**Acceptance Scenarios**:

1. **Given** two orders placed in one session, **When** `/orders` is reached through the header, **Then** both are listed newest first, each with ID, date, every item, delivery and total (rule 6).
2. **Given** a multi-item order including the same product in two colors, **When** history renders, **Then** both color lines appear.
3. **Given** no orders, **When** `/orders` loads, **Then** it shows "No orders yet." and a link to the shop.

---

### User Story 5 - Safe handling of shopper input (Priority: P2)

**Acceptance Scenarios**:

1. **Given** Full name `<img src=x onerror=alert(1)>marker`, **When** an order is placed, **Then** the receipt shows that text literally, no image element is created, and no dialog opens.
2. **Given** any checkout, **When** the shopper submits, **Then** the URL of every page visited contains no field value, and the browser console has no message containing a field value.

---

### User Story 6 - Pinned pages (Priority: P3)

**Acceptance Scenarios**:

1. **Given** the e2e suite, **When** `@golden` tests run, **Then** aria snapshots of `/checkout` (one lamp line), `/checkout/success` (an order placed through the UI, with its ID and date matched by pattern) and `/orders` (empty) match `tests/golden/pages/`.

### Edge Cases

- Whitespace-only values count as empty; values are trimmed before validation and storage.
- Double-clicking "Place order" places one order.
- Changing delivery at checkout changes the shared value the bag shows.
- Order IDs are random and not guessable from shopper input.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `/checkout` MUST render the form, delivery choice and summary for a non-empty bag, and the empty state otherwise.
- **FR-002**: Validation MUST be a pure function returning per-field errors with the exact messages in contracts/validation.md, unit-tested.
- **FR-003**: Submitting a valid form MUST call the shared store's `placeOrder` once and navigate to `/checkout/success` without query parameters.
- **FR-004**: The receipt MUST read the newest order from the shared store, not from the URL.
- **FR-005**: `/orders` MUST list every order newest first with every item.
- **FR-006**: All shopper input MUST render as text; no raw HTML rendering anywhere in these pages.
- **FR-007**: No shopper field value MUST be written to URLs or the console.
- **FR-008**: Totals on checkout and receipt MUST use the spec 003 `OrderSummary` component.
- **FR-009**: This feature MUST NOT change `components/store-provider.tsx`, `components/shell.tsx`, `components/order-summary.tsx` or `app/globals.css`.
- **FR-010**: The checkout form MUST use `method="post"` with no action and keep "Place order" disabled until the store is `hydrated`; empty states MUST wait for `hydrated`.

### Key Entities

- **ShippingDetails** and **Order** from spec 001; **ValidationErrors**: map from field to message.

## Success Criteria *(mandatory)*

- **SC-001**: Rules 4 and 6 each have a passing e2e test that fails when the rule is broken.
- **SC-002**: A shopper completes checkout from a filled bag in under one minute with valid data.
- **SC-003**: The safe-rendering test passes with zero dialogs and zero injected elements.

## Clarifications

### Session 2026-10-29

- Q: Which shipping fields? → A: Full name, Email, Address, City, Postal code; no phone, no card fields.
- Q: How is payment simulated? → A: No payment fields; a notice says payment is simulated and "Place order" completes it.
- Q: Postal code format? → A: 3–10 characters of letters, digits, spaces or hyphens, starting and ending with a letter or digit.
- Q: Where does the receipt get its data? → A: The newest order in the shared store; nothing in the URL.

## Assumptions

- Depends on spec 003 (cart, `OrderSummary`) and spec 001 `placeOrder`; checkout has its own delivery radios bound to the same store value.
- Orders live in memory until spec 005 persists them; e2e uses in-app navigation.
- Email is stored in the order's shipping details only because the receipt shows it; it is not logged.
