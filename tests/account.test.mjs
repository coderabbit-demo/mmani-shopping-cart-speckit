import { test } from "node:test";
import assert from "node:assert/strict";
import { productById, products } from "../lib/catalog.ts";
import { initialState, toggleWishlist, signIn, signOut, addItem, placeOrder, SIGN_IN_ERROR } from "../lib/store.ts";

test("wishlist toggles in insertion order without duplicates", () => {
  const empty = initialState();
  const one = toggleWishlist(empty, "a");
  const two = toggleWishlist(one, "b");
  assert.deepEqual(two.wishlist, ["a", "b"]);
  assert.deepEqual(toggleWishlist(two, "a").wishlist, ["b"]);
  assert.deepEqual(toggleWishlist(one, "a").wishlist, []);
  assert.deepEqual(empty.wishlist, []);
});

test("demo sign-in normalizes email, preserves wishlist, and rejects invalid credentials unchanged", () => {
  const guest = toggleWishlist(toggleWishlist(initialState(), "a"), "b");
  const result = signIn(guest, " Alex@DeskDrop.demo ", "deskdrop123");
  assert.equal(result.ok, true);
  assert.deepEqual(result.state.session, { name: "Alex", email: "alex@deskdrop.demo" });
  assert.deepEqual(result.state.wishlist, ["a", "b"]);
  assert.equal(guest.session, null);
  for (const [email, password] of [["wrong@example.test", "deskdrop123"], ["alex@deskdrop.demo", "Deskdrop123"], ["alex@deskdrop.demo", " deskdrop123 "]]) {
    const failure = signIn(guest, email, password);
    assert.equal(failure.ok, false);
    assert.equal(failure.error, "Email or password is incorrect.");
    assert.equal(failure.error, SIGN_IN_ERROR);
    assert.strictEqual(failure.state, guest);
  }
});

test("sign-out keeps wishlist, cart and orders", () => {
  const lamp = productById("arc-desk-lamp");
  let state = toggleWishlist(initialState(), lamp.id);
  state = addItem(state, lamp, "Sage").state;
  state = placeOrder(state, products, { fullName: "Alex", email: "a@example.test", address: "1 Main", city: "Demo", postalCode: "12345" }, { now: "2026-01-01T00:00:00.000Z", orderId: "DD-000001" }).state;
  state = addItem(state, lamp, "Terracotta").state;
  state = signIn(state, "alex@deskdrop.demo", "deskdrop123").state;
  const before = structuredClone(state);
  const guest = signOut(state);
  assert.deepEqual(guest, { ...before, session: null });
  assert.deepEqual(state, before);
});
