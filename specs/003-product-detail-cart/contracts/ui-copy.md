# Contract: visible copy and accessible names (spec 003)

| Element | Text / accessible name |
| --- | --- |
| Product heading | product name (h1) |
| Color group | radio group "Color" with one radio per color name |
| Quantity | "Quantity" input, buttons "Decrease quantity" / "Increase quantity" |
| Add button | Add to bag (disabled with "Out of stock" text when not in stock) |
| Add confirmation (polite) | Added to bag |
| Cart heading | Your bag (h1) |
| Empty bag | Your bag is empty. + link Continue shopping |
| Line | name link, "Color: <color>", unit price, quantity control, line total, button "Remove <name> (<color>)" |
| Coupon | input "Discount code", button Apply, button Remove code (when applied) |
| Coupon messages | exact strings from spec 001 contracts/domain-api.md |
| Delivery | radio group "Delivery": "Standard — Free", "Express — $12" |
| Summary rows | Subtotal · DESK15 (15%) · Delivery · Total |
| Checkout button | Checkout (link to `/checkout`) |
