import { test, expect, type Page } from '@playwright/test';

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
  // Web-first assertion - auto-retries until question indicator is visible
  await expect(page.locator('text=/Frage \\d+ von \\d+/')).toBeVisible();
}

/**
 * Click an age button and wait for it to be selected
 * Uses Playwright's built-in auto-waiting - no manual timeouts needed
 */
async function clickAgeButton(page: Page) {
  const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
  await ageButton.click();
  // Web-first assertion: wait for "Weiter" button to become enabled
  // This proves the click was registered and state updated
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
}

/**
 * Click the "Weiter" (Next) button and wait for navigation to next question
 */
async function clickNextButton(page: Page) {
  const nextButton = page.getByRole('button', { name: 'Weiter' });
  await nextButton.click();
  // Wait for question number to change (question 2 visible)
  await expect(page.locator('text=/Frage 2 von \\d+/')).toBeVisible();
}

test.describe('Quiz Progress Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await clearQuizCookie(page);
  });

  test('saves progress to cookie when answering a question', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Answer question 1 (age selection)
    await clickAgeButton(page);

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
    await clickAgeButton(page);
    await clickNextButton(page);

    // Verify we're on question 2
    await expect(page.locator('text=/Frage 2 von \\d+/')).toBeVisible();

    // Reload the page
    await page.reload();
    await waitForQuizReady(page);

    // Should still be on question 2 after reload
    await expect(page.locator('text=/Frage 2 von \\d+/')).toBeVisible();
  });

  test('preserves answers after page reload', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Answer question 1 (age)
    await clickAgeButton(page);
    await clickNextButton(page);

    // Reload page
    await page.reload();
    await waitForQuizReady(page);

    // Should be on question 2 after reload
    await expect(page.locator('text=/Frage 2 von \\d+/')).toBeVisible();

    // Go back to first question
    const backButton = page.getByRole('button', { name: 'Zurück' });
    await backButton.click();

    // Verify we're on question 1
    await expect(page.locator('text=/Frage 1 von \\d+/')).toBeVisible();
    
    // Verify age buttons are still visible
    await expect(page.getByRole('button', { name: /Jahre/i }).first()).toBeVisible();
  });

  test('starts fresh when no cookie exists', async ({ page }) => {
    await clearQuizCookie(page);
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Should start at question 1
    await expect(page.locator('text=/Frage 1 von \\d+/')).toBeVisible();
  });
});
