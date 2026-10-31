"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SHIPPING_FIELDS, validateShipping, type ValidationErrors } from "../lib/checkout-validation";
import type { ShippingDetails } from "../lib/store";
import { OrderSummary } from "./order-summary";
import { useStore } from "./store-provider";
import styles from "./checkout-view.module.css";

const labels: Record<keyof ShippingDetails, string> = { fullName: "Full name", email: "Email", address: "Address", city: "City", postalCode: "Postal code" };
const empty: ShippingDetails = { fullName: "", email: "", address: "", city: "", postalCode: "" };

export function CheckoutView() {
  const { state, totals, hydrated, setDelivery, placeOrder } = useStore();
  const router = useRouter();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submitted = useRef(false);
  const fields = useRef<Partial<Record<keyof ShippingDetails, HTMLInputElement | null>>>({});
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hydrated || submitted.current) return;
    const result = validateShipping(values);
    setErrors(result.errors);
    const first = SHIPPING_FIELDS.find((field) => result.errors[field]);
    if (first) { fields.current[first]?.focus(); return; }
    submitted.current = true;
    setSubmitting(true);
    const order = placeOrder(result.values);
    if (order.ok) router.replace("/checkout/success");
    else { submitted.current = false; setSubmitting(false); setSubmitError(order.error); }
  }
  function blur(field: keyof ShippingDetails) {
    if (errors[field] && !validateShipping(values).errors[field]) setErrors((current) => { const next = { ...current }; delete next[field]; return next; });
  }
  return <section className={`wrap ${styles.page}`}>
    <h1>Checkout</h1>
    {!hydrated ? null : state.cart.length === 0 ? <div className={styles.empty}><p>Your bag is empty.</p><Link href="/">Continue shopping</Link></div> :
      <div className={styles.layout}>
        <form method="post" noValidate onSubmit={submit}>
          <h2>Shipping details</h2>
          <div className={styles.fields}>{SHIPPING_FIELDS.map((field) => <div className={styles.field} key={field}>
            <label htmlFor={`shipping-${field}`}>{labels[field]}</label>
            <input id={`shipping-${field}`} name={field} type={field === "email" ? "email" : "text"} autoComplete={{ fullName: "name", email: "email", address: "street-address", city: "address-level2", postalCode: "postal-code" }[field]} ref={(element) => { fields.current[field] = element; }} value={values[field]} onChange={(event) => setValues({ ...values, [field]: event.target.value })} onBlur={() => blur(field)} aria-invalid={errors[field] ? true : undefined} aria-describedby={errors[field] ? `error-${field}` : undefined} />
            {errors[field] && <p className={styles.error} id={`error-${field}`}>{errors[field]}</p>}
          </div>)}</div>
          <fieldset className={styles.delivery}><legend>Delivery</legend>
            <label><input type="radio" name="delivery" checked={state.delivery === "standard"} onChange={() => setDelivery("standard")} />Standard — Free</label>
            <label><input type="radio" name="delivery" checked={state.delivery === "express"} onChange={() => setDelivery("express")} />Express — $12</label>
          </fieldset>
          <h2>Payment</h2><p>Payment is simulated. No card is charged.</p>
          {submitError && <p role="alert" className={styles.error}>{submitError}</p>}
          <button className={styles.submit} type="submit" disabled={!hydrated || submitting}>Place order</button>
        </form>
        <aside><OrderSummary totals={totals} delivery={state.delivery} /></aside>
      </div>}
  </section>;
}
