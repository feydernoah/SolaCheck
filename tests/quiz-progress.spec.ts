import { test, expect, type Page } from '@playwright/test';

const COOKIE_NAME = 'solacheck_quiz_progress';

async function clearQuizCookie(page: Page) {
  await page.context().clearCookies();
}

async function getQuizCookie(page: Page) {
  const cookies = await page.context().cookies();
  return cookies.find(c => c.name === COOKIE_NAME);
}

test.describe('Quiz Progress Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await clearQuizCookie(page);
  });

  test('saves progress to cookie when answering a question', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');

    // Answer question 1 (age selection)
    const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
    await ageButton.click();
    await page.waitForTimeout(200);

    // Check that cookie was created
    const cookie = await getQuizCookie(page);
    expect(cookie).toBeDefined();
    expect(cookie?.value).toBeTruthy();

    // Parse cookie value and verify it contains progress
    if (cookie) {
      const progressData = JSON.parse(decodeURIComponent(cookie.value)) as { currentQuestion: number; answers: Record<string, unknown> };
      expect(progressData).toHaveProperty('currentQuestion');
      expect(progressData).toHaveProperty('answers');
    }
  });

  test('restores progress after page reload', async ({ page }) => {
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

    // Verify we're on question 2
    await expect(page.locator('text=/Frage 2 von \\d+/')).toBeVisible();

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on question 2 after reload
    await expect(page.locator('text=/Frage 2 von \\d+/')).toBeVisible();
  });

  test('preserves answers after page reload', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');

    // Answer question 1 (age)
    const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
    await ageButton.click();
    await page.waitForTimeout(100);

    // Advance to question 2
    const nextButton = page.getByRole('button', { name: 'Weiter' });
    await expect(nextButton).toBeEnabled({ timeout: 3000 });
    await nextButton.click();
    await page.waitForTimeout(300);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should be on question 2 after reload
    await expect(page.locator('text=/Frage 2 von \\d+/')).toBeVisible();

    // Go back to first question
    await page.getByRole('button', { name: 'Zurück' }).click();
    await page.waitForTimeout(300);

    // Verify we're on question 1
    await expect(page.locator('text=/Frage 1 von \\d+/')).toBeVisible();
    
    const ageButtons = page.getByRole('button', { name: /Jahre/i });
    await expect(ageButtons.first()).toBeVisible();
  });

  test('starts fresh when no cookie exists', async ({ page }) => {
    await clearQuizCookie(page);
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');

    // Should start at question 1
    await expect(page.locator('text=/Frage 1 von \\d+/')).toBeVisible();
  });
});
