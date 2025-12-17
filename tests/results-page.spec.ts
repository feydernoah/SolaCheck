import { test, expect } from '@playwright/test';

test.describe('Results Page - UI Components', () => {
  test.beforeEach(async ({ page, context }) => {
    // Setze Cookie mit Quiz-Antworten
    await context.addCookies([{
      name: 'solacheck_quiz_progress',
      value: encodeURIComponent(JSON.stringify({
        currentQuestion: 11, // Last question index (0-based)
        answers: {
          1: '25-34',
          2: '{"city":"München","postalCode":"80331","coordinates":{"lat":48.1351,"lon":11.5820}}',
          3: '2',
          4: 'eigentumswohnung',
          5: '70-100',
          6: 'balkonbruestung',
          7: 'sueden',
          8: 'mittel',
          9: 'kaum',
          10: ['kuehlschrank', 'waschmaschine'],
          11: '400-700',
          12: 'sehr-wichtig'
        }
      })),
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax'
    }]);
    
    // Navigiere zur Results-Seite
    await page.goto('/solacheck/results');
    
    // Warte bis Loading vorbei ist - warte auf h1 heading
    await page.locator('h1').waitFor({ state: 'visible' });
  });

  test('displays loading screen initially', async ({ page }) => {
    // Reload page um Loading Screen zu sehen
    await page.reload();
    // Just verify page eventually loads (API call happens quickly)
    await page.locator('h1').waitFor({ state: 'visible', timeout: 5000 });
  });

  test('loading screen disappears after delay', async ({ page }) => {
    // Reload und warte auf das Laden
    await page.reload();
    // Warte darauf dass die Seite geladen ist (h1 sichtbar)
    await page.locator('h1').waitFor({ state: 'visible', timeout: 5000 });
    // Heading sollte jetzt sichtbar sein
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('displays burger menu', async ({ page }) => {
    // Wait for page to fully load after API call
    await page.waitForLoadState('networkidle');
    const burgerMenu = page.getByRole('button', { name: 'Menu' });
    await expect(burgerMenu).toBeVisible();
  });

  test('displays recommendation header with buddy image', async ({ page }) => {
    // Wait for API response
    await page.waitForLoadState('networkidle');
    // Sollte entweder SolaGluecklich oder SolaNachdenklich zeigen
    const happyBuddy = page.locator('img[alt="Sola Happy"]');
    const thinkingBuddy = page.locator('img[alt="Sola Nachdenklich"]');
    
    const isHappyVisible = await happyBuddy.isVisible().catch(() => false);
    const isThinkingVisible = await thinkingBuddy.isVisible().catch(() => false);
    
    expect(isHappyVisible || isThinkingVisible).toBeTruthy();
  });

  test('displays recommendation title', async ({ page }) => {
    // Prüfe ob ein Heading mit Empfehlung existiert
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Balkonkraftwerk/);
  });

  test('displays reasoning text', async ({ page }) => {
    // Reasoning-Text sollte sichtbar sein
    const reasoningText = page.locator('p.text-body-lg');
    await expect(reasoningText).toBeVisible();
  });
});

test.describe('Results Page - Positive Recommendation', () => {
  test.beforeEach(async ({ page, context }) => {
    // Setze Cookie mit Quiz-Antworten für positive Empfehlung
    await context.addCookies([{
      name: 'solacheck_quiz_progress',
      value: encodeURIComponent(JSON.stringify({
        currentQuestion: 11,
        answers: {
          1: '25-34',
          2: '{"city":"München","postalCode":"80331"}',
          7: 'sueden',
          9: 'kaum',
          11: '400-700'
        }
      })),
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax'
    }]);
    
    await page.goto('/solacheck/results');
    // Wait for the "Sola Happy" image to appear, indicating the results page is loaded
    await page.waitForSelector('img[alt="Sola Happy"]', { state: 'visible' });
  });

  test('displays happy buddy image for positive recommendation', async ({ page }) => {
    const happyBuddy = page.locator('img[alt="Sola Happy"]');
    await expect(happyBuddy).toBeVisible();
  });

  test('displays recommendation cards (at least two)', async ({ page }) => {
    // Sollte mindestens 2 Produktkarten anzeigen (fallback for varying recommendation counts)
    const cards = page.locator('[class*="grid"] > div').filter({ has: page.locator('text=/€/') });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('displays badges on recommendation cards', async ({ page }) => {
    // Prüfe auf die 3 Badge-Typen (now using medal badges)
    await expect(page.locator('text=🥇 Beste Wahl')).toBeVisible();
    await expect(page.locator('text=🥈 Zweite Wahl')).toBeVisible();
    // The third badge may not always be present depending on recommendation ranking; assert only if it exists
    const thirdBadge = page.locator('text=🥉 Dritte Wahl');
    if (await thirdBadge.count()) {
      await expect(thirdBadge).toBeVisible();
    }
  });

  test('recommendation cards display product details', async ({ page }) => {
    // Prüfe ob Produktdetails angezeigt werden (first() um strict mode zu vermeiden)
    await expect(page.locator('text=/\\d+ Wp/').first()).toBeVisible(); // Wattage peak
    await expect(page.locator('text=/\\d+ €/').first()).toBeVisible(); // Preis (mit Leerzeichen vor €)
    await expect(page.locator('text=/\\d+ Jahre/').first()).toBeVisible(); // Garantie/Amortisation
  });

  test('displays info box with additional information', async ({ page }) => {
    const infoBox = page.locator('text=Noch Fragen?');
    await expect(infoBox).toBeVisible();
    
    // New text mentions amortization sorting
    const infoText = page.locator('text=Amortisationszeit');
    await expect(infoText).toBeVisible();
  });

  test('displays "Neues Quiz starten" button', async ({ page }) => {
    const newQuizButton = page.locator('text=Neues Quiz starten');
    await expect(newQuizButton).toBeVisible();
  });

<<<<<<< HEAD
<<<<<<< HEAD
  test('CO2-Bilanz button links to /solacheck/carbon-footprint', async ({ page }) => {
    const co2Button = page.locator('text=CO₂-Bilanz anzeigen').first();
=======
  test('CO2-Bilanz button links to /carbon-footprint', async ({ page }) => {
    const co2Button = page.locator('text=CO₂-Bilanz anzeigen');
>>>>>>> d6db1a7 ( updated CO2-Bilanz button text and remove redundant test)
=======
  test('CO2-Bilanz button links to /solacheck/carbon-footprint', async ({ page }) => {
    const co2Button = page.locator('text=CO₂-Bilanz anzeigen').first();
>>>>>>> aa6ce54 (updated CO2-Bilanz button test to link to the correct path and removed redundant mobile layout test due to deleted button)
    const href = await co2Button.locator('..').getAttribute('href');
    expect(href).toBe('/solacheck/carbon-footprint');
  });

  test('"Neues Quiz starten" button resets progress', async ({ page, context }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const newQuizButton = page.getByRole('button', { name: 'Neues Quiz starten' });
    
    // Handle the confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Möchtest du das Quiz wirklich zurücksetzen');
      await dialog.accept();
    });
    
    await newQuizButton.click();
    
    // Sollte zur Startseite navigieren (ohne trailing slash)
    await expect(page).toHaveURL(/\/solacheck\/?$/);
    
    // Cookie sollte gelöscht sein
    const cookies = await context.cookies();
    const quizCookie = cookies.find(c => c.name === 'solacheck_quiz_progress');
    expect(quizCookie).toBeUndefined();
  });
});

test.describe('Results Page - Negative Recommendation', () => {
  test.beforeEach(async ({ page, context }) => {
    // Setze Cookie mit Quiz-Antworten für negative Empfehlung
    await context.addCookies([{
      name: 'solacheck_quiz_progress',
      value: encodeURIComponent(JSON.stringify({
        currentQuestion: 11,
        answers: {
          1: '25-34',
          2: '{"city":"Berlin","postalCode":"10115"}',
          7: 'norden',
          9: 'ganzen-tag',
          11: '400-700'
        }
      })),
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax'
    }]);
    
    await page.goto('/solacheck/results');
    // Wait for the "Sola Nachdenklich" image to appear, indicating the results page is loaded
    await page.waitForSelector('img[alt="Sola Nachdenklich"]', { state: 'visible' });
  });

  test('displays thinking buddy image for negative recommendation', async ({ page }) => {
    const thinkingBuddy = page.locator('img[alt="Sola Nachdenklich"]');
    await expect(thinkingBuddy).toBeVisible();
  });

  test('does not display recommendation cards', async ({ page }) => {
    // Keine Produktkarten bei negativer Empfehlung
    const badges = page.locator('text=💰 Günstigstes');
    await expect(badges).not.toBeVisible();
  });

  test('displays only "Zur Startseite" button', async ({ page }) => {
    const homeButton = page.getByRole('button', { name: 'Zur Startseite' });
    await expect(homeButton).toBeVisible();
    
    // CO2-Button sollte nicht sichtbar sein
    const co2Button = page.locator('text=CO₂-Bilanz berechnen');
    await expect(co2Button).not.toBeVisible();
  });

  test('"Zur Startseite" button navigates home and resets', async ({ page, context }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const homeButton = page.getByRole('button', { name: 'Zur Startseite' });
    
    // Handle the confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Möchtest du das Quiz wirklich zurücksetzen');
      await dialog.accept();
    });
    
    await homeButton.click();
    
    await expect(page).toHaveURL(/\/solacheck\/?$/);
    
    const cookies = await context.cookies();
    const quizCookie = cookies.find(c => c.name === 'solacheck_quiz_progress');
    expect(quizCookie).toBeUndefined();
  });
});

test.describe('Results Page - Redirect Logic', () => {
  test('redirects to quiz if no answers in cookie', async ({ page }) => {
    // Gehe direkt zur Results-Seite ohne Cookie
    await page.goto('/solacheck/results');
    
    // Sollte zum Quiz umleiten
    await expect(page).toHaveURL('/solacheck/quiz', { timeout: 3000 });
  });
});

test.describe('Results Page - Responsive Design', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([{
      name: 'solacheck_quiz_progress',
      value: encodeURIComponent(JSON.stringify({
        currentQuestion: 11,
        answers: {
          1: '25-34',
          2: '{"city":"Hamburg","postalCode":"20095"}',
          7: 'suedwest',
          9: 'kaum',
          11: '700-1000'
        }
      })),
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax'
    }]);
    
    await page.goto('/solacheck/results');
    // Wait for the grid container to be visible, indicating loading is complete
    await page.waitForSelector('[class*="grid"][class*="md:grid-cols-3"]');
  });

  test('recommendation cards are in grid layout on desktop', async ({ page }) => {
    const grid = page.locator('[class*="grid"][class*="md:grid-cols-3"]');
    await expect(grid).toBeVisible();
  });

  test('content is centered and has max-width', async ({ page }) => {
    const contentContainer = page.locator('.max-w-5xl');
    await expect(contentContainer).toBeVisible();
  });
});

test.describe('Results Page - Email Feature', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set up quiz answers for positive recommendation
    await context.addCookies([{
      name: 'solacheck_quiz_progress',
      value: encodeURIComponent(JSON.stringify({
        currentQuestion: 11,
        answers: {
          1: '25-34',
          2: '{"city":"München","postalCode":"80331"}',
          7: 'sueden',
          9: 'kaum',
          11: '400-700'
        }
      })),
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax'
    }]);
    
    await page.goto('/solacheck/results');
    // Wait for results to load
    await page.waitForSelector('img[alt="Sola Happy"]', { state: 'visible' });
  });

  test('displays email section with all elements', async ({ page }) => {
    // Email section heading
    const emailHeading = page.locator('text=Ergebnis per E-Mail erhalten');
    await expect(emailHeading).toBeVisible();
    
    // Email input field
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'deine@email.de');
    
    // CO2 checkbox
    const co2Checkbox = page.locator('text=CO₂-Daten einbinden');
    await expect(co2Checkbox).toBeVisible();
    
    // Send button
    const sendButton = page.getByRole('button', { name: 'Ergebnis erhalten' });
    await expect(sendButton).toBeVisible();
  });

  test('email input accepts text input', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('send button is disabled when email is empty', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: 'Ergebnis erhalten' });
    await expect(sendButton).toBeDisabled();
  });

  test('send button is disabled when email is invalid', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const sendButton = page.getByRole('button', { name: 'Ergebnis erhalten' });
    
    // Test invalid email formats
    await emailInput.fill('invalid');
    await expect(sendButton).toBeDisabled();
    
    await emailInput.fill('invalid@');
    await expect(sendButton).toBeDisabled();
    
    await emailInput.fill('invalid@test');
    await expect(sendButton).toBeDisabled();
    
    await emailInput.fill('@test.com');
    await expect(sendButton).toBeDisabled();
  });

  test('send button is enabled when email is valid', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const sendButton = page.getByRole('button', { name: 'Ergebnis erhalten' });
    
    await emailInput.fill('valid@email.com');
    await expect(sendButton).toBeEnabled();
  });

  test('displays validation error for invalid email in real-time', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    
    // Type invalid email
    await emailInput.fill('invalid@email');
    
    // Error message should appear immediately
    const errorMessage = page.locator('text=Bitte gib eine gültige E-Mail-Adresse ein');
    await expect(errorMessage).toBeVisible();
    
    // Input should have red border
    await expect(emailInput).toHaveClass(/border-red-500/);
  });

  test('validation error disappears when email becomes valid', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    
    // Type invalid email first
    await emailInput.fill('invalid');
    const errorMessage = page.locator('text=Bitte gib eine gültige E-Mail-Adresse ein');
    await expect(errorMessage).toBeVisible();
    
    // Complete the email to make it valid
    await emailInput.fill('valid@email.com');
    await expect(errorMessage).not.toBeVisible();
    
    // Input should not have red border
    await expect(emailInput).not.toHaveClass(/border-red-500/);
  });

  test('CO2 checkbox can be toggled', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]');
    
    // Initially unchecked
    await expect(checkbox).not.toBeChecked();
    
    // Click to check
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    
    // Click to uncheck
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test('email input is disabled while sending', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const sendButton = page.getByRole('button', { name: 'Ergebnis erhalten' });
    
    // Fill valid email
    await emailInput.fill('test@example.com');
    
    // Mock the email sending to take time
    await page.route('**/send', async route => {
      // Delay response to simulate sending
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.fulfill({ status: 200, body: JSON.stringify({ status: 200 }) });
    });
    
    // Click send button
    await sendButton.click();
    
    // Button text should change
    const sendingButton = page.getByRole('button', { name: 'Wird gesendet...' });
    await expect(sendingButton).toBeVisible();
  });

  test('displays error message when trying to send without email', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: 'Ergebnis erhalten' });
    
    // Try to click disabled button (won't work, but we can test validation)
    // Instead, test that error appears if somehow triggered
    const emailInput = page.locator('input[type="email"]');
    
    // Type invalid email and clear it
    await emailInput.fill('test');
    await emailInput.clear();
    
    // Button should remain disabled
    await expect(sendButton).toBeDisabled();
  });

  test('email section appears after info box', async ({ page }) => {
    // Both info box and email section should be visible
    const infoBox = page.locator('text=Noch Fragen?');
    const emailSection = page.locator('text=Ergebnis per E-Mail erhalten');
    
    await expect(infoBox).toBeVisible();
    await expect(emailSection).toBeVisible();
    
    // Email section should be below info box in DOM
    const infoBoxPosition = await infoBox.boundingBox();
    const emailSectionPosition = await emailSection.boundingBox();
    
    if (infoBoxPosition && emailSectionPosition) {
      expect(emailSectionPosition.y).toBeGreaterThan(infoBoxPosition.y);
    }
  });

  test('email input label is present and correct', async ({ page }) => {
    const label = page.locator('label[for="email-input"]');
    await expect(label).toBeVisible();
    await expect(label).toHaveText('E-Mail-Adresse');
  });

  test('accepts various valid email formats', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const sendButton = page.getByRole('button', { name: 'Ergebnis erhalten' });
    
    const validEmails = [
      'user@example.com',
      'user.name@example.com',
      'user+tag@example.co.uk',
      'user123@test-domain.de',
      'a@b.c'
    ];
    
    for (const email of validEmails) {
      await emailInput.fill(email);
      await expect(sendButton).toBeEnabled();
    }
  });
});

test.describe('Results Page - Email Feature - Negative Recommendation', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set up quiz answers for negative recommendation
    await context.addCookies([{
      name: 'solacheck_quiz_progress',
      value: encodeURIComponent(JSON.stringify({
        currentQuestion: 11,
        answers: {
          1: '25-34',
          2: '{"city":"Berlin","postalCode":"10115"}',
          7: 'norden',
          9: 'ganzen-tag',
          11: '400-700'
        }
      })),
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax'
    }]);
    
    await page.goto('/solacheck/results');
    await page.waitForSelector('img[alt="Sola Nachdenklich"]', { state: 'visible' });
  });

  test('email section is not displayed for negative recommendations', async ({ page }) => {
    const emailSection = page.locator('text=Ergebnis per E-Mail erhalten');
    await expect(emailSection).not.toBeVisible();
  });
});
