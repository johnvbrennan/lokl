// ============================================
// AUTOCOMPLETE
// Functions for autocomplete functionality
// ============================================

import { COUNTY_NAMES } from '../data/counties.js';
import { gameState } from '../game/gameState.js';

/**
 * Get autocomplete matches for input
 * @param {string} input - User input text
 * @returns {Array<string>} Array of matching county names
 */
export function getAutocompleteMatches(input) {
    if (!input) return [];
    const guessedCounties = gameState.guesses.map(g => g.county);
    return COUNTY_NAMES.filter(name =>
        name.toLowerCase().startsWith(input.toLowerCase()) &&
        !guessedCounties.includes(name)
    );
}

/**
 * Show autocomplete dropdown (old input)
 * @param {Array<string>} matches - Array of matching county names
 * @param {Function} processGuess - Callback to process guess
 */
export function showAutocomplete(matches, processGuess) {
    const list = document.getElementById('autocomplete-list');
    if (!list) return;

    list.innerHTML = '';

    if (matches.length === 0) {
        hideAutocomplete();
        return;
    }

    matches.forEach((county, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = county;
        item.dataset.index = index;
        item.addEventListener('click', () => {
            const input = document.getElementById('county-input');
            if (input) input.value = county;
            hideAutocomplete();
            if (processGuess) processGuess(county);
        });
        list.appendChild(item);
    });

    list.classList.add('visible');
}

/**
 * Hide autocomplete dropdown (old input)
 */
export function hideAutocomplete() {
    const list = document.getElementById('autocomplete-list');
    if (list) list.classList.remove('visible');
}

/**
 * Show autocomplete dropdown (new floating input)
 * @param {Array<string>} matches - Array of matching county names
 * @param {Function} processGuess - Callback to process guess
 */
export function showAutocompleteNew(matches, processGuess) {
    const list = document.getElementById('autocomplete-list-new');
    if (!list) return;

    list.innerHTML = '';

    if (matches.length === 0) {
        hideAutocompleteNew();
        return;
    }

    matches.forEach((county, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = county;
        item.dataset.index = index;
        item.addEventListener('click', () => {
            const input = document.getElementById('county-input-new');
            if (input) input.value = county;
            hideAutocompleteNew();
            if (processGuess) processGuess(county);
        });
        list.appendChild(item);
    });

    list.classList.add('visible');
}

/**
 * Hide autocomplete dropdown (new floating input)
 */
export function hideAutocompleteNew() {
    const list = document.getElementById('autocomplete-list-new');
    if (list) list.classList.remove('visible');
}

/**
 * Update submit button state based on input validity (old input)
 */
export function updateSubmitButtonState() {
    const input = document.getElementById('county-input');
    const btn = document.getElementById('submit-btn');
    if (!input || !btn) return;

    const value = input.value.trim();
    const matches = getAutocompleteMatches(value);
    const isValid = matches.length === 1 || COUNTY_NAMES.includes(value);

    if (isValid && gameState.status === 'playing') {
        btn.classList.add('ready');
    } else {
        btn.classList.remove('ready');
    }
}

/**
 * Update submit button state based on input validity (new floating input)
 */
export function updateSubmitButtonStateNew() {
    const input = document.getElementById('county-input-new');
    const btn = document.getElementById('submit-btn-new');
    if (!input || !btn) return;

    const value = input.value.trim();
    const matches = getAutocompleteMatches(value);

    if (matches.length === 1 || COUNTY_NAMES.includes(value)) {
        btn.classList.add('ready');
    } else {
        btn.classList.remove('ready');
    }
}
