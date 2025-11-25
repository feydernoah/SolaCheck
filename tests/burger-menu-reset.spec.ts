import { test, expect } from '@playwright/test';

const COOKIE_NAME = 'solacheck_quiz_progress';

test.describe('Burger Menu - Home Reset', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('burger menu is visible on quiz page', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');

    const menuButton = page.getByRole('button', { name: 'Menu' });
    await expect(menuButton).toBeVisible();
  });

  test('burger menu opens and shows home option', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.getByRole('button', { name: 'Menu' }).click();

    // Should show Home button
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
  });

  test('home click shows confirmation dialog', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');

    // Just answer question 1 (age) - no need to advance further for this test
    const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
    await ageButton.click();
    await page.waitForTimeout(200);

    // Setup dialog handler before clicking home
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.dismiss(); // Cancel the dialog
    });

    // Open menu and click home
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: 'Home' }).click();

    // Wait for dialog to be processed
    await page.waitForTimeout(500);

    // Verify dialog was shown with correct message
    expect(dialogMessage).toContain('Quiz');
    expect(dialogMessage).toContain('Fortschritt');
  });

  test('canceling confirmation dialog stays on quiz page', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');

    // Answer question 1 and advance to question 2
    const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
    await ageButton.click();
    await page.waitForTimeout(100);
    
    const nextButton = page.getByRole('button', { name: 'Weiter' });
    await expect(nextButton).toBeEnabled({ timeout: 3000 });
    await nextButton.click();
    await page.waitForTimeout(300);

    // Setup dialog handler BEFORE clicking home - dismiss means "Cancel"
    page.on('dialog', dialog => dialog.dismiss());

    // Open menu and click home
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: 'Home' }).click();

    // Wait for dialog to be processed
    await page.waitForTimeout(500);

    // When dialog is dismissed (canceled), the quiz resets but stays on quiz page
    // because handleResetQuiz returns false, but we only call resetProgress inside the if
    // So user stays on current page
    await expect(page).toHaveURL(/\/quiz/);
    
    // Note: Progress is preserved because dialog was dismissed
    await expect(page.locator('text=/Frage 2 von \\d+/')).toBeVisible();
  });

  test('confirming dialog navigates to home and resets progress', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');

    // Answer question 1 and advance
    const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
    await ageButton.click();
    await page.waitForTimeout(100);
    
    const nextButton = page.getByRole('button', { name: 'Weiter' });
    await expect(nextButton).toBeEnabled({ timeout: 3000 });
    await nextButton.click();
    await page.waitForTimeout(300);

    // Verify we have a cookie with progress
    let cookies = await page.context().cookies();
    let progressCookie = cookies.find(c => c.name === COOKIE_NAME);
    expect(progressCookie).toBeDefined();

    // Setup dialog handler BEFORE clicking home
    page.on('dialog', dialog => dialog.accept());

    // Open menu and click home
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: 'Home' }).click();

    // Should navigate to home page
    await expect(page).toHaveURL('/solacheck');

    // Cookie should be cleared
    cookies = await page.context().cookies();
    progressCookie = cookies.find(c => c.name === COOKIE_NAME);
    expect(progressCookie).toBeUndefined();
  });

  test('restarting quiz after reset starts at question 1', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');

    // Make some progress - answer question 1 and advance
    const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
    await ageButton.click();
    await page.waitForTimeout(100);
    
    const nextButton = page.getByRole('button', { name: 'Weiter' });
    await expect(nextButton).toBeEnabled({ timeout: 3000 });
    await nextButton.click();
    await page.waitForTimeout(300);

    // Verify we're on question 2
    await expect(page.locator('text=/Frage 2 von \\d+/')).toBeVisible();

    // Setup dialog handler BEFORE clicking home
    page.on('dialog', dialog => dialog.accept());

    // Reset via home
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: 'Home' }).click();

    // Wait for navigation
    await expect(page).toHaveURL('/solacheck');

    // Go back to quiz
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');

    // Should be at question 1
    await expect(page.locator('text=/Frage 1 von \\d+/')).toBeVisible();
  });

  test('menu behavior when dialog is canceled', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');

    // Dismiss dialog (cancel)
    page.on('dialog', dialog => dialog.dismiss());

    // Open menu and click home
    await page.getByRole('button', { name: 'Menu' }).click();
    
    const menuDropdown = page.locator('div.absolute.right-0');
    await expect(menuDropdown).toBeVisible();
    
    await page.getByRole('button', { name: 'Home' }).click();
    await page.waitForTimeout(500);

    // When canceled, user stays on quiz page (navigation prevented)
    await expect(page).toHaveURL(/\/quiz/);
  });
});
