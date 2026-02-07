// ============================================
// STATE ACTIONS
// Action creators for state updates
// ============================================

/**
 * Start a new game
 * @param {string} mode - Game mode ('daily', 'practice', 'locate')
 * @param {string} targetCounty - Target county name
 * @param {number} gameNumber - Game number (for daily mode)
 * @returns {Object} State update object
 */
export function startNewGame(mode, targetCounty, gameNumber = 0) {
    return {
        game: {
            targetCounty,
            guesses: [],
            status: 'playing',
            mode,
            gameNumber
        },
        ui: {
            showConfetti: false,
            activeModal: null
        }
    };
}

/**
 * Restore a saved game state
 * @param {Object} savedGame - Saved game state
 * @returns {Object} State update object
 */
export function restoreGame(savedGame) {
    return {
        game: savedGame
    };
}

/**
 * Submit a guess
 * @param {Object} guess - Guess object with county, distance, direction, color, etc.
 * @returns {Function} State update function
 */
export function submitGuess(guess) {
    return (currentState) => {
        const guesses = [...currentState.game.guesses, guess];
        return {
            game: {
                guesses
            }
        };
    };
}

/**
 * End the game (won or lost)
 * @param {string} status - 'won' or 'lost'
 * @returns {Object} State update object
 */
export function endGame(status) {
    return {
        game: {
            status
        },
        ui: {
            showConfetti: status === 'won'
        }
    };
}

/**
 * Update statistics
 * @param {Object} updates - Partial statistics updates
 * @returns {Object} State update object
 */
export function updateStatistics(updates) {
    return (currentState) => {
        return {
            statistics: {
                ...currentState.statistics,
                ...updates
            }
        };
    };
}

/**
 * Update settings
 * @param {Object} updates - Partial settings updates
 * @returns {Object} State update object
 */
export function updateSettings(updates) {
    return (currentState) => {
        return {
            settings: {
                ...currentState.settings,
                ...updates
            }
        };
    };
}

/**
 * Toggle theme between light and dark
 * @returns {Function} State update function
 */
export function toggleTheme() {
    return (currentState) => {
        const newTheme = currentState.settings.theme === 'light' ? 'dark' : 'light';
        return {
            settings: {
                theme: newTheme
            }
        };
    };
}

/**
 * Set theme explicitly
 * @param {string} theme - 'light' or 'dark'
 * @returns {Object} State update object
 */
export function setTheme(theme) {
    return {
        settings: {
            theme
        }
    };
}

/**
 * Set difficulty
 * @param {string} difficulty - 'easy' or 'hard'
 * @returns {Object} State update object
 */
export function setDifficulty(difficulty) {
    return {
        settings: {
            difficulty
        }
    };
}

/**
 * Show/hide modal
 * @param {string|null} modalName - Modal name or null to hide
 * @returns {Object} State update object
 */
export function setActiveModal(modalName) {
    return {
        ui: {
            activeModal: modalName
        }
    };
}

/**
 * Set loading state
 * @param {boolean} isLoading - Loading state
 * @returns {Object} State update object
 */
export function setLoading(isLoading) {
    return {
        ui: {
            isLoading
        }
    };
}

/**
 * Update autocomplete state
 * @param {Object} updates - Autocomplete state updates
 * @returns {Object} State update object
 */
export function updateAutocomplete(updates) {
    return (currentState) => {
        return {
            ui: {
                autocomplete: {
                    ...currentState.ui.autocomplete,
                    ...updates
                }
            }
        };
    };
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @returns {Object} State update object
 */
export function showToast(message) {
    return {
        ui: {
            toast: {
                message,
                visible: true
            }
        }
    };
}

/**
 * Hide toast notification
 * @returns {Object} State update object
 */
export function hideToast() {
    return {
        ui: {
            toast: {
                message: null,
                visible: false
            }
        }
    };
}

/**
 * Reset game state (for new game)
 * @param {string} mode - Game mode
 * @returns {Object} State update object
 */
export function resetGame(mode = 'daily') {
    return {
        game: {
            targetCounty: null,
            guesses: [],
            status: 'playing',
            mode,
            gameNumber: 0
        },
        ui: {
            showConfetti: false
        }
    };
}

/**
 * Start timer for time trial mode
 * @param {number} timeLimit - Time limit in seconds
 * @returns {Object} State update object
 */
export function startTimer(timeLimit) {
    return {
        game: {
            timeLimit,
            timeRemaining: timeLimit,
            startTime: Date.now(),
            timerActive: true
        }
    };
}

/**
 * Update timer with remaining time
 * @param {number} timeRemaining - Time remaining in seconds
 * @returns {Object} State update object
 */
export function updateTimer(timeRemaining) {
    return {
        game: {
            timeRemaining
        }
    };
}

/**
 * Stop timer
 * @returns {Object} State update object
 */
export function stopTimer() {
    return {
        game: {
            timerActive: false
        }
    };
}

/**
 * Update time trial settings
 * @param {Object} updates - Partial time trial settings updates
 * @returns {Function} State update function
 */
export function updateTimeTrialSettings(updates) {
    return (currentState) => {
        return {
            settings: {
                timeTrialDurations: {
                    ...currentState.settings.timeTrialDurations,
                    ...updates
                }
            }
        };
    };
}

/**
 * Update time trial statistics
 * @param {Object} updates - Partial time trial statistics updates
 * @returns {Function} State update function
 */
export function updateTimeTrialStatistics(updates) {
    return (currentState) => {
        return {
            timeTrialStatistics: {
                ...currentState.timeTrialStatistics,
                ...updates
            }
        };
    };
}

/**
 * Initialize locate mode with a target county
 * @param {string} targetCounty - Target county name
 * @returns {Object} State update object
 */
export function initLocateMode(targetCounty) {
    return {
        game: {
            mode: 'locate',
            status: 'playing',
            guesses: [],
            targetCounty: targetCounty
        }
    };
}

/**
 * Exit locate mode (will be followed by initGame)
 * @returns {Object} State update object
 */
export function exitLocateMode() {
    return {
        game: {
            mode: 'practice',
            status: 'start'
        }
    };
}

/**
 * Start next locate round
 * @param {string} targetCounty - New target county name
 * @returns {Object} State update object
 */
export function startNextLocateRound(targetCounty) {
    return {
        game: {
            targetCounty: targetCounty,
            guesses: [],
            status: 'playing'
        }
    };
}

// ============================================
// STREAK MODE ACTIONS
// ============================================

/**
 * Initialize streak mode with a target county
 * @param {string} targetCounty - Target county name
 * @returns {Object} State update object
 */
export function initStreakMode(targetCounty) {
    return {
        game: {
            mode: 'streak',
            status: 'playing',
            guesses: [],
            targetCounty: targetCounty,
            streakCount: 0
        }
    };
}

/**
 * Advance streak after correct guess
 * @param {string} nextTargetCounty - Next target county name
 * @returns {Function} State update function
 */
export function streakCorrect(nextTargetCounty) {
    return (currentState) => {
        return {
            game: {
                targetCounty: nextTargetCounty,
                guesses: [],
                status: 'playing',
                streakCount: (currentState.game.streakCount || 0) + 1
            }
        };
    };
}

/**
 * End streak game (wrong guess)
 * @returns {Object} State update object
 */
export function endStreakGame() {
    return {
        game: {
            status: 'lost'
        }
    };
}

/**
 * Update streak statistics
 * @param {Object} updates - Partial streak statistics updates
 * @returns {Function} State update function
 */
export function updateStreakStatistics(updates) {
    return (currentState) => {
        return {
            streakStatistics: {
                ...currentState.streakStatistics,
                ...updates
            }
        };
    };
}

/**
 * Exit streak mode
 * @returns {Object} State update object
 */
export function exitStreakMode() {
    return {
        game: {
            mode: 'practice',
            status: 'start'
        }
    };
}
