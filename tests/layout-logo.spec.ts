import { test, expect } from "@playwright/test";

test.describe("Global Layout Logo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/solacheck");
  });

  test("displays the global logo (top left)", async ({ page }) => {
    const logo = page.locator('img[alt="SolaCheck Logo"]');
    await expect(logo).toBeVisible();
  });

  test("global logo links to home page", async ({ page }) => {
    const logoLink = page.locator('a[aria-label="Zur Startseite"]');
    await expect(logoLink).toBeVisible();

    await logoLink.click();
    await expect(page).toHaveURL("/solacheck");
  });

  test("global logo is positioned top left", async ({ page }) => {
    const logoWrapper = page.locator('div.fixed.top-4.left-4').first();
    await expect(logoWrapper).toBeVisible();
  });
});
