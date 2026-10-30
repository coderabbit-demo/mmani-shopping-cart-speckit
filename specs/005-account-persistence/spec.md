# Feature Specification: Account, Wishlist, Persistence and Demo Reset

**Feature Branch**: `005-account-persistence` (spec directory; work lands on `main` through two PRs)

**Created**: 2026-10-29

**Status**: Clarified

**Input**: User description: "Demo sign-in and sign-out with an error for wrong credentials, a wishlist page, localStorage persistence under deskdrop-demo-v1 with an in-memory fallback and defensive parsing, and a /demo page that resets everything. Proves cart rule 5 in the browser and that a reload keeps the cart and the receipt."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Survive a reload (Priority: P1)

A shopper's bag, coupon, delivery choice, wishlist, session and orders survive a page reload and
a new tab on the same device.

**Why this priority**: without it every earlier page loses state on reload.

**Independent Test**: unit tests of the storage module, then e2e reloads.

**Acceptance Scenarios**:

1. **Given** a bag with lamp/Sage × 2 and DESK15 applied, **When** the page is reloaded, **Then** the bag, coupon and totals are unchanged.
2. **Given** an order was just placed, **When** `/checkout/success` is reloaded, **Then** the same receipt shows.
3. **Given** stored data, **When** the stored value is inspected, **Then** it is JSON under the key `deskdrop-demo-v1` and contains no password.
4. **Given** the first render after a reload, **When** the page hydrates, **Then** no hydration error is logged, and counts show stored values once loaded.

---

### User Story 2 - Tolerate bad or missing storage (Priority: P1)

**Acceptance Scenarios**:

1. **Given** `deskdrop-demo-v1` holds `not json`, **When** the app loads, **Then** it starts from an empty state without an error page.
2. **Given** stored data with an unknown product, a quantity of 99, a color the product lacks, an unknown coupon, duplicate wishlist IDs and a malformed order, **When** the app loads, **Then** the unknown product and bad color lines are dropped, the quantity becomes 10, the coupon is cleared, the wishlist is deduplicated to known IDs, and the malformed order is dropped while valid orders remain.
3. **Given** localStorage throws on every access, **When** the shopper browses, adds to bag and checks out, **Then** everything works in memory for the session.
4. **Given** stored data from a coupon applied on a cart that is now below $100, **When** it loads, **Then** the coupon is cleared.
5. **Given** a stored order with no `shipping`, **When** `/orders` and `/checkout/success` load, **Then** that order is dropped and neither page errors.

---

### User Story 3 - Sign in and keep the wishlist (Priority: P1) — rule 5

**Acceptance Scenarios**:

1. **Given** a guest who saved two products, **When** they sign in on `/account` as `alex@deskdrop.demo` / `deskdrop123`, **Then** the page greets "Signed in as Alex", and `/wishlist` still lists both products (rule 5).
2. **Given** wrong credentials, **When** "Sign in" is clicked, **Then** "Email or password is incorrect." shows next to the form (`role="alert"`) and the shopper stays a guest.
3. **Given** a signed-in shopper, **When** "Sign out" is clicked, **Then** the sign-in form returns and the wishlist, bag and orders are kept.
4. **Given** `/account`, **When** it renders for a guest, **Then** a note reads "Demo account: alex@deskdrop.demo / deskdrop123. This is fixture data; there is no real sign-in." and the password field has `type="password"`.
5. **Given** a signed-in shopper, **When** the page reloads, **Then** they are still signed in.
6. **Given** a signed-in shopper, **When** `/account` renders, **Then** it links to "Your orders" and "Your wishlist".
7. **Given** any sign-in attempt, **When** it is submitted, **Then** no URL visited and no console message contains the email or password typed.

---

### User Story 4 - Wishlist page (Priority: P2)

**Acceptance Scenarios**:

1. **Given** saved products, **When** `/wishlist` loads, **Then** each shows as a product card whose pressed wishlist toggle removes it, and whose "Add to bag" control adds the first color.
2. **Given** an empty wishlist, **When** `/wishlist` loads, **Then** it shows "Your wishlist is empty." and a link to the shop.

---

### User Story 5 - Reset the demo (Priority: P2)

**Acceptance Scenarios**:

1. **Given** a bag, wishlist, session and orders, **When** "Reset demo data" on `/demo` is clicked and confirmed, **Then** all are cleared, the stored key is removed, and the page says "Demo data cleared."
2. **Given** the reset dialog, **When** the shopper cancels, **Then** nothing changes.

---

### User Story 6 - Pinned pages (Priority: P3)

**Acceptance Scenarios**:

1. **Given** the e2e suite, **When** `@golden` tests run, **Then** aria snapshots of guest `/account`, empty `/wishlist` and `/demo` match `tests/golden/pages/`, and every earlier page golden still matches.

### Edge Cases

- Storage quota errors on save are ignored; the in-memory state stays authoritative.
- Storage written by another tab is picked up on the next load, not live.
- A stored string longer than 200,000 characters is ignored as corrupt.
- Server-rendered HTML never depends on stored data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A pure storage module MUST serialize the whole `StoreState` under `deskdrop-demo-v1` and parse it defensively per story 2, returning a valid state for any input.
- **FR-002**: A storage adapter MUST fall back to memory when localStorage is missing or throws, for reads and writes.
- **FR-003**: The store provider MUST load stored state after mount, save after every change, and expose `hydrated`; its public members stay as in spec 002.
- **FR-004**: `/account` MUST offer demo sign-in and sign-out through the store, with the exact error message and the fixture-only note.
- **FR-005**: The session MUST store only name and email; the password MUST never be stored or logged.
- **FR-006**: `/wishlist` MUST list saved products with remove and add controls.
- **FR-007**: `/demo` MUST reset state and remove the storage key after confirmation.
- **FR-008**: E2E tests MUST cover rule 5, reload of bag and receipt, reset, corrupt data and disabled storage.
- **FR-009**: The sign-in form MUST use `method="post"` with no action and keep "Sign in" disabled until `hydrated`; no field value MUST appear in a URL or the console.
- **FR-010**: A stored order or session that does not match the shapes in research.md R2 MUST be dropped, never rendered.

### Key Entities

- **Persisted snapshot**: `{ version: 1, state: StoreState }` as JSON under `deskdrop-demo-v1`.

## Success Criteria *(mandatory)*

- **SC-001**: Rule 5 has a passing e2e test that fails when sign-in clears the wishlist.
- **SC-002**: Every corrupt-data case in story 2 loads without an error page.
- **SC-003**: With storage disabled, the full journey (browse → bag → checkout → receipt) passes.

## Clarifications

### Session 2026-10-29

- Q: Persist per account or per device? → A: Per device, one snapshot; the session is part of it.
- Q: Does reset need confirmation? → A: Yes, a native confirm dialog "Clear all demo data?".
- Q: Is the snapshot versioned? → A: Yes, `version: 1`; other versions load as empty.

## Assumptions

- Depends on specs 001–004; the storage module (story 2 logic) is pure and can land before the UI PRs finish.
- No cross-tab live sync.
