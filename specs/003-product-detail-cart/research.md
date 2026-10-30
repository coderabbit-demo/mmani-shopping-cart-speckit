# Research: Product Detail and Cart

## R1. Static product routes
- **Decision**: `generateStaticParams` returns the eight IDs; `dynamicParams = false` so other slugs 404; Next.js 16 passes `params` as a Promise, awaited in the page.
- **Rationale**: deterministic 404 for unknown slugs (story 1 scenario 6). Pre-flight confirms the Promise-shaped `params` on 16.4.3.

## R2. Quantity input
- **Decision**: a `QuantityStepper` with − / + buttons (`aria-label` "Decrease quantity"/"Increase quantity") and a numeric text input (`inputmode="numeric"`), committing on blur or Enter through `clampQuantity`.

## R3. Shared summary
- **Decision**: `OrderSummary({ totals, delivery })` renders rows Subtotal, DESK15 (15%) when discount > 0, Delivery (Free or $12), Total; amounts in Hack.

## R4. Reaching the cart in e2e
- **Decision**: add via the UI and follow the header "Bag" link (client navigation), since a full reload resets in-memory state until spec 005.
