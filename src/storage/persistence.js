// ============================================
// STORAGE PERSISTENCE
// LocalStorage wrapper for game data
// ============================================

import { getDefaultSettings } from '../store/initialState.js';

// LocalStorage keys (region-specific where applicable)
const KEYS = {
    STATISTICS: (region) => `loklStats-${region}`,
    DAILY_STATE: (region) => `loklDaily-${region}`,
    SETTINGS: 'loklSettings', // Global (includes selectedRegion)
    THEME: 'loklTheme', // Global
    TIMETRIAL_SETTINGS: 'loklTimeTrialSettings', // Global
    TIMETRIAL_STATS: (region) => `loklTimeTrialStats-${region}`,
    TIMETRIAL_STATE: (region) => `loklTimeTrialState-${region}`,
    STREAK_STATS: (region) => `loklStreakStats-${region}`,
    MIGRATED: 'loklMigrated' // Migration flag
};

/**
 * Set up store subscriptions for auto-save
 * Call this from main.js after store initialization
 * @param {Object} store - The application store
 */
export function setupPersistenceSubscriptions(store) {
    // Subscribe to state changes for auto-save
    store.subscribe((newState, oldState) => {
        // Get current region from settings
        const regionId = newState.settings?.selectedRegion || 'irish-counties';

        // Save statistics if changed
        if (newState.statistics !== oldState.statistics) {
            saveStatistics(newState.statistics, regionId);
        }

        // Save settings if changed
        if (newState.settings !== oldState.settings) {
            saveSettings(newState.settings);
            // Save time trial settings if they changed
            if (newState.settings.timeTrialDurations !== oldState.settings.timeTrialDurations) {
                saveTimeTrialSettings(newState.settings.timeTrialDurations);
            }
        }

        // Save time trial statistics if changed
        if (newState.timeTrialStatistics !== oldState.timeTrialStatistics) {
            saveTimeTrialStatistics(newState.timeTrialStatistics, regionId);
        }

        // Save streak statistics if changed
        if (newState.streakStatistics !== oldState.streakStatistics) {
            saveStreakStatistics(newState.streakStatistics, regionId);
        }

        // Save daily game state if in daily mode and game state changed
        if (newState.game.mode === 'daily' && newState.game !== oldState.game) {
            const dailyState = {
                date: new Date().toISOString().split('T')[0],
                guesses: newState.game.guesses,
                status: newState.game.status
            };
            saveDailyState(dailyState, regionId);
        }

        // Save time trial game state if in time trial mode and game state changed
        if (newState.game.mode === 'timetrial' && newState.game !== oldState.game) {
            const timeTrialState = {
                targetCounty: newState.game.targetCounty,
                guesses: newState.game.guesses,
                status: newState.game.status,
                timeLimit: newState.game.timeLimit,
                startTime: newState.game.startTime
            };
            saveTimeTrialState(timeTrialState, regionId);
        }
    });
}

// ============================================
// STATISTICS
// ============================================

/**
 * Load statistics from localStorage
 * @param {string} regionId - Region identifier (default: 'irish-counties')
 * @returns {Object} Statistics object with defaults
 */
export function loadStatistics(regionId = 'irish-counties') {
    try {
        const saved = localStorage.getItem(KEYS.STATISTICS(regionId));
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
 * @param {string} regionId - Region identifier (default: 'irish-counties')
 */
export function saveStatistics(statistics, regionId = 'irish-counties') {
    try {
        localStorage.setItem(KEYS.STATISTICS(regionId), JSON.stringify(statistics));
    } catch (e) {
        console.error('Failed to save statistics:', e);
    }
}

// ============================================
// DAILY STATE
// ============================================

/**
 * Load daily game state from localStorage
 * @param {string} regionId - Region identifier (default: 'irish-counties')
 * @returns {Object|null} Daily state or null if not found
 */
export function loadDailyState(regionId = 'irish-counties') {
    try {
        const saved = localStorage.getItem(KEYS.DAILY_STATE(regionId));
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Failed to load daily state:', e);
        return null;
    }
}

/**
 * Save daily game state to localStorage
 * @param {Object} state - State object with date, guesses, status
 * @param {string} regionId - Region identifier (default: 'irish-counties')
 */
export function saveDailyState(state, regionId = 'irish-counties') {
    try {
        localStorage.setItem(KEYS.DAILY_STATE(regionId), JSON.stringify(state));
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
    const defaults = getDefaultSettings();

    try {
        const saved = localStorage.getItem(KEYS.SETTINGS);
        let settings = saved ? JSON.parse(saved) : {};

        // Migrate old theme storage if settings doesn't have theme
        if (!settings.theme) {
            const oldTheme = localStorage.getItem(KEYS.THEME);
            if (oldTheme) {
                settings.theme = oldTheme;
            }
        }

        // Validate difficulty is valid
        if (settings.difficulty && !['easy', 'medium', 'hard'].includes(settings.difficulty)) {
            console.warn('Invalid difficulty found, resetting to medium');
            settings.difficulty = 'medium';
        }

        // Merge saved settings with defaults to ensure all properties exist
        return {
            ...defaults,
            ...settings,
            // Deep merge timeTrialDurations to preserve new defaults
            timeTrialDurations: {
                ...defaults.timeTrialDurations,
                ...(settings.timeTrialDurations || {})
            }
        };
    } catch (e) {
        console.error('Failed to load settings:', e);
    }

    // Return default settings if none found
    return defaults;
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

// ============================================
// TIME TRIAL SETTINGS
// ============================================

/**
 * Load time trial settings from localStorage
 * @returns {Object} Time trial settings with defaults
 */
export function loadTimeTrialSettings() {
    try {
        const saved = localStorage.getItem(KEYS.TIMETRIAL_SETTINGS);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load time trial settings:', e);
    }

    // Return default time trial settings if none found
    return {
        easy: 60,
        medium: 45,
        hard: 30
    };
}

/**
 * Save time trial settings to localStorage
 * @param {Object} settings - Time trial settings to save
 */
export function saveTimeTrialSettings(settings) {
    try {
        localStorage.setItem(KEYS.TIMETRIAL_SETTINGS, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save time trial settings:', e);
    }
}

// ============================================
// TIME TRIAL STATISTICS
// ============================================

/**
 * Load time trial statistics from localStorage
 * @param {string} regionId - Region identifier (default: 'irish-counties')
 * @returns {Object} Time trial statistics with defaults
 */
export function loadTimeTrialStatistics(regionId = 'irish-counties') {
    try {
        const saved = localStorage.getItem(KEYS.TIMETRIAL_STATS(regionId));
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load time trial statistics:', e);
    }

    // Return default time trial statistics if none found
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

/**
 * Save time trial statistics to localStorage
 * @param {Object} stats - Time trial statistics to save
 */
export function saveTimeTrialStatistics(stats, regionId = 'irish-counties') {
    try {
        localStorage.setItem(KEYS.TIMETRIAL_STATS(regionId), JSON.stringify(stats));
    } catch (e) {
        console.error('Failed to save time trial statistics:', e);
    }
}

// ============================================
// TIME TRIAL STATE
// ============================================

/**
 * Load time trial game state from localStorage
 * @param {string} regionId - Region identifier (default: 'irish-counties')
 * @returns {Object|null} Time trial state or null if not found/expired
 */
export function loadTimeTrialState(regionId = 'irish-counties') {
    try {
        const saved = localStorage.getItem(KEYS.TIMETRIAL_STATE(regionId));
        if (!saved) return null;

        const state = JSON.parse(saved);

        // Check if state is recent (within time limit)
        if (state.startTime && state.timeLimit) {
            const elapsed = (Date.now() - state.startTime) / 1000;
            if (elapsed > state.timeLimit) {
                // State has expired
                clearTimeTrialState(regionId);
                return null;
            }
        }

        return state;
    } catch (e) {
        console.error('Failed to load time trial state:', e);
        return null;
    }
}

/**
 * Save time trial game state to localStorage
 * @param {Object} state - Time trial state to save
 */
export function saveTimeTrialState(state, regionId = 'irish-counties') {
    try {
        localStorage.setItem(KEYS.TIMETRIAL_STATE(regionId), JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save time trial state:', e);
    }
}

/**
 * Clear time trial game state from localStorage
 * @param {string} regionId - Region identifier (default: 'irish-counties')
 */
export function clearTimeTrialState(regionId = 'irish-counties') {
    try {
        localStorage.removeItem(KEYS.TIMETRIAL_STATE(regionId));
    } catch (e) {
        console.error('Failed to clear time trial state:', e);
    }
}

// ============================================
// STREAK STATISTICS
// ============================================

/**
 * Load streak statistics from localStorage
 * @param {string} regionId - Region identifier (default: 'irish-counties')
 * @returns {Object} Streak statistics with defaults
 */
export function loadStreakStatistics(regionId = 'irish-counties') {
    try {
        const saved = localStorage.getItem(KEYS.STREAK_STATS(regionId));
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load streak statistics:', e);
    }

    return {
        gamesPlayed: 0,
        bestStreak: 0,
        averageStreak: 0,
        totalCorrect: 0
    };
}

/**
 * Save streak statistics to localStorage
 * @param {Object} stats - Streak statistics to save
 * @param {string} regionId - Region identifier (default: 'irish-counties')
 */
export function saveStreakStatistics(stats, regionId = 'irish-counties') {
    try {
        localStorage.setItem(KEYS.STREAK_STATS(regionId), JSON.stringify(stats));
    } catch (e) {
        console.error('Failed to save streak statistics:', e);
    }
}

// ============================================
// DATA MIGRATION
// ============================================

/**
 * Migrate old localStorage data to region-specific keys
 * This preserves existing user data when upgrading to multi-region support
 */
export function migrateOldData() {
    // Check if migration already ran
    const migrated = localStorage.getItem(KEYS.MIGRATED);
    if (migrated) {
        console.log('✅ Data migration already complete');
        return;
    }

    console.log('🔄 Migrating old data to region-specific keys...');

    const defaultRegion = 'irish-counties';

    try {
        // Migrate statistics
        const oldStats = localStorage.getItem('loklStats');
        if (oldStats) {
            localStorage.setItem(KEYS.STATISTICS(defaultRegion), oldStats);
            console.log('  ✅ Migrated statistics');
        }

        // Migrate daily state
        const oldDaily = localStorage.getItem('loklDaily');
        if (oldDaily) {
            localStorage.setItem(KEYS.DAILY_STATE(defaultRegion), oldDaily);
            console.log('  ✅ Migrated daily state');
        }

        // Migrate time trial stats
        const oldTTStats = localStorage.getItem('loklTimeTrialStats');
        if (oldTTStats) {
            localStorage.setItem(KEYS.TIMETRIAL_STATS(defaultRegion), oldTTStats);
            console.log('  ✅ Migrated time trial statistics');
        }

        // Migrate time trial state
        const oldTTState = localStorage.getItem('loklTimeTrialState');
        if (oldTTState) {
            localStorage.setItem(KEYS.TIMETRIAL_STATE(defaultRegion), oldTTState);
            console.log('  ✅ Migrated time trial state');
        }

        // Migrate streak stats
        const oldStreakStats = localStorage.getItem('loklStreakStats');
        if (oldStreakStats) {
            localStorage.setItem(KEYS.STREAK_STATS(defaultRegion), oldStreakStats);
            console.log('  ✅ Migrated streak statistics');
        }

        // Mark migration as complete
        localStorage.setItem(KEYS.MIGRATED, 'true');
        console.log('✅ Data migration complete');

    } catch (e) {
        console.error('❌ Data migration failed:', e);
    }
}
