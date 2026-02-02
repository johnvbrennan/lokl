import { test, expect } from '@playwright/test';
import { GamePage } from './helpers/GamePage.js';

test.describe('Autocomplete Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show autocomplete dropdown when typing', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.startGame();

    // Type partial county name
    await gamePage.typeGuess('Cor');

    // Wait for autocomplete
    await page.waitForTimeout(300);

    // Verify autocomplete list appears
    const autocompleteList = page.locator('#autocomplete-list-new');
    await expect(autocompleteList).toBeVisible();

    // Verify Cork appears in suggestions
    const items = page.locator('.autocomplete-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    // Check if Cork is in the list
    const firstItem = await items.first().textContent();
    expect(firstItem).toContain('Cork');
  });

  test('should filter autocomplete results', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.startGame();

    // Type more specific partial name
    await gamePage.typeGuess('Dubl');

    await page.waitForTimeout(300);

    // Should show only Dublin
    const items = page.locator('.autocomplete-item');
    const count = await items.count();

    // Should have few matches (Dublin and maybe others)
    expect(count).toBeLessThanOrEqual(3);
  });

  test('should allow clicking autocomplete suggestion', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.startGame();

    // Type partial name
    await gamePage.typeGuess('Gal');

    await page.waitForTimeout(300);

    // Verify autocomplete appears first
    const autocompleteList = page.locator('#autocomplete-list-new');
    await expect(autocompleteList).toBeVisible();

    // Verify items are shown
    const items = page.locator('.autocomplete-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    // Click on autocomplete item using force to bypass overlays
    const firstItem = items.first();
    const itemText = await firstItem.textContent();

    // Use force click and then verify the click registered
    await firstItem.click({ force: true, timeout: 5000 });

    await page.waitForTimeout(500);

    // Verify autocomplete closed (which means click was processed)
    await expect(autocompleteList).not.toBeVisible();
  });

  test('should navigate autocomplete with keyboard', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.startGame();

    // Type partial name
    await gamePage.typeGuess('Lim');

    await page.waitForTimeout(300);

    // Press arrow down to select first item
    await page.keyboard.press('ArrowDown');

    // Verify first item is highlighted
    const selectedItem = page.locator('.autocomplete-item.selected');
    await expect(selectedItem).toBeVisible();

    // Press Enter to select
    await page.keyboard.press('Enter');

    // Verify input was filled and guess was submitted
    await page.waitForTimeout(1000);

    // Check that guess was processed
    const guessCount = await gamePage.getGuessCount();
    expect(guessCount).toBe(1);
  });

  test('should close autocomplete on Escape', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.startGame();

    // Type partial name
    await gamePage.typeGuess('Ker');

    await page.waitForTimeout(300);

    // Verify autocomplete is visible
    const autocompleteList = page.locator('#autocomplete-list-new');
    await expect(autocompleteList).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify autocomplete closed
    await expect(autocompleteList).not.toBeVisible();
  });

  test('should enable submit button when valid county typed', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.startGame();

    // Type full valid county name
    await gamePage.typeGuess('Cork');

    await page.waitForTimeout(300);

    // Verify submit button is enabled/ready
    const submitBtn = gamePage.submitBtn;
    const isDisabled = await submitBtn.isDisabled();
    expect(isDisabled).toBe(false);
  });
});
