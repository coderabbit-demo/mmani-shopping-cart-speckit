import { categories, products, productById } from "../../lib/catalog.ts";
import {
  addItem, applyCoupon, changeQuantity, initialState, lineTotal, placeOrder,
  setDelivery, signIn, toggleWishlist, totals, DEMO_ACCOUNT,
} from "../../lib/store.ts";

const lamp = productById("arc-desk-lamp");
const keyboard = productById("form-mechanical-keyboard");
const headphones = productById("hush-wireless-headphones");
const shipping = { fullName: "Alex Example", email: "alex@example.test", address: "1 Example St", city: "Demo", postalCode: "12345" };
const firstOrder = { now: "2026-01-01T00:00:00.000Z", orderId: "DD-123456" };
const secondOrder = { now: "2026-01-02T00:00:00.000Z", orderId: "DD-654321" };

function stateOf(result) {
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

function withItem(product, color, quantity = 1) {
  return stateOf(addItem(initialState(), product, color, quantity));
}

function snapshot(state) {
  return { state, totals: totals(state) };
}

export const scenarios = [
  {
    name: "rule1-two-colors",
    run: () => snapshot(stateOf(addItem(withItem(lamp, "Terracotta"), lamp, "Sage"))),
  },
  {
    name: "rule1-merge-same-color",
    run: () => snapshot(stateOf(addItem(withItem(lamp, "Sage"), lamp, "Sage", 2))),
  },
  {
    name: "rule2-quantity-clamp",
    run: () => {
      const state = withItem(lamp, "Sage", 2);
      return [0, -3, 11, 2.5].map((quantity) => ({
        input: quantity,
        ...snapshot(changeQuantity(state, lamp.id, "Sage", quantity)),
      }));
    },
  },
  {
    name: "rule2-line-and-subtotal",
    run: () => {
      const state = changeQuantity(withItem(lamp, "Sage", 2), lamp.id, "Sage", 4);
      return { ...snapshot(state), lineTotal: lineTotal(state.cart[0]) };
    },
  },
  {
    name: "rule3-apply-desk15",
    run: () => snapshot(stateOf(applyCoupon(withItem(headphones, "Oat"), " desk15 "))),
  },
  {
    name: "rule3-recompute-on-change",
    run: () => {
      const state = stateOf(applyCoupon(withItem(lamp, "Sage", 2), "DESK15"));
      return snapshot(changeQuantity(state, lamp.id, "Sage", 3));
    },
  },
  {
    name: "rule3-removed-below-100",
    run: () => {
      const state = stateOf(applyCoupon(withItem(lamp, "Sage", 2), "DESK15"));
      return snapshot(changeQuantity(state, lamp.id, "Sage", 1));
    },
  },
  {
    name: "rule3-invalid-code",
    run: () => {
      const state = stateOf(applyCoupon(withItem(lamp, "Sage", 2), "DESK15"));
      const result = applyCoupon(state, "invalid");
      return { result, totals: totals(result.state) };
    },
  },
  {
    name: "rule4-standard-free",
    run: () => snapshot(withItem(keyboard, "Cloud")),
  },
  {
    name: "rule4-express-12",
    run: () => snapshot(setDelivery(withItem(keyboard, "Cloud"), "express")),
  },
  {
    name: "rule4-coupon-and-express",
    run: () => snapshot(setDelivery(stateOf(applyCoupon(withItem(headphones, "Oat"), "DESK15")), "express")),
  },
  {
    name: "rule5-wishlist-kept-on-sign-in",
    run: () => {
      const guest = toggleWishlist(toggleWishlist(initialState(), lamp.id), keyboard.id);
      return { guest, result: signIn(guest, DEMO_ACCOUNT.email, DEMO_ACCOUNT.password) };
    },
  },
  {
    name: "rule6-multi-item-order",
    run: () => {
      let state = withItem(lamp, "Terracotta", 2);
      state = stateOf(addItem(state, lamp, "Sage"));
      state = stateOf(addItem(state, keyboard, "Cloud"));
      state = setDelivery(stateOf(applyCoupon(state, "DESK15")), "express");
      return placeOrder(state, products, shipping, firstOrder);
    },
  },
  {
    name: "rule6-history-two-orders",
    run: () => {
      const first = stateOf(placeOrder(withItem(lamp, "Sage"), products, shipping, firstOrder));
      const secondCart = stateOf(addItem(first, keyboard, "Cloud", 2));
      return placeOrder(secondCart, products, shipping, secondOrder);
    },
  },
  {
    name: "catalog-summary",
    run: () => ({ categories, products }),
  },
];
