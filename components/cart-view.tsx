"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { money, productById } from "../lib/catalog";
import { lineTotal } from "../lib/store";
import { OrderSummary } from "./order-summary";
import { ProductArt } from "./product-art";
import { QuantityStepper } from "./quantity-stepper";
import { useStore } from "./store-provider";
import styles from "./cart-view.module.css";

export function CartView() {
  const { state, totals, hydrated, changeQuantity, removeItem, applyCoupon, removeCoupon, setDelivery } = useStore();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const errorId = useId();
  function apply(event: React.FormEvent) { event.preventDefault(); setError(applyCoupon(code) ?? ""); }
  return <section className={`wrap ${styles.page}`}>
    <h1>Your bag</h1>
    {!hydrated ? null : <div className={state.cart.length === 0 ? styles.empty : styles.layout}>
      <div>{state.cart.length === 0 ? <><p>Your bag is empty.</p><Link href="/">Continue shopping</Link></> : <><ul className={styles.lines}>{state.cart.map((line) => {
        const product = productById(line.productId);
        if (!product) return null;
        return <li className={styles.line} key={`${line.productId}:${line.color}`}>
          <div className={styles.art}><ProductArt art={product.art} /></div>
          <div className={styles.lineBody}><h2><Link href={`/products/${product.id}`}>{product.name}</Link></h2><p>Color: {line.color}</p><p className={styles.amount}>{money(line.unitPrice)} each</p><QuantityStepper value={line.quantity} onChange={(quantity) => changeQuantity(line.productId, line.color, quantity)} /><button className={styles.remove} type="button" aria-label={`Remove ${product.name} (${line.color})`} onClick={() => removeItem(line.productId, line.color)}>Remove</button></div>
          <p className={styles.amount}>{money(lineTotal(line))}</p>
        </li>;
      })}</ul>
      <form className={styles.coupon} onSubmit={apply}><label htmlFor={`${errorId}-code`}>Discount code</label><div><input id={`${errorId}-code`} value={code} onChange={(event) => setCode(event.target.value)} aria-describedby={error ? errorId : undefined} /><button type="submit">Apply</button></div>{error && <p id={errorId} className={styles.error}>{error}</p>}{state.coupon && <button type="button" onClick={() => { removeCoupon(); setError(""); }}>Remove code</button>}</form></>}
      {(state.cart.length > 0 || state.couponNotice) && <p role="status" aria-live="polite">{state.couponNotice}</p>}
      {state.cart.length > 0 && <fieldset className={styles.delivery}><legend>Delivery</legend><label><input type="radio" name="delivery" checked={state.delivery === "standard"} onChange={() => setDelivery("standard")} />Standard — Free</label><label><input type="radio" name="delivery" checked={state.delivery === "express"} onChange={() => setDelivery("express")} />Express — $12</label></fieldset>}</div>
      {state.cart.length > 0 && <aside><OrderSummary totals={totals} delivery={state.delivery} /><Link className={styles.checkout} href="/checkout">Checkout</Link></aside>}
    </div>}
  </section>;
}
