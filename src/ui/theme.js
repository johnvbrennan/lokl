// ============================================
// THEME MANAGEMENT
// Functions for light/dark theme toggling
// ============================================

import { store } from '../game/gameState.js';
import { setTheme as setThemeAction, toggleTheme as toggleThemeAction } from '../store/actions.js';

/**
 * Initialize theme from store and set up DOM
 * @param {Function} updateMapTiles - Callback to update map tiles
 * @param {Function} updateAllMapBorders - Callback to update map borders
 */
export function initTheme(updateMapTiles, updateAllMapBorders) {
    const state = store.getState();
    const theme = state.settings.theme;

    // Apply theme to DOM
    applyThemeToDOM(theme, updateMapTiles, updateAllMapBorders);

    // Subscribe to theme changes
    store.subscribe((newState, oldState) => {
        if (newState.settings.theme !== oldState.settings.theme) {
            applyThemeToDOM(newState.settings.theme, updateMapTiles, updateAllMapBorders);
        }
    });
}

/**
 * Set the theme
 * @param {string} theme - Theme name ('light' or 'dark')
 * @param {Function} updateMapTiles - Callback to update map tiles
 * @param {Function} updateAllMapBorders - Callback to update map borders
 */
export function setTheme(theme, updateMapTiles, updateAllMapBorders) {
    store.setState(setThemeAction(theme), 'setTheme');
    // DOM update happens via subscription
}

/**
 * Toggle between light and dark theme
 * @param {Function} updateMapTiles - Callback to update map tiles
 * @param {Function} updateAllMapBorders - Callback to update map borders
 */
export function toggleTheme(updateMapTiles, updateAllMapBorders) {
    store.setState(toggleThemeAction(), 'toggleTheme');
    // DOM update happens via subscription
}

/**
 * Apply theme to DOM
 * @param {string} theme - Theme to apply
 * @param {Function} updateMapTiles - Callback to update map tiles
 * @param {Function} updateAllMapBorders - Callback to update map borders
 */
function applyThemeToDOM(theme, updateMapTiles, updateAllMapBorders) {
    const currentTheme = document.documentElement.getAttribute('data-theme');

    // Only update if theme is different to prevent unnecessary reflows
    if (currentTheme !== theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (updateMapTiles) updateMapTiles(theme);
        if (updateAllMapBorders) updateAllMapBorders();
    }

    // Always update button to ensure it's in sync
    updateThemeButton(theme);
}

/**
 * Update theme button icon and tooltip
 * @param {string} theme - Current theme (optional, reads from store if not provided)
 */
export function updateThemeButton(theme) {
    if (!theme) {
        const state = store.getState();
        theme = state.settings.theme;
    }

    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;

    const icon = btn.querySelector('.menu-icon');
    const label = btn.querySelector('.menu-label');

    if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Update label to show the mode we're switching TO
    if (label) {
        label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

/**
 * Get current theme from store
 * @returns {string} Current theme ('light' or 'dark')
 */
export function getCurrentTheme() {
    const state = store.getState();
    return state.settings.theme;
}
