# DeskDrop Shopping Cart Constitution

DeskDrop is a demo storefront built in `coderabbit-demo/mmani-shopping-cart-speckit`, run 2 of the
Golden Framework comparison. These principles bind every spec, plan, task list, brief and pull
request in this repository.

## Core Principles

### I. One Writer

- The CodeRabbit Coding Agent MUST author all product code and tests: everything under `app/`,
  `components/`, `lib/`, `tests/`, `scripts/` (except `scripts/golden/`), `public/`, `README.md`, and
  the npm manifest, lockfile and tool configuration.
- The orchestrator MUST write only Spec Kit artifacts (`.specify/memory/`, `specs/`), briefs
  (`docs/briefs/`), run documentation under `docs/`, and repository configuration
  (`.coderabbit.yaml`, `AGENTS.md`, `.github/workflows/`, `scripts/golden/`).
- A commit by the orchestrator that touches a product path MUST NOT merge.
- Judges MUST run read-only.

Rationale: the run compares how requirements are written, so authorship of code stays fixed.

### II. Test-First Evidence

- Every new behavior and every bug fix MUST ship with a test that asserts observable behavior
  (returned values, rendered text, stored state), not merely that a module imports.
- Every acceptance scenario in a feature's `spec.md` that the PR's task range covers MUST map to
  at least one unit or e2e test.
- Every regression guard MUST fail on the PR's base commit and pass on its head (red-then-green).
- Tests of brand-new modules are exempt from red-then-green and MUST instead be proven by
  mutation: a judge mutates the implementation and at least one test MUST fail.
- Existing tests and assertions MUST NOT be removed or weakened without the brief naming the change.

### III. Pinned Behavior

- Domain outputs MUST be pinned by JSON goldens under `tests/golden/`, and key pages by Playwright
  aria snapshots under `tests/golden/pages/`, once the pinning PR lands.
- A golden MUST change only when the PR's brief names that exact change.
- A PR whose title starts with `refactor` MUST leave every golden byte-identical.
- CI MUST check goldens on every pull request.

### IV. Scoped Changes

- Each PR MUST change fewer than 30 files, goldens excluded.
- Each PR MUST change only files matched by its brief's `ALLOW:` globs and those of approved fix
  rounds; `scripts/golden/scope-gate.sh` MUST pass before the PR opens.
- One PR MUST implement one task phase, or one contiguous task range, of one feature's `tasks.md`.
- Dependencies MUST change only with an `ALLOW:` line the maintainer approved, and the manifest
  and lockfile MUST stay consistent.

### V. Strict Gate

A PR MUST merge only through `scripts/golden/strict-gate.sh`, followed by
`gh pr merge --match-head-commit <gated sha>`, after the maintainer approves the merge, and only
when all of these hold on the exact head commit:

- CodeRabbit has approved that commit;
- no review thread is unresolved;
- the latest review has no Critical or Major finding;
- every check is green (a completed `CodeRabbit Security` check concluding neutral counts as passing);
- the Security Gate row of CodeRabbit's pre-merge checks has passed for that commit.

### VI. Security by Default

- Untrusted input (form fields, query strings, stored data) MUST render as text, never as HTML.
- No secret MUST be committed. Personal data MUST NOT appear in URLs or logs, and MUST be stored
  only where the feature requires it.
- Data read from localStorage MUST be parsed defensively: corrupt, missing or wrongly shaped data
  MUST fall back to a valid empty state without crashing.
- Demo credentials MUST be labeled as fixture-only; the app MUST NOT claim real authentication or
  payment.

### VII. Brand and Accessibility

- Visual work MUST follow `docs/BRAND.md`.
- Colors MUST be CSS custom properties defined in `:root` token blocks in `app/globals.css`;
  components and product art MUST use tokens, never raw hex or rgb.
- Text and interactive controls MUST meet WCAG AA contrast in both the dark and light themes, and
  an e2e test MUST check the key text and CTA tokens in both color schemes.
- Interactive controls MUST be reachable and operable by keyboard and MUST have accessible names.

### VIII. No Noise

- Code MUST NOT contain TODOs, debug prints, commented-out code, reasoning comments, or comments
  quoting review requests.

## Technology Constraints

- Next.js 16, React 19, TypeScript 7, Node >=22.6.0, npm.
- Unit tests run with `node --test`; end-to-end tests run with Playwright.
- Persistence is browser localStorage only, with an in-memory fallback. There is no backend, no
  network API, and no real payment or authentication.
- No dependency beyond those the scaffold PR's approved manifest names.
- The scaffold MUST ship `scripts/qa/setup.sh` (`npm ci`) and `scripts/qa/start.sh` (build, then
  start on port 3100 bound to `0.0.0.0`) so the QA Agent environment can start the app from `main`.

## Development Workflow

- Requirements live in `specs/NNN-feature/spec.md`; design in `plan.md` and its companions; work in
  `tasks.md`. Jira project `SC`, epic SC-20, is the system of record: one Story per spec, one Task
  per PR, each labeled `run-2` and `mmani-shopping-cart-speckit`.
- Each PR has a thin brief in `docs/briefs/` naming its task range, Jira key, verified
  assumptions, `ALLOW:` globs, allowed golden changes and required checks.
- Before a PR opens: the scope gate passes, the required checks pass, at least one CodeRabbit CLI
  review has run on the pushed commit, four judges (scope, behavior on a different model, tests by
  mutation, security) have passed, and red-then-green holds for every regression guard.
- Every Critical and Major finding MUST be fixed. Every judge note of Minor or higher MUST be fixed
  or listed in the PR body as skipped with a reason.
- After each merge the orchestrator runs `/speckit-converge` and records stage times in
  `docs/stage-log.csv`.

## Governance

This constitution supersedes other practice in this repository. `AGENTS.md` restates its author
rules for the Coding Agent; where they differ, this document wins. `/speckit-plan` and
`/speckit-analyze` MUST check every plan and task list against it, and a violation is a CRITICAL
analysis finding.

Amendments require the maintainer's approval, land as their own docs-only commit, and bump the
version: MAJOR for removing or redefining a principle, MINOR for a new principle or materially
expanded rule, PATCH for wording. Reviewers and judges verify compliance on every PR.

**Version**: 1.0.1 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-30
