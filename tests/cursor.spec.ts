import { test, expect } from '@playwright/test';
import { setupPhotonMock } from './utils/photon-mock';

test.describe('Cursor behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await setupPhotonMock(page);
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
    const searchInput = page.getByPlaceholder(/Stadt, Adresse oder PLZ/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Berlin');
    const suggestion = page.locator('button').filter({ hasText: /Berlin/i }).first();
    await expect(suggestion).toBeVisible({ timeout: 3000 });
    await suggestion.click();
    await expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 5000 });
    await expect(next).toBeEnabled();
    const cursor = await next.evaluate((el) => window.getComputedStyle(el as Element).cursor);
    expect(cursor).toBe('pointer');
  });
});
