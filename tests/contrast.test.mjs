import assert from "node:assert/strict";
import { test } from "node:test";
import { contrastRatio, meetsAA, relativeLuminance } from "../lib/contrast.ts";

test("relative luminance uses the sRGB transfer curve and channel weights", () => {
  assert.equal(relativeLuminance("#000000"), 0);
  assert.equal(relativeLuminance("#ffffff"), 1);
  assert.ok(Math.abs(relativeLuminance("#ff0000") - 0.2126) < 1e-12);
  assert.ok(Math.abs(relativeLuminance("#00ff00") - 0.7152) < 1e-12);
  assert.ok(Math.abs(relativeLuminance("#0000ff") - 0.0722) < 1e-12);
  assert.ok(Math.abs(relativeLuminance("#0a0a0a") - (10 / 255 / 12.92)) < 1e-12);
  const justBelowCutoff = 0.04044;
  const justAboveCutoff = 0.04046;
  const gray = (channel) => `rgb(${channel * 255}, ${channel * 255}, ${channel * 255})`;
  assert.ok(Math.abs(relativeLuminance(gray(justBelowCutoff)) - justBelowCutoff / 12.92) < 1e-12);
  assert.ok(Math.abs(relativeLuminance(gray(justAboveCutoff)) - ((justAboveCutoff + 0.055) / 1.055) ** 2.4) < 1e-12);
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
  assert.equal(relativeLuminance("#fff"), relativeLuminance("#ffffff"));
  assert.equal(relativeLuminance("#f00"), relativeLuminance("#ff0000"));
  assert.throws(() => relativeLuminance("not-a-color"));
});
