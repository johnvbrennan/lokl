// ============================================
// GAME STATE MANAGEMENT
// ============================================

import { loadStatistics, loadSettings } from '../storage/persistence.js';

/**
 * Create a new game state object
 * @param {string} mode - Game mode ('daily', 'practice', 'locate')
 * @returns {Object} New game state
 */
export function createGameState(mode = 'daily') {
    return {
        targetCounty: null,
        guesses: [],
        status: 'playing', // 'playing', 'won', 'lost'
        mode: mode,
        gameNumber: 0
    };
}

/**
 * Current game state
 * This will be replaced with a more robust state management system in Phase 16
 */
export let gameState = createGameState();

/**
 * Update the game state reference
 * @param {Object} newState - New game state
 */
export function setGameState(newState) {
    gameState = newState;
}

/**
 * Statistics tracking
 */
export let statistics = loadStatistics();

/**
 * Update statistics reference
 * @param {Object} newStats - New statistics
 */
export function setStatistics(newStats) {
    statistics = newStats;
}

/**
 * Game settings
 */
export let settings = loadSettings();

/**
 * Update settings reference
 * @param {Object} newSettings - New settings
 */
export function setSettings(newSettings) {
    settings = newSettings;
}

/**
 * Get maximum guesses based on current difficulty
 * @returns {number} Maximum number of guesses
 */
export function getMaxGuesses() {
    return settings.difficulty === 'hard' ? 4 : 6;
}
