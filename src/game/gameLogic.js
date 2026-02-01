// ============================================
// GAME LOGIC
// Core game initialization and guess processing
// ============================================

import { COUNTIES } from '../data/counties.js';
import { COLORS } from '../utils/constants.js';
import { getDistance, getBearing, getProximityColor, areAdjacent } from '../utils/calculations.js';
import { getDailyCounty, getGameNumber, getTodaysDateString, getRandomCounty } from '../utils/dateUtils.js';
import { gameState, statistics, settings, getMaxGuesses, setGameState } from './gameState.js';
import { loadDailyState, saveDailyState, saveStatistics } from '../storage/persistence.js';

/**
 * Initialize a new game
 * @param {string} mode - Game mode ('daily', 'practice', 'locate')
 * @param {boolean} suppressModal - Don't show end modal for already-complete daily games
 * @param {Object} callbacks - UI callback functions
 * @returns {boolean} Whether a new game was started (false if daily already complete)
 */
export function initGame(mode = 'daily', suppressModal = false, callbacks = {}) {
    const {
        resetUI,
        showEndModal,
        restoreGameUI,
        updateModeBadge,
        clearGuessRail
    } = callbacks;

    // Clear guess pills immediately
    if (clearGuessRail) clearGuessRail();

    gameState.mode = mode;
    gameState.guesses = [];
    gameState.status = 'playing';

    if (mode === 'daily') {
        gameState.targetCounty = getDailyCounty();
        gameState.gameNumber = getGameNumber();

        const savedState = loadDailyState();
        if (savedState && savedState.date === getTodaysDateString()) {
            gameState.guesses = savedState.guesses;
            gameState.status = savedState.status;

            if (restoreGameUI) restoreGameUI();

            if (gameState.status !== 'playing' && !suppressModal && showEndModal) {
                // Show end modal with a note that this is today's completed challenge
                setTimeout(() => {
                    showEndModal();
                    // Add a note to the modal
                    const modal = document.querySelector('.modal');
                    const subtitle = modal?.querySelector('.modal-subtitle');
                    if (subtitle && gameState.status === 'won') {
                        subtitle.textContent = `You already completed today's challenge! Come back tomorrow for a new one.`;
                    } else if (subtitle && gameState.status === 'lost') {
                        subtitle.textContent = `You already attempted today's challenge. Come back tomorrow for a new one.`;
                    }
                }, 300);
            }
            return false;
        }
    } else {
        gameState.targetCounty = getRandomCounty();
        gameState.gameNumber = 0;
    }

    if (resetUI) resetUI();
    if (updateModeBadge) updateModeBadge();

    return true;
}

/**
 * Process a player's guess
 * @param {string} countyName - Name of the guessed county
 * @param {Object} callbacks - UI callback functions
 * @returns {Object|null} Guess object if valid, null otherwise
 */
export function processGuess(countyName, callbacks = {}) {
    const {
        updateMapCounty,
        addGuessToHistory,
        updateGuessCounter,
        updateStatsBar,
        updateGuessRail,
        updateGuessCounterPill,
        startNextLocateRound,
        showEndModal,
        disableInput,
        clearInput,
        hideAutocomplete
    } = callbacks;

    // Validate guess
    if (gameState.status !== 'playing') return null;
    if (gameState.guesses.some(g => g.county === countyName)) return null;
    if (!COUNTIES[countyName]) return null;

    const target = COUNTIES[gameState.targetCounty];
    const guessed = COUNTIES[countyName];
    const isCorrect = countyName === gameState.targetCounty;
    const isAdjacent = areAdjacent(countyName, gameState.targetCounty);

    // Adjacent counties = 0km (borders touch), otherwise use centroid distance
    const distance = isCorrect ? 0 : isAdjacent ? 0 : Math.round(getDistance(guessed, target));
    const direction = isCorrect ? '🎯' : getBearing(guessed, target);

    // Only correct answer gets green; adjacent gets HOT (red) to indicate "very close"
    const color = isCorrect ? COLORS.CORRECT : isAdjacent ? COLORS.HOT : getProximityColor(distance);

    const guess = {
        county: countyName,
        distance,
        direction,
        color,
        province: guessed.province,
        isAdjacent
    };

    gameState.guesses.push(guess);

    // Update UI
    if (updateMapCounty) updateMapCounty(countyName, color, isCorrect);
    if (addGuessToHistory) addGuessToHistory(guess, gameState.guesses.length);
    if (updateGuessCounter) updateGuessCounter();
    if (updateStatsBar) updateStatsBar();
    if (updateGuessRail) updateGuessRail();
    if (updateGuessCounterPill) updateGuessCounterPill();

    // Check win/loss conditions
    if (isCorrect) {
        gameState.status = 'won';
        if (gameState.mode === 'locate') {
            // Locate mode: auto-start next round after delay
            if (startNextLocateRound) {
                setTimeout(() => startNextLocateRound(), 1500);
            }
        } else {
            updateStatistics(true, gameState.guesses.length);
            saveDailyState();
            if (showEndModal) {
                setTimeout(() => showEndModal(), 500);
            }
        }
    } else if (gameState.guesses.length >= getMaxGuesses()) {
        gameState.status = 'lost';
        if (updateMapCounty) {
            updateMapCounty(gameState.targetCounty, COLORS.CORRECT, true);
        }
        if (gameState.mode === 'locate') {
            // Locate mode: show correct answer, then next round
            if (startNextLocateRound) {
                setTimeout(() => startNextLocateRound(), 2000);
            }
        } else {
            updateStatistics(false);
            saveDailyState();
            if (showEndModal) {
                setTimeout(() => showEndModal(), 500);
            }
        }
    }

    if (gameState.mode === 'daily') {
        saveDailyState();
    }

    if (gameState.status !== 'playing' && disableInput) {
        disableInput();
    }

    // Clear input
    if (clearInput) clearInput();
    if (hideAutocomplete) hideAutocomplete();

    return guess;
}

/**
 * Check if the player has won
 * @returns {boolean} True if player has won
 */
export function checkWinCondition() {
    return gameState.status === 'won';
}

/**
 * Update game statistics
 * @param {boolean} won - Whether the player won
 * @param {number|null} guessCount - Number of guesses (null if lost)
 */
export function updateStatistics(won, guessCount = null) {
    statistics.gamesPlayed++;

    if (won) {
        statistics.gamesWon++;
        statistics.currentStreak++;
        statistics.bestStreak = Math.max(statistics.bestStreak, statistics.currentStreak);
        if (guessCount && guessCount >= 1 && guessCount <= 6) {
            statistics.distribution[guessCount - 1]++;
        }
    } else {
        statistics.currentStreak = 0;
    }

    statistics.lastPlayedDate = getTodaysDateString();
    saveStatistics();
}
