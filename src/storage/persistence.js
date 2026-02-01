// ============================================
// STORAGE PERSISTENCE
// LocalStorage wrapper for game data
// ============================================

// LocalStorage keys
const KEYS = {
    STATISTICS: 'loklStats',
    DAILY_STATE: 'loklDaily',
    SETTINGS: 'loklSettings',
    THEME: 'loklTheme'
};

// ============================================
// STATISTICS
// ============================================

/**
 * Load statistics from localStorage
 * @returns {Object} Statistics object with defaults
 */
export function loadStatistics() {
    try {
        const saved = localStorage.getItem(KEYS.STATISTICS);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load statistics:', e);
    }

    // Return default statistics if none found
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
 * Save statistics to localStorage
 * @param {Object} statistics - Statistics object to save
 */
export function saveStatistics(statistics) {
    try {
        localStorage.setItem(KEYS.STATISTICS, JSON.stringify(statistics));
    } catch (e) {
        console.error('Failed to save statistics:', e);
    }
}

// ============================================
// DAILY STATE
// ============================================

/**
 * Load daily game state from localStorage
 * @returns {Object|null} Daily state or null if not found
 */
export function loadDailyState() {
    try {
        const saved = localStorage.getItem(KEYS.DAILY_STATE);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Failed to load daily state:', e);
        return null;
    }
}

/**
 * Save daily game state to localStorage
 * @param {Object} state - State object with date, guesses, status
 */
export function saveDailyState(state) {
    try {
        localStorage.setItem(KEYS.DAILY_STATE, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save daily state:', e);
    }
}

// ============================================
// SETTINGS
// ============================================

/**
 * Load settings from localStorage
 * @returns {Object} Settings object with defaults
 */
export function loadSettings() {
    try {
        const saved = localStorage.getItem(KEYS.SETTINGS);
        if (saved) {
            const settings = JSON.parse(saved);
            // Validate difficulty is valid
            if (!['easy', 'medium', 'hard'].includes(settings.difficulty)) {
                console.warn('Invalid difficulty found, resetting to medium');
                return { difficulty: 'medium' };
            }
            return settings;
        }
    } catch (e) {
        console.error('Failed to load settings:', e);
    }

    // Return default settings if none found
    return {
        difficulty: 'medium'
    };
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings object to save
 */
export function saveSettings(settings) {
    try {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
}

// ============================================
// THEME
// ============================================

/**
 * Load theme preference from localStorage
 * @returns {string} Theme ('light' or 'dark')
 */
export function loadTheme() {
    try {
        return localStorage.getItem(KEYS.THEME) || 'light';
    } catch (e) {
        console.error('Failed to load theme:', e);
        return 'light';
    }
}

/**
 * Save theme preference to localStorage
 * @param {string} theme - Theme ('light' or 'dark')
 */
export function saveTheme(theme) {
    try {
        localStorage.setItem(KEYS.THEME, theme);
    } catch (e) {
        console.error('Failed to save theme:', e);
    }
}
