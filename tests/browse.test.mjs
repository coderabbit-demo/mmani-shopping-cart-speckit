import assert from "node:assert/strict";
import { test } from "node:test";
import { products } from "../lib/catalog.ts";
import { defaultFilters, filterProducts, sortOptions } from "../lib/browse.ts";

const names = (filters = {}) => filterProducts(products, { ...defaultFilters, ...filters }).map((product) => product.name);

test("search trims and ignores case, and matches name, subtitle and category", () => {
  assert.deepEqual(names({ query: "  LAMP " }), ["Arc desk lamp"]);
  assert.deepEqual(names({ query: "every word" }), ["Form mechanical keyboard"]);
  assert.equal(names({ query: "desk essentials" }).length, 3);
});

test("category, stock and search filters combine, including text containing markup", () => {
  assert.equal(names({ category: "Desk essentials" }).length, 3);
  assert.equal(names({ category: "All objects" }).length, 8);
  assert.equal(names({ inStockOnly: true }).length, 7);
  assert.deepEqual(names({ category: "Desk essentials", inStockOnly: true, query: "mat" }), ["Everyday desk mat"]);
  assert.deepEqual(names({ query: "<b>marker</b>" }), []);
  assert.deepEqual(names({ category: "Lighting", query: "clock" }), []);
});

test("sorts prices and ratings stably without modifying the catalog", () => {
  const before = products.map((product) => product.id);
  const asc = filterProducts(products, { ...defaultFilters, sort: "price-asc" });
  assert.deepEqual([asc[0].price, asc.at(-1).price], [24, 129]);
  assert.deepEqual(names({ sort: "price-desc" }), asc.map((product) => product.name).reverse());
  const tied = [{ ...products[0], rating: "4.8" }, { ...products[1], rating: "4.8" }, { ...products[2], rating: "4.9" }];
  assert.deepEqual(filterProducts(tied, { ...defaultFilters, sort: "rating" }).map((p) => p.id), [tied[2].id, tied[0].id, tied[1].id]);
  assert.deepEqual(products.map((product) => product.id), before);
  assert.deepEqual(filterProducts(products, defaultFilters).map((product) => product.id), before);
  assert.deepEqual(sortOptions.map((option) => option.label), ["Featured", "Price: low to high", "Price: high to low", "Top rated"]);
});
