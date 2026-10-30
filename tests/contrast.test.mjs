import assert from "node:assert/strict";
import { test } from "node:test";
import { contrastRatio, meetsAA, relativeLuminance } from "../lib/contrast.ts";

test("relative luminance uses the sRGB transfer curve and channel weights", () => {
  assert.equal(relativeLuminance("#000000"), 0);
  assert.equal(relativeLuminance("#ffffff"), 1);
  assert.ok(Math.abs(relativeLuminance("#ff0000") - 0.2126) < 1e-12);
  assert.ok(Math.abs(relativeLuminance("#808080") - 0.2158605001) < 1e-9);
});

test("contrast is symmetric, with extremes 21 and identical colors 1", () => {
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  assert.equal(contrastRatio("#123456", "#123456"), 1);
  assert.equal(contrastRatio("#123456", "#abcdef"), contrastRatio("#abcdef", "#123456"));
});

test("AA uses inclusive 4.5 and 3 thresholds for normal and large text", () => {
  assert.equal(meetsAA(4.49, { largeText: false }), false);
  assert.equal(meetsAA(4.5, { largeText: false }), true);
  assert.equal(meetsAA(2.99, { largeText: true }), false);
  assert.equal(meetsAA(3, { largeText: true }), true);
});

test("supports CSS hex and computed RGB colors, rejecting invalid colors", () => {
  assert.equal(contrastRatio("#000", "rgb(255, 255, 255)"), 21);
  assert.throws(() => relativeLuminance("not-a-color"));
});
