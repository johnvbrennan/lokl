// ============================================
// GAME LOGIC
// Core game initialization and guess processing
// ============================================

import { COUNTIES } from '../data/counties.js';
import { COLORS } from '../utils/constants.js';
import { getDistance, getBearing, getProximityColor, areAdjacent } from '../utils/calculations.js';
import { getDailyCounty, getGameNumber, getTodaysDateString, getRandomCounty } from '../utils/dateUtils.js';
import { store, getMaxGuesses } from './gameState.js';
import { startNewGame, restoreGame, submitGuess, endGame, updateStatistics as updateStatsAction } from '../store/actions.js';
import { getGameState, getGameStatus, getGameMode, getTargetCounty, getCurrentGuesses, isTimeTrialMode } from '../store/selectors.js';
import { loadDailyState, saveDailyState as persistDailyState, saveStatistics as persistStatistics } from '../storage/persistence.js';
import { initTimeTrialMode, stopTimeTrialTimer, updateTimeTrialStats, getElapsedTime } from './timeTrialMode.js';

/**
 * Initialize a new game
 * @param {string} mode - Game mode ('daily', 'practice', 'locate', 'timetrial')
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

    if (mode === 'daily') {
        const targetCounty = getDailyCounty();
        const gameNumber = getGameNumber();

        // Check for saved daily state
        const savedState = loadDailyState();
        if (savedState && savedState.date === getTodaysDateString()) {
            // Restore saved game
            store.setState(
                restoreGame({
                    targetCounty,
                    guesses: savedState.guesses,
                    status: savedState.status,
                    mode,
                    gameNumber
                }),
                'restoreGame'
            );

            if (restoreGameUI) restoreGameUI();

            const state = store.getState();
            if (state.game.status !== 'playing' && !suppressModal && showEndModal) {
                // Show end modal with a note that this is today's completed challenge
                setTimeout(() => {
                    showEndModal();
                    // Add a note to the modal
                    const modal = document.querySelector('.modal');
                    const subtitle = modal?.querySelector('.modal-subtitle');
                    if (subtitle && state.game.status === 'won') {
                        subtitle.textContent = `You already completed today's challenge! Come back tomorrow for a new one.`;
                    } else if (subtitle && state.game.status === 'lost') {
                        subtitle.textContent = `You already attempted today's challenge. Come back tomorrow for a new one.`;
                    }
                }, 300);
            }
            return false;
        }

        // Start new daily game
        store.setState(startNewGame(mode, targetCounty, gameNumber), 'startNewGame');
    } else if (mode === 'timetrial') {
        // Start time trial game
        const targetCounty = getRandomCounty();
        const state = store.getState();
        const duration = state.settings.timeTrialDurations[state.settings.difficulty];

        // Start new time trial game with timer
        store.setState(startNewGame(mode, targetCounty, 0), 'startNewGame');

        // Initialize time trial mode (starts timer)
        initTimeTrialMode(duration, targetCounty, callbacks);
    } else {
        // Start practice or locate game
        const targetCounty = getRandomCounty();
        store.setState(startNewGame(mode, targetCounty, 0), 'startNewGame');
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

    // Get current state
    const state = store.getState();
    const gameState = state.game;

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

    // Add guess to store
    store.setState(submitGuess(guess), 'submitGuess');

    // Get updated state
    const updatedState = store.getState();
    const currentGuesses = updatedState.game.guesses;

    // Update UI
    if (updateMapCounty) updateMapCounty(countyName, color, isCorrect);
    if (addGuessToHistory) addGuessToHistory(guess, currentGuesses.length);
    if (updateGuessCounter) updateGuessCounter();
    if (updateStatsBar) updateStatsBar();
    if (updateGuessRail) updateGuessRail();
    if (updateGuessCounterPill) updateGuessCounterPill();

    // Check win/loss conditions
    if (isCorrect) {
        store.setState(endGame('won'), 'endGame');

        if (updatedState.game.mode === 'locate') {
            // Locate mode: auto-start next round after delay
            if (startNextLocateRound) {
                setTimeout(() => startNextLocateRound(), 1500);
            }
        } else if (updatedState.game.mode === 'timetrial') {
            // Time trial mode: stop timer and update stats
            stopTimeTrialTimer();
            const elapsedTime = getElapsedTime(updatedState.game.startTime);
            updateTimeTrialStats(true, elapsedTime, currentGuesses.length);
            if (callbacks.showTimeTrialEndModal) {
                setTimeout(() => {
                    callbacks.showTimeTrialEndModal(true, elapsedTime, currentGuesses.length, updatedState.game.targetCounty);
                }, 500);
            }
        } else {
            updateStatistics(true, currentGuesses.length);
            persistDailyState({
                date: getTodaysDateString(),
                guesses: currentGuesses,
                status: 'won'
            });
            if (showEndModal) {
                setTimeout(() => showEndModal(), 500);
            }
        }
    } else if (!isTimeTrialMode(updatedState) && currentGuesses.length >= getMaxGuesses()) {
        // Only check guess limit for non-time-trial modes
        store.setState(endGame('lost'), 'endGame');

        if (updateMapCounty) {
            updateMapCounty(updatedState.game.targetCounty, COLORS.CORRECT, true);
        }

        if (updatedState.game.mode === 'locate') {
            // Locate mode: show correct answer, then next round
            if (startNextLocateRound) {
                setTimeout(() => startNextLocateRound(), 2000);
            }
        } else {
            updateStatistics(false);
            persistDailyState({
                date: getTodaysDateString(),
                guesses: currentGuesses,
                status: 'lost'
            });
            if (showEndModal) {
                setTimeout(() => showEndModal(), 500);
            }
        }
    }

    if (updatedState.game.mode === 'daily') {
        persistDailyState({
            date: getTodaysDateString(),
            guesses: currentGuesses,
            status: updatedState.game.status
        });
    }

    if (updatedState.game.status !== 'playing' && disableInput) {
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
    const state = store.getState();
    return state.game.status === 'won';
}

/**
 * Update game statistics
 * @param {boolean} won - Whether the player won
 * @param {number|null} guessCount - Number of guesses (null if lost)
 */
export function updateStatistics(won, guessCount = null) {
    const state = store.getState();
    const stats = state.statistics;

    const updates = {
        gamesPlayed: stats.gamesPlayed + 1,
        lastPlayedDate: getTodaysDateString()
    };

    if (won) {
        updates.gamesWon = stats.gamesWon + 1;
        updates.currentStreak = stats.currentStreak + 1;
        updates.bestStreak = Math.max(stats.bestStreak, stats.currentStreak + 1);

        if (guessCount && guessCount >= 1 && guessCount <= 6) {
            const newDistribution = [...stats.distribution];
            newDistribution[guessCount - 1]++;
            updates.distribution = newDistribution;
        }
    } else {
        updates.currentStreak = 0;
    }

    store.setState(updateStatsAction(updates), 'updateStatistics');
    persistStatistics(store.getState().statistics);
}
