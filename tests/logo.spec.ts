import { test, expect } from "@playwright/test";

test("clicking the logo navigates to the home page", async ({ page }) => {
  await page.goto("/solacheck");

  const logoLink = page.getByRole("link", { name: /zur startseite/i });
  await expect(logoLink).toBeVisible();

  await logoLink.click();

  await expect(page).toHaveURL("/solacheck");
});

