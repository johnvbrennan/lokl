import { test, expect } from '@playwright/test';

test('debug - check page load and start overlay', async ({ page }) => {
  await page.goto('/');

  // Take a screenshot
  await page.screenshot({ path: 'debug-load.png', fullPage: true });

  // Check if start overlay is visible
  const startOverlay = page.locator('#start-overlay');
  console.log('Start overlay visible:', await startOverlay.isVisible());

  // Check if it has the visible class
  const classes = await startOverlay.getAttribute('class');
  console.log('Start overlay classes:', classes);

  // Check if start button is visible
  const startBtn = page.locator('#start-game-btn');
  console.log('Start button visible:', await startBtn.isVisible());

  // Try clicking the start button
  await startBtn.click();

  // Wait a bit
  await page.waitForTimeout(2000);

  // Take another screenshot
  await page.screenshot({ path: 'debug-after-click.png', fullPage: true });

  // Check overlay status again
  console.log('Start overlay visible after click:', await startOverlay.isVisible());
  console.log('Start overlay classes after click:', await startOverlay.getAttribute('class'));

  // Check if input is visible
  const input = page.locator('#county-input-new');
  console.log('Input visible:', await input.isVisible());
});
