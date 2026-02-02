import { test, expect } from '@playwright/test';
import { GamePage } from './helpers/GamePage.js';

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should load with default light theme', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Check initial theme
    const theme = await gamePage.getTheme();
    expect(theme).toBe('light');
  });

  test('should toggle theme to dark mode', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Start the game first
    await gamePage.startGame();

    // Open menu and toggle theme
    await gamePage.openMenu();
    await gamePage.toggleTheme();

    // Wait for theme transition
    await page.waitForTimeout(500);

    // Verify theme changed to dark
    const theme = await gamePage.getTheme();
    expect(theme).toBe('dark');

    // Verify CSS variables changed
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Dark theme should have a dark background
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });

  test('should persist theme preference on reload', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();

    // Start game and toggle to dark theme
    await gamePage.startGame();
    await gamePage.openMenu();
    await gamePage.toggleTheme();
    await page.waitForTimeout(500);

    // Verify dark theme
    let theme = await gamePage.getTheme();
    expect(theme).toBe('dark');

    // Reload the page
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify theme persisted
    theme = await gamePage.getTheme();
    expect(theme).toBe('dark');
  });

  test('should toggle between themes multiple times', async ({ page }) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.startGame();

    // Initial theme should be light
    let theme = await gamePage.getTheme();
    expect(theme).toBe('light');

    // Toggle to dark
    await gamePage.openMenu();
    await gamePage.toggleTheme();
    await page.waitForTimeout(500);

    // Verify dark theme
    theme = await gamePage.getTheme();
    expect(theme).toBe('dark');

    // Close menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Toggle back to light (without reload)
    await gamePage.openMenu();
    await gamePage.toggleTheme();
    await page.waitForTimeout(500);

    // Verify back to light
    theme = await gamePage.getTheme();
    expect(theme).toBe('light');

    // One more toggle to dark to verify it works repeatedly
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await gamePage.openMenu();
    await gamePage.toggleTheme();
    await page.waitForTimeout(500);

    // Verify dark again
    theme = await gamePage.getTheme();
    expect(theme).toBe('dark');
  });
});
