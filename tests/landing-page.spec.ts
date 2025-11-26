import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/solacheck');
  });

  test('displays the main logo', async ({ page }) => {
    const logo = page.locator('img[alt="Sola Check Logo"]');
    await expect(logo).toBeVisible();
  });

  test('displays the Start button', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await expect(startButton).toBeVisible();
  });

  test('Start button has correct styling', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    
    // Check if button has gray background
    await expect(startButton).toHaveClass(/bg-gray-400/);
    
    // Check if button has rounded-full class
    await expect(startButton).toHaveClass(/rounded-full/);
  });

  test('Start button navigates to quiz page', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    // Should navigate to /solacheck/quiz
    await expect(page).toHaveURL('/solacheck/quiz');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Should see the progress indicator with percentage
    await expect(page.locator('text=/\\d+%/')).toBeVisible({ timeout: 10000 });
    
    // Should see a question heading
    const questionHeading = page.locator('h2.text-heading-2');
    await expect(questionHeading).toBeVisible();
  });

  test('displays burger menu', async ({ page }) => {
    const burgerMenu = page.getByRole('button', { name: 'Menu' });
    await expect(burgerMenu).toBeVisible();
  });

  test('displays chat buddy image', async ({ page }) => {
    const chatBuddy = page.locator('img[alt="Sola Chat Buddy"]');
    await expect(chatBuddy).toBeVisible();
  });

  test('displays speech bubble with welcome message', async ({ page }) => {
    const speechBubble = page.locator('text=Hallo! Willkommen bei SolaCheck. Ich bin Sola und helfe dir gerne weiter! 👋');
    await expect(speechBubble).toBeVisible();
  });

  test('displays placeholder for small logo in top left', async ({ page }) => {
    const smallLogoPlaceholder = page.locator('text=Logo').first();
    await expect(smallLogoPlaceholder).toBeVisible();
  });

  test('hover effect on Start button', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    
    // Check that button has hover classes
    await expect(startButton).toHaveClass(/md:hover:bg-yellow-400/);
    await expect(startButton).toHaveClass(/md:hover:text-gray-800/);
  });

  test('page has white background', async ({ page }) => {
    const mainContainer = page.locator('div.min-h-screen.bg-white').first();
    await expect(mainContainer).toBeVisible();
  });

  test('responsive layout - logo and button are centered', async ({ page }) => {
    const contentContainer = page.locator('div.flex.flex-col.items-center.justify-center');
    await expect(contentContainer).toBeVisible();
  });

  test('chat buddy is positioned at bottom left', async ({ page }) => {
    const chatBuddyContainer = page.locator('div.fixed').filter({ has: page.locator('img[alt="Sola Chat Buddy"]') });
    await expect(chatBuddyContainer).toBeVisible();
    await expect(chatBuddyContainer).toHaveClass(/bottom-/);
    await expect(chatBuddyContainer).toHaveClass(/left-/);
  });

  test('burger menu is positioned at top right', async ({ page }) => {
    const burgerMenuContainer = page.locator('div.fixed').filter({ has: page.getByRole('button', { name: 'Menu' }) });
    await expect(burgerMenuContainer).toBeVisible();
    await expect(burgerMenuContainer).toHaveClass(/top-/);
    await expect(burgerMenuContainer).toHaveClass(/right-/);
  });
});
