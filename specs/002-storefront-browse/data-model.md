# Data Model: Storefront Shell and Browse

Reuses `StoreState`, `Product` and `Totals` from `specs/001-catalog-cart-domain/data-model.md`.

## BrowseFilters

| Field | Type | Default |
| --- | --- | --- |
| query | string | `""` |
| category | Category | `"All objects"` |
| inStockOnly | boolean | `false` |
| sort | `"featured" \| "price-asc" \| "price-desc" \| "rating"` | `"featured"` |

`filterProducts(products, filters): Product[]` — trim and lowercase `query`; keep products whose name, subtitle or category contains it; apply category unless "All objects"; drop out-of-stock when `inStockOnly`; sort stably (ties keep catalog order; rating compares numerically).

Filters live in component state, not in the URL.
