import { test } from "node:test";
import assert from "node:assert/strict";
import { productById } from "../lib/catalog.ts";
import { initialState, addItem, changeQuantity, removeItem, totals, applyCoupon, removeCoupon, COUPON_MIN_MESSAGE, COUPON_INVALID_MESSAGE, COUPON_REMOVED_NOTICE } from "../lib/store.ts";

const lamp = productById("arc-desk-lamp");
const headphones = productById("hush-wireless-headphones");
const organizer = productById("tidy-desk-organizer");
const withLamp = (quantity) => addItem(initialState(), lamp, "Sage", quantity).state;

test("DESK15 is normalized, accepted from $100, and applied to the subtotal", () => {
  const state = addItem(initialState(), headphones, "Oat").state;
  const applied = applyCoupon(state, " desk15 ");
  assert.equal(applied.ok, true);
  assert.equal(applied.state.coupon, "DESK15");
  assert.equal(totals(applied.state).discount, 19.35);
  assert.deepEqual(applyCoupon(applied.state, "DESK15").state, applied.state);
  assert.equal(state.coupon, null);
});

test("rejections preserve coupon and clear a previous notice", () => {
  assert.equal(COUPON_MIN_MESSAGE, "DESK15 needs a subtotal of $100 or more.");
  assert.equal(COUPON_INVALID_MESSAGE, "That code isn't valid.");
  const below = { ...withLamp(1), couponNotice: COUPON_REMOVED_NOTICE };
  const snapshot = structuredClone(below);
  const rejected = applyCoupon(below, "DESK15");
  assert.equal(rejected.ok, false);
  assert.equal(rejected.error, COUPON_MIN_MESSAGE);
  assert.deepEqual(rejected.state, { ...below, couponNotice: null });
  assert.deepEqual(below, snapshot);
  const applied = applyCoupon(withLamp(2), "DESK15").state;
  const invalidInput = { ...applied, couponNotice: COUPON_REMOVED_NOTICE };
  const invalid = applyCoupon(invalidInput, "wrong");
  assert.equal(invalid.ok, false);
  assert.equal(invalid.error, COUPON_INVALID_MESSAGE);
  assert.deepEqual(invalid.state, { ...invalidInput, couponNotice: null });
  assert.equal(totals(invalid.state).discount, 20.4);
});

test("discount follows cart changes; removal remains until applied again", () => {
  assert.equal(COUPON_REMOVED_NOTICE, "DESK15 was removed because your subtotal is below $100.");
  const applied = applyCoupon(withLamp(2), "DESK15").state;
  const increased = changeQuantity(applied, lamp.id, "Sage", 3);
  assert.equal(totals(increased).discount, 30.6);
  const dropped = changeQuantity(increased, lamp.id, "Sage", 1);
  assert.equal(dropped.coupon, null);
  assert.equal(dropped.couponNotice, COUPON_REMOVED_NOTICE);
  const raised = addItem(dropped, lamp, "Terracotta").state;
  assert.equal(raised.coupon, null);
  assert.equal(totals(raised).discount, 0);
  const again = applyCoupon(raised, "DESK15").state;
  assert.equal(again.couponNotice, null);
  assert.equal(again.coupon, "DESK15");
  const removed = removeItem(again, lamp.id, "Sage");
  assert.equal(removed.coupon, null);
  assert.equal(removed.couponNotice, COUPON_REMOVED_NOTICE);
  assert.deepEqual(removeCoupon(removed), { ...removed, coupon: null, couponNotice: null });
  assert.deepEqual(removeCoupon(again), { ...again, coupon: null, couponNotice: null });
});

test("DESK15 applies at the exact $100 boundary", () => {
  let state = addItem(initialState(), lamp, "Sage").state;
  state = addItem(state, organizer, "Natural oak").state;
  assert.equal(totals(state).subtotal, 100);
  assert.equal(state.delivery, "standard");
  const applied = applyCoupon(state, "DESK15");
  assert.equal(applied.ok, true);
  assert.equal(applied.state.coupon, "DESK15");
  assert.deepEqual(totals(applied.state), { subtotal: 100, discount: 15, deliveryFee: 0, total: 85 });
});

test("DESK15 remains at $100 and is removed below the boundary", () => {
  let state = addItem(initialState(), lamp, "Sage").state;
  state = addItem(state, organizer, "Natural oak", 2).state;
  assert.equal(totals(state).subtotal, 132);
  const applied = applyCoupon(state, "DESK15");
  assert.equal(applied.ok, true);
  const boundary = changeQuantity(applied.state, organizer.id, "Natural oak", 1);
  assert.equal(totals(boundary).subtotal, 100);
  assert.equal(boundary.coupon, "DESK15");
  assert.equal(boundary.couponNotice, null);
  assert.equal(totals(boundary).discount, 15);
  assert.equal(totals(boundary).total, 85);
  assert.equal(applyCoupon(boundary, "DESK15").ok, true);

  const clamped = changeQuantity(boundary, organizer.id, "Natural oak", 0);
  assert.equal(clamped.cart.find((line) => line.productId === organizer.id).quantity, 1);
  assert.equal(totals(clamped).subtotal, 100);
  assert.equal(clamped.coupon, "DESK15");
  assert.equal(clamped.couponNotice, null);
  const below = removeItem(boundary, organizer.id, "Natural oak");
  assert.equal(totals(below).subtotal, 68);
  assert.equal(below.coupon, null);
  assert.equal(below.couponNotice, COUPON_REMOVED_NOTICE);
});
