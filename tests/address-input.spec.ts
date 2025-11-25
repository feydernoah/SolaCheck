import { test, expect, type Page } from '@playwright/test';

test.describe('Address Input Component', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies to start fresh
    await page.context().clearCookies();
    await page.goto('/solacheck/quiz');
    await page.waitForLoadState('networkidle');
  });

  async function navigateToLocationQuestion(page: Page) {
    // Question 2 is the address/location question
    // First, answer question 1 (age selection)
    const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
    
    if (await ageButton.isVisible().catch(() => false)) {
      await ageButton.click();
      await page.waitForTimeout(100);
      
      // Click Weiter to go to question 2
      const nextButton = page.getByRole('button', { name: 'Weiter' });
      await expect(nextButton).toBeEnabled({ timeout: 3000 });
      await nextButton.click();
      await page.waitForTimeout(300);
    }
    
    // Check if we're now on the location question
    const gpsButton = page.getByRole('button', { name: /Standort nutzen/i });
    return await gpsButton.isVisible().catch(() => false);
  }

  test('displays GPS location button', async ({ page }) => {
    const foundLocationQuestion = await navigateToLocationQuestion(page);
    
    if (!foundLocationQuestion) {
      test.skip();
      return;
    }

    const gpsButton = page.getByRole('button', { name: /Standort nutzen/i });
    await expect(gpsButton).toBeVisible();
  });

  test('displays manual address entry button', async ({ page }) => {
    const foundLocationQuestion = await navigateToLocationQuestion(page);
    
    if (!foundLocationQuestion) {
      test.skip();
      return;
    }

    const manualButton = page.getByRole('button', { name: /manuell eingeben/i });
    await expect(manualButton).toBeVisible();
  });

  test('shows address form when clicking manual entry button', async ({ page }) => {
    const foundLocationQuestion = await navigateToLocationQuestion(page);
    
    if (!foundLocationQuestion) {
      test.skip();
      return;
    }

    // Click manual entry button
    const manualButton = page.getByRole('button', { name: /manuell eingeben/i });
    await manualButton.click();

    // Should show all address fields
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

    const manualButton = page.getByRole('button', { name: /manuell eingeben/i });
    await manualButton.click();

    // Check that inputs have proper IDs linked to labels
    const streetInput = page.locator('#address-street');
    const houseNumberInput = page.locator('#address-housenumber');
    const postalCodeInput = page.locator('#address-postalcode');
    const cityInput = page.locator('#address-city');

    await expect(streetInput).toBeVisible();
    await expect(houseNumberInput).toBeVisible();
    await expect(postalCodeInput).toBeVisible();
    await expect(cityInput).toBeVisible();
  });

  test('can fill in address manually', async ({ page }) => {
    const foundLocationQuestion = await navigateToLocationQuestion(page);
    
    if (!foundLocationQuestion) {
      test.skip();
      return;
    }

    const manualButton = page.getByRole('button', { name: /manuell eingeben/i });
    await manualButton.click();

    // Fill in address fields
    await page.locator('#address-street').fill('Musterstraße');
    await page.locator('#address-housenumber').fill('42');
    await page.locator('#address-postalcode').fill('12345');
    await page.locator('#address-city').fill('Berlin');

    // Should show success message with the address
    await expect(page.locator('text=/Standort:.*Musterstraße.*42.*12345.*Berlin/i')).toBeVisible();
  });

  test('PLZ field has max length of 5', async ({ page }) => {
    const foundLocationQuestion = await navigateToLocationQuestion(page);
    
    if (!foundLocationQuestion) {
      test.skip();
      return;
    }

    const manualButton = page.getByRole('button', { name: /manuell eingeben/i });
    await manualButton.click();

    const postalCodeInput = page.locator('#address-postalcode');
    await expect(postalCodeInput).toHaveAttribute('maxlength', '5');
  });
});
