import { expect, test } from "@playwright/test";

test("shipping input renders as text and stays out of navigation URLs and console", async ({ page }) => {
  const values = { "Full name": "<img src=x onerror=alert(1)>marker", Email: "marker.person@example.test", Address: "123 Marker Lane", City: "Markerville", "Postal code": "M4RK3R" };
  const urls: string[] = [];
  const messages: string[] = [];
  let dialogs = 0;
  page.on("framenavigated", (frame) => { if (frame === page.mainFrame()) urls.push(frame.url()); });
  page.on("console", (message) => messages.push(message.text()));
  page.on("dialog", (dialog) => { dialogs++; void dialog.dismiss(); });
  await page.goto("/");
  await page.getByRole("button", { name: "Add Form mechanical keyboard to bag" }).click();
  await page.getByRole("link", { name: /Bag \(/ }).click();
  await page.getByRole("link", { name: "Checkout", exact: true }).click();
  for (const [label, value] of Object.entries(values)) await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL("/checkout/success");
  await expect(page.locator("main")).toContainText(values["Full name"]);
  await expect(page.locator("main img")).toHaveCount(0);
  expect(dialogs).toBe(0);
  await page.getByRole("link", { name: "Orders", exact: true }).click();
  for (const value of Object.values(values)) {
    for (const url of [...urls, page.url()]) { expect(url).not.toContain(value); expect(decodeURIComponent(url)).not.toContain(value); }
    for (const message of messages) expect(message).not.toContain(value);
  }
});
