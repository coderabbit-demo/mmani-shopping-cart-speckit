import { money } from "../lib/catalog";
import type { StoreState, Totals } from "../lib/store";
import styles from "./order-summary.module.css";

export function OrderSummary({ totals, delivery }: { totals: Totals; delivery: StoreState["delivery"] }) {
  return <section className={styles.summary} aria-label="Order summary">
    <h2>Order summary</h2>
    <dl>
      <div><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
      {totals.discount > 0 && <div><dt>DESK15 (15%)</dt><dd>−{money(totals.discount)}</dd></div>}
      <div><dt>Delivery</dt><dd>{delivery === "standard" ? "Free" : money(totals.deliveryFee)}</dd></div>
      <div className={styles.total}><dt>Total</dt><dd>{money(totals.total)}</dd></div>
    </dl>
  </section>;
}
