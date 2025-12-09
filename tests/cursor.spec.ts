import { test, expect } from '@playwright/test';

test.describe('Cursor behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/solacheck/quiz');
    // Wait for quiz to be ready (progress percent visible)
    await expect(page.locator('text=/\\d+%/')).toBeVisible();
  });

  test('buttons use pointer cursor', async ({ page }) => {
    const next = page.getByRole('button', { name: 'Weiter' });
    await expect(next).toBeVisible();
    const cursor = await next.evaluate((el) => window.getComputedStyle(el as Element).cursor);
    expect(cursor).toBe('pointer');
  });

  test('elements with role=button use pointer cursor', async ({ page }) => {
    // Use Playwright role query which covers native buttons and elements with role=button
    const roleBtn = page.getByRole('button').first();
    await expect(roleBtn).toBeVisible();
    const cursor = await roleBtn.evaluate((el) => window.getComputedStyle(el as Element).cursor);
    expect(cursor).toBe('pointer');
  });
});
