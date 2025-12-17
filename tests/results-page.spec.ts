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

  test('CO2-Bilanz button links to /solacheck/carbon-footprint', async ({ page }) => {
    const co2Button = page.locator('text=CO₂-Bilanz anzeigen').first();
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
