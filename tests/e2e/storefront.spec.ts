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
  await page.route("**/products/arc-desk-lamp", (route) => route.fulfill({ status: 404 }));
  await page.goto("/");
  const lamp = card(page, "Arc desk lamp");
  const add = lamp.getByRole("button", { name: "Add Arc desk lamp to bag" });
  await add.click();
  await add.click();
  await expect(page.getByRole("link", { name: "Bag (2)" })).toBeVisible();
  await expect(page.locator("article").getByText(/In bag:/)).toHaveCount(0);
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
  await expect(page.getByRole("link", { name: "Bag (0)", exact: true })).toHaveAttribute("href", "/cart");
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
  await page.route("**/products/arc-desk-lamp", (route) => route.fulfill({ status: 404 }));
  await page.route(/\/(wishlist|orders|account|bag|cart)(?:\?|$)/, async (route) => {
    const destination = new URL(route.request().url());
    destination.pathname = "/";
    await route.continue({ url: destination.toString() });
  });
  await page.goto("/");
  const lamp = card(page, "Arc desk lamp");
  await lamp.getByRole("button", { name: "Add Arc desk lamp to bag" }).click();
  await lamp.getByRole("button", { name: "Save Arc desk lamp to wishlist" }).click();
  for (const [name, destination] of [["Wishlist (1)", "/wishlist"], ["Orders", "/orders"], ["Account", "/account"], ["Bag (1)", "/cart"]]) {
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
  await page.route("**/products/arc-desk-lamp", (route) => route.fulfill({ status: 404 }));
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

for (const [name, selector] of [["hero link", ".hero-link"], ["add-to-bag button", ".add-button:not(:disabled)"], ["primary button", ".primary-button"]] as const) {
  test(`${name} uses regular weight`, async ({ page }) => {
    await page.goto(name === "primary button" ? "/no-such-page" : "/");
    await expect(page.locator(selector).first()).toHaveCSS("font-weight", "400");
  });
}

for (const [status, destination] of [[404, "/wishlist"], [500, "/wishlist"], [404, "/"]] as const) {
  test(`stale product lookup (${status}) cannot replace ${destination}`, async ({ page }) => {
    let release!: () => void;
    let started!: () => void;
    let finished!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const requestStarted = new Promise<void>((resolve) => { started = resolve; });
    const requestFinished = new Promise<void>((resolve) => { finished = resolve; });
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = (...args) => {
        const response = originalFetch(...args);
        if (args[0] === "/products/arc-desk-lamp") {
          return response.finally(() => { (window as Window & { lookupSettled?: boolean }).lookupSettled = true; });
        }
        return response;
      };
    });
    await page.route(/\/wishlist(?:\?|$)/, async (route) => {
      const destination = new URL(route.request().url());
      destination.pathname = "/";
      await route.continue({ url: destination.toString() });
    });
    await page.route("**/products/arc-desk-lamp", async (route) => {
      started();
      await gate;
      try { await route.fulfill({ status, body: "unavailable" }); } catch { }
      finished();
    });
    await page.goto("/");
    await card(page, "Arc desk lamp").getByRole("link", { name: "Arc desk lamp", exact: true }).click();
    await requestStarted;
    await page.getByRole("link", { name: destination === "/" ? "Shop" : "Wishlist (0)", exact: true }).click();
    await expect(page).toHaveURL(destination);
    await expect(page.getByRole("heading", { name: "DeskDrop", level: 1 })).toBeVisible();
    release();
    await requestFinished;
    await page.waitForFunction(() => (window as Window & { lookupSettled?: boolean }).lookupSettled === true);
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 100)));
    await expect(page).toHaveURL(destination);
    await expect(page.getByRole("heading", { name: "DeskDrop", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page not found" })).toHaveCount(0);
  });
}

test("home heading uses the Geist font family", async ({ page }) => {
  await page.goto("/");
  const heading = page.getByRole("heading", { name: "DeskDrop", level: 1 });
  const fonts = await heading.evaluate((element) => {
    const style = getComputedStyle(element);
    const firstFamily = (value: string) => value.split(",")[0].trim().replace(/^["']|["']$/g, "");
    return {
      actual: firstFamily(style.fontFamily),
      geist: firstFamily(style.getPropertyValue("--font-geist")),
      hack: firstFamily(style.getPropertyValue("--font-hack")),
    };
  });
  expect(fonts.geist).not.toBe("");
  expect(fonts.actual).toBe(fonts.geist);
  expect(fonts.actual).not.toBe(fonts.hack);
});

test("home heading uses semibold weight", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "DeskDrop", level: 1 })).toHaveCSS("font-weight", "600");
});

test("reduced motion disables smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "smooth");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto", { timeout: 1000 });
});

for (const [name, path, selector, weight] of [
  ["filter label", "/", ".select-field > span", "700"],
  ["results count", "/", ".results-line [role=status]", "700"],
  ["card rating", "/", '[aria-label="Rating 4.9 out of 5"]', "700"],
  ["section heading", "/", ".section-heading h2", "600"],
  ["card heading", "/", ".card-body h2", "600"],
  ["not-found heading", "/no-such-page", ".not-found h1", "600"],
  ["card price", "/", ".price", "400"],
] as const) {
  test(`${name} has the brand font weight`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(selector).first()).toHaveCSS("font-weight", weight, { timeout: 1000 });
  });
}
