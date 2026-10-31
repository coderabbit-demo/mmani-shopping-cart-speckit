import { expect, test, type Page } from "@playwright/test";
import { contrastRatio } from "../../lib/contrast";

const shipping = { "Full name": "Alex Smith", Email: "alex@example.com", Address: "123 Main St", City: "Portland", "Postal code": "97201" };
async function add(page: Page, name: string) {
  await page.getByRole("button", { name: `Add ${name} to bag` }).click();
}
async function checkout(page: Page) {
  await page.getByRole("link", { name: /Bag \(/ }).click();
  await page.getByRole("link", { name: "Checkout", exact: true }).click();
}
async function fillShipping(page: Page) {
  for (const [label, value] of Object.entries(shipping)) await page.getByLabel(label, { exact: true }).fill(value);
}
async function place(page: Page) {
  await fillShipping(page);
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL("/checkout/success");
}

test("rule 4: cart delivery carries to checkout and checkout updates the bag", async ({ page }) => {
  await page.goto("/");
  await add(page, "Form mechanical keyboard");
  await page.getByRole("link", { name: /Bag \(/ }).click();
  await page.getByRole("radio", { name: "Express — $12" }).check();
  await page.getByRole("link", { name: "Checkout", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Checkout", exact: true })).toBeVisible();
  await expect(page.getByText("Payment is simulated. No card is charged.")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Express — $12" })).toBeChecked();
  await expect(page.getByRole("region", { name: "Order summary" })).toContainText("$106");
  await page.getByRole("radio", { name: "Standard — Free" }).check();
  await page.getByRole("link", { name: /Bag \(/ }).click();
  await expect(page.getByRole("radio", { name: "Standard — Free" })).toBeChecked();
  await page.getByRole("link", { name: "Checkout", exact: true }).click();
  await fillShipping(page);
  await page.getByRole("radio", { name: "Express — $12" }).check();
  await expect(page.getByRole("region", { name: "Order summary" })).toContainText("$106");
  await page.getByRole("button", { name: "Place order" }).dblclick();
  await expect(page).toHaveURL("/checkout/success");
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
  await page.getByRole("link", { name: "Orders", exact: true }).click();
  await expect(page.getByText(/^Order DD-/)).toHaveCount(1);
});

test("empty checkout waits for hydration and has no form", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByText("Your bag is empty.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("button", { name: "Place order" })).toHaveCount(0);
});

test("validation shows errors, focuses the first field and clears errors on blur", async ({ page }) => {
  await page.goto("/");
  await add(page, "Form mechanical keyboard");
  await checkout(page);
  await expect(page.locator("form")).toHaveAttribute("method", "post");
  await expect(page.locator("form")).not.toHaveAttribute("action", /.+/);
  await page.getByRole("button", { name: "Place order" }).click();
  for (const label of Object.keys(shipping)) await expect(page.getByLabel(label, { exact: true })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Full name", { exact: true })).toBeFocused();
  for (const message of ["Enter your full name.", "Enter a valid email address.", "Enter your street address.", "Enter your city.", "Enter a valid postal code."]) await expect(page.getByText(message)).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill("alex@");
  await page.getByLabel("Postal code", { exact: true }).fill("!!");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Enter a valid postal code.")).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill(shipping.Email);
  await page.getByLabel("Email", { exact: true }).blur();
  await expect(page.getByText("Enter a valid email address.")).toHaveCount(0);
  await page.getByLabel("Postal code", { exact: true }).fill(shipping["Postal code"]);
  await page.getByLabel("Postal code", { exact: true }).blur();
  await expect(page.getByText("Enter a valid postal code.")).toHaveCount(0);
  await expect(page).toHaveURL("/checkout");
});

test("rule 6: receipt and newest-first history retain every line and totals", async ({ page }) => {
  await page.goto("/products/arc-desk-lamp");
  await page.getByRole("radio", { name: "Sage" }).check();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page.getByRole("radio", { name: "Terracotta" }).check();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page.getByRole("link", { name: "Shop", exact: true }).click();
  await add(page, "Form mechanical keyboard");
  await page.getByRole("link", { name: /Bag \(/ }).click();
  await page.getByLabel("Discount code").fill("DESK15");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await page.getByRole("radio", { name: "Express — $12" }).check();
  await page.getByRole("link", { name: "Checkout", exact: true }).click();
  const total = await page.getByRole("region", { name: "Order summary" }).textContent();
  await place(page);
  await expect(page.getByRole("heading", { name: "Thank you, Alex!" })).toBeVisible();
  await expect(page.getByText("Arc desk lamp", { exact: true })).toHaveCount(2);
  await expect(page.getByText(/Sage/)).toBeVisible();
  await expect(page.getByText(/Terracotta/)).toBeVisible();
  await expect(page.getByText("Form mechanical keyboard", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Order summary" })).toHaveText(total!);
  const firstId = await page.getByText(/^Order DD-\d{6}$/).innerText();
  await page.getByRole("link", { name: "Shop", exact: true }).click();
  await add(page, "Little green companion");
  await checkout(page);
  await place(page);
  const secondId = await page.getByText(/^Order DD-\d{6}$/).innerText();
  await page.getByRole("link", { name: "Orders", exact: true }).click();
  await expect(page.getByText(/^Order DD-\d{6}$/)).toHaveText([secondId, firstId]);
  await expect(page.getByText("Arc desk lamp", { exact: true })).toHaveCount(2);
  await expect(page.getByText(/Sage/)).toBeVisible();
  await expect(page.getByText(/Terracotta/)).toBeVisible();
  await expect(page.getByText("Form mechanical keyboard", { exact: true })).toBeVisible();
  await expect(page.getByText("Little green companion", { exact: true })).toBeVisible();
  await expect(page.getByText("Express", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Standard", { exact: true })).toHaveCount(1);
  const orders = page.locator("main article");
  await expect(orders).toHaveCount(2);
  await expect(orders.nth(0)).toContainText("$24");
  await expect(orders.nth(1)).toContainText("$207.50");
  await expect(orders.nth(1)).toContainText("Quantity: 1");
  await expect(orders.nth(1)).toContainText("$68");
  await expect(orders.nth(1).locator("p").first()).toHaveText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
});

test("empty receipt and history offer a route to the shop", async ({ page }) => {
  await page.goto("/checkout/success");
  await expect(page.getByText("No recent order.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the shop" })).toHaveAttribute("href", "/");
  await page.getByRole("link", { name: "Orders", exact: true }).click();
  await expect(page.getByText("No orders yet.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Start shopping" })).toHaveAttribute("href", "/");
});

for (const scheme of ["dark", "light"] as const) {
  test(`${scheme} checkout text and action meet AA contrast`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await add(page, "Form mechanical keyboard");
    await checkout(page);
    await page.getByRole("button", { name: "Place order" }).click();
    for (const locator of [page.getByLabel("Full name", { exact: true }), page.getByRole("button", { name: "Place order" })]) {
      const colors = await locator.evaluate((element) => { const style = getComputedStyle(element); return [style.color, style.backgroundColor]; });
      expect(contrastRatio(colors[0], colors[1])).toBeGreaterThanOrEqual(4.5);
    }
    const errorColors = await page.getByText("Enter your full name.").evaluate((element) => [getComputedStyle(element).color, getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim()]);
    expect(contrastRatio(errorColors[0], errorColors[1])).toBeGreaterThanOrEqual(4.5);
  });
}
