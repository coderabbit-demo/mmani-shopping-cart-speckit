# /speckit-analyze record (2026-10-30)

Run by an independent read-only subagent across specs 001–005 plus a cross-feature pass (shared contracts, lane file overlap, arithmetic against the catalog, PR sizes, rule coverage). Before fixes: 2 CRITICAL, 7 HIGH (some cross-feature duplicates), about 20 MEDIUM/LOW. Arithmetic, lane overlap and PR sizes checked clean; all six cart rules have a domain and a browser test.

| ID | Severity | Finding | Resolution |
| --- | --- | --- | --- |
| 005 D1 / X3 | CRITICAL | Persisted orders not validated for `shipping`, `delivery`, `coupon`, item shape; a bad order could crash the receipt | 005 research R2, FR-010, US2 scenario 5, T001/T006 |
| 002 D1 | CRITICAL | "Product art uses tokens only" had no test | 002 T018 asserts computed `fill`/`stroke` are token values |
| 005 F1 / X2 | HIGH | Reset could not remove the storage key under the frozen provider contract | 002 store-provider contract: `resetAll()` clears storage from spec 005; 005 R1, T005, T011, T012 |
| 005 F2 / X1 | HIGH | Empty states flash (and tests can falsely pass) before hydration | `hydrated` false until mount from spec 002; 003 FR-009, 004 FR-010 gate empty states; 005 T004 reload test |
| 005 C1 | HIGH | Pre-hydration native submit could put form values in the URL | 004 FR-010, 005 FR-009: `method="post"`, submit disabled until `hydrated`; 005 US3 scenario 7 |
| 001 F1 | HIGH | Golden `--check` vs `BASELINE` undefined | 001 contracts/goldens.md and R7: `BASELINE` excluded from check; harness test |
| 001 D1 | HIGH | Scaffold scenarios 1 and 3 had no test | Mapped to the CI `npm ci`/typecheck/unit/e2e jobs (spec and T008) |
| X5 | MEDIUM | Contrast check skipped danger, mint, cobalt | 002 US4 scenario 1 and T018 |
| X4 | MEDIUM | Catalog `hex` could become raw color in components | 001 data model and 003 FR-002: names only, never rendered |
| 001 F2, C1, C2, F3, E1 | MEDIUM/LOW | Notice clearing, merge price, error constants, naming, unmeasured SC | Fixed in 001 spec, data model, contract, tasks |
| 002 C1, C2, E1, E2 | MEDIUM | Wishlist count copy, navigation scenario, edge tests, untested throw | Fixed; throw removed from the contract |
| 003 F1, F3, E1, E2 | MEDIUM/LOW | Cart line text, link vs button, stepper edge tests, unchanged-files check | Fixed |
| 004 B1, E1, F1, F2, F3 | MEDIUM/LOW | Blur semantics, double-click and delivery edge tests, "session" wording, golden source, delivery radios | Fixed |
| 005 C2, C3, B1, E1 | MEDIUM/LOW | Wishlist duplicate control, non-demo session, size unit, test file names | Fixed |
| X7 / D2 | LOW | Constitution rows V and VIII missing; README owner | Rows added; constitution 1.0.1 lists `README.md` as Coding Agent work |

Not changed: 003 F2 ("Sold out" on cards vs "Out of stock" on the detail page; kept on purpose), 005 E2 (cross-tab reload, optional).
