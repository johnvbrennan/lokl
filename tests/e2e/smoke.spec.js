import { test, expect } from '@playwright/test';
import { GamePage } from './helpers/GamePage.js';

test.describe('Smoke Tests', () => {
  test('should load the game successfully', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Verify start overlay is visible
    await expect(gamePage.startOverlay).toBeVisible();

    // Verify mode cards are present
    await expect(gamePage.modeCards).toHaveCount(3);

    // Verify difficulty buttons are present
    await expect(gamePage.difficultyBtns).toHaveCount(3);

    // Verify start button is present
    await expect(gamePage.startGameBtn).toBeVisible();
  });

  test('should start a game when clicking Start Game', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Start the game with default settings
    await gamePage.startGame();

    // Verify game interface is visible
    await expect(gamePage.countyInput).toBeVisible();
    await expect(gamePage.submitBtn).toBeVisible();
    await expect(gamePage.statGuesses).toHaveText('0/6');
  });

  test('should allow selecting different game modes', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Select practice mode
    await gamePage.selectMode('Practice');
    await gamePage.startGame();

    // Verify practice mode is active
    const mode = await gamePage.getModeBadge();
    expect(mode).toContain('Practice');
  });

  test('should allow selecting different difficulties', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Select hard difficulty
    await gamePage.selectDifficulty('Hard');
    await gamePage.startGame();

    // Verify hard difficulty reduces max guesses to 4
    const guessText = await gamePage.statGuesses.textContent();
    expect(guessText).toBe('0/4');
  });
});
