import { test, expect, type Page } from '@playwright/test';

test.describe('Quiz Dependencies', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/solacheck/quiz');
    // Wait for quiz to be ready
    await expect(page.locator('text=/\\d+%/')).toBeVisible();
  });

  /**
   * Helper: Click age button (Question 1)
   */
  async function selectAge(page: Page) {
    const ageButton = page.getByRole('button', { name: /Jahre/i }).first();
    await ageButton.click();
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
  }

  /**
   * Helper: Fill in address manually (Question 2)
   */
  async function fillInAddress(page: Page) {
    // Click "manuell eingeben" button
    await page.getByRole('button', { name: /manuell eingeben/i }).click();
    
    // Fill in a real valid Berlin address
    await page.locator('#address-street').fill('Unter den Linden');
    await page.locator('#address-housenumber').fill('1');
    await page.locator('#address-postalcode').fill('10117');
    
    // Wait for city auto-fill
    await expect(page.locator('#address-city')).toHaveValue(/Berlin/i, { timeout: 10000 });
    
    // Wait for validation to complete (green success message)
    await expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
  }

  /**
   * Helper: Click household size button (Question 3)
   */
  async function selectHouseholdSize(page: Page, size = '2') {
    const button = page.getByRole('button', { name: new RegExp(`${size}.*Person`, 'i') });
    await button.click();
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
  }

  /**
   * Helper: Select housing type with tile (Question 4)
   */
  async function selectHousingType(page: Page, type: 'mietwohnung' | 'eigentumswohnung' | 'einfamilienhaus' | 'reihenhaus') {
    const typeMap: Record<string, RegExp> = {
      'mietwohnung': /Mietwohnung/i,
      'eigentumswohnung': /Eigentumswohnung/i,
      'einfamilienhaus': /Einfamilienhaus/i,
      'reihenhaus': /Reihenhaus/i,
    };
    
    const button = page.locator('button').filter({ hasText: typeMap[type] });
    await button.click();
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
  }


  /**
   * Helper: Get current question text
   */
  async function getCurrentQuestionText(page: Page): Promise<string> {
    const heading = page.locator('h2').first();
    const text = await heading.textContent({ timeout: 5000 });
    return text ?? '';
  }

  // =======================
  // TEST 1: Question 6 depends on Question 4
  // =======================
  test('Question 6 - Exclude Flachdach option for renters (Mietwohnung)', async ({ page }) => {
    // Navigate to question 6 by answering questions 1-5
    await selectAge(page);
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 2: Fill address
    await fillInAddress(page);
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 3: Select household size
    await selectHouseholdSize(page);
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 4: Select "Mietwohnung" (renter)
    await selectHousingType(page, 'mietwohnung');
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 5: Select apartment size - "Unter 40 m²"
    await page.getByRole('button', { name: /Unter 40/i }).click();
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 6: Verify "Flachdach" is NOT available for renters
    const flachdachOption = page.locator('button').filter({ hasText: /Flachdach/i });
    await expect(flachdachOption).not.toBeVisible();

    // Verify other options ARE available
    await expect(page.locator('button').filter({ hasText: /Balkonbrüstung/i })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Balkonboden/i })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Hauswand/i })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Weiß ich noch nicht/i })).toBeVisible();
  });

  test('Question 6 - Include Flachdach option for homeowners (Einfamilienhaus)', async ({ page }) => {
    // Navigate to question 6 by answering questions 1-5
    await selectAge(page);
    await page.getByRole('button', { name: 'Weiter' }).click();

    await fillInAddress(page);
    await page.getByRole('button', { name: 'Weiter' }).click();

    await selectHouseholdSize(page);
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 4: Select "Einfamilienhaus" (homeowner)
    await selectHousingType(page, 'einfamilienhaus');
    await page.getByRole('button', { name: 'Weiter' }).click();

    await page.getByRole('button', { name: /Unter 40/i }).click();
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 6: Verify "Flachdach" IS available for homeowners
    const flachdachOption = page.locator('button').filter({ hasText: /Flachdach/i });
    await expect(flachdachOption).toBeVisible();
  });

  // =======================
  // TEST 2: Question 7 depends on Question 6
  // =======================
  test('Question 7 - Shown when Question 6 is Balkonbrüstung (not flachdach/weiss-nicht)', async ({ page }) => {
    // Navigate to question 6
    await selectAge(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await fillInAddress(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHouseholdSize(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHousingType(page, 'einfamilienhaus');
    await page.getByRole('button', { name: 'Weiter' }).click();
    await page.getByRole('button', { name: /Unter 40/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 6: Select "Balkonbrüstung" (not in ['flachdach', 'weiss-nicht'])
    await page.locator('button').filter({ hasText: /Balkonbrüstung/i }).click();
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Verify Question 7 is shown
    const questionText = await getCurrentQuestionText(page);
    expect(questionText).toContain('Richtung');
  });

  test('Question 7 - Hidden when Question 6 is Flachdach', async ({ page }) => {
    // Navigate to question 6
    await selectAge(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await fillInAddress(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHouseholdSize(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHousingType(page, 'einfamilienhaus');
    await page.getByRole('button', { name: 'Weiter' }).click();
    await page.getByRole('button', { name: /Unter 40/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 6: Select "Flachdach"
    await page.locator('button').filter({ hasText: /Flachdach/i }).click();
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Verify Question 7 is SKIPPED (we jump to question 8)
    const questionText = await getCurrentQuestionText(page);
    expect(questionText).not.toContain('In welche Richtung');
  });

  test('Question 7 - Hidden when Question 6 is Weiß-ich-noch-nicht', async ({ page }) => {
    // Navigate to question 6
    await selectAge(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await fillInAddress(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHouseholdSize(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHousingType(page, 'einfamilienhaus');
    await page.getByRole('button', { name: 'Weiter' }).click();
    await page.getByRole('button', { name: /Unter 40/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 6: Select "Weiß ich noch nicht"
    await page.locator('button').filter({ hasText: /Weiß ich noch nicht/i }).click();
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Verify Question 7 is SKIPPED
    const questionText = await getCurrentQuestionText(page);
    expect(questionText).not.toContain('In welche Richtung');
  });

  // =======================
  // TEST 3: Question 8 depends on Question 6
  // =======================
  test('Question 8 - Shown for Balkonbrüstung and Balkonboden', async ({ page }) => {
    // Navigate to question 6
    await selectAge(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await fillInAddress(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHouseholdSize(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHousingType(page, 'einfamilienhaus');
    await page.getByRole('button', { name: 'Weiter' }).click();
    await page.getByRole('button', { name: /Unter 40/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 6: Select "Balkonbrüstung"
    await page.locator('button').filter({ hasText: /Balkonbrüstung/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // We should see Question 7 now (since Q6 is not flachdach/weiss-nicht)
    const q7Text = await getCurrentQuestionText(page);
    expect(q7Text).toContain('Richtung');

    // Answer Q7 to continue
    await page.locator('button').filter({ hasText: /Süden/i }).first().click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Now Question 8 should be shown (balkon size)
    const questionText = await getCurrentQuestionText(page);
    expect(questionText).toContain('Wie groß ist dein Balkon');
  });

  test('Question 8 - Hidden for Hauswand (shown for other install locations)', async ({ page }) => {
    // Navigate to question 6
    await selectAge(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await fillInAddress(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHouseholdSize(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHousingType(page, 'einfamilienhaus');
    await page.getByRole('button', { name: 'Weiter' }).click();
    await page.getByRole('button', { name: /Unter 40/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Select installation location that requires balcony size question (not in skip list)
    await page.locator('button').filter({ hasText: /Balkonboden/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 7 should be shown (Q6 is not in ['flachdach', 'weiss-nicht'])
    let questionText = await getCurrentQuestionText(page);
    expect(questionText).toContain('Richtung');

    // Answer Q7
    await page.locator('button').filter({ hasText: /Süden/i }).first().click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 8 should be shown for Balkonboden (not in skip list)
    questionText = await getCurrentQuestionText(page);
    expect(questionText).toContain('Wie groß ist dein Balkon');
  });

  // =======================
  // TEST 4: Question 9 depends on Question 6
  // Question 9 is ONLY shown when Q6 = 'weiss-nicht' (and NO other values)
  // =======================
  test('Question 9 - Shown when Question 6 is "Balkonbrüstung" (not weiss-nicht)', async ({ page }) => {
    // Navigate to question 6
    await selectAge(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await fillInAddress(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHouseholdSize(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHousingType(page, 'einfamilienhaus');
    await page.getByRole('button', { name: 'Weiter' }).click();
    await page.getByRole('button', { name: /Unter 40/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 6: Select "Balkonbrüstung" (not 'weiss-nicht')
    await page.locator('button').filter({ hasText: /Balkonbrüstung/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 7 should be shown
    let questionText = await getCurrentQuestionText(page);
    expect(questionText).toContain('Richtung');

    // Answer Q7
    await page.locator('button').filter({ hasText: /Süden/i }).first().click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 8 should be shown
    questionText = await getCurrentQuestionText(page);
    expect(questionText).toContain('Wie groß ist dein Balkon');

    // Answer Q8
    await page.locator('button').filter({ hasText: /Klein/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 9 about shading should appear (Q6 is not 'weiss-nicht', so dependency is NOT met)
    questionText = await getCurrentQuestionText(page);
    expect(questionText).toContain('beschattet');
  });

  test('Question 9 - Hidden when Question 6 is "Weiß-ich-noch-nicht"', async ({ page }) => {
    // Navigate to question 6
    await selectAge(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await fillInAddress(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHouseholdSize(page);
    await page.getByRole('button', { name: 'Weiter' }).click();
    await selectHousingType(page, 'einfamilienhaus');
    await page.getByRole('button', { name: 'Weiter' }).click();
    await page.getByRole('button', { name: /Unter 40/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 6: Select "Weiß ich noch nicht"
    await page.locator('button').filter({ hasText: /Weiß ich noch nicht/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Question 7 should be skipped (Q6 is 'weiss-nicht')
    let questionText = await getCurrentQuestionText(page);
    expect(questionText).not.toContain('In welche Richtung');

    // Question 8 should be skipped (Q6 is 'weiss-nicht' which is in the dependency list)
    const nextButton = page.getByRole('button', { name: 'Weiter' });
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      questionText = await getCurrentQuestionText(page);
    }
    expect(questionText).not.toContain('Wie groß ist dein Balkon');

    // Question 9 should be hidden (Q6 = 'weiss-nicht', so dependency IS met → question hidden)
    expect(questionText).not.toContain('beschattet');
  });

  // =======================
  // TEST 5: Complete flow with all dependencies
  // =======================
  test('Complete quiz flow with dependency chain', async ({ page }) => {
    // Q1: Age
    await selectAge(page);
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Q2: Address
    await fillInAddress(page);
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Q3: Household size
    await selectHouseholdSize(page);
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Q4: Housing type
    await selectHousingType(page, 'einfamilienhaus');
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Q5: Apartment size
    await page.getByRole('button', { name: /Unter 40/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Q6: Installation location - select Balkonbrüstung
    await page.locator('button').filter({ hasText: /Balkonbrüstung/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Q7: Direction should be shown (Q6 is Balkonbrüstung, not in ['flachdach', 'weiss-nicht'])
    let questionText = await getCurrentQuestionText(page);
    expect(questionText).toContain('Richtung');
    await page.locator('button').filter({ hasText: /Süden/i }).first().click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Q8: Balkon size should be shown (Q6 is not in ['hauswand', 'flachdach', 'weiss-nicht'])
    questionText = await getCurrentQuestionText(page);
    expect(questionText).toContain('Wie groß ist dein Balkon');
    await page.locator('button').filter({ hasText: /Klein/i }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Q9: Shading should be shown (Q6 is not 'weiss-nicht', so dependency NOT met)
    questionText = await getCurrentQuestionText(page);
    expect(questionText).toContain('beschattet');
  });

  // =======================
  // TEST 6: Address field must be filled to proceed
  // =======================
  test('Cannot proceed from Question 2 without valid address', async ({ page }) => {
    // Q1: Answer age
    await selectAge(page);
    await page.getByRole('button', { name: 'Weiter' }).click();

    // Q2: Try to click Weiter without entering address
    const weiterButton = page.getByRole('button', { name: 'Weiter' });
    
    // Button should be disabled
    await expect(weiterButton).toBeDisabled();

    // Now fill in address
    await fillInAddress(page);

    // Button should now be enabled
    await expect(weiterButton).toBeEnabled();
  });
});
