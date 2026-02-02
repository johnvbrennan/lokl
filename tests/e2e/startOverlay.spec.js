import { test, expect } from '@playwright/test';
import { GamePage } from './helpers/GamePage.js';

test.describe('Start Overlay Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should allow selecting game mode by clicking on cards', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Daily should be selected by default
    const dailyCard = gamePage.modeCards.filter({ hasText: 'Daily' });
    await expect(dailyCard).toHaveClass(/selected/);

    // Click on practice card
    const practiceCard = gamePage.modeCards.filter({ hasText: 'Practice' });
    await practiceCard.click();

    // Practice should now be selected
    await expect(practiceCard).toHaveClass(/selected/);
    await expect(dailyCard).not.toHaveClass(/selected/);

    // Click on locate card
    const locateCard = gamePage.modeCards.filter({ hasText: 'Locate' });
    await locateCard.click();

    // Locate should now be selected
    await expect(locateCard).toHaveClass(/selected/);
    await expect(practiceCard).not.toHaveClass(/selected/);
  });

  test('should allow selecting difficulty by clicking on buttons', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Medium should be selected by default
    const mediumBtn = gamePage.difficultyBtns.filter({ hasText: 'Medium' });
    await expect(mediumBtn).toHaveClass(/selected/);

    // Click on easy button
    const easyBtn = gamePage.difficultyBtns.filter({ hasText: 'Easy' });
    await easyBtn.click();

    // Easy should now be selected
    await expect(easyBtn).toHaveClass(/selected/);
    await expect(mediumBtn).not.toHaveClass(/selected/);

    // Click on hard button
    const hardBtn = gamePage.difficultyBtns.filter({ hasText: 'Hard' });
    await hardBtn.click();

    // Hard should now be selected
    await expect(hardBtn).toHaveClass(/selected/);
    await expect(easyBtn).not.toHaveClass(/selected/);
  });

  test('should start game with selected mode and difficulty', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Select practice mode
    await gamePage.selectMode('Practice');

    // Select hard difficulty
    await gamePage.selectDifficulty('Hard');

    // Start game
    await gamePage.startGame();

    // Verify practice mode is active
    const mode = await gamePage.getModeBadge();
    expect(mode).toContain('Practice');

    // Verify hard difficulty (4 guesses max)
    await expect(gamePage.statGuesses).toHaveText('0/4');
  });

  test('should hide start overlay after clicking Start Game', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Verify overlay is visible
    await expect(gamePage.startOverlay).toBeVisible();

    // Click start button
    await gamePage.startGameBtn.click();

    // Verify overlay is hidden
    await expect(gamePage.startOverlay).not.toBeVisible();

    // Verify game interface is visible
    await expect(gamePage.countyInput).toBeVisible();
  });

  test('should show start overlay when clicking New Game from menu', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Start a game first
    await gamePage.startGame();

    // Open menu and click New Game
    await gamePage.openNewGameScreen();

    // Verify start overlay is visible again
    await expect(gamePage.startOverlay).toBeVisible();

    // Verify mode and difficulty selections are shown
    await expect(gamePage.modeCards).toHaveCount(3);
    await expect(gamePage.difficultyBtns).toHaveCount(3);
  });
});
