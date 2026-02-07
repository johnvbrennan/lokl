// ============================================
// STREAK MODE
// Functions specific to streak mode gameplay
// One click per county - correct advances, wrong ends game
// ============================================

import { store } from './gameState.js';
import {
    initStreakMode as initStreakModeAction,
    streakCorrect as streakCorrectAction,
    endStreakGame as endStreakGameAction,
    updateStreakStatistics
} from '../store/actions.js';
import { getStreakCount, getStreakStatistics } from '../store/selectors.js';
import { createCountyShuffleQueue } from '../utils/dateUtils.js';
import { saveStreakStatistics } from '../storage/persistence.js';

// Module-level shuffle queue instance
let streakQueue = null;

/**
 * Initialize Streak Mode
 * Creates a fresh shuffle queue and gets the first target county.
 * @returns {string} First target county name
 */
export function initStreakMode() {
    streakQueue = createCountyShuffleQueue();
    const targetCounty = streakQueue.next();
    store.setState(initStreakModeAction(targetCounty), 'initStreakMode');
    return targetCounty;
}

/**
 * Handle a correct streak guess - advance to next county
 * @returns {string} Next target county name
 */
export function handleStreakCorrect() {
    const nextCounty = streakQueue.next();
    store.setState(streakCorrectAction(nextCounty), 'streakCorrect');
    return nextCounty;
}

/**
 * Handle streak game over (wrong answer)
 * Updates statistics and persists them.
 * @returns {number} Final streak count
 */
export function handleStreakGameOver() {
    const state = store.getState();
    const finalStreak = state.game.streakCount || 0;

    // End the game
    store.setState(endStreakGameAction(), 'endStreakGame');

    // Update statistics
    updateStreakStats(finalStreak);

    return finalStreak;
}

/**
 * Update streak statistics after game over
 * @param {number} finalStreak - The streak count achieved
 */
function updateStreakStats(finalStreak) {
    const state = store.getState();
    const stats = getStreakStatistics(state);

    const newGamesPlayed = stats.gamesPlayed + 1;
    const newTotalCorrect = stats.totalCorrect + finalStreak;
    const newBestStreak = Math.max(stats.bestStreak, finalStreak);
    const newAverageStreak = ((stats.averageStreak * stats.gamesPlayed) + finalStreak) / newGamesPlayed;

    const updates = {
        gamesPlayed: newGamesPlayed,
        bestStreak: newBestStreak,
        averageStreak: newAverageStreak,
        totalCorrect: newTotalCorrect
    };

    store.setState(updateStreakStatistics(updates), 'updateStreakStatistics');
    saveStreakStatistics(store.getState().streakStatistics);
}

/**
 * Exit streak mode and return to practice
 * @param {Function} initGame - Callback to initialize practice mode
 */
export function exitStreakMode(initGame) {
    if (streakQueue) {
        streakQueue.reset();
        streakQueue = null;
    }
    if (initGame) initGame('practice');
}
