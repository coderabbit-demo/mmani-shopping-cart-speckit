import { test } from "node:test";
import assert from "node:assert/strict";
import { productById } from "../lib/catalog.ts";
import { initialState, addItem, setDelivery, totals, applyCoupon } from "../lib/store.ts";

test("standard is free by default and express adds $12", () => {
  const state = addItem(initialState(), productById("form-mechanical-keyboard"), "Cloud").state;
  assert.equal(state.delivery, "standard");
  assert.deepEqual(totals(state), { subtotal: 94, discount: 0, deliveryFee: 0, total: 94 });
  const express = setDelivery(state, "express");
  assert.deepEqual(totals(express), { subtotal: 94, discount: 0, deliveryFee: 12, total: 106 });
  assert.equal(state.delivery, "standard");
});

test("coupon and express use rounded cents in the total", () => {
  const cart = addItem(initialState(), productById("hush-wireless-headphones"), "Oat").state;
  const state = setDelivery(applyCoupon(cart, "DESK15").state, "express");
  assert.deepEqual(totals(state), { subtotal: 129, discount: 19.35, deliveryFee: 12, total: 121.65 });
  const rounding = { ...state, cart: [{ productId: "x", color: "x", quantity: 1, unitPrice: 100.05 }] };
  assert.deepEqual(totals(rounding), { subtotal: 100.05, discount: 15.01, deliveryFee: 12, total: 97.04 });
});
