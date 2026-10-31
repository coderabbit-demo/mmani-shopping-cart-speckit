import { test } from "node:test";
import assert from "node:assert/strict";
import { productById } from "../lib/catalog.ts";
import { initialState, addItem, changeQuantity, removeItem, clampQuantity, lineTotal, totals, INVALID_COLOR_ERROR, OUT_OF_STOCK_ERROR } from "../lib/store.ts";

const lamp = productById("arc-desk-lamp");
const clock = productById("slow-time-clock");

test("lines use product and color as identity; same pair merges and preserves price", () => {
  const original = initialState();
  const first = addItem(original, lamp, "Terracotta");
  assert.equal(first.ok, true);
  const second = addItem(first.state, lamp, "Sage");
  const merged = addItem(second.state, { ...lamp, price: 200 }, "Sage", 2);
  assert.equal(merged.ok, true);
  assert.deepEqual(merged.state.cart, [
    { productId: lamp.id, color: "Terracotta", quantity: 1, unitPrice: 68 },
    { productId: lamp.id, color: "Sage", quantity: 3, unitPrice: 68 },
  ]);
  assert.deepEqual(original, initialState());
  assert.equal(first.state.cart.length, 1);
  assert.equal(second.state.cart[1].quantity, 1);
});

test("invalid color and unavailable stock reject with unchanged input", () => {
  const state = initialState();
  for (const [product, color, error] of [[lamp, "Blue", INVALID_COLOR_ERROR], [clock, "Moss", OUT_OF_STOCK_ERROR]]) {
    const result = addItem(state, product, color);
    assert.equal(result.ok, false);
    assert.equal(result.error, error);
    assert.strictEqual(result.state, state);
  }
  assert.equal(INVALID_COLOR_ERROR, "Choose an available color.");
  assert.equal(OUT_OF_STOCK_ERROR, "This item is out of stock.");
});

test("quantity changes and line removal recompute totals without mutation", () => {
  const state = addItem(addItem(initialState(), lamp, "Sage", 2).state, lamp, "Terracotta").state;
  const before = structuredClone(state);
  const changed = changeQuantity(state, lamp.id, "Sage", 4);
  assert.equal(lineTotal(changed.cart[0]), 272);
  assert.equal(totals(changed).subtotal, 340);
  assert.deepEqual(state, before);
  const removed = removeItem(changed, lamp.id, "Sage");
  assert.deepEqual(removed.cart, [changed.cart[1]]);
  assert.deepEqual(removeItem(changed, "missing", "Sage"), changed);
  assert.deepEqual(changeQuantity(changed, "missing", "Sage", 4), changed);
});

test("quantities are truncated and clamped, including merges and invalid inputs", () => {
  const state = addItem(initialState(), lamp, "Sage", 2).state;
  for (const [value, expected] of [[0, 1], [-3, 1], [11, 10], [2.5, 2], [NaN, 1], [Infinity, 1], [-Infinity, 1], ["5", 1], [null, 1]]) {
    assert.equal(clampQuantity(value), expected);
    assert.equal(changeQuantity(state, lamp.id, "Sage", value).cart[0].quantity, expected);
  }
  const nine = changeQuantity(state, lamp.id, "Sage", 9);
  assert.equal(addItem(nine, lamp, "Sage", 5).state.cart[0].quantity, 10);
  assert.equal(addItem(initialState(), lamp, "Sage", 99).state.cart[0].quantity, 10);
  assert.equal(addItem(initialState(), lamp, "Sage", NaN).state.cart[0].quantity, 1);
});
