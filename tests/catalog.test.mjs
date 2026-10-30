import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { categories, products, productById, money } from "../lib/catalog.ts";

const contract = JSON.parse(readFileSync(new URL("../specs/001-catalog-cart-domain/contracts/catalog.json", import.meta.url)));

test("catalog matches the contract, in order, with valid unique products", () => {
  assert.deepEqual(categories, contract.categories);
  assert.deepEqual(products, contract.products);
  assert.equal(products.length, 8);
  assert.equal(new Set(products.map((product) => product.id)).size, 8);
  for (const product of products) {
    assert.ok(Number.isInteger(product.price) && product.price > 0);
    assert.ok(product.colors.length > 0);
    assert.deepEqual(productById(product.id), product);
  }
});

test("only Slow time clock is out of stock and unknown products are absent", () => {
  assert.deepEqual(products.filter((product) => !product.inStock).map((product) => product.id), ["slow-time-clock"]);
  assert.equal(productById("missing"), undefined);
});

test("money formats dollars and cents", () => {
  assert.equal(money(68), "$68");
  assert.equal(money(1022), "$1,022");
  assert.equal(money(57.8), "$57.80");
});
