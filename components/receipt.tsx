"use client";
import Link from "next/link";
import { money } from "../lib/catalog";
import { OrderSummary } from "./order-summary";
import { useStore } from "./store-provider";
import styles from "./receipt.module.css";

export function Receipt() {
  const { state, hydrated } = useStore();
  const order = state.orders[0];
  if (!hydrated) return <section className={`wrap ${styles.page}`} />;
  if (!order) return <section className={`wrap ${styles.page}`}><h1>No recent order.</h1><Link href="/">Back to the shop</Link></section>;
  return <section className={`wrap ${styles.page}`}>
    <h1>Thank you, {order.shipping.fullName.split(/\s+/)[0]}!</h1>
    <p className={styles.id}>Order {order.id}</p>
    <p>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(order.placedAt))}</p>
    <div className={styles.layout}><div><h2>Items</h2><ul className={styles.items}>{order.items.map((item, index) => <li key={`${item.productId}:${item.color}:${index}`}><strong>{item.name}</strong><span>Color: {item.color} · Quantity: {item.quantity}</span><span>{money(item.lineTotal)}</span></li>)}</ul><h2>Shipping details</h2><p>{order.shipping.fullName}<br />{order.shipping.email}<br />{order.shipping.address}<br />{order.shipping.city}, {order.shipping.postalCode}</p><p>Delivery: {order.delivery === "express" ? "Express" : "Standard"}</p></div><OrderSummary totals={order} delivery={order.delivery} /></div>
    <p><Link href="/orders">View orders</Link></p>
  </section>;
}
