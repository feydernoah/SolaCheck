import { test, expect } from '@playwright/test';

test.describe('SolaCheck - Basic Health Check', () => {
  test('website is up and running', async ({ page }) => {
    // Navigate to quiz page
    await page.goto('/solacheck/quiz');

    // Check if the page loaded
    await expect(page).toHaveTitle(/SolaCheck/i);

    // Check if the main question box is visible
    await expect(page.locator('text=Question 1 of 5')).toBeVisible();

    // Check if the first question is displayed
    await expect(page.locator('text=What is your name?')).toBeVisible();

    // Check if the burger menu is present
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();

    // Check if Next button is present
    await expect(page.locator('text=Next')).toBeVisible();
  });

  test('progress bar shows correct percentage', async ({ page }) => {
    await page.goto('/solacheck/quiz');

    // Should show 20% on first question (1 of 5)
    await expect(page.locator('text=20%')).toBeVisible();
  });
});
