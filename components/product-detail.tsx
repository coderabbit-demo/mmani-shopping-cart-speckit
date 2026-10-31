"use client";

import { useState } from "react";
import type { Product } from "../lib/catalog";
import { money } from "../lib/catalog";
import { ProductArt } from "./product-art";
import { QuantityStepper } from "./quantity-stepper";
import { useStore } from "./store-provider";
import styles from "./product-detail.module.css";

export function ProductDetail({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0].name);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const { state, addItem, toggleWishlist, hydrated } = useStore();
  const saved = state.wishlist.includes(product.id);
  function add() { setMessage(addItem(product.id, color, quantity) ?? "Added to bag"); }
  return <section className={`wrap ${styles.page}`}>
    <div className={styles.art}><ProductArt art={product.art} />{product.badge && <span className={styles.badge}>{product.badge}</span>}</div>
    <div className={styles.content}>
      <p className={styles.eyebrow}>{product.category} · <span aria-label={`Rating ${product.rating} out of 5`}>★ {product.rating}</span></p>
      <h1>{product.name}</h1>
      <p className={styles.subtitle}>{product.subtitle}</p>
      <p className={styles.price}>{money(product.price)}</p>
      <p className={styles.description}>{product.description}</p>
      <fieldset className={styles.colors}><legend>Color</legend>{product.colors.map((option) => <label key={option.name}><input type="radio" name="color" value={option.name} checked={color === option.name} onChange={() => setColor(option.name)} />{option.name}</label>)}</fieldset>
      <QuantityStepper value={quantity} onChange={setQuantity} />
      <div className={styles.actions}><button className={styles.primary} type="button" disabled={!product.inStock || !hydrated} onClick={add}>Add to bag</button><button className={styles.secondary} type="button" aria-label={`Save ${product.name} to wishlist`} aria-pressed={saved} onClick={() => toggleWishlist(product.id)}>{saved ? "Saved to wishlist" : "Save to wishlist"}</button></div>
      {!product.inStock && <p>Out of stock</p>}
      <p role="status" aria-live="polite">{message}</p>
      <h2>Details</h2><ul>{product.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
    </div>
  </section>;
}
