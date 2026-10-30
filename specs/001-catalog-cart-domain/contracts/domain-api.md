# Contract: domain API (`lib/catalog.ts`, `lib/store.ts`)

Names are binding; later specs import them. Every state function is pure and returns a new `StoreState`.

## `lib/catalog.ts`

- `type Category`, `type Art`, `type Product` (see data-model.md)
- `categories: Category[]` — the contract order
- `products: Product[]` — exactly `contracts/catalog.json` `products`, without the `source` key
- `productById(id: string): Product | undefined`
- `money(value: number): string`

## `lib/store.ts`

Constants:

- `MAX_QUANTITY = 10`, `COUPON_CODE = "DESK15"`, `COUPON_MIN_SUBTOTAL = 100`, `COUPON_RATE = 0.15`, `EXPRESS_FEE = 12`
- `DEMO_ACCOUNT = { name: "Alex", email: "alex@deskdrop.demo", password: "deskdrop123" }` — fixture-only, documented as such
- Messages (exact text):
  - `COUPON_MIN_MESSAGE = "DESK15 needs a subtotal of $100 or more."`
  - `COUPON_INVALID_MESSAGE = "That code isn't valid."`
  - `COUPON_REMOVED_NOTICE = "DESK15 was removed because your subtotal is below $100."`
  - `SIGN_IN_ERROR = "Email or password is incorrect."`
  - `EMPTY_CART_ERROR = "Your bag is empty."`
  - `INVALID_COLOR_ERROR = "Choose an available color."`
  - `OUT_OF_STOCK_ERROR = "This item is out of stock."`

Functions (`Result<T> = { ok: true; state: StoreState } | { ok: false; state: StoreState; error: string }`; `state` on failure is the unchanged input):

| Function | Behavior |
| --- | --- |
| `initialState(): StoreState` | all fields at their initial values |
| `clampQuantity(n: unknown): number` | non-finite or non-number → 1; truncate; clamp 1–10 |
| `addItem(state, product, color, quantity = 1): Result` | rejects an unknown color (`INVALID_COLOR_ERROR`) and out-of-stock (`OUT_OF_STOCK_ERROR`); merges on `(productId, color)`, keeping the existing unit price |
| `changeQuantity(state, productId, color, quantity): StoreState` | clamps; no-op if the line is missing |
| `removeItem(state, productId, color): StoreState` | no-op if missing |
| `lineTotal(line): number` | `unitPrice × quantity` |
| `totals(state): Totals` | see data-model.md |
| `applyCoupon(state, code): Result` | trims, case-insensitive; clears `couponNotice` whether accepted or rejected |
| `removeCoupon(state): StoreState` | |
| `setDelivery(state, method): StoreState` | |
| `placeOrder(state, products, shipping, { now, orderId }): Result` | rejects an empty cart with `EMPTY_CART_ERROR`; `products` resolves names |
| `toggleWishlist(state, productId): StoreState` | |
| `signIn(state, email, password): Result` | |
| `signOut(state): StoreState` | |

Every cart-changing function (`addItem`, `changeQuantity`, `removeItem`) applies the coupon-removal rule before returning.
