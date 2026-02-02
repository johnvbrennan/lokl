import { test, expect } from '@playwright/test';
import { GamePage } from './helpers/GamePage.js';

test.describe('Daily Challenge Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should start a new daily game', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Verify daily mode is selected by default
    const dailyCard = gamePage.modeCards.filter({ hasText: 'Daily' });
    await expect(dailyCard).toHaveClass(/selected/);

    // Start the game
    await gamePage.startGame();

    // Verify game state
    await expect(gamePage.statGuesses).toHaveText('0/6');
    const mode = await gamePage.getModeBadge();
    expect(mode).toContain('Daily');
  });

  test('should process guesses and show proximity colors', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.startGame();

    // Submit a guess
    await gamePage.submitGuess('Dublin');

    // Wait for guess to be processed
    await page.waitForTimeout(1000);

    // Verify guess count increased
    const guessCount = await gamePage.getGuessCount();
    expect(guessCount).toBe(1);

    // Verify guess appears in history
    const guessItems = page.locator('.guess-item');
    await expect(guessItems).toHaveCount(1);

    // Verify the guess has a color indicator
    const guessColor = page.locator('.guess-color').first();
    await expect(guessColor).toBeAttached();

    // Verify it has a background color set
    const bgColor = await guessColor.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
  });

  test('should track guess history', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.startGame();

    // Submit multiple guesses
    const guesses = ['Dublin', 'Galway', 'Limerick'];
    for (const county of guesses) {
      await gamePage.submitGuess(county);
      await page.waitForTimeout(500);
    }

    // Verify all guesses are in history
    const guessItems = page.locator('.guess-item');
    await expect(guessItems).toHaveCount(3);

    // Verify guess count
    const guessCount = await gamePage.getGuessCount();
    expect(guessCount).toBe(3);
  });

  test('should persist game state on reload', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.startGame();

    // Submit a guess
    await gamePage.submitGuess('Dublin');
    await page.waitForTimeout(1000);

    // Reload the page
    await page.reload();

    // Game should auto-restore and skip start screen
    await page.waitForTimeout(1000);

    // Verify guess is still there
    const guessItems = page.locator('.guess-item');
    await expect(guessItems).toHaveCount(1);

    // Verify guess count
    const guessCount = await gamePage.getGuessCount();
    expect(guessCount).toBe(1);
  });

  test('should show win modal on correct guess', async ({ page, context }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await gamePage.startGame();

    // Get the target county from the game state
    const targetCounty = await page.evaluate(() => {
      return window.__LOKL_DEBUG__ ? window.__LOKL_DEBUG__.game().targetCounty : null;
    });

    if (targetCounty) {
      // Submit the correct answer
      await gamePage.submitGuess(targetCounty);
      await page.waitForTimeout(1000);

      // Verify win modal appears
      await gamePage.waitForModal();
      await expect(gamePage.modalTitle).toContainText('Well Done');

      // Verify statistics are shown
      await expect(gamePage.playAgainBtn).toBeVisible();
      await expect(gamePage.shareBtn).toBeVisible();
    }
  });
});
