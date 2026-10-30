# Feature Specification: Storefront Shell and Browse

**Feature Branch**: `002-storefront-browse` (spec directory; work lands on `main` through one PR)

**Created**: 2026-10-29

**Status**: Clarified

**Input**: User description: "The branded DeskDrop storefront: app shell with header, mobile navigation, bag and wishlist counts and a footer credit; the home page with search, category filter, in-stock filter, sort and quick-add; a not-found page; CodeRabbit brand tokens, fonts and logos in dark and light themes; page goldens and a contrast check."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and find products (Priority: P1)

A shopper opens the store, sees all eight products as cards, and narrows them by search text,
category and stock, or reorders them.

**Why this priority**: the entry point of every journey.

**Independent Test**: e2e on `/` with search, filter and sort controls.

**Acceptance Scenarios**:

1. **Given** the home page, **When** it loads, **Then** eight product cards show name, subtitle, price, rating and badge (when present), each linking to `/products/<id>`, and the heading "DeskDrop" is present.
2. **Given** the home page, **When** "lamp" is typed in search, **Then** only the Arc desk lamp is shown; search matches name, subtitle and category, trimmed and case-insensitive.
3. **Given** the home page, **When** the "Desk essentials" category is chosen, **Then** only its three products show, and "All objects" restores all eight.
4. **Given** the home page, **When** "In stock only" is turned on, **Then** the Slow time clock is hidden and seven cards show.
5. **Given** the home page, **When** the sort is "Price: low to high", **Then** cards run from $24 to $129; "Price: high to low" reverses it; "Top rated" orders by rating, ties in catalog order; "Featured" is catalog order and the default.
6. **Given** filters that match nothing, **When** results update, **Then** the page shows "No products match your filters." and a "Clear filters" button that resets search, category, stock and sort.
7. **Given** a search term, **When** the result count changes, **Then** a polite live region announces "<n> products".

---

### User Story 2 - Quick-add and save (Priority: P1)

From a card, a shopper adds a product to the bag in its first color, or saves it to the wishlist,
and the header counts update.

**Why this priority**: the header counts and quick-add exercise the shared store the later pages use.

**Independent Test**: e2e clicks quick-add and save on cards and reads the header counts.

**Acceptance Scenarios**:

1. **Given** an empty bag, **When** "Add to bag" on the Arc desk lamp card is clicked twice, **Then** the header bag count reads 2 (one line, Terracotta × 2).
2. **Given** the Slow time clock card, **When** it is shown, **Then** its add button is disabled and labeled "Sold out".
3. **Given** a card, **When** its "Save to wishlist" toggle is pressed, **Then** it becomes pressed, the header wishlist count reads 1, and pressing again returns both to the unsaved state.
4. **Given** items were added and a product saved, **When** the shopper follows a card link (a not-found page until spec 003) and then the header "Shop" link back, **Then** both counts are unchanged (in memory; reload persistence is spec 005).

---

### User Story 3 - Shell, navigation and not-found (Priority: P2)

Every page shares a header (DeskDrop name linking home, links to Shop, Wishlist, Orders and
Account, a bag link with count), a mobile menu below 768 px, and a footer with the "Built with
CodeRabbit" credit. Unknown URLs show a friendly not-found page.

**Why this priority**: shared frame for specs 003–005.

**Independent Test**: e2e at desktop and 375 × 812 viewports, and on an unknown URL.

**Acceptance Scenarios**:

1. **Given** any page at desktop width, **When** it renders, **Then** the header shows the DeskDrop name, the four links, "Wishlist (<n>)" and "Bag (<n>)", and the footer shows the official CodeRabbit logotype with the text "Built with CodeRabbit".
2. **Given** a 375 px wide viewport, **When** the page renders, **Then** there is no horizontal scroll, the links collapse into a "Menu" button with `aria-expanded`, and opening it reveals the links.
3. **Given** `/no-such-page`, **When** it loads, **Then** the response is 404, the page heading is "Page not found", and a "Back to the shop" link goes to `/`.
4. **Given** the header, **When** it renders, **Then** it shows no CodeRabbit mark.

---

### User Story 4 - Brand look in both themes (Priority: P2)

The storefront follows `docs/BRAND.md`: dark-first with a light theme from the system preference,
CR Orange for primary actions and focus, mauve neutrals, Geist and Hack type, token-only colors
and AA contrast.

**Why this priority**: required by the constitution (Principle VII); later pages reuse the tokens.

**Independent Test**: e2e emulating dark and light color schemes, measuring token contrast.

**Acceptance Scenarios**:

1. **Given** dark and light color schemes, **When** `/` renders, **Then** body text on the background and on surfaces, muted text on the background, primary-button text on the primary color, and the danger, mint and cobalt tokens on the background and on surfaces each reach at least 4.5:1.
2. **Given** the light scheme, **When** the footer renders, **Then** it shows the light-background logotype; in the dark scheme, the white logotype.
3. **Given** a keyboard user, **When** they tab through the header and a card, **Then** each focused control shows a visible focus indicator in the primary color.
4. **Given** product cards, **When** they render, **Then** product art uses only theme tokens for its colors.

---

### User Story 5 - Pinned pages (Priority: P3)

A maintainer pins the home and not-found pages' accessible structure as goldens.

**Independent Test**: `npm run golden:capture:pages`, then the e2e run compares.

**Acceptance Scenarios**:

1. **Given** the e2e suite, **When** tests tagged `@golden` run, **Then** aria snapshots of `/` (default filters) and `/no-such-page` match files under `tests/golden/pages/`.
2. **Given** a change to a heading or control name on those pages, **When** e2e runs, **Then** the golden test fails.

### Edge Cases

- Search text containing markup (for example `<b>marker</b>`) is shown as typed in the input and in the "No products" state, never interpreted.
- Category and stock filters combine with search (logical AND).
- Quick-add on a product already in the bag at quantity 10 leaves it at 10.
- With JavaScript disabled, the product grid and links still render (filters need JavaScript).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The home page MUST list catalog products filtered by search, category and stock and ordered by the chosen sort, as defined in story 1.
- **FR-002**: Filtering and sorting MUST be pure functions of the catalog and the filter state, unit-tested without a browser.
- **FR-003**: Quick-add MUST add the product's first color at quantity 1 through the shared store; out-of-stock products MUST NOT be addable.
- **FR-004**: The header bag count MUST equal the sum of line quantities; the wishlist count MUST equal the number of saved products.
- **FR-005**: One client-side store MUST hold the 001 domain state for the whole app and expose every 001 domain action (contracts/store-provider.md), so specs 003–005 add pages without changing it, except spec 005's persistence wiring.
- **FR-006**: The shell MUST provide header, mobile menu and footer as in story 3, on every page.
- **FR-007**: Unknown routes MUST render the not-found page with status 404.
- **FR-008**: All colors MUST come from the tokens in `docs/BRAND.md`, defined in `:root` blocks of `app/globals.css`, with light overrides under `prefers-color-scheme: light`.
- **FR-009**: Geist MUST load through the framework's Google font loader; Hack MUST be self-hosted with its license file; no font package is added.
- **FR-010**: The official CodeRabbit logotype files MUST be committed unmodified under `public/brand/` and used only in the footer.
- **FR-011**: Interactive controls MUST have accessible names, be keyboard-operable, and show a visible focus state.
- **FR-012**: Aria snapshots of `/` and the not-found page MUST be stored under `tests/golden/pages/` and checked by e2e.

### Key Entities

- **Browse filters**: search text, category (default "All objects"), in-stock only (default off), sort (`featured` | `price-asc` | `price-desc` | `rating`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A shopper finds any named product from the home page in at most two interactions (type or choose a category).
- **SC-002**: Every text and CTA token pair in story 4 measures ≥ 4.5:1 in both themes.
- **SC-003**: At 375 px width, page width equals viewport width on `/` and the not-found page.
- **SC-004**: Every acceptance scenario maps to at least one passing unit or e2e test.

## Clarifications

### Session 2026-10-29

- Q: Which sort options? → A: Featured (default, catalog order), Price low to high, Price high to low, Top rated.
- Q: What does quick-add pick for color? → A: The product's first listed color, quantity 1.
- Q: Which fields does search match? → A: Name, subtitle and category.
- Q: Where do the logotype files come from? → A: coderabbit.ai/brand, unmodified (`white-typemark.svg`, `orange-typemark.svg`).

## Assumptions

- Depends on spec 001 (domain, catalog) and its tooling phase (contrast helper, `golden:capture:pages`).
- State is in memory in this feature; reload persistence arrives in spec 005.
- The Hack font files and license come from the upstream Hack release; the logotypes from coderabbit.ai/brand. Pre-flight confirms both are reachable.
