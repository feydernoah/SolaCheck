import { test, expect, type Page } from '@playwright/test';
import { setupPhotonMock } from './utils/photon-mock';

/**
 * Wait for quiz to be ready - uses web-first assertions with auto-retry
 */
async function waitForQuizReady(page: Page) {
  await expect(page.locator('text=/\\d+%/')).toBeVisible();
}

/**
 * Click an age button and wait for "Weiter" to become enabled
 */
async function fillAddress(page: Page) {
  const searchInput = page.getByPlaceholder(/Stadt, Adresse oder PLZ/i);
  await searchInput.fill('Berlin');
  const suggestion = page.locator('button').filter({ hasText: /Berlin/i }).first();
  await expect(suggestion).toBeVisible({ timeout: 3000 });
  await suggestion.click();
  await expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
}

/**
 * Click "Weiter" and wait for next question to appear
 */
async function clickNextButton(page: Page) {
  const nextButton = page.getByRole('button', { name: 'Weiter' });
  await nextButton.click();
  await expect(page.getByRole('button', { name: 'Zurück' })).toBeEnabled();
}

/**
 * Open the info modal by clicking the info button
 */
async function openInfoModal(page: Page) {
  const infoButton = page.getByRole('button', { name: 'Mehr Informationen' });
  await infoButton.click();
  // Wait for modal to be visible
  await expect(page.locator('text=Verstanden')).toBeVisible();
}

/**
 * Close the info modal by clicking the "Verstanden" button
 */
async function closeInfoModalWithButton(page: Page) {
  const closeButton = page.getByRole('button', { name: 'Verstanden' });
  await closeButton.click();
  // Wait for modal to disappear
  await expect(page.locator('text=Verstanden')).not.toBeVisible();
}

test.describe('Info Button Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupPhotonMock(page);
  });

  test('info button is visible on quiz page', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    const infoButton = page.getByRole('button', { name: 'Mehr Informationen' });
    await expect(infoButton).toBeVisible();
  });

  test('info button is positioned next to burger menu', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    const infoButton = page.getByRole('button', { name: 'Mehr Informationen' });
    const menuButton = page.getByRole('button', { name: 'Menu' });

    // Both buttons should be visible
    await expect(infoButton).toBeVisible();
    await expect(menuButton).toBeVisible();

    // Get their bounding boxes to verify positioning
    const infoBox = await infoButton.boundingBox();
    const menuBox = await menuButton.boundingBox();

    expect(infoBox).not.toBeNull();
    expect(menuBox).not.toBeNull();

    if (infoBox && menuBox) {
      // Info button should be to the left of menu button (smaller x position)
      expect(infoBox.x).toBeLessThan(menuBox.x);
      // Both buttons should be roughly on the same vertical line (top of page)
      expect(Math.abs(infoBox.y - menuBox.y)).toBeLessThan(20);
    }
  });

  test('info button is round', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    const infoButton = page.getByRole('button', { name: 'Mehr Informationen' });
    
    // Check that the button has rounded-full class (makes it circular)
    await expect(infoButton).toHaveClass(/rounded-full/);
  });

  test('clicking info button opens modal', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    await openInfoModal(page);

    // Modal should contain a title - use the modal-specific heading
    const modalTitle = page.getByRole('heading', { name: 'Warum ist dein Standort wichtig?' });
    await expect(modalTitle).toBeVisible();
  });

  test('modal displays correct info for question 1 (location)', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Verify we're on question 1
    await expect(page.locator('h2').first()).toContainText(/Wo wohnst du/i);

    await openInfoModal(page);

    // Check for question 1 specific content - use modal heading
    await expect(page.getByRole('heading', { name: 'Warum ist dein Standort wichtig?' })).toBeVisible();
  });

  test('modal displays correct info for question 2 (household)', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Answer question 1 and go to question 2
    await fillAddress(page);
    await clickNextButton(page);

    // Verify we're on question 2
    await expect(page.locator('h2').first()).toContainText(/Wie viele Personen/i);

    await openInfoModal(page);

    // Check for question 2 specific content - use modal heading
    await expect(page.getByRole('heading', { name: 'Warum die Anzahl Personen wichtig ist' })).toBeVisible();
  });

  test('modal can be closed with "Verstanden" button', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    await openInfoModal(page);

    // Modal should be visible
    await expect(page.locator('text=Verstanden')).toBeVisible();

    await closeInfoModalWithButton(page);

    // Modal should be closed
    await expect(page.locator('text=Verstanden')).not.toBeVisible();
  });

  test('modal can be closed with X button', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    await openInfoModal(page);

    // Find and click the close X button
    const closeXButton = page.getByRole('button', { name: 'Schließen' });
    await closeXButton.click();

    // Modal should be closed
    await expect(page.locator('text=Verstanden')).not.toBeVisible();
  });

  test('modal can be closed by clicking backdrop', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    await openInfoModal(page);

    // Click on the backdrop (the semi-transparent overlay)
    const backdrop = page.locator('div.bg-black\\/50');
    await backdrop.click({ position: { x: 10, y: 10 } });

    // Modal should be closed
    await expect(page.locator('text=Verstanden')).not.toBeVisible();
  });

  test('modal can be closed with Escape key', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    await openInfoModal(page);

    // Press Escape key
    await page.keyboard.press('Escape');

    // Modal should be closed
    await expect(page.locator('text=Verstanden')).not.toBeVisible();
  });

  test('info content changes when navigating to different questions', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Open info on question 1
    await openInfoModal(page);
    const question1Title = await page.locator('h2').nth(0).textContent();
    await closeInfoModalWithButton(page);

    // Navigate to question 2
    await fillAddress(page);
    await clickNextButton(page);

    // Open info on question 2
    await openInfoModal(page);
    const question2Title = await page.locator('h2').nth(0).textContent();

    // Titles should be different
    expect(question1Title).not.toBe(question2Title);
  });

  test('quiz progress is not affected by opening/closing info modal', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Answer question 1
    await fillAddress(page);

    // Verify "Weiter" is enabled
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();

    // Open and close info modal
    await openInfoModal(page);
    await closeInfoModalWithButton(page);

    // "Weiter" should still be enabled (answer preserved)
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
  });

  test('body scroll is prevented when modal is open', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    await openInfoModal(page);

    // Check that body has overflow hidden
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('hidden');

    await closeInfoModalWithButton(page);

    // Check that body overflow is restored
    const bodyOverflowAfter = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflowAfter).toBe('unset');
  });

  test('info modal has proper z-index (appears above other content)', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    await openInfoModal(page);

    // The modal container should have z-50 class
    const modalContainer = page.locator('div.fixed.inset-0.z-50');
    await expect(modalContainer).toBeVisible();
  });
});

test.describe('Info Button - Question Specific Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupPhotonMock(page);
  });

  test('question 1 info modal shows Standort content', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Start quiz and verify info button works
    await openInfoModal(page);
    
    // Check for the modal heading
    await expect(page.getByRole('heading', { name: 'Warum ist dein Standort wichtig?' })).toBeVisible();
    
    // Check for specific content about solar radiation
    await expect(page.getByText(/Sonneneinstrahlung/i)).toBeVisible();
  });

  test('question 2 info modal shows Haushalt content', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    // Navigate to question 2
    await fillAddress(page);
    await clickNextButton(page);

    // Verify we're on question 2
    await expect(page.locator('h2').first()).toContainText(/Wie viele Personen/i);

    // Open info modal and verify content
    await openInfoModal(page);
    await expect(page.getByRole('heading', { name: 'Warum die Anzahl Personen wichtig ist' })).toBeVisible();
    await expect(page.getByText(/Verbrauch/i)).toBeVisible();
  });
});

test.describe('Info Button - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupPhotonMock(page);
  });

  test('info button has proper aria-label', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    const infoButton = page.getByRole('button', { name: 'Mehr Informationen' });
    await expect(infoButton).toHaveAttribute('aria-label', 'Mehr Informationen');
  });

  test('info button has title attribute for tooltip', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    const infoButton = page.getByRole('button', { name: 'Mehr Informationen' });
    await expect(infoButton).toHaveAttribute('title', 'Mehr Informationen zu dieser Frage');
  });

  test('close button in modal has aria-label', async ({ page }) => {
    await page.goto('/solacheck/quiz');
    await waitForQuizReady(page);

    await openInfoModal(page);

    const closeButton = page.getByRole('button', { name: 'Schließen' });
    await expect(closeButton).toHaveAttribute('aria-label', 'Schließen');
  });
});
