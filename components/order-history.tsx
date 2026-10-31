"use client";
import Link from "next/link";
import { money } from "../lib/catalog";
import { useStore } from "./store-provider";
import styles from "./order-history.module.css";

export function OrderHistory() {
  const { state, hydrated } = useStore();
  return <section className={`wrap ${styles.page}`}><h1>Your orders</h1>{!hydrated ? null : state.orders.length === 0 ? <div className={styles.empty}><p>No orders yet.</p><Link href="/">Start shopping</Link></div> : <div className={styles.orders}>{state.orders.map((order, index) => <article className={styles.order} key={`${order.id}:${index}`}>
    <h2>Order {order.id}</h2><p>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(order.placedAt))}</p>
    <ul>{order.items.map((item, itemIndex) => <li key={`${item.productId}:${item.color}:${itemIndex}`}><strong>{item.name}</strong><span>Color: {item.color} · Quantity: {item.quantity}</span><span>{money(item.lineTotal)}</span></li>)}</ul>
    <p>Delivery: <span>{order.delivery === "express" ? "Express" : "Standard"}</span></p><p>Total: {money(order.total)}</p>
  </article>)}</div>}</section>;
}
