"use client";

import { useState } from "react";
import { useStore } from "./store-provider";
import styles from "./demo-reset.module.css";

export function DemoReset() {
  const { hydrated, resetAll } = useStore();
  const [cleared, setCleared] = useState(false);
  function reset() {
    if (!window.confirm("Clear all demo data?")) return;
    resetAll();
    setCleared(true);
  }
  return <section className={`wrap ${styles.page}`}>
    <h1>Demo data</h1>
    <p>Clear your bag, wishlist, account and order history on this device.</p>
    <button className={styles.button} type="button" disabled={!hydrated} onClick={reset}>Reset demo data</button>
    <p role="status" aria-live="polite">{cleared ? "Demo data cleared." : ""}</p>
  </section>;
}
