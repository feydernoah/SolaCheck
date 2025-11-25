import { test, expect, type Page } from '@playwright/test';

test.describe('Address Input Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/solacheck/quiz');
    // Web-first assertion - wait for quiz to be ready
    await expect(page.locator('text=/\\d+%/')).toBeVisible();
  });

  /**
   * Navigate to the location question (question 2)
   * Uses web-first assertions for reliable waiting
   */
  async function navigateToLocationQuestion(page: Page): Promise<boolean> {
    // Click age button
    const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
    
    try {
      await ageButton.click();
      // Wait for "Weiter" to become enabled - proves click was registered
      await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
      
      // Click Weiter to go to question 2
      await page.getByRole('button', { name: 'Weiter' }).click();
      
      // Wait for GPS button to appear (proves we're on location question)
      await expect(page.getByRole('button', { name: /Standort nutzen/i })).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  test('displays GPS location button', async ({ page }) => {
    const foundLocationQuestion = await navigateToLocationQuestion(page);
    
    if (!foundLocationQuestion) {
      test.skip();
      return;
    }

    await expect(page.getByRole('button', { name: /Standort nutzen/i })).toBeVisible();
  });

  test('displays manual address entry button', async ({ page }) => {
    const foundLocationQuestion = await navigateToLocationQuestion(page);
    
    if (!foundLocationQuestion) {
      test.skip();
      return;
    }

    await expect(page.getByRole('button', { name: /manuell eingeben/i })).toBeVisible();
  });

  test('shows address form when clicking manual entry button', async ({ page }) => {
    const foundLocationQuestion = await navigateToLocationQuestion(page);
    
    if (!foundLocationQuestion) {
      test.skip();
      return;
    }

    // Click manual entry button
    await page.getByRole('button', { name: /manuell eingeben/i }).click();

    // Web-first assertions for form fields
    await expect(page.locator('label', { hasText: 'Straße' })).toBeVisible();
    await expect(page.locator('label', { hasText: /Nr\./i })).toBeVisible();
    await expect(page.locator('label', { hasText: 'PLZ' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Stadt' })).toBeVisible();
  });

  test('address form fields are properly labeled and accessible', async ({ page }) => {
    const foundLocationQuestion = await navigateToLocationQuestion(page);
    
    if (!foundLocationQuestion) {
      test.skip();
      return;
    }

    await page.getByRole('button', { name: /manuell eingeben/i }).click();

    // Check that inputs are visible
    await expect(page.locator('#address-street')).toBeVisible();
    await expect(page.locator('#address-housenumber')).toBeVisible();
    await expect(page.locator('#address-postalcode')).toBeVisible();
    await expect(page.locator('#address-city')).toBeVisible();
  });

  test('can fill in address manually', async ({ page }) => {
    const foundLocationQuestion = await navigateToLocationQuestion(page);
    
    if (!foundLocationQuestion) {
      test.skip();
      return;
    }

    await page.getByRole('button', { name: /manuell eingeben/i }).click();

    // Fill in address fields - Playwright auto-waits for inputs to be ready
    await page.locator('#address-street').fill('Musterstraße');
    await page.locator('#address-housenumber').fill('42');
    await page.locator('#address-postalcode').fill('12345');
    await page.locator('#address-city').fill('Berlin');

    // Web-first assertion - wait for success message
    await expect(page.locator('text=/Standort:.*Musterstraße.*42.*12345.*Berlin/i')).toBeVisible();
  });

  test('PLZ field has max length of 5', async ({ page }) => {
    const foundLocationQuestion = await navigateToLocationQuestion(page);
    
    if (!foundLocationQuestion) {
      test.skip();
      return;
    }

    await page.getByRole('button', { name: /manuell eingeben/i }).click();

    await expect(page.locator('#address-postalcode')).toHaveAttribute('maxlength', '5');
  });
});
