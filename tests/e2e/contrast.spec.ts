import { expect, test } from "@playwright/test";
import { contrastRatio } from "../../lib/contrast";

for (const scheme of ["dark", "light"] as const) {
  test(`${scheme} theme tokens, artwork, logo and focus meet the brand contract`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const names = ["bg", "surface", "text", "muted", "on-primary", "primary", "primary-text", "danger", "accent-mint", "accent-cobalt", "border", "focus", "art-deep", "art-light", "art-bg"];
      return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(`--color-${name}`).trim()]));
    });
    for (const [foreground, background] of [["text", "bg"], ["text", "surface"], ["muted", "bg"], ["muted", "surface"], ["primary-text", "bg"], ["primary-text", "surface"], ["on-primary", "primary"], ...["danger", "accent-mint", "accent-cobalt"].flatMap((name) => [[name, "bg"], [name, "surface"]])]) {
      expect(contrastRatio(tokens[foreground], tokens[background]), `${foreground}/${background}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(tokens.primary.toLowerCase()).toBe("#ff570a");
    const artColors = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const tokenNames = ["bg", "surface", "text", "muted", "on-primary", "primary", "primary-text", "danger", "accent-mint", "accent-cobalt", "border", "focus", "art-deep", "art-light", "art-bg"];
      const probe = document.createElement("span");
      document.body.append(probe);
      const allowed = tokenNames.map((name) => { probe.style.color = root.getPropertyValue(`--color-${name}`).trim(); return getComputedStyle(probe).color; });
      probe.remove();
      const actual = [...document.querySelectorAll(".product-art, .product-art *")].flatMap((el) => [getComputedStyle(el).fill, getComputedStyle(el).stroke]);
      return actual.filter((color) => color !== "none" && !allowed.includes(color));
    });
    expect(artColors).toEqual([]);
    await expect(page.locator("footer img")).toHaveJSProperty("currentSrc", `${new URL(page.url()).origin}/brand/${scheme === "light" ? "orange" : "white"}-typemark.svg`);
    for (const locator of [page.getByRole("link", { name: "Shop", exact: true }), page.getByRole("button", { name: "Add Arc desk lamp to bag" })]) {
      for (let step = 0; step < 80 && !(await locator.evaluate((element) => element === document.activeElement)); step++) {
        await page.keyboard.press("Tab");
      }
      await expect(locator).toBeFocused();
      const outline = await locator.evaluate((element) => { const style = getComputedStyle(element); return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor }; });
      expect(outline.style).not.toBe("none");
      expect(parseFloat(outline.width)).toBeGreaterThan(0);
      expect(outline.color).toBe("rgb(255, 87, 10)");
    }
  });
}
