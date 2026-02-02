// ============================================
// TIME TRIAL MODE
// Core timer mechanics and game logic
// ============================================

import { store } from '../store/store.js';
import { startTimer, updateTimer, stopTimer, updateTimeTrialStatistics, endGame } from '../store/actions.js';
import { getTimeTrialStatistics } from '../store/selectors.js';
import { saveTimeTrialStatistics, clearTimeTrialState } from '../storage/persistence.js';

// Timer interval reference
let timerInterval = null;

/**
 * Initialize Time Trial mode
 * @param {number} duration - Timer duration in seconds
 * @param {string} targetCounty - Target county to guess
 * @param {Object} callbacks - UI callback functions
 */
export function initTimeTrialMode(duration, targetCounty, callbacks = {}) {
    // Start the timer
    store.dispatch(startTimer(duration));

    // Start countdown
    startTimeTrialTimer(duration, callbacks);
}

/**
 * Start the time trial countdown timer
 * @param {number} duration - Duration in seconds
 * @param {Object} callbacks - UI callbacks (onTimeout, onTick)
 */
export function startTimeTrialTimer(duration, callbacks = {}) {
    const startTime = performance.now();
    const startTimestamp = Date.now();

    // Clear any existing interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Update every 100ms for smooth countdown
    timerInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const timeRemaining = Math.max(0, duration - elapsed);

        // Update store with remaining time
        store.dispatch(updateTimer(timeRemaining));

        // Call tick callback if provided
        if (callbacks.onTick) {
            callbacks.onTick(timeRemaining);
        }

        // Check for timeout
        if (timeRemaining <= 0) {
            stopTimeTrialTimer();
            handleTimeout(callbacks);
        }
    }, 100);
}

/**
 * Stop the time trial timer
 */
export function stopTimeTrialTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    store.dispatch(stopTimer());
}

/**
 * Handle timeout (time ran out)
 * @param {Object} callbacks - UI callbacks
 */
export function handleTimeout(callbacks) {
    const state = store.getState();
    const targetCounty = state.game.targetCounty;
    const guessCount = state.game.guesses.length;

    // End the game as lost
    store.dispatch(endGame('lost'));

    // Update statistics
    const stats = getTimeTrialStatistics(state);
    const updatedStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        timeoutCount: stats.timeoutCount + 1
    };
    store.dispatch(updateTimeTrialStatistics(updatedStats));

    // Clear saved state
    clearTimeTrialState();

    // Call timeout callback to reveal answer
    if (callbacks.onTimeout) {
        callbacks.onTimeout(targetCounty);
    }

    // Show time trial end modal
    if (callbacks.showTimeTrialEndModal) {
        setTimeout(() => {
            callbacks.showTimeTrialEndModal(false, 0, guessCount, targetCounty);
        }, 500);
    }
}

/**
 * Get timer color based on remaining time
 * @param {number} timeRemaining - Time remaining in seconds
 * @param {number} timeLimit - Total time limit in seconds
 * @returns {string} Color state: 'normal', 'warning', 'danger', 'critical', 'urgent'
 */
export function getTimerColor(timeRemaining, timeLimit) {
    if (timeRemaining > 20) {
        return 'normal';
    } else if (timeRemaining > 15) {
        return 'warning';
    } else if (timeRemaining > 10) {
        return 'danger';
    } else if (timeRemaining > 5) {
        return 'critical';
    } else {
        return 'urgent';
    }
}

/**
 * Format time for display
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTimeDisplay(seconds) {
    if (seconds < 0) seconds = 0;

    if (seconds < 60) {
        // Format as "X.Xs" for times under 60s
        return `${seconds.toFixed(1)}s`;
    } else {
        // Format as "M:SS.S" for times 60s and above
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const paddedSeconds = remainingSeconds < 10 ? '0' : '';
        return `${minutes}:${paddedSeconds}${remainingSeconds.toFixed(1)}`;
    }
}

/**
 * Update Time Trial statistics after game completion
 * @param {boolean} won - Whether the game was won
 * @param {number} timeElapsed - Time elapsed in seconds (for wins)
 * @param {number} guessCount - Number of guesses made
 */
export function updateTimeTrialStats(won, timeElapsed, guessCount) {
    const state = store.getState();
    const stats = getTimeTrialStatistics(state);

    const updates = {
        gamesPlayed: stats.gamesPlayed + 1
    };

    if (won) {
        updates.gamesWon = stats.gamesWon + 1;

        // Update average time (running average)
        const totalWins = stats.gamesWon + 1;
        updates.averageTime = ((stats.averageTime * stats.gamesWon) + timeElapsed) / totalWins;

        // Update best time
        if (stats.bestTime === null || timeElapsed < stats.bestTime) {
            updates.bestTime = timeElapsed;
        }

        // Update average guesses
        const currentTotal = stats.averageGuesses * stats.gamesWon;
        updates.averageGuesses = (currentTotal + guessCount) / totalWins;

        // Update distribution (0-indexed, so guessCount-1)
        const distribution = [...stats.distribution];
        if (guessCount >= 1 && guessCount <= 6) {
            distribution[guessCount - 1]++;
        }
        updates.distribution = distribution;
    }

    store.dispatch(updateTimeTrialStatistics(updates));
    saveTimeTrialStatistics(store.getState().timeTrialStatistics);
}

/**
 * Calculate elapsed time from start
 * @param {number} startTime - Start timestamp
 * @returns {number} Elapsed time in seconds
 */
export function getElapsedTime(startTime) {
    return (Date.now() - startTime) / 1000;
}
