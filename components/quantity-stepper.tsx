"use client";

import { useEffect, useId, useState } from "react";
import { clampQuantity } from "../lib/store";
import styles from "./quantity-stepper.module.css";

export function QuantityStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);
  function commit() {
    const next = draft === "" ? value : clampQuantity(Number(draft));
    setDraft(String(next));
    if (next !== value) onChange(next);
  }
  function step(delta: number) {
    const next = clampQuantity(value + delta);
    setDraft(String(next));
    if (next !== value) onChange(next);
  }
  return <div className={styles.field}>
    <label htmlFor={id}>Quantity</label>
    <div className={styles.controls}>
      <button type="button" aria-label="Decrease quantity" onClick={() => step(-1)}>−</button>
      <input id={id} type="text" inputMode="numeric" value={draft} onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
      <button type="button" aria-label="Increase quantity" onClick={() => step(1)}>+</button>
    </div>
  </div>;
}
