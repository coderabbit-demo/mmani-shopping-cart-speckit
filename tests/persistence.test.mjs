import test from "node:test";
import assert from "node:assert/strict";
import { products } from "../lib/catalog.ts";
import { initialState, clampQuantity, totals, placeOrder, signIn } from "../lib/store.ts";
import { STORAGE_KEY, MAX_STORED_LENGTH, serialize, parseStored, createStorage } from "../lib/persistence.ts";

const domain = { initialState, clampQuantity, totals };
const parse = (raw) => parseStored(raw, products, domain);
const snapshot = (state, version = 1) => JSON.stringify({ version, state });
const lamp = products[0];
const shipping = { fullName: "Alex", email: "alex@example.test", address: "1 Desk St", city: "Town", postalCode: "12345" };
const cart = [{ productId: lamp.id, color: "Sage", quantity: 2, unitPrice: lamp.price }];
const orderState = placeOrder({ ...initialState(), cart }, products, shipping, { now: "2026-10-31T12:00:00.000Z", orderId: "DD-123456" }).state;
const order = orderState.orders[0];
const full = { ...initialState(), cart, coupon: "DESK15", couponNotice: "old notice", delivery: "express", wishlist: [lamp.id], session: { name: "Alex", email: "alex@deskdrop.demo" }, orders: [order] };

function copy(value) { return structuredClone(value); }

test("round trips the complete snapshot without a transient notice or password", () => {
  const signedIn = signIn({ ...full, session: null }, "alex@deskdrop.demo", "deskdrop123").state;
  const raw = serialize(signedIn);
  assert.equal(STORAGE_KEY, "deskdrop-demo-v1");
  assert.equal(MAX_STORED_LENGTH, 200_000);
  assert.equal(raw, JSON.stringify({ version: 1, state: { ...signedIn, couponNotice: null } }));
  assert.equal(raw.includes("deskdrop123"), false);
  assert.deepEqual(parse(raw), { ...signedIn, couponNotice: null });
});

test("invalid envelopes return an empty state and never throw", () => {
  for (const raw of [undefined, null, 123, {}, "", "not json", "x".repeat(MAX_STORED_LENGTH + 1), "null", "[]", '"text"', snapshot(full, 2), JSON.stringify({ version: 1, state: null }), JSON.stringify({ version: 1, state: [] })]) {
    assert.deepEqual(parse(raw), initialState(), String(raw).slice(0, 30));
  }
  const fullRaw = snapshot(full);
  assert.deepEqual(parse(fullRaw + " ".repeat(MAX_STORED_LENGTH - fullRaw.length)), { ...full, couponNotice: null });
  assert.deepEqual(parse(fullRaw + " ".repeat(MAX_STORED_LENGTH - fullRaw.length + 1)), initialState());
});

test("cart lines are validated, clamped, priced, merged and keep different colors", () => {
  const input = { ...initialState(), cart: [
    { ...cart[0], quantity: 99 }, { ...cart[0], quantity: 2 },
    { ...cart[0], color: "Cream", quantity: 2.9, unitPrice: -1 },
    { ...cart[0], productId: "unknown" }, { ...cart[0], color: "invalid" },
    { ...cart[0], quantity: "3" }, null, {},
  ] };
  assert.deepEqual(parse(snapshot(input)).cart, [
    { ...cart[0], quantity: 10 }, { ...cart[0], color: "Cream", quantity: 2, unitPrice: lamp.price },
  ]);
  for (const invalidCart of [null, {}, "bad"]) assert.deepEqual(parse(snapshot({ ...full, cart: invalidCart })).cart, []);
  for (const unitPrice of [undefined, null, "10", 0, -5]) {
    assert.equal(parse(snapshot({ ...initialState(), cart: [{ ...cart[0], unitPrice }] })).cart[0].unitPrice, lamp.price);
  }
  assert.equal(parse(snapshot({ ...initialState(), cart: [{ ...cart[0], quantity: -3, unitPrice: 1.25 }] })).cart[0].quantity, 1);
});

test("coupon eligibility, delivery, wishlist and session are restored defensively", () => {
  const parsed = parse(snapshot({ ...full, wishlist: [lamp.id, "unknown", lamp.id, 123], couponNotice: "stale" }));
  assert.equal(parsed.coupon, "DESK15");
  assert.equal(parsed.couponNotice, null);
  assert.equal(parsed.delivery, "express");
  assert.deepEqual(parsed.wishlist, [lamp.id]);
  assert.deepEqual(parsed.session, full.session);
  for (const coupon of ["bad", null, 5]) assert.equal(parse(snapshot({ ...full, coupon })).coupon, null);
  assert.equal(parse(snapshot({ ...full, cart: [{ ...cart[0], quantity: 1 }], coupon: "DESK15" })).coupon, null);
  assert.equal(parse(snapshot({ ...full, cart: [{ ...cart[0], quantity: 1, unitPrice: 100 }], coupon: "DESK15" })).coupon, "DESK15");
  for (const delivery of ["overnight", null, 5]) assert.equal(parse(snapshot({ ...full, delivery })).delivery, "standard");
  for (const wishlist of [null, {}, "bad"]) assert.deepEqual(parse(snapshot({ ...full, wishlist })).wishlist, []);
  for (const session of [null, {}, { name: "Alex" }, { email: "alex@deskdrop.demo" }, { name: "Other", email: "alex@deskdrop.demo" }, { name: "Alex", email: "wrong" }, { name: 1, email: "alex@deskdrop.demo" }, { name: "Alex", email: 1 }]) {
    assert.equal(parse(snapshot({ ...full, session })).session, null);
  }
  assert.deepEqual(parse(snapshot({ ...full, session: { ...full.session, password: "secret" } })).session, full.session);
});

test("malformed orders are dropped while valid orders remain", () => {
  const badOrders = [];
  for (const [key, values] of Object.entries({ id: [null, 5, "DD-12345", "XX-123456"], placedAt: [null, 5, "not a date", "2026-02-30T00:00:00.000Z"], delivery: [null, "overnight"], coupon: ["bad", 1], subtotal: [null, "1"], discount: [null, "1"], deliveryFee: [null, "1"], total: [null, "1"], shipping: [null, {}], items: [null, [], [{}]] })) {
    for (const value of values) badOrders.push({ ...copy(order), [key]: value });
  }
  for (const key of Object.keys(shipping)) {
    for (const value of [undefined, 1, null]) badOrders.push({ ...copy(order), shipping: { ...shipping, [key]: value } });
  }
  for (const [key, values] of Object.entries({ productId: [undefined, 1], name: [undefined, 1], color: [undefined, 1], quantity: [undefined, 0, 11, 1.5, "1"], unitPrice: [undefined, null, "2"], lineTotal: [undefined, null, "2"] })) {
    for (const value of values) badOrders.push({ ...copy(order), items: [{ ...order.items[0], [key]: value }] });
  }
  badOrders.push({ ...copy(order), items: [order.items[0], { ...order.items[0], name: null }] });
  const parsed = parse(snapshot({ ...full, orders: [order, ...badOrders, order] }));
  assert.deepEqual(parsed.orders, [order, order]);
  for (const orders of [null, {}, "bad"]) assert.deepEqual(parse(snapshot({ ...full, orders })).orders, []);
});

function storageMock(failMethod) {
  let value = null;
  return {
    getItem(key) { assert.equal(key, STORAGE_KEY); if (failMethod === "getItem") throw new Error("denied"); return value; },
    setItem(key, next) { assert.equal(key, STORAGE_KEY); if (failMethod === "setItem") throw new Error("denied"); value = next; },
    removeItem(key) { assert.equal(key, STORAGE_KEY); if (failMethod === "removeItem") throw new Error("denied"); value = null; },
  };
}

test("storage reads, writes and clears persistent data", () => {
  const backing = storageMock();
  const adapter = createStorage(() => backing);
  assert.equal(adapter.load(), null);
  adapter.save("one");
  assert.equal(adapter.load(), "one");
  adapter.clear();
  assert.equal(adapter.load(), null);
  assert.equal(backing.getItem(STORAGE_KEY), null);
});

test("missing or throwing storage permanently falls back to memory", () => {
  for (const failure of ["missing", "getter", "getItem", "setItem", "removeItem"]) {
    let calls = 0;
    const backing = storageMock(failure);
    const adapter = createStorage(() => { calls++; if (failure === "getter") throw new Error("denied"); return failure === "missing" ? undefined : backing; });
    if (failure === "removeItem") { adapter.save("before"); adapter.clear(); assert.equal(adapter.load(), null); }
    else if (failure === "getItem") assert.equal(adapter.load(), null);
    else adapter.save("before");
    const callsAfterFailure = calls;
    adapter.save("after");
    assert.equal(adapter.load(), "after", failure);
    adapter.clear();
    assert.equal(adapter.load(), null, failure);
    assert.equal(calls, callsAfterFailure, failure);
  }
});
