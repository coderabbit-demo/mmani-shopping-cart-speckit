# Run 2 PR and lane map

Run 2 of 3 (GitHub Spec Kit 1.2.5). Requirements: `specs/NNN-*/spec.md`; rules: `.specify/memory/constitution.md`; loop: the kit's `PLAYBOOK.md`. Jira epic [SC-20](https://coderabbit-demo.atlassian.net/browse/SC-20); every issue is labeled `run-2` and `mmani-shopping-cart-speckit`.

## PRs

| PR | Title | Tasks | Brief | Jira | Story | Depends on | Lane |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `chore: scaffold and QA startup scripts` | 001 T001–T008 | `docs/briefs/01-scaffold.md` | SC-26 | SC-21 | — | A |
| 2 | `feat: catalog and cart domain` | 001 T009–T023 | `docs/briefs/02-domain.md` | SC-27 | SC-21 | 1 | A |
| 3 | `chore: golden harness and contrast helper` | 001 T024–T028 | `docs/briefs/03-tooling.md` | SC-28 | SC-21 | 1 | B |
| 4 | `test: pin domain goldens` | 001 T029–T031 | `docs/briefs/04-domain-goldens.md` | SC-29 | SC-21 | 2, 3 | B |
| 5 | `feat: storefront shell and browse` | 002 T001–T022 | `docs/briefs/05-storefront.md` | SC-30 | SC-22 | 2, 3 | A |
| 6 | `feat: product detail and cart` | 003 T001–T013 | `docs/briefs/06-detail-cart.md` | SC-31 | SC-23 | 5 | A |
| 7 | `feat: persistence module` | 005 T001–T003 | `docs/briefs/07-persistence.md` | SC-32 | SC-25 | 2 | B |
| 8 | `feat: checkout, receipt and orders` | 004 T001–T014 | `docs/briefs/08-checkout.md` | SC-33 | SC-24 | 6 | A |
| 9 | `feat: account, wishlist, persistence and demo reset` | 005 T004–T015 | `docs/briefs/09-account.md` | SC-34 | SC-25 | 4, 7, 8 | A |

## Lanes

```text
Wave 0   PR1 scaffold ───────────────────────────────┐   (plan-first: large, novel)
Wave 1   A: PR2 domain            B: PR3 tooling      │   (parallel, disjoint files)
Wave 2   A: PR5 storefront        B: PR4 domain goldens   (parallel)
Wave 3   A: PR6 detail + cart     B: PR7 persistence module (parallel)
Wave 4   A: PR8 checkout          (B idle, or Deep Scan baseline)
Wave 5   A: PR9 account + persistence wiring
```

Five sequential waves instead of nine PRs in series. Each lane gets its own Coding Agent task, worktree and `PLAYWRIGHT_PORT` (lane A 3100, lane B 3200).

## Why the lanes don't collide

| Pair | Lane A files | Lane B files | Shared |
| --- | --- | --- | --- |
| PR2 ∥ PR3 | `lib/catalog.ts`, `lib/store.ts`, 6 domain tests | `scripts/goldens/*`, `lib/contrast.ts`, 2 tests, `package.json` scripts | none (`package.json` changes only in PR3) |
| PR5 ∥ PR4 | `app/**`, `components/**`, `lib/browse.ts`, `public/**`, `playwright.config.ts`, `tests/e2e/**`, `tests/golden/pages/**` | `scripts/goldens/scenarios.mjs`, `tests/golden/domain/**`, harness test | none (separate golden directories and manifests) |
| PR6 ∥ PR7 | `app/products/**`, `app/cart/**`, new components, e2e, page goldens | `lib/persistence.ts`, `tests/persistence.test.mjs` | none |
| PR8 ∥ PR7 | `app/checkout/**`, `app/orders/**`, `lib/checkout-validation.ts`, new components | as above | none |

Serial in lane A on purpose: PR5 → PR6 → PR8 → PR9 build on each other's components and all add page goldens to `tests/e2e/pages.golden.spec.ts`. The hot files (`components/store-provider.tsx`, `components/shell.tsx`, `app/globals.css`) change only in PR5, and the provider again only in PR9; PR6 and PR8 use CSS modules.

## Scaffold PR and the QA Agent

PR1 ships `scripts/qa/setup.sh` (`npm ci`) and `scripts/qa/start.sh` (`npm run build && npm run start -- --port 3100`, bound to `0.0.0.0`). After it merges, the maintainer prepares the QA Agent environment from `main` with those two scripts; ready check: `GET /` → 200 with the "DeskDrop" heading. QA is requested on PR2 onward.

## Milestones

- Deep Scan baseline after PR5 (first UI attack surface); pre-release Deep Scan after PR9.
- After every merge: `/speckit-converge` on that spec, stage times in `docs/stage-log.csv`, post-merge automation result checked (`docs/automations/post-merge-sweep.md`).

## Maintainer actions before PR1 opens

1. GitHub App covers `coderabbit-demo/mmani-shopping-cart-speckit`.
2. Publish the **CodeRabbit Security** check for the repo (block on Major and above).
3. Create the post-merge **Automations** trigger from `docs/automations/post-merge-sweep.md` (paused draft; enable before PR1 merges).
