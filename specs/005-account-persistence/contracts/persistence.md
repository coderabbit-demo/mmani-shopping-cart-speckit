# Contract: `lib/persistence.ts`

| Export | Signature | Behavior |
| --- | --- | --- |
| `STORAGE_KEY` | `"deskdrop-demo-v1"` | |
| `MAX_STORED_LENGTH` | `200_000` | maximum raw string length |
| `serialize` | `(state: StoreState) => string` | `JSON.stringify({ version: 1, state: { ...state, couponNotice: null } })` |
| `parseStored` | `(raw: unknown, products: Product[], domain: { initialState, clampQuantity, totals }) => StoreState` | research.md R2; never throws |
| `createStorage` | `(getStorage: () => Storage \| undefined) => { load, save, clear }` | research.md R3; never throws |

`lib/persistence.ts` imports `lib/store.ts` and `lib/catalog.ts` with `import type` only (spec 001 research.md R1); the caller passes `products` and the three domain functions, so the module needs no value import.
