"use client";
import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { quickAddColor } from "../lib/browse";
import { money, type Product } from "../lib/catalog";
import { useStore } from "./store-provider";
import { ProductArt } from "./product-art";

export function ProductCard({ product }: { product: Product }) {
  const { state, addItem, toggleWishlist } = useStore();
  const router = useRouter();
  const href = `/products/${product.id}`;
  const pendingLookup = useRef<AbortController | null>(null);
  useEffect(() => {
    function cancelLookup() { pendingLookup.current?.abort(); }
    function cancelOnNavigation(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (link && (!link.getAttribute("target") || link.getAttribute("target") === "_self")) cancelLookup();
    }
    document.addEventListener("click", cancelOnNavigation, true);
    window.addEventListener("popstate", cancelLookup);
    window.addEventListener("hashchange", cancelLookup);
    return () => {
      cancelLookup();
      document.removeEventListener("click", cancelOnNavigation, true);
      window.removeEventListener("popstate", cancelLookup);
      window.removeEventListener("hashchange", cancelLookup);
    };
  }, []);
  async function followProduct(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    pendingLookup.current?.abort();
    const lookup = new AbortController();
    pendingLookup.current = lookup;
    const origin = window.location.href;
    try {
      const response = await fetch(href, { signal: lookup.signal });
      if (lookup.signal.aborted || window.location.href !== origin) return;
      if (response.status === 404) {
        window.dispatchEvent(new CustomEvent("deskdrop:missing-product", { detail: href }));
        return;
      }
    } catch {
      if (lookup.signal.aborted || window.location.href !== origin) return;
    }
    if (!lookup.signal.aborted && window.location.href === origin) router.push(href);
  }
  const saved = state.wishlist.includes(product.id);
  return <article className="product-card">
    <div className="art-panel"><ProductArt art={product.art} />{product.badge && <span className="badge">{product.badge}</span>}<button className="save-button" type="button" aria-label={`Save ${product.name} to wishlist`} aria-pressed={saved} onClick={() => toggleWishlist(product.id)}><Heart size={19} fill={saved ? "currentColor" : "none"} aria-hidden="true" /></button></div>
    <div className="card-body"><div className="card-topline"><span>{product.category}</span><span aria-label={`Rating ${product.rating} out of 5`}>★ {product.rating}</span></div>
      <h2><Link href={href} onClick={followProduct}>{product.name} <ArrowUpRight size={16} aria-hidden="true" /></Link></h2><p className="subtitle">{product.subtitle}</p>
      <div className="card-bottom"><span className="price">{money(product.price)}</span><button className="add-button" type="button" disabled={!product.inStock} aria-label={product.inStock ? `Add ${product.name} to bag` : "Sold out"} onClick={() => addItem(product.id, quickAddColor(product))}>{product.inStock ? "Add to bag" : "Sold out"}<span aria-hidden="true">{product.inStock ? " +" : ""}</span></button></div>
    </div>
  </article>;
}
