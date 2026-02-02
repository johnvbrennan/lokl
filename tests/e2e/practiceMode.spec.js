import { test, expect } from '@playwright/test';
import { GamePage } from './helpers/GamePage.js';

test.describe('Practice Mode Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should switch to practice mode', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Select practice mode
    await gamePage.selectMode('Practice');
    await gamePage.startGame();

    // Verify practice mode is active
    const mode = await gamePage.getModeBadge();
    expect(mode).toContain('Practice');
  });

  test('should allow unlimited practice games', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Start first practice game
    await gamePage.selectMode('Practice');
    await gamePage.startGame();

    // Get the target county
    const targetCounty = await page.evaluate(() => {
      return window.__LOKL_DEBUG__ ? window.__LOKL_DEBUG__.game().targetCounty : null;
    });

    if (targetCounty) {
      // Win the game
      await gamePage.submitGuess(targetCounty);
      await page.waitForTimeout(1000);

      // Verify modal appears
      await gamePage.waitForModal();

      // Start another practice game immediately
      await gamePage.playAgainBtn.click();
      await page.waitForTimeout(500);

      // Verify new game screen is shown
      await expect(gamePage.startOverlay).toBeVisible();

      // Start another game
      await gamePage.selectMode('Practice');
      await gamePage.startGame();

      // Verify new game started
      await expect(gamePage.statGuesses).toHaveText('0/6');
    }
  });

  test('should not persist practice games on reload', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Start practice mode
    await gamePage.selectMode('Practice');
    await gamePage.startGame();

    // Submit a guess
    await gamePage.submitGuess('Dublin');
    await page.waitForTimeout(1000);

    // Reload the page
    await page.reload();

    // Should show start screen (not restore practice game)
    await expect(gamePage.startOverlay).toBeVisible();
  });

  test('should track practice statistics separately', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Start practice game
    await gamePage.selectMode('Practice');
    await gamePage.startGame();

    const targetCounty = await page.evaluate(() => {
      return window.__LOKL_DEBUG__ ? window.__LOKL_DEBUG__.game().targetCounty : null;
    });

    if (targetCounty) {
      // Win the game
      await gamePage.submitGuess(targetCounty);
      await page.waitForTimeout(1000);

      // Check statistics in modal
      await gamePage.waitForModal();

      // Verify statistics modal is shown
      const modalStats = page.locator('#modal-stats-summary');
      await expect(modalStats).toBeVisible();
    }
  });
});
