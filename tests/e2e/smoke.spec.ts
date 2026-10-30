import { expect, test } from "@playwright/test";

test("serves the DeskDrop page", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const headings = page.getByRole("heading", { level: 1 });
  await expect(headings).toHaveCount(1);
  await expect(headings).toHaveText("DeskDrop");
});
