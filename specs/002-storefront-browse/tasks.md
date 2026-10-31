---
description: "Task list for the storefront shell and browse"
---

# Tasks: Storefront Shell and Browse

**Input**: `specs/002-storefront-browse/` (plan.md, spec.md, research.md, data-model.md, contracts/)

**Tests**: required (constitution Principle II). Write each test task before the task it guards.

**PR**: Phases 1–7 → PR 5 (one PR). Depends on spec 001 PR 2 (domain) and PR 3 (contrast helper, `golden:capture:pages`).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup — brand assets

- [x] T001 [P] Add `public/fonts/Hack-Regular.woff2`, `public/fonts/Hack-Bold.woff2` and `public/fonts/LICENSE.md` from the upstream Hack release, unmodified
- [x] T002 [P] Add `public/brand/white-typemark.svg` and `public/brand/orange-typemark.svg` from coderabbit.ai/brand, unmodified

---

## Phase 2: Foundational — tokens, layout, store (blocks all stories)

- [x] T003 Create `app/globals.css` with the tokens from research.md R1 in `:root` and the light override block, base typography (`--font-geist`, `--font-hack`), focus-visible styles in `--color-primary`, and no raw color outside the token blocks
- [x] T004 Create `components/store-provider.tsx` exactly per contracts/store-provider.md (`hydrated` turns true in a mount effect)
- [x] T005 Update `app/layout.tsx`: load Geist and Hack (research.md R2), wrap children in `StoreProvider` and the shell, keep `<html lang="en">` and the "DeskDrop" title
- [x] T006 Update `playwright.config.ts`: `snapshotPathTemplate: "tests/golden/pages/{arg}{ext}"` (research.md R4); keep the existing web server and port settings

---

## Phase 3: User Story 1 — Browse and find products (P1)

- [x] T007 [P] [US1] Write `tests/browse.test.mjs` for `filterProducts`: each of US1 scenarios 2–6 at the function level, combined filters (AND), stable ties, and markup in the query treated as plain text
- [x] T008 [US1] Create `lib/browse.ts` exporting `BrowseFilters`, `defaultFilters`, `sortOptions` and `filterProducts` per data-model.md
- [x] T009 [P] [US1] Create `components/product-art.tsx`: one inline SVG per `Art` value, colored only with CSS variables
- [x] T010 [US1] Create `components/product-card.tsx` (art, name, subtitle, price via `money`, rating, badge, link to `/products/<id>`) using contracts/ui-copy.md names
- [x] T011 [US1] Create `components/shop.tsx` (search, category, stock, sort, live count, empty state with "Clear filters") and render it from `app/page.tsx` under the `<h1>DeskDrop</h1>`
- [x] T012 [US1] Write the browse journeys in `tests/e2e/storefront.spec.ts` (US1 scenarios 1–7, and the markup-in-search edge case)

---

## Phase 4: User Story 2 — Quick-add and save (P1)

- [x] T013 [US2] Add quick-add and the wishlist toggle to `components/product-card.tsx` through `useStore()`
- [x] T014 [US2] Add e2e for US2 scenarios 1–4 to `tests/e2e/storefront.spec.ts`, plus the quick-add-at-10 edge case and the grid rendering with JavaScript disabled (`javaScriptEnabled: false`)

---

## Phase 5: User Story 3 — Shell, navigation and not-found (P2)

- [x] T015 [US3] Create `components/shell.tsx`: header (site name, four links, "Bag (<n>)" from `bagCount`, wishlist count), mobile "Menu" disclosure below 768 px, footer credit with the theme-appropriate logotype (`<picture>` with a `prefers-color-scheme` source) and no header mark
- [x] T016 [US3] Create `app/not-found.tsx` ("Page not found", "Back to the shop")
- [x] T017 [US3] Add e2e for US3 scenarios 1–4 to `tests/e2e/storefront.spec.ts`, including the 375 × 812 no-horizontal-scroll check on `/` and `/no-such-page`

---

## Phase 6: User Story 4 — Brand look in both themes (P2)

- [x] T018 [US4] Write `tests/e2e/contrast.spec.ts`: in dark and light schemes, assert ≥ 4.5:1 for text/bg, text/surface, muted/bg, on-primary/primary, and danger, mint and cobalt on bg and surface using `lib/contrast.ts` (US4 scenario 1), that every computed `fill` and `stroke` in product art equals a token value or `none` (scenario 4), the footer logotype per scheme (scenario 2), and a visible focus outline in the primary color on a header link and a card button (scenario 3)
- [x] T019 [US4] Adjust token values in `app/globals.css` until T018 passes, keeping `--color-primary` at `#FF570A`

---

## Phase 7: User Story 5 — Pinned pages (P3)

- [x] T020 [US5] Write `tests/e2e/pages.golden.spec.ts` tagged `@golden`: aria snapshots of `/` and `/no-such-page` (US5 scenario 1)
- [x] T021 [US5] Run `npm run golden:capture:pages` to create `tests/golden/pages/home.aria.yml` and `tests/golden/pages/not-found.aria.yml`; then `npm run test:e2e` passes without `--update-snapshots`
- [x] T022 Run `npm run typecheck`, `npm test`, `npm run golden:check` and `npm run test:e2e`; all pass and the domain goldens are unchanged

---

## Dependencies & Execution Order

- Phase 1 and T003–T006 first; T004 blocks every story.
- US1 before US2 (card), US3 can proceed after Phase 2, US4 after US1–US3, US5 last.
- Parallel: T001, T002, T007, T009.
