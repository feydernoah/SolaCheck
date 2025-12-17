import { test, expect } from "@playwright/test";

test.describe("Info Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the info page before each test
    await page.goto("/solacheck/info-page");
    await page.waitForLoadState("networkidle");
  });

  test("renders the page heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Wissensbereich" })
    ).toBeVisible();
  });

  test("shows the intro text", async ({ page }) => {
    await expect(
      page.locator("text=Tippe auf eine Kategorie, um die Inhalte auszuklappen.")
    ).toBeVisible();
  });

  test("displays burger menu", async ({ page }) => {
    // Burger menu should be visible (accessible name contains 'menu')
    const burgerMenu = page.getByRole("button", { name: /menu/i });
    await expect(burgerMenu).toBeVisible();
  });

  test("shows small logo placeholder in the top left corner", async ({ page }) => {
    await expect(page.locator("text=Logo").first()).toBeVisible();
  });

  test("shows CTA links: 'Zum Quiz' and 'Zurück'", async ({ page }) => {
    const quizLink = page.getByRole("link", { name: /zum quiz/i });
    const backLink = page.getByRole("link", { name: /zurück/i });

    await expect(quizLink).toBeVisible();
    await expect(backLink).toBeVisible();
  });

  test("'Zum Quiz' navigates to /quiz", async ({ page }) => {
    await page.getByRole("link", { name: /zum quiz/i }).click();
    await expect(page).toHaveURL("/solacheck/quiz");
  });

  test("'Zurück' navigates to the home page", async ({ page }) => {
    await page.getByRole("link", { name: /zurück/i }).click();
    await expect(page).toHaveURL("/solacheck");
  });

  test("renders at least one accordion item", async ({ page }) => {
    // Accordion buttons use aria-expanded and aria-controls
    const accordionButtons = page.locator(
      "button[aria-expanded][aria-controls]"
    );
    await expect(accordionButtons.first()).toBeVisible();
  });

  test("first accordion item is open by default", async ({ page }) => {
    const firstButton = page
      .locator("button[aria-expanded][aria-controls]")
      .first();

    await expect(firstButton).toHaveAttribute("aria-expanded", "true");
  });

  test("accordion toggles open and close on click", async ({ page }) => {
    const firstButton = page
      .locator("button[aria-expanded][aria-controls]")
      .first();

    // Initially open
    await expect(firstButton).toHaveAttribute("aria-expanded", "true");

    // Close accordion
    await firstButton.click();
    await expect(firstButton).toHaveAttribute("aria-expanded", "false");

    // Open accordion again
    await firstButton.click();
    await expect(firstButton).toHaveAttribute("aria-expanded", "true");
  });

  test("only one accordion item can be open at a time", async ({ page }) => {
    const buttons = page.locator("button[aria-expanded][aria-controls]");
    const first = buttons.nth(0);
    const second = buttons.nth(1);

    // First accordion is open initially
    await expect(first).toHaveAttribute("aria-expanded", "true");

    // Open second accordion
    await second.click();

    // Second is open, first is closed
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");
  });

  test("accordion content becomes visible when opened", async ({ page }) => {
    // Open a known accordion section by its title
    const target = page.getByRole("button", {
      name: /Komponenten: Was gehört dazu\?/i,
    });

    await target.click();

    // Content inside the accordion should be visible
    await expect(page.locator("text=Typische Teile")).toBeVisible();
  });

  test("renders an image subsection when its section is open", async ({ page }) => {
    const target = page.getByRole("button", {
      name: /Komponenten: Was gehört dazu\?/i,
    });

    await target.click();

    // Image inside the section should be visible
    const image = page.locator(
      'img[alt="Vereinfachte Darstellung der Komponenten eines Balkonkraftwerks"]'
    );
    await expect(image).toBeVisible();
  });

  test("renders the disclaimer footer", async ({ page }) => {
    await expect(
        page.getByText("Diese Seite ersetzt keine Rechtsberatung", { exact: false })
    ).toBeVisible();
  });

  test("info buddy image is visible", async ({ page }) => {
    const buddy = page.locator('img[alt="Sola liest und erklärt"]');
    await expect(buddy).toBeVisible();
  });

  test("info buddy speech bubble shows one of the messages", async ({ page }) => {
    // The bubble should contain one of the rotating helper messages
    await expect(
      page.getByText(
        /Spannend, oder\?|Wenn man es einmal versteht|Gut, dass du dir Zeit nimmst/
      )
    ).toBeVisible();
  });

  test("clicking the info buddy cycles the message", async ({ page }) => {
    const buddyButton = page.getByRole("button", {
      name: "Info-Hilfe anzeigen",
    });

    // Read the current bubble text
    const bubble = page.locator("p.text-gray-800").first();
    const before = await bubble.textContent();

    // Click the buddy to cycle the message
    await buddyButton.click();

    const after = await bubble.textContent();
    expect(after).not.toBe(before);
  });

  test("page has a white background container", async ({ page }) => {
    const mainContainer = page.locator("div.min-h-screen.bg-white").first();
    await expect(mainContainer).toBeVisible();
  });
});
