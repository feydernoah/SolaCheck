import { test, expect } from '@playwright/test';

test.describe('Footer', () => {
  test('footer links navigate to legal pages', async ({ page }) => {
    await page.goto('/solacheck');

    const impressumLink = page.getByRole('link', { name: /Impressum/i });
    await expect(impressumLink).toBeVisible();
    await impressumLink.click();
    await expect(page).toHaveURL(/\/impressum$/);

    const datenschutzLink = page.getByRole('link', { name: /Datenschutz/i });
    await expect(datenschutzLink).toBeVisible();
    await datenschutzLink.click();
    await expect(page).toHaveURL(/\/datenschutz$/);
  });
});
