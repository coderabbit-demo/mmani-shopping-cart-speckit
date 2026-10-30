import { test } from "node:test";
import assert from "node:assert/strict";
import { products, productById } from "../lib/catalog.ts";
import { initialState, addItem, applyCoupon, setDelivery, placeOrder, totals, EMPTY_CART_ERROR } from "../lib/store.ts";

const lamp = productById("arc-desk-lamp");
const keyboard = productById("form-mechanical-keyboard");
const shipping = { fullName: "Alex Example", email: "alex@example.test", address: "1 Example St", city: "Demo", postalCode: "12345" };
const firstInfo = { now: "2026-01-01T00:00:00.000Z", orderId: "DD-123456" };

test("order snapshots every line, delivery, totals and shipping without changing input", () => {
  let state = addItem(initialState(), lamp, "Terracotta", 2).state;
  state = addItem(state, lamp, "Sage").state;
  state = addItem(state, keyboard, "Cloud").state;
  state = { ...setDelivery(applyCoupon(state, "DESK15").state, "express"), couponNotice: "previous notice" };
  const before = structuredClone(state);
  const expectedTotals = totals(state);
  const result = placeOrder(state, products, shipping, firstInfo);
  assert.equal(result.ok, true);
  assert.deepEqual(state, before);
  const order = result.state.orders[0];
  assert.deepEqual(order.items, [
    { productId: lamp.id, name: "Arc desk lamp", color: "Terracotta", quantity: 2, unitPrice: 68, lineTotal: 136 },
    { productId: lamp.id, name: "Arc desk lamp", color: "Sage", quantity: 1, unitPrice: 68, lineTotal: 68 },
    { productId: keyboard.id, name: "Form mechanical keyboard", color: "Cloud", quantity: 1, unitPrice: 94, lineTotal: 94 },
  ]);
  assert.deepEqual({ subtotal: order.subtotal, discount: order.discount, deliveryFee: order.deliveryFee, total: order.total }, expectedTotals);
  assert.equal(order.delivery, "express");
  assert.equal(order.coupon, "DESK15");
  assert.deepEqual(order.shipping, shipping);
  assert.equal(order.id, firstInfo.orderId);
  assert.match(order.id, /^DD-\d{6}$/);
  assert.equal(order.placedAt, firstInfo.now);
  assert.deepEqual(result.state.cart, []);
  assert.equal(result.state.coupon, null);
  assert.equal(result.state.couponNotice, null);
  assert.equal(result.state.delivery, "standard");
  shipping.city = "Changed";
  assert.equal(order.shipping.city, "Demo");
  shipping.city = "Demo";
});

test("history retains both orders newest first; empty cart is rejected", () => {
  const state = addItem(initialState(), lamp, "Sage").state;
  const first = placeOrder(state, products, shipping, firstInfo).state;
  const secondCart = addItem(first, keyboard, "Cloud", 2).state;
  const second = placeOrder(secondCart, products, shipping, { now: "2026-01-02T00:00:00.000Z", orderId: "DD-654321" }).state;
  assert.deepEqual(second.orders.map((order) => order.id), ["DD-654321", "DD-123456"]);
  assert.equal(second.orders[0].items[0].quantity, 2);
  assert.equal(second.orders[1].items[0].productId, lamp.id);
  assert.equal(first.orders.length, 1);
  const rejected = placeOrder(second, products, shipping, firstInfo);
  assert.equal(rejected.ok, false);
  assert.equal(rejected.error, "Your bag is empty.");
  assert.equal(rejected.error, EMPTY_CART_ERROR);
  assert.strictEqual(rejected.state, second);
});
