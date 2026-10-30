# Contract: `components/store-provider.tsx`

`"use client"`. Exports `StoreProvider` and `useStore()`.

`useStore()` returns:

| Member | Type | Delegates to (lib/store.ts) |
| --- | --- | --- |
| `state` | StoreState | — |
| `totals` | Totals | `totals(state)` |
| `bagCount` | number | sum of quantities |
| `wishlistCount` | number | `state.wishlist.length` |
| `addItem(productId, color, quantity?)` | `string \| null` (error message or null) | `addItem` |
| `changeQuantity(productId, color, quantity)` | void | `changeQuantity` |
| `removeItem(productId, color)` | void | `removeItem` |
| `applyCoupon(code)` | `string \| null` | `applyCoupon` |
| `removeCoupon()` | void | `removeCoupon` |
| `setDelivery(method)` | void | `setDelivery` |
| `placeOrder(shipping)` | `{ ok: true; order: Order } \| { ok: false; error: string }` | `placeOrder` with `now = new Date().toISOString()` and a random 6-digit `DD-` ID |
| `toggleWishlist(productId)` | void | `toggleWishlist` |
| `signIn(email, password)` | `string \| null` | `signIn` |
| `signOut()` | void | `signOut` |
| `resetAll()` | void | `initialState()`; from spec 005 on it also removes the stored key and skips saving the reset state |
| `hydrated` | boolean | `false` on the server and the first client render, `true` after mount (spec 005: after reading storage). Empty states and form submit buttons wait for it |

Spec 005 is the only later spec allowed to change this file, and only to add persistence (load on mount, save on change, `resetAll` clearing storage) without changing the members' signatures.
