# Data Model: Account, Wishlist, Persistence and Demo Reset

## PersistedSnapshot
`{ "version": 1, "state": StoreState }` (spec 001 data-model.md), JSON, under `deskdrop-demo-v1`. `couponNotice` is written as `null`.

## Session
`{ name: string; email: string } | null` — never a password.

Parsing rules: research.md R2.
