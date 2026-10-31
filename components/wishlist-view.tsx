"use client";

import Link from "next/link";
import { productById } from "../lib/catalog";
import { ProductCard } from "./product-card";
import { useStore } from "./store-provider";
import styles from "./wishlist-view.module.css";

export function WishlistView() {
  const { state, hydrated } = useStore();
  const saved = state.wishlist.map(productById).filter(product => product !== undefined);
  return <section className={`wrap ${styles.page}`}>
    <h1>Your wishlist</h1>
    {!hydrated ? null : saved.length ? <div className="product-grid">{saved.map(product => <ProductCard key={product.id} product={product} />)}</div> :
      <div className={styles.empty}><p>Your wishlist is empty.</p><Link href="/">Browse the shop</Link></div>}
  </section>;
}
