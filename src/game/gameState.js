// ============================================
// GAME STATE MANAGEMENT
// Centralized state store for the application
// ============================================

import { createStore } from '../store/store.js';
import { getInitialState } from '../store/initialState.js';
import { loadStatistics, loadSettings, loadTheme } from '../storage/persistence.js';

/**
 * Initialize the application state by merging defaults with persisted data
 * @returns {Object} Initial state with persisted values
 */
function initializeState() {
    const defaultState = getInitialState();

    // Load persisted data from localStorage
    const persistedStatistics = loadStatistics();
    const persistedSettings = loadSettings();
    const persistedTheme = loadTheme();

    // Merge persisted data with default state
    return {
        ...defaultState,
        statistics: persistedStatistics,
        settings: {
            ...persistedSettings,
            theme: persistedTheme
        }
    };
}

/**
 * Create and export the centralized state store
 * This is the single source of truth for all application state
 */
export const store = createStore(initializeState(), {
    enableDevTools: true,
    enableHistory: true,
    enableLogging: import.meta.env?.DEV ?? false
});

/**
 * Create a new game state object (utility function)
 * @param {string} mode - Game mode ('daily', 'practice', 'locate')
 * @returns {Object} New game state
 * @deprecated Use store actions instead
 */
export function createGameState(mode = 'daily') {
    return {
        targetCounty: null,
        guesses: [],
        status: 'playing',
        mode: mode,
        gameNumber: 0
    };
}

/**
 * Get maximum guesses based on current difficulty from store
 * @returns {number} Maximum number of guesses
 */
export function getMaxGuesses() {
    const state = store.getState();
    return state.settings.difficulty === 'hard' ? 4 : 6;
}

// ============================================
// BACKWARDS COMPATIBILITY LAYER
// These are temporary exports for gradual migration
// TODO: Remove these once all modules are refactored
// ============================================

/**
 * @deprecated Use store.getState().game instead
 */
export const gameState = new Proxy({}, {
    get(target, prop) {
        console.warn('Direct gameState access is deprecated. Use store.getState().game instead');
        return store.getState().game[prop];
    }
});

/**
 * @deprecated Use store.getState().statistics instead
 */
export const statistics = new Proxy({}, {
    get(target, prop) {
        console.warn('Direct statistics access is deprecated. Use store.getState().statistics instead');
        return store.getState().statistics[prop];
    }
});

/**
 * @deprecated Use store.getState().settings instead
 */
export const settings = new Proxy({}, {
    get(target, prop) {
        console.warn('Direct settings access is deprecated. Use store.getState().settings instead');
        return store.getState().settings[prop];
    }
});

/**
 * @deprecated Use store.setState with actions instead
 */
export function setGameState(newState) {
    console.warn('setGameState is deprecated. Use store.setState with actions instead');
    store.setState({ game: newState }, 'setGameState (deprecated)');
}

/**
 * @deprecated Use store.setState with actions instead
 */
export function setStatistics(newStats) {
    console.warn('setStatistics is deprecated. Use store.setState with actions instead');
    store.setState({ statistics: newStats }, 'setStatistics (deprecated)');
}

/**
 * @deprecated Use store.setState with actions instead
 */
export function setSettings(newSettings) {
    console.warn('setSettings is deprecated. Use store.setState with actions instead');
    store.setState({ settings: newSettings }, 'setSettings (deprecated)');
}
