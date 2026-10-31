import { expect, test } from "@playwright/test";
import { money, products } from "../../lib/catalog";

const card = (page: import("@playwright/test").Page, name: string) => page.locator("article").filter({ has: page.getByRole("heading", { name, exact: true }) });

test("browse products with search, filters, sorting and reset", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "DeskDrop", level: 1 })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(8);
  for (const product of products) {
    const item = card(page, product.name);
    await expect(item.getByRole("link", { name: product.name, exact: true })).toHaveAttribute("href", `/products/${product.id}`);
    await expect(item.getByText(product.subtitle, { exact: true })).toBeVisible();
    await expect(item.getByText(money(product.price), { exact: true })).toBeVisible();
    await expect(item.getByLabel(`Rating ${product.rating} out of 5`)).toBeVisible();
    if (product.badge) await expect(item.getByText(product.badge, { exact: true })).toBeVisible();
  }
  const lamp = card(page, "Arc desk lamp");
  await expect(lamp.getByText("A little light. A lot of focus.")).toBeVisible();
  await expect(lamp.getByText("$68")).toBeVisible();
  await expect(lamp.getByText("4.9", { exact: false })).toBeVisible();
  await expect(lamp.getByText("Bestseller")).toBeVisible();
  await expect(lamp.getByRole("link", { name: "Arc desk lamp", exact: true })).toHaveAttribute("href", "/products/arc-desk-lamp");
  await page.getByLabel("Search products").fill("  LAMP  ");
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.getByRole("status")).toHaveText("1 product");
  await expect(page.getByRole("status")).toHaveAttribute("aria-live", "polite");
  await page.getByLabel("Search products").fill("");
  await page.getByLabel("Category").selectOption({ label: "Desk essentials" });
  await expect(page.locator("article")).toHaveCount(3);
  await page.getByLabel("Category").selectOption({ label: "All objects" });
  await page.getByLabel("In stock only").check();
  await expect(page.locator("article")).toHaveCount(7);
  await expect(card(page, "Slow time clock")).toHaveCount(0);
  await page.getByLabel("In stock only").uncheck();
  await page.getByLabel("Sort by").selectOption({ label: "Price: low to high" });
  await expect(page.locator("article").first()).toContainText("Little green companion");
  await expect(page.locator("article").last()).toContainText("Hush wireless headphones");
  await page.getByLabel("Sort by").selectOption({ label: "Price: high to low" });
  await expect(page.locator("article").first()).toContainText("Hush wireless headphones");
  await page.getByLabel("Sort by").selectOption({ label: "Top rated" });
  await expect(page.locator("article").first()).toContainText("Arc desk lamp");
  await page.getByLabel("Category").selectOption({ label: "Lighting" });
  await page.getByLabel("In stock only").check();
  await page.getByLabel("Search products").fill("<b>marker</b>");
  await expect(page.getByText("No products match your filters.")).toBeVisible();
  await expect(page.getByText("<b>marker</b>", { exact: true })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByLabel("Search products")).toHaveValue("");
  await expect(page.getByLabel("Sort by")).toHaveValue("featured");
  await expect(page.getByLabel("Category")).toHaveValue("All objects");
  await expect(page.getByLabel("In stock only")).not.toBeChecked();
  await expect(page.locator("article")).toHaveCount(8);
});

test("quick add, wishlist, quantity cap and navigation retain state", async ({ page }) => {
  await page.goto("/");
  const lamp = card(page, "Arc desk lamp");
  const add = lamp.getByRole("button", { name: "Add Arc desk lamp to bag" });
  await add.click();
  await add.click();
  await expect(page.getByRole("link", { name: "Bag (2)" })).toBeVisible();
  await expect(lamp.getByText("In bag: Terracotta × 2", { exact: true })).toBeVisible();
  for (let i = 0; i < 10; i++) await add.click();
  await expect(page.getByRole("link", { name: "Bag (10)" })).toBeVisible();
  await expect(card(page, "Slow time clock").getByRole("button", { name: "Sold out" })).toBeDisabled();
  const save = lamp.getByRole("button", { name: "Save Arc desk lamp to wishlist" });
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: "Wishlist (1)" })).toBeVisible();
  await lamp.getByRole("link", { name: "Arc desk lamp", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page).toHaveURL("/products/arc-desk-lamp");
  await page.goBack();
  await expect(page.getByRole("heading", { name: "DeskDrop", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag (10)" })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.getByRole("link", { name: "Shop", exact: true }).click();
  await expect(page.getByRole("link", { name: "Bag (10)" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Wishlist (1)" })).toBeVisible();
  const restoredSave = card(page, "Arc desk lamp").getByRole("button", { name: "Save Arc desk lamp to wishlist" });
  await restoredSave.click();
  await expect(restoredSave).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("link", { name: "Wishlist (0)" })).toBeVisible();
});

test("desktop shell and not found response", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Shop", "Wishlist (0)", "Orders", "Account", "Bag (0)"]) await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
  await expect(page.locator("header img")).toHaveCount(0);
  await expect(page.locator("footer")).toContainText("Built with");
  await expect(page.locator("footer").getByAltText("CodeRabbit")).toBeVisible();
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.getByRole("link", { name: "Back to the shop" }).click();
  await expect(page).toHaveURL("/");
});

test("mobile menu and both pages fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ["/", "/no-such-page"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    const menu = page.getByRole("button", { name: "Menu" });
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    for (const link of ["Shop", "Wishlist (0)", "Orders", "Account", "Bag (0)"]) {
      await expect(page.locator("#site-nav").getByRole("link", { name: link, exact: true, includeHidden: true })).toBeHidden();
    }
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: "Shop", exact: true })).toBeVisible();
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("renders the product grid and links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("article")).toHaveCount(8);
    await expect(card(page, "Arc desk lamp").getByRole("link", { name: "Arc desk lamp", exact: true })).toHaveAttribute("href", "/products/arc-desk-lamp");
  });
});

test("synthetic 404 followed by Wishlist then Shop restores home", async ({ page }) => {
  await page.route(/\/(wishlist|orders|account|bag)(?:\?|$)/, async (route) => {
    const destination = new URL(route.request().url());
    destination.pathname = "/";
    await route.continue({ url: destination.toString() });
  });
  await page.goto("/");
  const lamp = card(page, "Arc desk lamp");
  await lamp.getByRole("button", { name: "Add Arc desk lamp to bag" }).click();
  await lamp.getByRole("button", { name: "Save Arc desk lamp to wishlist" }).click();
  for (const [name, destination] of [["Wishlist (1)", "/wishlist"], ["Orders", "/orders"], ["Account", "/account"], ["Bag (1)", "/bag"]]) {
    await lamp.getByRole("link", { name: "Arc desk lamp", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await page.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(destination);
    await expect(page.getByRole("heading", { name: "DeskDrop", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page not found" })).toHaveCount(0);
    await page.getByRole("link", { name: "Shop", exact: true }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "DeskDrop", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page not found" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Wishlist (1)" })).toBeVisible();
  }
});

test("Shop from a synthetic 404 restores home and preserves counts", async ({ page }) => {
  await page.goto("/");
  const lamp = card(page, "Arc desk lamp");
  await lamp.getByRole("button", { name: "Add Arc desk lamp to bag" }).click();
  await lamp.getByRole("button", { name: "Save Arc desk lamp to wishlist" }).click();
  await lamp.getByRole("link", { name: "Arc desk lamp", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.getByRole("link", { name: "Shop", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "DeskDrop", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Page not found" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Wishlist (1)" })).toBeVisible();
});
