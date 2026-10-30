# Research: Account, Wishlist, Persistence and Demo Reset

## R1. Hydration
- **Decision**: the provider renders initial state on the server and on the first client render, then reads storage in `useEffect`, replaces state and sets `hydrated = true`; saves run in an effect only after `hydrated`. `resetAll()` calls `storage.clear()` and marks the next state change as not to be saved, so the key stays removed until the shopper changes something.
- **Rationale**: avoids hydration mismatches (story 1 scenario 4) and never overwrites stored data with the initial state.

## R2. Defensive parsing
- **Decision**: `parseStored(raw, products, domain)` returns `initialState()` for non-strings, a raw string longer than 200,000 characters, invalid JSON, a non-object, or `version !== 1`; otherwise validates field by field: lines need a known product, an offered color, a numeric quantity (clamped) and a unit price (finite > 0, else the catalog price); merge duplicate `(productId, color)` lines; coupon must be `"DESK15"` with subtotal ≥ 100; delivery must be `standard` or `express`; wishlist filtered to known IDs and deduplicated; session must equal the demo account's name and email, else `null`; orders must have id `DD-\d{6}`, an ISO `placedAt`, `delivery` in {standard, express}, `coupon` `"DESK15"` or `null`, `shipping` with five string fields, finite totals, and ≥ 1 item where every item has string `productId`, `name` and `color`, an integer quantity 1–10 and finite prices, else the order is dropped. `couponNotice` is not restored.

## R3. Storage adapter
- **Decision**: `createStorage(getStorage: () => Storage | undefined)` returns `{ load(): string | null; save(value: string): void; clear(): void }`; any throw from `getStorage` or a call switches to an in-memory string permanently for the session.

## R4. Disabling storage in e2e
- **Decision**: `page.addInitScript` replaces `window.localStorage` with a getter that throws `SecurityError`; corrupt cases write the bad value before navigation.
