"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import NotFound from "../app/not-found";
import { ShoppingBag } from "lucide-react";
import { useStore } from "./store-provider";

export function Shell({ children }: { children: ReactNode }) {
  const { bagCount, wishlistCount } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [missingProduct, setMissingProduct] = useState(false);
  useEffect(() => {
    const showMissing = (event: Event) => {
      const href = (event as CustomEvent<string>).detail;
      window.history.pushState({ deskdropMissingProduct: true }, "", href);
      setMissingProduct(true);
    };
    const restore = (event: PopStateEvent) => setMissingProduct(Boolean(event.state?.deskdropMissingProduct));
    window.addEventListener("deskdrop:missing-product", showMissing);
    window.addEventListener("popstate", restore);
    return () => {
      window.removeEventListener("deskdrop:missing-product", showMissing);
      window.removeEventListener("popstate", restore);
    };
  }, []);
  function goHome(event: React.MouseEvent<HTMLAnchorElement>) {
    setMenuOpen(false);
    if (missingProduct && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault();
      window.history.pushState({}, "", "/");
      setMissingProduct(false);
    }
  }
  return <div className="site">
    <header className="site-header">
      <div className="header-inner wrap">
        <Link className="wordmark" href="/" onClick={goHome}>DeskDrop<span aria-hidden="true">.</span></Link>
        <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}>Menu <span aria-hidden="true">{menuOpen ? "−" : "+"}</span></button>
        <nav id="site-nav" aria-label="Main navigation" className={menuOpen ? "site-nav is-open" : "site-nav"}>
          <Link href="/" onClick={goHome}>Shop</Link>
          <Link href="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist ({wishlistCount})</Link>
          <Link href="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
          <Link href="/account" onClick={() => setMenuOpen(false)}>Account</Link>
          <Link className="bag-link" href="/bag" onClick={() => setMenuOpen(false)}><ShoppingBag aria-hidden="true" size={17} /> Bag ({bagCount})</Link>
        </nav>
      </div>
    </header>
    <main id="main-content">{missingProduct ? <NotFound onBack={goHome} /> : children}</main>
    <footer className="site-footer"><div className="wrap footer-inner"><div><span className="footer-name">DeskDrop<span>.</span></span><p>Little things for your big ideas.</p></div><div className="footer-credit"><span>Built with</span><picture><source media="(prefers-color-scheme: light)" srcSet="/brand/orange-typemark.svg" /><img src="/brand/white-typemark.svg" alt="CodeRabbit" /></picture></div></div></footer>
  </div>;
}
