# Research: Catalog and Cart Domain

Each item is verified again at pre-flight against the scaffold commit; a mismatch stops the task.

## R1. Module imports between TypeScript files under `node --test`

- **Decision**: unit tests are `.mjs` files that import `lib/*.ts` with the `.ts` extension, run as `node --experimental-strip-types --test tests/*.test.mjs`. Inside `lib/`, files import each other's **types only** (`import type … from "./catalog"`); `lib/store.ts` receives products as arguments instead of importing catalog values.
- **Rationale**: Node's type stripping needs explicit extensions for value imports, while `tsc --noEmit` without `allowImportingTsExtensions` rejects `.ts` value imports. Type-only imports are erased by both, so this layout satisfies the typechecker, Node and the Next.js bundler without changing compiler options.
- **Alternatives considered**: `allowImportingTsExtensions` (changes the compiler contract for the whole app; rejected); a test bundler (new dependency; rejected).

## R2. Exact dependency versions

- **Decision**: pin the reference manifest's packages at exact versions (no `^`): next 16.4.3, react 19.3.1, react-dom 19.3.1, lucide-react 1.63.0, @playwright/test 1.64.1, typescript 7.0.2, @types/node 26.6.5, @types/react 19.3.0, @types/react-dom 19.3.0. `"type": "module"`, `"engines": { "node": ">=22.6.0" }`.
- **Rationale**: the constitution allows only the approved set; exact pins make the lockfile reproducible across the three runs.
- **Alternatives considered**: caret ranges as in the reference (non-reproducible; rejected).

## R3. npm scripts

- **Decision**: the scaffold defines `dev`, `build`, `start` (both `--hostname 0.0.0.0`), `typecheck` (`tsc --noEmit`), `test` (the R1 command), `test:e2e` (`playwright test`, with Playwright's `webServer` building and starting on `PLAYWRIGHT_PORT`, default 3100). The tooling phase adds `golden:capture`, `golden:check` and `golden:capture:pages`.
- **Rationale**: CI runs `npm run --if-present golden:check`, so the golden job is a no-op until the harness exists and live afterwards. `PLAYWRIGHT_PORT` lets parallel lanes run e2e side by side.

## R4. QA startup scripts

- **Decision**: `scripts/qa/setup.sh` runs `npm ci`; `scripts/qa/start.sh` runs `npm run build && npm run start -- --port 3100`. Both start with `#!/usr/bin/env bash` and `set -euo pipefail`, are executable, and run from any working directory by changing to the repository root first.
- **Rationale**: the QA Agent environment points at these two files; the ready check is `GET /` → 200 with the "DeskDrop" heading.

## R5. Money and rounding

- **Decision**: amounts are numbers of dollars; discounts round half-up to cents (`Math.round(x * 100) / 100`); `money()` uses `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })` with 0 fraction digits for whole amounts and 2 otherwise.
- **Rationale**: catalog prices are whole dollars, so only the 15% discount creates cents.

## R6. Determinism

- **Decision**: `placeOrder` takes `now` (ISO string) and `orderId` from the caller; the UI supplies the clock and a 6-digit random suffix. Goldens use fixed values.
- **Rationale**: pure functions and byte-stable goldens.

## R7. Golden format

- **Decision**: one JSON file per scenario, `JSON.stringify(value, null, 2) + "\n"`, keys in insertion order; `MANIFEST.sha256` lists `sha256  filename` sorted by name; `BASELINE` holds the commit the goldens were captured from and is excluded from `--check`. `--check` recomputes in memory and compares bytes, reporting each differing scenario.
- **Rationale**: byte comparison is simple and catches any drift; the manifest makes tampering visible in review.
