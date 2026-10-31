import { expect, test } from "@playwright/test";

test("@golden home accessible structure", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toMatchAriaSnapshot({ name: "home.aria.yml" });
});

test("@golden not-found accessible structure", async ({ page }) => {
  await page.goto("/no-such-page");
  await expect(page.locator("body")).toMatchAriaSnapshot({ name: "not-found.aria.yml" });
});
