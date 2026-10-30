# Brief 09 — `feat: account, wishlist, persistence and demo reset`

**Mode:** brownfield feature, lane A. Golden changes allowed as listed. **Jira:** SC-34
**Read first:** `specs/005-account-persistence/spec.md`, `plan.md`, `tasks.md` and `contracts/`; `.specify/memory/constitution.md`; `AGENTS.md`; `docs/BRAND.md` for visual work.

## Tasks in scope (Spec Kit only)

Implement tasks T004–T015 of `specs/005-account-persistence/tasks.md`. Mark each task done in tasks.md as you finish it. Leave tasks outside this range untouched.

## Assumptions (to verify before start)

<!-- The orchestrator re-verifies each line against main right before start-task and rewrites the heading as "verified <date> on main <sha>". -->

- PRs 7 and 8 are merged; `lib/persistence.ts` exports `STORAGE_KEY`, `serialize`, `parseStored` and `createStorage`.
- The provider's public members match `specs/002-storefront-browse/contracts/store-provider.md`; this PR may add persistence only.

## Goal

Account, wishlist and demo pages per `specs/005-account-persistence/spec.md`, persistence wired into the provider, with e2e proving rule 5, reloads, reset, corrupt data and disabled storage.

## Pre-flight

Check this brief against the code on `main`. If any assumption is false, or a task needs a file outside ALLOW, stop and report the conflict. Otherwise implement without waiting.

## Golden changes this PR is allowed to make

- Add `tests/golden/pages/account-guest.aria.yml`, `wishlist-empty.aria.yml`, `demo.aria.yml`. All other goldens byte-identical.

## Red-then-green

Reload, rule 5 and storage e2e fail on `main` and pass on the head; record both runs.

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## ALLOW

```
ALLOW: components/store-provider.tsx
ALLOW: app/account/page.tsx
ALLOW: app/wishlist/page.tsx
ALLOW: app/demo/page.tsx
ALLOW: components/account-panel.tsx
ALLOW: components/account-panel.module.css
ALLOW: components/wishlist-view.tsx
ALLOW: components/wishlist-view.module.css
ALLOW: components/demo-reset.tsx
ALLOW: components/demo-reset.module.css
ALLOW: tests/e2e/account-persistence.spec.ts
ALLOW: tests/e2e/pages.golden.spec.ts
ALLOW: tests/golden/pages/account-guest.aria.yml
ALLOW: tests/golden/pages/wishlist-empty.aria.yml
ALLOW: tests/golden/pages/demo.aria.yml
ALLOW: specs/005-account-persistence/tasks.md
```

Everything else must not change, in particular `.github/**`, `scripts/golden/**`, `.coderabbit.yaml`, `AGENTS.md`, `.specify/**` and the other files under `specs/`.

## Required checks

- `npm run typecheck`
- `npm test`
- `npm run golden:check`
- `PLAYWRIGHT_PORT=<lane port> npm run test:e2e`

## Report

Changed files with the count, the output of each check, red-then-green evidence, the tasks ticked, and the CLI review status.
