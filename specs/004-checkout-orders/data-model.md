# Data Model: Checkout, Receipt and Orders

Uses `ShippingDetails`, `Order` and `StoreState` from spec 001.

## ShippingInput (form state)
`{ fullName, email, address, city, postalCode }` as typed (strings).

## ValidationResult
`{ values: ShippingDetails; errors: Partial<Record<keyof ShippingDetails, string>> }`; valid when `errors` is empty. `values` holds trimmed strings.

## Receipt view
Derived from `state.orders[0]`; first name = first whitespace-separated word of `shipping.fullName`.
