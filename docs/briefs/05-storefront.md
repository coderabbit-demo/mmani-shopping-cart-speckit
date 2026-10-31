# Brief 05 — `feat: storefront shell and browse`

**Mode:** brownfield feature, lane A (parallel with PR 4). Golden changes allowed as listed. Styling begins here. **Jira:** SC-30
**Read first:** `specs/002-storefront-browse/spec.md`, `plan.md`, `tasks.md` and `contracts/`; `.specify/memory/constitution.md`; `AGENTS.md`; `docs/BRAND.md` for visual work.

## Tasks in scope (Spec Kit only)

Implement tasks T001–T022 of `specs/002-storefront-browse/tasks.md`. Mark each task done in tasks.md as you finish it. Leave tasks outside this range untouched.

## Assumptions (verified 2026-10-31 on main 8430cfb)

<!-- The orchestrator re-verifies each line against main right before start-task and rewrites the heading as "verified <date> on main <sha>". -->

- PRs 2 and 3 are merged: `lib/store.ts`, `lib/contrast.ts` and the `golden:capture:pages` script exist.
- Next.js 16.4.3 fails to build when Google Fonts is unreachable (confirmed in pre-flight). An offline build is not required: `research.md` R1 says the build needs network access to Google Fonts, which CI, QA and local e2e have. Keep Geist on `next/font/google` (FR-009) and add no fallback or font mock.
- The Hack release files and the coderabbit.ai/brand logotypes (`white-typemark.svg`, `orange-typemark.svg`) are downloadable: the woff2 files are in `Hack-v3.003-webfonts.zip` on the source-foundry/Hack v3.003 release, and the logotypes are at `https://www.coderabbit.ai/content/assets/<name>.svg`. If your sandbox cannot reach them, report it.

## Goal

The branded shell, home browse page and not-found page per `specs/002-storefront-browse/spec.md`, a store provider exposing the full `contracts/store-provider.md` API, AA contrast in both themes, and page goldens for `/` and 404.

## Pre-flight

Check this brief against the code on `main`. If any assumption is false, or a task needs a file outside ALLOW, stop and report the conflict. Otherwise implement without waiting.

## Golden changes this PR is allowed to make

- Add `tests/golden/pages/home.aria.yml` and `tests/golden/pages/not-found.aria.yml`. Domain goldens stay byte-identical.

## Red-then-green

`tests/e2e/smoke.spec.ts` stays green. New modules (`lib/browse.ts`, components) are exempt; e2e tests are red on `main` because the controls don't exist, and the tests judge proves `tests/browse.test.mjs` by mutation.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## ALLOW

```
ALLOW: app/layout.tsx
ALLOW: app/page.tsx
ALLOW: app/globals.css
ALLOW: app/not-found.tsx
ALLOW: components/store-provider.tsx
ALLOW: components/shell.tsx
ALLOW: components/shop.tsx
ALLOW: components/product-card.tsx
ALLOW: components/product-art.tsx
ALLOW: lib/browse.ts
ALLOW: public/fonts/**
ALLOW: public/brand/**
ALLOW: playwright.config.ts
ALLOW: tests/browse.test.mjs
ALLOW: tests/e2e/storefront.spec.ts
ALLOW: tests/e2e/contrast.spec.ts
ALLOW: tests/e2e/pages.golden.spec.ts
ALLOW: tests/golden/pages/home.aria.yml
ALLOW: tests/golden/pages/not-found.aria.yml
ALLOW: specs/002-storefront-browse/tasks.md
```

Everything else must not change, in particular `.github/**`, `scripts/golden/**`, `.coderabbit.yaml`, `AGENTS.md`, `.specify/**` and the other files under `specs/`.

## Required checks

- `npm run typecheck`
- `npm test`
- `npm run golden:check`
- `PLAYWRIGHT_PORT=<lane port> npm run test:e2e`

## Report

Changed files with the count, the output of each check, red-then-green evidence, the tasks ticked, and the CLI review status.
