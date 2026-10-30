# Data Model: Catalog and Cart Domain

All values are plain, JSON-serializable data. Functions return new values and never mutate inputs.

## Category

`"All objects" | "Desk essentials" | "Lighting" | "Tech accessories" | "Little extras"`. "All objects" is a filter value, not a product category.

## Product (read-only, from `contracts/catalog.json`)

| Field | Type | Notes |
| --- | --- | --- |
| id | string | slug, unique, used in `/products/[id]` |
| name, subtitle, description | string | copy, verbatim |
| price | number | whole dollars, > 0 |
| category | Category (not "All objects") | |
| art | `"lamp" \| "keyboard" \| "headphones" \| "plant" \| "stand" \| "mat" \| "organizer" \| "clock"` | selects the built-in SVG |
| colors | `{ name: string; hex: string }[]` | ≥ 1; `hex` is catalog data only and is never rendered (the UI shows color names; see spec 003) |
| badge | string, optional | |
| rating | string | e.g. "4.9" |
| details | string[] | |
| inStock | boolean | only `slow-time-clock` is false |

## CartLine

| Field | Type | Rules |
| --- | --- | --- |
| productId | string | must exist in the catalog |
| color | string | one of the product's color names |
| quantity | integer | 1–10 |
| unitPrice | number | the product price when first added |

Identity: `(productId, color)`. No stored line total; `lineTotal = unitPrice × quantity`.

## StoreState

| Field | Type | Initial |
| --- | --- | --- |
| cart | CartLine[] | `[]` |
| coupon | `"DESK15" \| null` | `null` |
| couponNotice | string \| null | `null` (set to the removal notice when a change drops the subtotal below $100; cleared by the next coupon action or order) |
| delivery | `"standard" \| "express"` | `"standard"` |
| wishlist | string[] (product IDs, insertion order, no duplicates) | `[]` |
| session | `{ name: string; email: string } \| null` | `null` |
| orders | Order[] (newest first) | `[]` |

## Totals (derived)

`{ subtotal, discount, deliveryFee, total }`, with `discount = coupon && subtotal >= 100 ? round2(subtotal × 0.15) : 0`, `deliveryFee = delivery === "express" ? 12 : 0`, `total = round2(subtotal − discount + deliveryFee)`.

## ShippingDetails

`{ fullName, email, address, city, postalCode }`, all non-empty strings (validated in spec 004; the domain only requires presence).

## Order

| Field | Type |
| --- | --- |
| id | `DD-` + 6 digits |
| placedAt | ISO 8601 string |
| items | `{ productId, name, color, quantity, unitPrice, lineTotal }[]` (every cart line, in cart order) |
| subtotal, discount, deliveryFee, total | number |
| delivery | `"standard" \| "express"` |
| coupon | `"DESK15" \| null` |
| shipping | ShippingDetails |

## State transitions

- add / changeQuantity / remove → recompute totals; if `coupon` is set and subtotal < 100 → `coupon = null`, `couponNotice = COUPON_REMOVED_NOTICE`.
- applyCoupon(code) → notice cleared in both outcomes; accepted: `coupon = "DESK15"`; rejected: coupon unchanged, result carries the error.
- removeCoupon → `coupon = null`, notice cleared.
- placeOrder → `orders = [order, ...orders]`, `cart = []`, `coupon = null`, `couponNotice = null`, `delivery = "standard"`.
- signIn / signOut → only `session` changes.
