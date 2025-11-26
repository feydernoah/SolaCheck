import { test, expect, type Page } from '@playwright/test';

const COOKIE_NAME = 'solacheck_quiz_progress';

/**
 * Wait for quiz to be ready - uses web-first assertions with auto-retry
 */
async function waitForQuizReady(page: Page) {
  await expect(page.locator('text=/\\d+%/')).toBeVisible();
}

/**
 * Click an age button and wait for "Weiter" to become enabled
 * This proves the click was registered - no manual timeouts needed
 */
async function clickAgeButton(page: Page) {
  const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
  await ageButton.click();
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
}

/**
 * Click "Weiter" and wait for next question to appear
 */
async function clickNextButton(page: Page) {
  const nextButton = page.getByRole('button', { name: 'Weiter' });
  await nextButton.click();
  // Wait for question to change by verifying navigation buttons are enabled
  await expect(page.getByRole('button', { name: 'Zurück' })).toBeEnabled();
}

/**
 * Open burger menu and click Home button
 */
async function openMenuAndClickHome(page: Page) {
  const menuButton = page.getByRole('button', { name: 'Menu' });
  await menuButton.click();
  
  // Wait for dropdown to be visible
  const homeButton = page.getByRole('button', { name: 'Home' });
  await expect(homeButton).toBeVisible();
  await homeButton.click();
}

test.describe('Burger Menu - Home Reset', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('burger menu is visible on quiz page', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
  });

  test('burger menu opens and shows home option', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Open menu
    await page.getByRole('button', { name: 'Menu' }).click();

    // Should show Home button
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
  });

  test('home click shows confirmation dialog', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Answer question 1
    await clickAgeButton(page);

    // Setup dialog handler before clicking home
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    // Open menu and click home
    await openMenuAndClickHome(page);

    // Use expect.poll to wait for dialog to be processed
    await expect.poll(() => dialogMessage, {
      message: 'Dialog should contain Quiz and Fortschritt',
      timeout: 5000,
    }).toContain('Quiz');
    
    expect(dialogMessage).toContain('Fortschritt');
  });

  test('canceling confirmation dialog stays on quiz page', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Answer question 1 and advance to question 2
    await clickAgeButton(page);
    await clickNextButton(page);

    // Verify we're on question 2 by checking the heading
    const heading = page.locator('h2').first();
    await expect(heading).toContainText(/Wo wohnst du|Wie viele Personen/i);

    // Setup dialog handler - dismiss means "Cancel"
    page.on('dialog', dialog => dialog.dismiss());

    // Open menu and click home
    await openMenuAndClickHome(page);

    // When canceled, user stays on quiz page with progress preserved
    await expect(page).toHaveURL(/\/quiz/);
    await expect(heading).toContainText(/Wo wohnst du|Wie viele Personen/i);
  });

  test('confirming dialog navigates to home and resets progress', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Answer question 1 and advance
    await clickAgeButton(page);
    await clickNextButton(page);

    // Verify we're on question 2 by checking the heading
    const heading = page.locator('h2').first();
    await expect(heading).toContainText(/Wo wohnst du|Wie viele Personen/i);

    // Verify we have a cookie with progress
    let cookies = await page.context().cookies();
    let progressCookie = cookies.find(c => c.name === COOKIE_NAME);
    expect(progressCookie).toBeDefined();

    // Setup dialog handler - accept means "Confirm"
    page.on('dialog', dialog => dialog.accept());

    // Open menu and click home
    await openMenuAndClickHome(page);

    // Should navigate to home page
    await expect(page).toHaveURL('/solacheck');

    // Cookie should be cleared
    cookies = await page.context().cookies();
    progressCookie = cookies.find(c => c.name === COOKIE_NAME);
    expect(progressCookie).toBeUndefined();
  });

  test('restarting quiz after reset starts at question 1', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Make some progress
    await clickAgeButton(page);
    await clickNextButton(page);

    // Verify we're on question 2 by checking the heading
    let heading = page.locator('h2').first();
    await expect(heading).toContainText(/Wo wohnst du|Wie viele Personen/i);

    // Setup dialog handler
    page.on('dialog', dialog => dialog.accept());

    // Reset via home
    await openMenuAndClickHome(page);

    // Wait for navigation to home
    await expect(page).toHaveURL('/solacheck');

    // Go back to quiz
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Should be at question 1
    heading = page.locator('h2').first();
    await expect(heading).toContainText(/Wie alt bist du/i);
  });

  test('menu behavior when dialog is canceled', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Dismiss dialog (cancel)
    page.on('dialog', dialog => dialog.dismiss());

    // Open menu
    const menuButton = page.getByRole('button', { name: 'Menu' });
    await menuButton.click();
    
    // Wait for dropdown
    const menuDropdown = page.locator('div.absolute.right-0');
    await expect(menuDropdown).toBeVisible();
    
    // Click home
    await page.getByRole('button', { name: 'Home' }).click();

    // When canceled, user stays on quiz page
    await expect(page).toHaveURL(/\/quiz/);
  });
});
