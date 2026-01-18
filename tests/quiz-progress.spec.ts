import { test, expect, type Page } from '@playwright/test';
import { setupPhotonMock } from './utils/photon-mock';

const COOKIE_NAME = 'solacheck_quiz_progress';

async function clearQuizCookie(page: Page) {
  await page.context().clearCookies();
}

async function getQuizCookie(page: Page) {
  const cookies = await page.context().cookies();
  return cookies.find(c => c.name === COOKIE_NAME);
}

/**
 * Wait for quiz to be ready - uses web-first assertions with auto-retry
 */
async function waitForQuizReady(page: Page) {
  // Web-first assertion - auto-retries until progress percentage is visible
  await expect(page.locator('text=/\\d+%/')).toBeVisible();
  // Wait for SolaWalkingAnimation to complete (2500ms + buffer)
  await page.waitForTimeout(3000);
}

/**
 * Enter address and wait for it to be valid
 * Uses Playwright's built-in auto-waiting - no manual timeouts needed
 */
async function enterAddress(page: Page) {
  const searchInput = page.getByPlaceholder(/Stadt, Adresse oder PLZ/i);
  await searchInput.fill('Berlin');
  // Wait for autocomplete suggestions and click first one
  const suggestion = page.locator('button').filter({ hasText: /Berlin/i }).first();
  await expect(suggestion).toBeVisible({ timeout: 5000 });
  // Wait for element to be stable before clicking
  await page.waitForTimeout(500);
  await suggestion.click({ force: true });
  // Web-first assertion: wait for "Weiter" button to become enabled
  // This proves the address was accepted and state updated
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled({ timeout: 10000 });
}

/**
 * Click the "Weiter" (Next) button and wait for navigation to next question
 */
async function clickNextButton(page: Page) {
  const nextButton = page.getByRole('button', { name: 'Weiter' });
  await nextButton.click();
  // Wait for question to change by checking the heading contains different text
  await expect(page.locator('h2').first()).not.toContainText(/Wo wohnst du/i);
}

test.describe('Quiz Progress Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await setupPhotonMock(page, { useFullMocks: false });
    await clearQuizCookie(page);
  });

  test('saves progress to cookie when answering a question', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Answer question 1 (location)
    await enterAddress(page);

    // Use expect.poll for non-locator assertions that need retry
    await expect.poll(async () => {
      const cookie = await getQuizCookie(page);
      return cookie !== undefined;
    }, {
      message: 'Cookie should be created after answering question',
      timeout: 10000,
    }).toBe(true);

    // Verify cookie content
    const cookie = await getQuizCookie(page);
    expect(cookie?.value).toBeTruthy();
    
    if (cookie) {
      const progressData = JSON.parse(decodeURIComponent(cookie.value)) as { 
        currentQuestion: number; 
        answers: Record<string, unknown> 
      };
      expect(progressData).toHaveProperty('currentQuestion');
      expect(progressData).toHaveProperty('answers');
    }
  });

  test('restores progress after page reload', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Answer question 1 and advance to question 2
    await enterAddress(page);
    await clickNextButton(page);

    // Verify we're on question 2 by checking the heading
    await expect(page.locator('h2').first()).toContainText(/Wie viele Personen/i);

    // Reload the page
    await page.reload();
    await waitForQuizReady(page);

    // Should still be on question 2 after reload
    await expect(page.locator('h2').first()).toContainText(/Wie viele Personen/i);
  });

  test('preserves answers after page reload', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Answer question 1 (location)
    await enterAddress(page);
    await clickNextButton(page);

    // Reload page
    await page.reload();
    await waitForQuizReady(page);

    // Should be on question 2 after reload
    await expect(page.locator('h2').first()).toContainText(/Wie viele Personen/i);

    // Go back to first question
    const backButton = page.getByRole('button', { name: 'Zurück' });
    await backButton.click();

    // Verify we're on question 1
    await expect(page.locator('h2').first()).toContainText(/Wo wohnst du/i);
    
    // Verify address is still selected (green card should be visible)
    await expect(page.locator('text=/Standort ausgewählt/i')).toBeVisible();
  });

  test('starts fresh when no cookie exists', async ({ page }) => {
    await clearQuizCookie(page);
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Should start at question 1
    await expect(page.locator('h2').first()).toContainText(/Wo wohnst du/i);
  });
});
