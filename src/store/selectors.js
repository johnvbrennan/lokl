// ============================================
// STATE SELECTORS
// Functions for reading specific state slices
// ============================================

/**
 * Get the complete game state
 * @param {Object} state - Full application state
 * @returns {Object} Game state
 */
export function getGameState(state) {
    return state.game;
}

/**
 * Get the complete statistics
 * @param {Object} state - Full application state
 * @returns {Object} Statistics
 */
export function getStatistics(state) {
    return state.statistics;
}

/**
 * Get the complete settings
 * @param {Object} state - Full application state
 * @returns {Object} Settings
 */
export function getSettings(state) {
    return state.settings;
}

/**
 * Get the complete UI state
 * @param {Object} state - Full application state
 * @returns {Object} UI state
 */
export function getUIState(state) {
    return state.ui;
}

/**
 * Get current guesses
 * @param {Object} state - Full application state
 * @returns {Array} Array of guess objects
 */
export function getCurrentGuesses(state) {
    return state.game.guesses;
}

/**
 * Get target county
 * @param {Object} state - Full application state
 * @returns {string|null} Target county name
 */
export function getTargetCounty(state) {
    return state.game.targetCounty;
}

/**
 * Get game status
 * @param {Object} state - Full application state
 * @returns {string} Game status ('playing', 'won', 'lost')
 */
export function getGameStatus(state) {
    return state.game.status;
}

/**
 * Get game mode
 * @param {Object} state - Full application state
 * @returns {string} Game mode ('daily', 'practice', 'locate')
 */
export function getGameMode(state) {
    return state.game.mode;
}

/**
 * Get game number (for daily mode)
 * @param {Object} state - Full application state
 * @returns {number} Game number
 */
export function getGameNumber(state) {
    return state.game.gameNumber;
}

/**
 * Get current theme
 * @param {Object} state - Full application state
 * @returns {string} Theme ('light' or 'dark')
 */
export function getTheme(state) {
    return state.settings.theme;
}

/**
 * Get current difficulty
 * @param {Object} state - Full application state
 * @returns {string} Difficulty ('easy' or 'hard')
 */
export function getDifficulty(state) {
    return state.settings.difficulty;
}

/**
 * Get maximum guesses based on current difficulty
 * @param {Object} state - Full application state
 * @returns {number} Maximum number of guesses (6 for easy, 4 for hard)
 */
export function getMaxGuesses(state) {
    return state.settings.difficulty === 'hard' ? 4 : 6;
}

/**
 * Get number of guesses made
 * @param {Object} state - Full application state
 * @returns {number} Number of guesses
 */
export function getGuessCount(state) {
    return state.game.guesses.length;
}

/**
 * Get remaining guesses
 * @param {Object} state - Full application state
 * @returns {number} Remaining guesses
 */
export function getRemainingGuesses(state) {
    const max = getMaxGuesses(state);
    const current = state.game.guesses.length;
    return Math.max(0, max - current);
}

/**
 * Check if game is in playing state
 * @param {Object} state - Full application state
 * @returns {boolean} True if game is in playing state
 */
export function isGamePlaying(state) {
    return state.game.status === 'playing';
}

/**
 * Check if game is won
 * @param {Object} state - Full application state
 * @returns {boolean} True if game is won
 */
export function isGameWon(state) {
    return state.game.status === 'won';
}

/**
 * Check if game is lost
 * @param {Object} state - Full application state
 * @returns {boolean} True if game is lost
 */
export function isGameLost(state) {
    return state.game.status === 'lost';
}

/**
 * Check if game is in daily mode
 * @param {Object} state - Full application state
 * @returns {boolean} True if in daily mode
 */
export function isDailyMode(state) {
    return state.game.mode === 'daily';
}

/**
 * Check if game is in practice mode
 * @param {Object} state - Full application state
 * @returns {boolean} True if in practice mode
 */
export function isPracticeMode(state) {
    return state.game.mode === 'practice';
}

/**
 * Check if game is in locate mode
 * @param {Object} state - Full application state
 * @returns {boolean} True if in locate mode
 */
export function isLocateMode(state) {
    return state.game.mode === 'locate';
}

/**
 * Get active modal
 * @param {Object} state - Full application state
 * @returns {string|null} Active modal name or null
 */
export function getActiveModal(state) {
    return state.ui.activeModal;
}

/**
 * Check if loading
 * @param {Object} state - Full application state
 * @returns {boolean} True if loading
 */
export function isLoading(state) {
    return state.ui.isLoading;
}

/**
 * Check if confetti should show
 * @param {Object} state - Full application state
 * @returns {boolean} True if confetti should show
 */
export function shouldShowConfetti(state) {
    return state.ui.showConfetti;
}

/**
 * Get autocomplete state
 * @param {Object} state - Full application state
 * @returns {Object} Autocomplete state
 */
export function getAutocompleteState(state) {
    return state.ui.autocomplete;
}

/**
 * Get toast state
 * @param {Object} state - Full application state
 * @returns {Object} Toast state
 */
export function getToastState(state) {
    return state.ui.toast;
}

/**
 * Get win percentage
 * @param {Object} state - Full application state
 * @returns {number} Win percentage (0-100)
 */
export function getWinPercentage(state) {
    const { gamesPlayed, gamesWon } = state.statistics;
    return gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
}

/**
 * Get last guess
 * @param {Object} state - Full application state
 * @returns {Object|null} Last guess or null
 */
export function getLastGuess(state) {
    const guesses = state.game.guesses;
    return guesses.length > 0 ? guesses[guesses.length - 1] : null;
}

/**
 * Check if county has been guessed
 * @param {Object} state - Full application state
 * @param {string} countyName - County name to check
 * @returns {boolean} True if county has been guessed
 */
export function hasGuessedCounty(state, countyName) {
    return state.game.guesses.some(g => g.county === countyName);
}

/**
 * Check if game is in time trial mode
 * @param {Object} state - Full application state
 * @returns {boolean} True if in time trial mode
 */
export function isTimeTrialMode(state) {
    return state.game.mode === 'timetrial';
}

/**
 * Get time remaining for time trial
 * @param {Object} state - Full application state
 * @returns {number|null} Time remaining in seconds
 */
export function getTimeRemaining(state) {
    return state.game.timeRemaining;
}

/**
 * Get time limit for time trial
 * @param {Object} state - Full application state
 * @returns {number|null} Time limit in seconds
 */
export function getTimeLimit(state) {
    return state.game.timeLimit;
}

/**
 * Check if timer is active
 * @param {Object} state - Full application state
 * @returns {boolean} True if timer is active
 */
export function isTimerActive(state) {
    return state.game.timerActive;
}

/**
 * Get time trial statistics
 * @param {Object} state - Full application state
 * @returns {Object} Time trial statistics
 */
export function getTimeTrialStatistics(state) {
    return state.timeTrialStatistics;
}

/**
 * Get time trial duration for current difficulty
 * @param {Object} state - Full application state
 * @returns {number} Duration in seconds
 */
export function getTimeTrialDuration(state) {
    const difficulty = state.settings.difficulty;
    return state.settings.timeTrialDurations[difficulty];
}

// ============================================
// STREAK MODE SELECTORS
// ============================================

/**
 * Check if game is in streak mode
 * @param {Object} state - Full application state
 * @returns {boolean} True if in streak mode
 */
export function isStreakMode(state) {
    return state.game.mode === 'streak';
}

/**
 * Get current streak count
 * @param {Object} state - Full application state
 * @returns {number} Current streak count
 */
export function getStreakCount(state) {
    return state.game.streakCount || 0;
}

/**
 * Get streak statistics
 * @param {Object} state - Full application state
 * @returns {Object} Streak statistics
 */
export function getStreakStatistics(state) {
    return state.streakStatistics;
}
