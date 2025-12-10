import { test, expect } from '@playwright/test';

test.describe('Cursor behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/solacheck/quiz');
    // Wait for quiz to be ready (progress percent visible)
    await expect(page.locator('text=/\\d+%/')).toBeVisible();
  });

  test('disabled Weiter shows not-allowed cursor', async ({ page }) => {
    const next = page.getByRole('button', { name: 'Weiter' });
    await expect(next).toBeVisible();
    // Button should be disabled on first question
    await expect(next).toBeDisabled();
    const cursor = await next.evaluate((el) => window.getComputedStyle(el as Element).cursor);
    expect(cursor).toBe('not-allowed');
  });

  test('answering enables Weiter and shows pointer cursor', async ({ page }) => {
    const next = page.getByRole('button', { name: 'Weiter' });
    const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
    await expect(ageButton).toBeVisible();
    await ageButton.click();
    await expect(next).toBeEnabled();
    const cursor = await next.evaluate((el) => window.getComputedStyle(el as Element).cursor);
    expect(cursor).toBe('pointer');
  });
});
