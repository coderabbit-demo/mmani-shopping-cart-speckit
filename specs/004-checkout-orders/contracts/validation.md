# Contract: `lib/checkout-validation.ts`

`validateShipping(input: Record<string, unknown>): ValidationResult` — non-string values count as empty.

| Field | Label | Rule | Message |
| --- | --- | --- | --- |
| fullName | Full name | non-empty after trim, ≤ 80 chars | Enter your full name. |
| email | Email | non-empty and matches research.md R1 | Enter a valid email address. |
| address | Address | non-empty, ≤ 120 chars | Enter your street address. |
| city | City | non-empty, ≤ 60 chars | Enter your city. |
| postalCode | Postal code | matches research.md R1 | Enter a valid postal code. |

Exported: `validateShipping`, `SHIPPING_FIELDS` (ordered field keys, used for focus order).
