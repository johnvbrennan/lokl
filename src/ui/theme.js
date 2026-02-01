// ============================================
// THEME MANAGEMENT
// Functions for light/dark theme toggling
// ============================================

import { loadTheme, saveTheme } from '../storage/persistence.js';

// Track current theme
let currentTheme = 'light';

/**
 * Initialize theme from localStorage
 * @param {Function} updateMapTiles - Callback to update map tiles
 * @param {Function} updateAllMapBorders - Callback to update map borders
 */
export function initTheme(updateMapTiles, updateAllMapBorders) {
    const savedTheme = loadTheme();
    setTheme(savedTheme, updateMapTiles, updateAllMapBorders);
}

/**
 * Set the theme
 * @param {string} theme - Theme name ('light' or 'dark')
 * @param {Function} updateMapTiles - Callback to update map tiles
 * @param {Function} updateAllMapBorders - Callback to update map borders
 */
export function setTheme(theme, updateMapTiles, updateAllMapBorders) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
    updateThemeButton();

    if (updateMapTiles) updateMapTiles(theme);
    if (updateAllMapBorders) updateAllMapBorders();
}

/**
 * Toggle between light and dark theme
 * @param {Function} updateMapTiles - Callback to update map tiles
 * @param {Function} updateAllMapBorders - Callback to update map borders
 */
export function toggleTheme(updateMapTiles, updateAllMapBorders) {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme, updateMapTiles, updateAllMapBorders);
}

/**
 * Update theme button icon and tooltip
 */
export function updateThemeButton() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;

    const icon = btn.querySelector('.menu-icon');
    if (icon) {
        icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
    btn.title = currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

/**
 * Get current theme
 * @returns {string} Current theme ('light' or 'dark')
 */
export function getCurrentTheme() {
    return currentTheme;
}
