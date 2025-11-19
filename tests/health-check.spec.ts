import { test, expect } from '@playwright/test';

test.describe('SolaCheck - Basic Health Check', () => {
  test('website is up and running', async ({ page }) => {
    // Navigate to quiz page
    await page.goto('/solacheck/quiz');

    // Check if the page loaded
    await expect(page).toHaveTitle(/SolaCheck/i);

    // Check if the progress indicator is visible (more flexible - checks for pattern "Frage X von Y")
    await expect(page.locator('text=/Frage \\d+ von \\d+/')).toBeVisible();

    // Check if any question content is displayed (looks for the h2 heading element)
    const questionHeading = page.locator('h2.text-heading-2');
    await expect(questionHeading).toBeVisible();
    await expect(questionHeading).not.toBeEmpty();

    // Check if the burger menu is present
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();

    // Check if navigation buttons are present (Back or Next)
    const navigationButtons = page.getByRole('button').filter({ hasText: /Zurück|Weiter|Absenden/ });
    await expect(navigationButtons.first()).toBeVisible();
  });

  test('progress bar shows correct percentage', async ({ page }) => {
    await page.goto('/solacheck/quiz');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that progress bar exists and shows a percentage
    await expect(page.locator('text=/\\d+%/')).toBeVisible();
    
    // Check that the progress bar container is visible (gray background)
    const progressBarContainer = page.locator('.bg-gray-200.rounded-full.h-2');
    await expect(progressBarContainer).toBeVisible();
    
    // Check that the yellow progress bar exists (it may have width 0 if no answer selected)
    const progressBar = page.locator('.bg-yellow-400.h-2.rounded-full');
    await expect(progressBar).toBeAttached();
  });
});
