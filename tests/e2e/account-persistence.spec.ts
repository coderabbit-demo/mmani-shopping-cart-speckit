import { expect, test, type Page } from "@playwright/test";
import { contrastRatio } from "../../lib/contrast";

const key = "deskdrop-demo-v1";
const shipping = { "Full name": "Alex Smith", Email: "alex@example.com", Address: "123 Main St", City: "Portland", "Postal code": "97201" };

async function add(page: Page, name = "Arc desk lamp") { await page.getByRole("button", { name: `Add ${name} to bag` }).click(); }
async function save(page: Page, name: string) { await page.getByRole("button", { name: `Save ${name} to wishlist` }).click(); }
async function signIn(page: Page, email = "alex@deskdrop.demo", password = "deskdrop123") {
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}
async function placeOrder(page: Page) {
  await page.getByRole("link", { name: /Bag \(/ }).click();
  await page.getByRole("link", { name: "Checkout", exact: true }).click();
  for (const [label, value] of Object.entries(shipping)) await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL("/checkout/success");
}
async function seed(page: Page, value: unknown) {
  await page.addInitScript(({ key, raw }) => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem(key, raw);
      sessionStorage.setItem("seeded", "yes");
    }
  }, { key, raw: typeof value === "string" ? value : JSON.stringify(value) });
}

test("reload preserves the bag, coupon, totals and receipt without flashing empty states", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/products/arc-desk-lamp");
  await page.getByRole("radio", { name: "Sage" }).check();
  await page.getByLabel("Quantity", { exact: true }).fill("2");
  await page.getByLabel("Quantity", { exact: true }).blur();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page.getByRole("link", { name: "Bag (2)" }).click();
  await page.getByLabel("Discount code").fill("DESK15");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await page.getByRole("radio", { name: "Express — $12" }).check();
  const total = await page.getByRole("region", { name: "Order summary" }).textContent();
  const flashes: string[] = [];
  await page.exposeFunction("reportEmpty", (text: string) => flashes.push(text));
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      const main = document.querySelector("main");
      if (main?.textContent?.includes("Your bag is empty.") || main?.textContent?.includes("No recent order.")) (window as any).reportEmpty(main.textContent);
    });
    observer.observe(document, { subtree: true, childList: true, characterData: true });
  });
  await page.reload();
  await expect(page.getByText("Color: Sage")).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag (2)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove code" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Express — $12" })).toBeChecked();
  await expect(page.getByRole("region", { name: "Order summary" })).toHaveText(total!);
  const other = await context.newPage();
  await other.goto("/cart");
  await expect(other.getByRole("link", { name: "Bag (2)" })).toBeVisible();
  await other.close();
  await page.getByRole("link", { name: "Checkout", exact: true }).click();
  await expect(page).toHaveURL("/checkout");
  await page.reload();
  await expect(page.getByRole("button", { name: "Place order" })).toBeEnabled();
  expect(flashes).toEqual([]);
  for (const [label, value] of Object.entries(shipping)) await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL("/checkout/success");
  const id = await page.getByText(/^Order DD-\d{6}$/).innerText();
  flashes.length = 0;
  await page.reload();
  await expect(page.getByText(id)).toBeVisible();
  await expect(page.getByText("Arc desk lamp", { exact: true })).toBeVisible();
  expect(flashes).toEqual([]);
  expect(errors.filter(message => /hydrat/i.test(message))).toEqual([]);
  const stored = await page.evaluate(key => localStorage.getItem(key), key);
  expect(JSON.parse(stored!).version).toBe(1);
  expect(stored).not.toContain("deskdrop123");
});

test("rule 5 preserves wishlist across sign in, reload and sign out", async ({ page }) => {
  const urls: string[] = [], messages: string[] = [];
  page.on("framenavigated", frame => { if (frame === page.mainFrame()) urls.push(frame.url()); });
  page.on("console", message => messages.push(message.text()));
  await page.goto("/");
  await save(page, "Arc desk lamp");
  await save(page, "Form mechanical keyboard");
  await add(page);
  await page.getByRole("link", { name: "Account", exact: true }).click();
  await expect(page.getByText("Demo account: alex@deskdrop.demo / deskdrop123. This is fixture data; there is no real sign-in.")).toBeVisible();
  await expect(page.locator("form")).toHaveAttribute("method", "post");
  await expect(page.locator("form")).not.toHaveAttribute("action", /.+/);
  await expect(page.getByLabel("Password")).toHaveAttribute("type", "password");
  await signIn(page, "wrong@example.test", "wrong-secret");
  await expect(page.locator("main").getByRole("alert")).toHaveText("Email or password is incorrect.");
  await signIn(page);
  await expect(page.getByText("Signed in as Alex")).toBeVisible();
  await expect(page.getByRole("link", { name: "Your orders" })).toHaveAttribute("href", "/orders");
  await page.reload();
  await expect(page.getByText("Signed in as Alex")).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).not.toContain("deskdrop123");
  await page.getByRole("link", { name: "Your wishlist" }).click();
  await expect(page.locator("main article")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "Arc desk lamp" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Form mechanical keyboard" })).toBeVisible();
  await placeOrder(page);
  await page.getByRole("link", { name: "Shop", exact: true }).click();
  await add(page);
  await page.getByRole("link", { name: "Account", exact: true }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Wishlist (2)" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();
  await page.getByRole("link", { name: "Orders", exact: true }).click();
  await expect(page.getByText("Arc desk lamp", { exact: true })).toBeVisible();
  for (const value of ["wrong@example.test", "wrong-secret", "alex@deskdrop.demo", "deskdrop123"]) {
    for (const url of urls) expect(decodeURIComponent(url)).not.toContain(value);
    for (const message of messages) expect(message).not.toContain(value);
  }
});

test.describe("before hydration", () => {
  test.use({ javaScriptEnabled: false });
  test("sign in stays disabled and posts without an action", async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeDisabled();
    await expect(page.locator("main form")).toHaveAttribute("method", "post");
    await expect(page.locator("main form")).not.toHaveAttribute("action", /.+/);
  });
});

for (const colorScheme of ["dark", "light"] as const) {
  test(`${colorScheme} account and reset controls meet AA contrast`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/account");
    for (const locator of [page.getByLabel("Email"), page.getByRole("button", { name: "Sign in" })]) {
      const colors = await locator.evaluate(element => { const style = getComputedStyle(element); return [style.color, style.backgroundColor]; });
      expect(contrastRatio(colors[0], colors[1])).toBeGreaterThanOrEqual(4.5);
    }
    await page.goto("/demo");
    const colors = await page.getByRole("button", { name: "Reset demo data" }).evaluate(element => { const style = getComputedStyle(element); return [style.color, style.backgroundColor]; });
    expect(contrastRatio(colors[0], colors[1])).toBeGreaterThanOrEqual(4.5);
  });
}

test("wishlist cards add the first color and remove saved products", async ({ page }) => {
  await page.goto("/");
  await save(page, "Arc desk lamp");
  await page.getByRole("link", { name: "Wishlist (1)" }).click();
  await page.getByRole("button", { name: "Add Arc desk lamp to bag" }).click();
  await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save Arc desk lamp to wishlist" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Save Arc desk lamp to wishlist" }).click();
  await expect(page.getByText("Your wishlist is empty.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse the shop" })).toHaveAttribute("href", "/");
  await page.getByRole("link", { name: "Bag (1)" }).click();
  await expect(page.getByText("Color: Terracotta")).toBeVisible();
});

test("invalid JSON starts empty and the app can store new changes", async ({ page }) => {
  await seed(page, "not json");
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
  await add(page);
  await expect.poll(async () => page.evaluate(key => localStorage.getItem(key), key)).toContain('"version":1');
});

test("corrupt fields are repaired and valid orders retained", async ({ page }) => {
  const valid = { id: "DD-123456", placedAt: "2026-10-30T12:00:00.000Z", delivery: "standard", coupon: null, subtotal: 68, discount: 0, deliveryFee: 0, total: 68, shipping: { fullName: "Alex Smith", email: "alex@example.com", address: "123 Main St", city: "Portland", postalCode: "97201" }, items: [{ productId: "arc-desk-lamp", name: "Arc desk lamp", color: "Sage", quantity: 1, unitPrice: 68, lineTotal: 68 }] };
  await seed(page, { version: 1, state: { cart: [{ productId: "unknown", color: "Sage", quantity: 1 }, { productId: "arc-desk-lamp", color: "wrong", quantity: 1 }, { productId: "arc-desk-lamp", color: "Sage", quantity: 99 }], coupon: "BAD", wishlist: ["arc-desk-lamp", "arc-desk-lamp", "unknown"], orders: [valid, { ...valid, id: "broken" }] } });
  await page.goto("/cart");
  await expect(page.getByRole("link", { name: "Bag (10)" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Wishlist (1)" })).toBeVisible();
  await expect(page.getByText("Color: Sage")).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove code" })).toHaveCount(0);
  await page.getByRole("link", { name: "Orders", exact: true }).click();
  await expect(page.locator("main article")).toHaveCount(1);
  await expect(page.getByText("Order DD-123456")).toBeVisible();
});

test("ineligible coupon and an order without shipping are discarded", async ({ page }) => {
  await seed(page, { version: 1, state: { cart: [{ productId: "arc-desk-lamp", color: "Sage", quantity: 1 }], coupon: "DESK15", orders: [{ id: "DD-123456", placedAt: "2026-10-30T12:00:00.000Z", delivery: "standard", coupon: null, subtotal: 68, discount: 0, deliveryFee: 0, total: 68, items: [{ productId: "arc-desk-lamp", name: "Arc desk lamp", color: "Sage", quantity: 1, unitPrice: 68, lineTotal: 68 }] }] } });
  await page.goto("/cart");
  await expect(page.getByText("Color: Sage")).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove code" })).toHaveCount(0);
  await page.goto("/orders");
  await expect(page.getByText("No orders yet.")).toBeVisible();
  await page.goto("/checkout/success");
  await expect(page.getByText("No recent order.")).toBeVisible();
});

test("disabled storage supports the full journey in memory", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } }));
  await page.goto("/");
  await add(page);
  await placeOrder(page);
  await expect(page.getByRole("heading", { name: "Thank you, Alex!" })).toBeVisible();
  await page.getByRole("link", { name: "Account", exact: true }).click();
  await signIn(page);
  await expect(page.getByText("Signed in as Alex")).toBeVisible();
  await page.getByRole("link", { name: "Your orders" }).click();
  await expect(page.getByText("Arc desk lamp", { exact: true })).toBeVisible();
});

test("a first visit stores nothing until the shopper changes state", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByRole("button", { name: "Reset demo data" })).toBeEnabled();
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  await page.getByRole("link", { name: "Shop", exact: true }).click();
  await add(page);
  await expect.poll(async () => page.evaluate(key => localStorage.getItem(key), key)).toContain('"version":1');
});

test("demo reset can be cancelled and removes all state when confirmed", async ({ page }) => {
  await page.goto("/");
  await save(page, "Arc desk lamp");
  await add(page);
  await placeOrder(page);
  await page.getByRole("link", { name: "Shop", exact: true }).click();
  await add(page);
  await page.getByRole("link", { name: "Account", exact: true }).click();
  await signIn(page);
  await page.goto("/demo");
  page.once("dialog", dialog => { expect(dialog.message()).toBe("Clear all demo data?"); void dialog.dismiss(); });
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await expect(page.getByRole("link", { name: "Wishlist (1)" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).not.toBeNull();
  page.once("dialog", dialog => { expect(dialog.message()).toBe("Clear all demo data?"); void dialog.accept(); });
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await expect(page.getByText("Demo data cleared.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Wishlist (0)" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  await page.reload();
  await expect(page.getByRole("button", { name: "Reset demo data" })).toBeEnabled();
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  await page.getByRole("link", { name: "Account", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  await page.getByRole("link", { name: "Orders", exact: true }).click();
  await expect(page.getByText("No orders yet.")).toBeVisible();
  await page.getByRole("link", { name: "Shop", exact: true }).click();
  await add(page);
  await expect.poll(async () => page.evaluate(key => localStorage.getItem(key), key)).toContain('"version":1');
});
