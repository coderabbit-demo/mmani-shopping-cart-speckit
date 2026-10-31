import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const strictChildren = "- /children: deep-equal\n";

async function matchPageSnapshot(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.snapshotPath(name, { kind: "aria" });
  if (existsSync(path)) expect(readFileSync(path, "utf8").startsWith(strictChildren)).toBe(true);
  await expect(page.locator("body")).toMatchAriaSnapshot({ name });
  let snapshot = readFileSync(path, "utf8");
  if (!snapshot.startsWith(strictChildren) && ["all", "changed", "missing"].includes(testInfo.config.updateSnapshots)) {
    if (name === "home.aria.yml") {
      const prices = await page.locator("article .price").allTextContents();
      let priceIndex = 0;
      snapshot = snapshot.replace(/- text: \/\\\$\\d\+\/(?=\r?$)/gm, () => {
        if (priceIndex >= prices.length) throw new Error("More snapshot prices than product cards");
        return `- text: ${prices[priceIndex++].trim()}`;
      });
      if (priceIndex !== prices.length) throw new Error("Unable to pin all product prices in the page snapshot");
    }
    writeFileSync(path, strictChildren + snapshot);
  }
  expect(readFileSync(path, "utf8").startsWith(strictChildren)).toBe(true);
}

test("@golden home accessible structure", async ({ page }, testInfo) => {
  await page.goto("/");
  await matchPageSnapshot(page, testInfo, "home.aria.yml");
});

test("@golden not-found accessible structure", async ({ page }, testInfo) => {
  await page.goto("/no-such-page");
  await matchPageSnapshot(page, testInfo, "not-found.aria.yml");
});

test("snapshot child matching rejects an extra button", async ({ page }, testInfo) => {
  const snapshot = readFileSync(testInfo.snapshotPath("home.aria.yml", { kind: "aria" }), "utf8");
  expect(snapshot.startsWith(strictChildren)).toBe(true);
  await page.goto("/");
  const body = page.locator("body");
  await expect(body).toMatchAriaSnapshot(snapshot);
  await page.locator("main").evaluate((main) => {
    const button = document.createElement("button");
    button.textContent = "Extra control";
    main.append(button);
  });
  await expect(body).toMatchAriaSnapshot(`- /children: contain\n${snapshot.slice(strictChildren.length)}`);
  await expect(body).not.toMatchAriaSnapshot(snapshot);
});


test("@golden product detail accessible structure", async ({ page }, testInfo) => {
  await page.goto("/products/arc-desk-lamp");
  await expect(page.getByRole("button", { name: "Add to bag", exact: true })).toBeEnabled();
  await matchPageSnapshot(page, testInfo, "product-arc-desk-lamp.aria.yml");
});

test("@golden empty cart accessible structure", async ({ page }, testInfo) => {
  await page.goto("/cart");
  await expect(page.getByText("Your bag is empty.")).toBeVisible();
  await matchPageSnapshot(page, testInfo, "cart-empty.aria.yml");
});

test("@golden filled cart accessible structure", async ({ page }, testInfo) => {
  await page.goto("/products/arc-desk-lamp");
  await page.getByRole("radio", { name: "Sage" }).check();
  await page.getByLabel("Quantity", { exact: true }).fill("2");
  await page.getByLabel("Quantity", { exact: true }).blur();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page.getByRole("link", { name: "Bag (2)" }).click();
  await expect(page.getByText("Color: Sage")).toBeVisible();
  await matchPageSnapshot(page, testInfo, "cart-filled.aria.yml");
});
