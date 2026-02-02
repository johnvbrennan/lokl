/**
 * Page Object Model for the main game page
 * Encapsulates all interactions with the lokl game interface
 */
export class GamePage {
  constructor(page) {
    this.page = page;

    // Start overlay elements
    this.startOverlay = page.locator('#start-overlay');
    this.startGameBtn = page.locator('#start-game-btn');
    this.modeCards = page.locator('.mode-card');
    this.difficultyBtns = page.locator('.difficulty-btn');

    // Game elements
    this.countyInput = page.locator('#county-input-new');
    this.submitBtn = page.locator('#submit-btn-new');
    this.guessList = page.locator('#guess-list');
    this.guessRail = page.locator('#guess-rail');
    this.map = page.locator('#map');

    // Modal elements
    this.modalOverlay = page.locator('#modal-overlay');
    this.gameModal = page.locator('#game-modal');
    this.modalTitle = page.locator('#modal-title');
    this.playAgainBtn = page.locator('#play-again-btn');
    this.shareBtn = page.locator('#share-btn');

    // Menu elements
    this.floatingMenuBtn = page.locator('#floating-menu-btn');
    this.floatingMenu = page.locator('#floating-menu');
    this.menuNewGame = page.locator('#menu-new-game');
    this.menuStats = page.locator('#menu-stats');
    this.menuHelp = page.locator('#menu-help');
    this.themeToggleBtn = page.locator('#theme-toggle-btn');

    // Help modal
    this.helpOverlay = page.locator('#help-overlay');
    this.closeHelpBtn = page.locator('#close-help');

    // Stats elements
    this.statGuesses = page.locator('#stat-guesses');
    this.modeBadge = page.locator('#mode-badge');
  }

  async goto() {
    await this.page.goto('/');
  }

  async selectMode(mode) {
    await this.modeCards.filter({ hasText: mode }).click();
  }

  async selectDifficulty(difficulty) {
    await this.difficultyBtns.filter({ hasText: difficulty }).click();
  }

  async startGame() {
    await this.startGameBtn.click();
    await this.startOverlay.waitFor({ state: 'hidden', timeout: 2000 });
  }

  async typeGuess(countyName) {
    await this.countyInput.fill(countyName);
  }

  async submitGuess(countyName) {
    await this.typeGuess(countyName);
    await this.submitBtn.click();
    await this.page.waitForTimeout(500); // Wait for animations
  }

  async getGuessCount() {
    const text = await this.statGuesses.textContent();
    return parseInt(text.split('/')[0]);
  }

  async isGameWon() {
    return await this.modalOverlay.isVisible() &&
           (await this.modalTitle.textContent()).includes('Well Done');
  }

  async isGameLost() {
    return await this.modalOverlay.isVisible() &&
           (await this.modalTitle.textContent()).includes('Game Over');
  }

  async clickMapCounty(countyName) {
    // Click on the map path for the given county
    await this.page.locator(`#county-${countyName}`).click();
  }

  async toggleTheme() {
    await this.themeToggleBtn.click();
  }

  async openMenu() {
    await this.floatingMenuBtn.click();
    await this.floatingMenu.waitFor({ state: 'visible' });
  }

  async openNewGameScreen() {
    await this.openMenu();
    await this.menuNewGame.click();
    await this.startOverlay.waitFor({ state: 'visible' });
  }

  async openHelp() {
    await this.menuHelp.click();
    await this.helpOverlay.waitFor({ state: 'visible' });
  }

  async closeHelp() {
    await this.closeHelpBtn.click();
    await this.helpOverlay.waitFor({ state: 'hidden' });
  }

  async getTheme() {
    const html = this.page.locator('html');
    return await html.getAttribute('data-theme');
  }

  async getModeBadge() {
    return await this.modeBadge.textContent();
  }

  async waitForModal() {
    await this.modalOverlay.waitFor({ state: 'visible', timeout: 5000 });
  }

  async closeModal() {
    await this.page.keyboard.press('Escape');
    await this.modalOverlay.waitFor({ state: 'hidden' });
  }

  async shareResult() {
    await this.shareBtn.click();
  }
}
