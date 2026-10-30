# Research: Checkout, Receipt and Orders

## R1. Validation
- **Decision**: `validateShipping(raw)` trims every field and returns `{ values, errors }` with messages from contracts/validation.md; email regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`; postal code `^[A-Za-z0-9](?:[A-Za-z0-9 -]{1,8})[A-Za-z0-9]$`.
- **Rationale**: pure, unit-testable, no dependency.

## R2. Single submission
- **Decision**: a `submitting` flag disables "Place order" after the first valid submit; `router.replace("/checkout/success")` after `placeOrder` succeeds.

## R3. Stable success golden
- **Decision**: Playwright aria snapshots accept `/regex/` values; the order ID and date use `/DD-\d{6}/` and a date regex.

## R4. Console and URL checks
- **Decision**: e2e collects `page.on("console")` messages and every `framenavigated` URL during checkout and asserts none contains the benign marker values typed into the form.
