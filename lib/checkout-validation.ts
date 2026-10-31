import type { ShippingDetails } from "./store";

export const SHIPPING_FIELDS = ["fullName", "email", "address", "city", "postalCode"] as const;
type Field = typeof SHIPPING_FIELDS[number];
export type ValidationErrors = Partial<Record<Field, string>>;

export function validateShipping(input: Record<string, unknown>): { values: ShippingDetails; errors: ValidationErrors } {
  const value = (field: Field) => typeof input[field] === "string" ? (input[field] as string).trim() : "";
  const values = { fullName: value("fullName"), email: value("email"), address: value("address"), city: value("city"), postalCode: value("postalCode") };
  const errors: ValidationErrors = {};
  if (!values.fullName || values.fullName.length > 80) errors.fullName = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.address || values.address.length > 120) errors.address = "Enter your street address.";
  if (!values.city || values.city.length > 60) errors.city = "Enter your city.";
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9 -]{1,8})[A-Za-z0-9]$/.test(values.postalCode)) errors.postalCode = "Enter a valid postal code.";
  return { values, errors };
}
