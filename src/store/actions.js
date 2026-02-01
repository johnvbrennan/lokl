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
