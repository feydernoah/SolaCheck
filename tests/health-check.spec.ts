import { test, expect } from '@playwright/test';

test.describe('SolaCheck - Basic Health Check', () => {
  test('website is up and running', async ({ page }) => {
    await page.goto('/solacheck/quiz');

    await expect(page).toHaveTitle(/SolaCheck/i);

    await expect(page.locator('text=/\\d+%/')).toBeVisible();

    const questionHeading = page.locator('h2.text-heading-2');
    await expect(questionHeading).toBeVisible();
    await expect(questionHeading).not.toBeEmpty();

    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();

    const navigationButtons = page.getByRole('button').filter({ hasText: /Zurück|Weiter|Absenden/ });
    await expect(navigationButtons.first()).toBeVisible();
  });

  test('progress bar shows correct percentage', async ({ page }) => {
    await page.goto('/solacheck/quiz');

    await page.waitForLoadState('networkidle');

    const percentageText = page.locator('text=/\\d+%/');
    await expect(percentageText).toBeVisible();
    
    const percentageValue = await percentageText.textContent();
    expect(percentageValue).toMatch(/\d+%/);
  });
});
