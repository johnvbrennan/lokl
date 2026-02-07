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
            mode: 'daily',               // 'daily', 'practice', 'locate', 'timetrial'
            gameNumber: 0,               // Daily challenge number (0 for practice/locate)
            timeLimit: null,             // Time limit in seconds (for time trial)
            timeRemaining: null,         // Current remaining time in seconds (for time trial)
            startTime: null,             // Game start timestamp (for time trial)
            timerActive: false,          // Whether timer is running (for time trial)
            streakCount: 0               // Current streak count (for streak mode)
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

        // Time Trial Statistics - persistent across sessions
        timeTrialStatistics: {
            gamesPlayed: 0,              // Total time trial games played
            gamesWon: 0,                 // Total time trial games won
            averageTime: 0,              // Average completion time in seconds
            bestTime: null,              // Best completion time in seconds
            averageGuesses: 0,           // Average number of guesses
            timeoutCount: 0,             // Number of timeouts
            distribution: [0, 0, 0, 0, 0, 0] // Wins by guess count [1, 2, 3, 4, 5, 6]
        },

        // Streak Statistics - persistent across sessions
        streakStatistics: {
            gamesPlayed: 0,              // Total streak games played
            bestStreak: 0,               // All-time highest streak
            averageStreak: 0,            // Average streak length
            totalCorrect: 0              // Total counties correctly identified
        },

        // Settings - user preferences
        settings: {
            difficulty: 'medium',        // 'easy' (6 guesses), 'hard' (4 guesses)
            theme: 'light',              // 'light' or 'dark'
            timeTrialDurations: {        // Time trial durations in seconds
                easy: 60,
                medium: 45,
                hard: 30
            }
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
 * @param {number} timeLimit - Time limit for time trial mode (optional)
 * @returns {Object} Default game state
 */
export function getDefaultGameState(mode = 'daily', timeLimit = null) {
    return {
        targetCounty: null,
        guesses: [],
        status: 'playing',
        mode: mode,
        gameNumber: 0,
        timeLimit: mode === 'timetrial' ? timeLimit : null,
        timeRemaining: mode === 'timetrial' ? timeLimit : null,
        startTime: mode === 'timetrial' ? Date.now() : null,
        timerActive: mode === 'timetrial',
        streakCount: 0
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
        theme: 'light',
        timeTrialDurations: {
            easy: 60,
            medium: 45,
            hard: 30
        }
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

/**
 * Get default streak statistics
 * @returns {Object} Default streak statistics
 */
export function getDefaultStreakStatistics() {
    return {
        gamesPlayed: 0,
        bestStreak: 0,
        averageStreak: 0,
        totalCorrect: 0
    };
}

/**
 * Get default time trial statistics
 * @returns {Object} Default time trial statistics
 */
export function getDefaultTimeTrialStatistics() {
    return {
        gamesPlayed: 0,
        gamesWon: 0,
        averageTime: 0,
        bestTime: null,
        averageGuesses: 0,
        timeoutCount: 0,
        distribution: [0, 0, 0, 0, 0, 0]
    };
}
