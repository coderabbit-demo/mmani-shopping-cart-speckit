import { expect, test, type Page } from "@playwright/test";
import { products, money } from "../../lib/catalog";

async function openProduct(page: Page, slug = "arc-desk-lamp") {
  await page.goto(`/products/${slug}`);
}

async function addLamp(page: Page, color = "Sage", quantity = "2") {
  await openProduct(page);
  await page.getByRole("radio", { name: color }).check();
  await page.getByLabel("Quantity", { exact: true }).fill(quantity);
  await page.getByLabel("Quantity", { exact: true }).blur();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Added to bag");
  await expect(page.getByRole("status")).toHaveAttribute("aria-live", "polite");
}

async function goToBag(page: Page) {
  await page.getByRole("link", { name: /^Bag \(/ }).click();
  await expect(page.getByRole("heading", { name: "Your bag" })).toBeVisible();
}

test("rule 1: chosen colors remain separate cart lines", async ({ page }) => {
  await addLamp(page);
  await expect(page.getByRole("link", { name: "Bag (2)" })).toBeVisible();
  await page.getByRole("radio", { name: "Terracotta" }).check();
  await page.getByLabel("Quantity", { exact: true }).fill("1");
  await page.getByLabel("Quantity", { exact: true }).blur();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await goToBag(page);
  await expect(page.getByText("Color: Sage")).toBeVisible();
  await expect(page.getByText("Color: Terracotta")).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove Arc desk lamp (Sage)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove Arc desk lamp (Terracotta)" })).toBeVisible();
  const sage = page.locator("li").filter({ hasText: "Color: Sage" });
  await expect(sage.getByRole("link", { name: "Arc desk lamp" })).toHaveAttribute("href", "/products/arc-desk-lamp");
  await expect(sage.getByLabel("Quantity", { exact: true })).toHaveValue("2");
  await expect(sage.getByText("$68 each")).toBeVisible();
  await expect(sage.getByText("$136", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Remove Arc desk lamp (Terracotta)" }).click();
  await expect(page.getByText("Color: Terracotta")).toHaveCount(0);
  await expect(page.getByText("Color: Sage")).toBeVisible();
  await expect(page.getByRole("region", { name: "Order summary" }).getByText("$136").first()).toBeVisible();
});

test("cart waits for hydration before showing its empty state", async ({ browser, page }) => {
  const withoutJavaScript = await browser.newContext({ javaScriptEnabled: false });
  try {
    const serverPage = await withoutJavaScript.newPage();
    await serverPage.goto("/cart");
    await expect(serverPage.getByRole("heading", { name: "Your bag" })).toBeVisible();
    await expect(serverPage.getByText("Your bag is empty.")).toHaveCount(0);
    await expect(serverPage.getByRole("link", { name: "Continue shopping" })).toHaveCount(0);
  } finally {
    await withoutJavaScript.close();
  }
  await page.goto("/cart");
  await expect(page.getByText("Your bag is empty.")).toBeVisible();
});

test("product detail announces the real store error for an unavailable color", async ({ page }) => {
  await page.route("**/products/arc-desk-lamp", async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    expect(body).toContain('value="Sage"');
    const headers = { ...response.headers() };
    delete headers["content-encoding"];
    delete headers["content-length"];
    await route.fulfill({ response, headers, body: body.replaceAll("Sage", "Mint") });
  });
  await openProduct(page);
  await page.getByRole("radio", { name: "Mint" }).check();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  const status = page.getByRole("status");
  await expect(status).toHaveText("Choose an available color.");
  await expect(status).toHaveAttribute("aria-live", "polite");
  await expect(status).not.toHaveText("Added to bag");
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
});

test("quantity changes affect only the selected color line", async ({ page }) => {
  await addLamp(page, "Sage", "2");
  await page.getByRole("radio", { name: "Terracotta" }).check();
  await page.getByLabel("Quantity", { exact: true }).fill("1");
  await page.getByLabel("Quantity", { exact: true }).blur();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await goToBag(page);
  const sage = page.locator("li").filter({ hasText: "Color: Sage" });
  const terracotta = page.locator("li").filter({ hasText: "Color: Terracotta" });
  await expect(sage.getByLabel("Quantity", { exact: true })).toHaveValue("2");
  await expect(terracotta.getByLabel("Quantity", { exact: true })).toHaveValue("1");
  await terracotta.getByRole("button", { name: "Increase quantity" }).click();
  await expect(terracotta.getByLabel("Quantity", { exact: true })).toHaveValue("2");
  await expect(sage.getByLabel("Quantity", { exact: true })).toHaveValue("2");
  await expect(terracotta.getByText("$136", { exact: true })).toBeVisible();
  await expect(sage.getByText("$136", { exact: true })).toBeVisible();
  const summary = page.getByRole("region", { name: "Order summary" });
  await expect(summary.locator("div").filter({ hasText: "Subtotal" })).toHaveText("Subtotal$272");
  await expect(summary.locator("div").filter({ has: page.getByText("Total", { exact: true }) })).toHaveText("Total$272");
});

test("rule 2: quantities clamp, totals update, and lines can be removed", async ({ page }) => {
  await addLamp(page, "Sage", "1");
  await goToBag(page);
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.getByText("$204", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Order summary" }).locator("div").filter({ hasText: "Subtotal" })).toHaveText("Subtotal$204");
  await page.getByLabel("Quantity", { exact: true }).fill("15");
  await page.getByLabel("Quantity", { exact: true }).blur();
  await expect(page.getByLabel("Quantity", { exact: true })).toHaveValue("10");
  await expect(page.getByText("$680", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Order summary" }).locator("div").filter({ hasText: "Subtotal" })).toHaveText("Subtotal$680");
  await page.getByRole("button", { name: "Remove Arc desk lamp (Sage)" }).click();
  await expect(page.getByText("Your bag is empty.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Checkout" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/");
});

test("rule 3: DESK15 eligibility, removal, and invalid input", async ({ page }) => {
  await addLamp(page);
  await goToBag(page);
  const coupon = page.getByLabel("Discount code");
  await coupon.fill("desk15");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.getByText("DESK15 (15%)")).toBeVisible();
  await expect(page.getByText("−$20.40")).toBeVisible();
  await expect(page.getByText("$115.60")).toBeVisible();
  await page.getByRole("button", { name: "Decrease quantity" }).click();
  await expect(page.getByText("DESK15 (15%)")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("DESK15 was removed because your subtotal is below $100.");
  await coupon.fill("DESK15");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  const error = page.getByText("DESK15 needs a subtotal of $100 or more.");
  await expect(error).toBeVisible();
  await expect(coupon).toHaveAttribute("aria-describedby", await error.getAttribute("id") || "missing");
  await coupon.fill("<b>unknown</b>");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.getByText("That code isn't valid.")).toBeVisible();
  await expect(coupon).toHaveValue("<b>unknown</b>");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await coupon.fill("DESK15");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await page.getByRole("button", { name: "Remove code" }).click();
  await expect(page.getByText("DESK15 (15%)")).toHaveCount(0);
  await expect(page.getByText("DESK15 was removed because your subtotal is below $100.")).toHaveCount(0);
});

test("rule 3: removing the last line explains coupon removal", async ({ page }) => {
  await addLamp(page);
  await goToBag(page);
  await page.getByLabel("Discount code").fill("DESK15");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.getByText("DESK15 (15%)")).toBeVisible();
  const status = await page.getByRole("status").elementHandle();
  await page.getByRole("button", { name: "Remove Arc desk lamp (Sage)" }).click();
  await expect(page.getByText("Your bag is empty.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Checkout" })).toHaveCount(0);
  const notice = page.getByRole("status");
  await expect(notice).toHaveText("DESK15 was removed because your subtotal is below $100.");
  await expect(notice).toHaveAttribute("aria-live", "polite");
  expect(await notice.evaluate((element, previous) => element === previous, status)).toBe(true);
});

test("rule 4: delivery choice changes the total", async ({ page }) => {
  await openProduct(page, "form-mechanical-keyboard");
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await goToBag(page);
  await expect(page.getByRole("radio", { name: "Standard — Free" })).toBeChecked();
  await expect(page.getByRole("region", { name: "Order summary" }).locator("div").filter({ has: page.getByText("Total", { exact: true }) })).toHaveText("Total$94");
  await page.getByRole("radio", { name: "Express — $12" }).check();
  await expect(page.getByRole("region", { name: "Order summary" }).getByText("$12", { exact: true })).toBeVisible();
  await expect(page.getByText("$106", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL("/checkout");
});

test("product detail, quantity entry, stock, wishlist and unknown product", async ({ page }) => {
  await openProduct(page);
  const lamp = products.find((product) => product.id === "arc-desk-lamp")!;
  await expect(page.getByRole("heading", { name: lamp.name, level: 1 })).toBeVisible();
  for (const text of [lamp.subtitle, lamp.description, money(lamp.price), lamp.badge!, ...lamp.details]) await expect(page.getByText(text, { exact: true })).toBeVisible();
  await expect(page.getByLabel(`Rating ${lamp.rating} out of 5`)).toBeVisible();
  await expect(page.getByRole("radio", { name: "Terracotta" })).toBeChecked();
  const quantity = page.getByLabel("Quantity", { exact: true });
  await page.getByRole("button", { name: "Decrease quantity" }).click();
  await expect(quantity).toHaveValue("1");
  await quantity.fill("10"); await quantity.blur();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(quantity).toHaveValue("10");
  await quantity.fill("0"); await quantity.blur();
  await expect(quantity).toHaveValue("1");
  await quantity.fill("10"); await quantity.blur();
  await quantity.fill(""); await quantity.blur();
  await expect(quantity).toHaveValue("10");
  await quantity.fill("2x");
  await expect(quantity).toHaveValue("2");
  await page.getByRole("button", { name: "Save Arc desk lamp to wishlist" }).click();
  await expect(page.getByRole("link", { name: "Wishlist (1)" })).toBeVisible();
  await openProduct(page, "slow-time-clock");
  await expect(page.getByRole("button", { name: "Add to bag", exact: true })).toBeDisabled();
  await expect(page.getByText("Out of stock")).toBeVisible();
  const response = await page.goto("/products/not-a-product");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});


test("product links navigate in the app and controls work on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("link", { name: "Arc desk lamp", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Arc desk lamp", level: 1 })).toBeVisible();
  await page.getByRole("radio", { name: "Sage" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("radio", { name: "Sage" })).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("link", { name: "Bag (1)" }).click();
  await expect(page.getByText("Color: Sage")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
