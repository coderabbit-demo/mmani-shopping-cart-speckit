# Research: Storefront Shell and Browse

## R1. Brand tokens

- **Decision**: `app/globals.css` defines the eight `docs/BRAND.md` tokens plus `--color-on-primary`, `--color-focus` and `--color-danger` in `:root` (dark values) and in `@media (prefers-color-scheme: light) { :root { … } }`. Dark: `--color-bg` a deep mauve, `--color-surface` a lighter mauve, `--color-text` near-white mauve; light: inverse. `--color-primary` is `#FF570A` in both themes; when its contrast with `--color-on-primary` is below 4.5:1, the button text token changes, never the orange.
- **Rationale**: BRAND.md makes raw colors outside `:root` a Major finding; AA is checked by e2e.
- **Alternatives considered**: a `data-theme` toggle (not required; rejected).

## R2. Fonts

- **Decision**: Geist via `next/font/google` (weights 400 and 600) as `--font-geist`; Hack via `next/font/local` from `public/fonts/Hack-Regular.woff2` and `Hack-Bold.woff2` as `--font-hack`, with the upstream license in `public/fonts/LICENSE.md`.
- **Rationale**: BRAND.md; no npm font package. The build must still succeed offline (Next.js falls back to system fonts if Google Fonts is unreachable; pre-flight confirms the behavior on Next 16.4.3).

## R3. Contrast check

- **Decision**: `tests/e2e/contrast.spec.ts` emulates `colorScheme: "dark"` and `"light"`, reads computed token values with `getComputedStyle(document.documentElement)`, and asserts ratios with `contrastRatio` from `lib/contrast.ts`.

## R4. Page goldens

- **Decision**: `expect(page.locator("body")).toMatchAriaSnapshot({ name: "home.aria.yml" })` with `snapshotPathTemplate: "tests/golden/pages/{arg}{ext}"`; refreshed with `npm run golden:capture:pages`.
- **Rationale**: aria snapshots are deterministic; raw HTML carries build hashes.

## R5. Provider shape

- **Decision**: a single React context holding `StoreState` with `useReducer`-style dispatch to the 001 pure functions; derived `totals`, `bagCount` and `wishlistCount` are computed per render. See contracts/store-provider.md.
