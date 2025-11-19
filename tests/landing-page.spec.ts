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
    
    // Should see the quiz question
    await expect(page.locator('text=Question 1 of 5')).toBeVisible();
  });

  test('displays burger menu', async ({ page }) => {
    const burgerMenu = page.getByRole('button', { name: 'Menu' });
    await expect(burgerMenu).toBeVisible();
  });

  test('burger menu opens and shows navigation options', async ({ page }) => {
    const burgerMenu = page.getByRole('button', { name: 'Menu' });
    await burgerMenu.click();
    
    // Menu dropdown should be visible
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Quiz starten')).toBeVisible();
  });

  test('displays chat buddy image', async ({ page }) => {
    const chatBuddy = page.locator('img[alt="Sola Chat Buddy"]');
    await expect(chatBuddy).toBeVisible();
  });

  test('displays speech bubble with welcome message', async ({ page }) => {
    const speechBubble = page.locator('text=Hallo! Willkommen bei SolaCheck');
    await expect(speechBubble).toBeVisible();
  });

  test('speech bubble changes message after delay', async ({ page }) => {
    // Check initial message is visible
    const initialMessage = page.locator('text=Hallo! Willkommen bei SolaCheck');
    await expect(initialMessage).toBeVisible();
    
    // Wait 5 seconds for the message to change
    await page.waitForTimeout(5500);
    
    // Check that the initial message is no longer visible (message has changed)
    await expect(initialMessage).not.toBeVisible();
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
