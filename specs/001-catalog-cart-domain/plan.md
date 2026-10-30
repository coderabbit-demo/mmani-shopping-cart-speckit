# Implementation Plan: Catalog and Cart Domain

**Branch**: `001-catalog-cart-domain` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-catalog-cart-domain/spec.md`

## Summary

Stand up a runnable, unstyled Next.js app that the QA Agent can start from `main`, then build the
store's rules as pure TypeScript functions over immutable state (catalog, cart lines, DESK15,
delivery, totals, orders, wishlist, demo sign-in), proven by `node --test` acceptance tests. Add a
golden harness, then pin the domain outputs as JSON goldens. No UI beyond the scaffold heading.

## Technical Context

**Language/Version**: TypeScript 7.0.2 on Node >=22.6.0 (`--experimental-strip-types` for unit tests)

**Primary Dependencies**: next 16.4.3, react 19.3.1, react-dom 19.3.1, lucide-react 1.63.0; dev: @playwright/test 1.64.1, typescript 7.0.2, @types/node 26.6.5, @types/react 19.3.0, @types/react-dom 19.3.0 (the reference manifest's set, exact versions)

**Storage**: none in this feature (state is plain values; persistence is spec 005)

**Testing**: `node --test` for domain and harness; Playwright for the scaffold smoke test

**Target Platform**: modern evergreen browsers; dev on macOS (bash 3.2), CI on Ubuntu

**Project Type**: single Next.js web application (App Router), no backend

**Performance Goals**: domain functions are O(lines); no measurable target

**Constraints**: pure functions, no input mutation, deterministic (time and order ID injected)

**Scale/Scope**: 8 products, carts of at most a few dozen lines

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How this plan complies |
| --- | --- | --- |
| I. One writer | PASS | Every file under "Source Code" is written by the Coding Agent; the orchestrator writes only this directory and briefs. |
| II. Test-first evidence | PASS | Each acceptance scenario maps to a named test (tasks.md); domain modules are new, so the tests judge proves them by mutation. |
| III. Pinned behavior | PASS | Phase 10 pins domain JSON goldens; scenarios cover rules 1–4, 6 and the wishlist part of 5. |
| IV. Scoped changes | PASS | Four PRs, each under 15 files; the manifest and lockfile change only in the scaffold (approved dependency set) and tooling PR (scripts only). |
| V. Strict gate | PASS | No change to the gate; every PR goes through `strict-gate.sh`. |
| VI. Security by default | PASS | No input rendering here; demo credentials are fixture constants labeled as such. |
| VII. Brand and accessibility | N/A | Scaffold stays unstyled; styling begins in spec 002. |
| VIII. No noise | PASS | Enforced by review and judges. |

Post-design re-check: PASS, no violations; Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-catalog-cart-domain/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── catalog.json      # product data, field for field
│   ├── domain-api.md     # exported functions and messages
│   └── goldens.md        # harness CLI and file layout
└── tasks.md
```

### Source Code (repository root)

```text
package.json, package-lock.json, tsconfig.json, next.config.ts, next-env.d.ts, .gitignore
app/
├── layout.tsx            # minimal root layout, no styling
└── page.tsx              # <h1>DeskDrop</h1>
lib/
├── catalog.ts            # categories, products, productById, money
├── store.ts              # state type and pure cart/coupon/delivery/totals/order/wishlist/session functions
└── contrast.ts           # WCAG contrast ratio helper (tooling phase; used by spec 002 e2e)
scripts/
├── qa/setup.sh           # npm ci
├── qa/start.sh           # npm run build && npm run start -- --port 3100 (binds 0.0.0.0)
└── goldens/
    ├── capture.mjs       # capture and --check
    └── scenarios.mjs     # fixture scenarios (empty in the tooling phase, filled by the pin phase)
tests/
├── qa-scripts.test.mjs
├── catalog.test.mjs
├── cart.test.mjs
├── coupon.test.mjs
├── totals.test.mjs
├── orders.test.mjs
├── account.test.mjs
├── contrast.test.mjs
├── goldens-harness.test.mjs
├── e2e/smoke.spec.ts
└── golden/domain/        # *.json, MANIFEST.sha256, BASELINE (pin phase only)
playwright.config.ts
```

**Structure Decision**: one Next.js app at the root. Domain code in `lib/` has no React or browser
imports, so the UI specs (002–005) consume it through a client-side store provider. Golden tooling
lives in `scripts/goldens/` because `scripts/golden/` holds the orchestrator's gate scripts.

## PR mapping

| Tasks phase | PR | Lane |
| --- | --- | --- |
| Phase 1 Setup (US1) | PR 1 `chore: scaffold, QA startup scripts` | A (first; everything waits on it) |
| Phases 2–8 (US2–US7) | PR 2 `feat: catalog and cart domain` | A |
| Phase 9 Tooling | PR 3 `chore: golden harness and contrast helper` | B (parallel with PR 2) |
| Phase 10 (US8) | PR 4 `test: pin domain goldens` | B (after PR 2 and PR 3; parallel with spec 002) |

## Complexity Tracking

No constitution violations.
