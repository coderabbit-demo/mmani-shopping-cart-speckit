# Implementation Plan: Storefront Shell and Browse

**Branch**: `002-storefront-browse` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-storefront-browse/spec.md`

## Summary

Add the branded app shell, the client-side store provider over the 001 domain, the home page with
pure browse filtering, a not-found page, brand tokens, fonts and logotypes, e2e journeys, a
two-theme contrast check and aria-snapshot page goldens.

## Technical Context

**Language/Version**: TypeScript 7.0.2, React 19.3.1, Next.js 16.4.3 App Router

**Primary Dependencies**: existing set only (`lucide-react` for icons; `next/font/google` for Geist; `next/font/local` for Hack)

**Storage**: in-memory React state (persistence is spec 005)

**Testing**: `node --test` for `lib/browse.ts`; Playwright for journeys, contrast and aria snapshots

**Target Platform**: evergreen browsers, 375 px and up

**Project Type**: Next.js web application

**Performance Goals**: filtering 8 products is instant; no target

**Constraints**: token-only colors; WCAG AA; no new dependency; under 30 changed files

**Scale/Scope**: 2 routes (`/`, not-found) plus the shell used by all later routes

## Constitution Check

| Principle | Status | How this plan complies |
| --- | --- | --- |
| I. One writer | PASS | All files below are Coding Agent work. |
| II. Test-first evidence | PASS | `tests/browse.test.mjs` for pure filtering; e2e for every story; `lib/browse.ts` is new, proven by mutation. |
| III. Pinned behavior | PASS | The brief allows adding exactly `tests/golden/pages/home.aria.yml` and `not-found.aria.yml`; domain goldens untouched. |
| IV. Scoped changes | PASS | About 22 files; no dependency change; `package.json` untouched (scripts came from 001 Phase 9). |
| VI. Security by default | PASS | Search text is rendered through React text nodes only; no `dangerouslySetInnerHTML`. |
| VII. Brand and accessibility | PASS | Tokens in `app/globals.css`; e2e contrast check uses `lib/contrast.ts`; focus styles use `--color-primary`. |
| V. Strict gate | PASS | Merge only through `strict-gate.sh`. |
| VIII. No noise | PASS | Enforced by review and judges. |

Post-design re-check: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/002-storefront-browse/
├── plan.md, research.md, data-model.md, quickstart.md, tasks.md
└── contracts/
    ├── store-provider.md   # the client store API used by specs 003–005
    └── ui-copy.md          # exact visible strings and accessible names
```

### Source Code (repository root)

```text
app/
├── layout.tsx            # fonts, StoreProvider, Shell
├── globals.css           # brand tokens (dark default, light override), base styles
├── page.tsx              # home: renders <Shop />
└── not-found.tsx
components/
├── store-provider.tsx    # "use client"; context over lib/store.ts
├── shell.tsx             # header, mobile menu, footer credit
├── shop.tsx              # filters, live result count, grid
├── product-card.tsx      # card, quick-add, wishlist toggle
└── product-art.tsx       # 8 inline SVGs using tokens via currentColor/var()
lib/browse.ts             # filterProducts(products, filters), sortOptions
public/fonts/             # Hack-Regular.woff2, Hack-Bold.woff2, LICENSE.md
public/brand/             # white-typemark.svg, orange-typemark.svg (official, unmodified)
tests/browse.test.mjs
tests/e2e/storefront.spec.ts    # stories 1–3
tests/e2e/contrast.spec.ts      # story 4
tests/e2e/pages.golden.spec.ts  # story 5, tagged @golden
tests/golden/pages/home.aria.yml, not-found.aria.yml
playwright.config.ts            # snapshotPathTemplate → tests/golden/pages/{arg}{ext}
```

**Structure Decision**: domain stays in `lib/`; React-only code in `components/`. The provider exposes
the whole 001 API now so 003 and 004 never edit it (it is the hot file of this run).

## PR mapping

| Tasks phases | PR | Lane |
| --- | --- | --- |
| Phases 1–7 | PR 5 `feat: storefront shell and browse` | A (after PR 2 and PR 3; parallel with PR 4) |

## Complexity Tracking

No violations.
