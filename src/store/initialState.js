// ============================================
// INITIAL STATE DEFINITION
// Defines the complete state shape for the application
// ============================================

/**
 * Get the initial state for the application
 * @returns {Object} Complete initial state structure
 */
export function getInitialState() {
    return {
        // Game state - current game session
        game: {
            targetCounty: null,         // Name of the county to guess
            guesses: [],                 // Array of guess objects
            status: 'playing',           // 'playing', 'won', 'lost'
            mode: 'daily',               // 'daily', 'practice', 'locate'
            gameNumber: 0                // Daily challenge number (0 for practice/locate)
        },

        // Statistics - persistent across sessions
        statistics: {
            gamesPlayed: 0,              // Total games played (daily only)
            gamesWon: 0,                 // Total games won (daily only)
            currentStreak: 0,            // Current winning streak
            bestStreak: 0,               // Best winning streak
            distribution: [0, 0, 0, 0, 0, 0], // Wins by guess count [1, 2, 3, 4, 5, 6]
            lastPlayedDate: null         // Last played date string (YYYY-MM-DD)
        },

        // Settings - user preferences
        settings: {
            difficulty: 'medium',        // 'easy' (6 guesses), 'hard' (4 guesses)
            theme: 'light'               // 'light' or 'dark'
        },

        // UI state - ephemeral UI state
        ui: {
            isLoading: false,            // Global loading state
            activeModal: null,           // 'help', 'stats', 'settings', 'end', 'share', null
            showConfetti: false,         // Show confetti animation
            autocomplete: {
                isOpen: false,           // Autocomplete dropdown open
                selectedIndex: -1,       // Selected item index
                matches: []              // Filtered county matches
            },
            toast: {
                message: null,           // Toast message text
                visible: false           // Toast visibility
            }
        }
    };
}

/**
 * Get default game state
 * @param {string} mode - Game mode
 * @returns {Object} Default game state
 */
export function getDefaultGameState(mode = 'daily') {
    return {
        targetCounty: null,
        guesses: [],
        status: 'playing',
        mode: mode,
        gameNumber: 0
    };
}

/**
 * Get default statistics
 * @returns {Object} Default statistics
 */
export function getDefaultStatistics() {
    return {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        distribution: [0, 0, 0, 0, 0, 0],
        lastPlayedDate: null
    };
}

/**
 * Get default settings
 * @returns {Object} Default settings
 */
export function getDefaultSettings() {
    return {
        difficulty: 'medium',
        theme: 'light'
    };
}

/**
 * Get default UI state
 * @returns {Object} Default UI state
 */
export function getDefaultUIState() {
    return {
        isLoading: false,
        activeModal: null,
        showConfetti: false,
        autocomplete: {
            isOpen: false,
            selectedIndex: -1,
            matches: []
        },
        toast: {
            message: null,
            visible: false
        }
    };
}
