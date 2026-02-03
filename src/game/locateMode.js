// ============================================
// LOCATE MODE
// Functions specific to locate mode gameplay
// ============================================

import { getRandomCounty } from '../utils/dateUtils.js';
import { areAdjacent } from '../utils/calculations.js';
import { gameState, getMaxGuesses } from './gameState.js';
import { COUNTY_ADJACENCY } from '../data/adjacency.js';

/**
 * Initialize locate mode UI (state updates handled by caller)
 * @param {string} targetCounty - Target county to display
 * @param {Object} callbacks - UI callback functions
 */
export function initLocateModeUI(targetCounty, callbacks = {}) {
    const {
        clearGuessRail,
        resetMapColors,
        clearResultLine,
        updateModeBadge
    } = callbacks;

    // Clear guess pills immediately
    if (clearGuessRail) clearGuessRail();

    // Clear previous game state
    if (resetMapColors) resetMapColors();
    if (clearResultLine) clearResultLine();

    // Clear guess list
    const guessList = document.getElementById('guess-list');
    if (guessList) guessList.innerHTML = '';

    // Reset guess slots
    const maxGuesses = getMaxGuesses();
    for (let i = 0; i < 6; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (slot) {
            slot.style.backgroundColor = '';
            slot.classList.remove('filled', 'warning');
            slot.style.display = i < maxGuesses ? '' : 'none';
        }
    }

    // Reset stats display
    const statGuesses = document.getElementById('stat-guesses');
    const statClosest = document.getElementById('stat-closest');
    const statProvince = document.getElementById('stat-province');
    if (statGuesses) statGuesses.textContent = `0/${maxGuesses}`;
    if (statClosest) statClosest.textContent = '--';
    if (statProvince) statProvince.textContent = '--';

    // Switch UI - hide text input, show locate prompt
    const inputArea = document.getElementById('input-area');
    const locateArea = document.getElementById('locate-area');
    if (inputArea) inputArea.style.display = 'none';
    if (locateArea) locateArea.style.display = 'block';

    // Hide input dock
    const inputDock = document.getElementById('input-dock');
    if (inputDock) inputDock.style.display = 'none';

    // Show target county in header
    const floatingHeader = document.querySelector('.floating-header');
    const locateTargetInline = document.getElementById('locate-target-inline');
    if (floatingHeader) floatingHeader.classList.add('locate-mode');
    if (locateTargetInline) locateTargetInline.textContent = targetCounty;

    if (updateModeBadge) updateModeBadge();
}

/**
 * Exit locate mode and return to practice
 * @param {Function} initGame - Callback to initialize practice mode
 */
export function exitLocateMode(initGame) {
    // Switch back to normal UI
    const inputArea = document.getElementById('input-area');
    const locateArea = document.getElementById('locate-area');
    if (inputArea) inputArea.style.display = '';
    if (locateArea) locateArea.style.display = 'none';

    // Show input dock and remove locate mode from header
    const inputDock = document.getElementById('input-dock');
    const floatingHeader = document.querySelector('.floating-header');
    if (inputDock) inputDock.style.display = 'flex';
    if (floatingHeader) floatingHeader.classList.remove('locate-mode');

    // Return to practice mode
    if (initGame) initGame('practice');
}

/**
 * Start next locate round UI (state updates handled by caller)
 * @param {string} targetCounty - New target county to display
 * @param {Object} callbacks - UI callback functions
 */
export function startNextLocateRoundUI(targetCounty, callbacks = {}) {
    const {
        resetUI,
        clearGuessRail,
        updateGuessCounterPill
    } = callbacks;

    // Update target county in header
    const locateTargetInline = document.getElementById('locate-target-inline');
    if (locateTargetInline) locateTargetInline.textContent = targetCounty;

    // Clear guess rail
    if (clearGuessRail) clearGuessRail();
    if (updateGuessCounterPill) updateGuessCounterPill();

    if (resetUI) resetUI();
}

/**
 * Get adjacent county hints for locate mode
 * @param {string} targetCounty - The target county name
 * @returns {Array<string>} Array of adjacent county names
 */
export function getAdjacentHints(targetCounty) {
    return COUNTY_ADJACENCY[targetCounty] || [];
}

/**
 * Process a locate mode guess (clicking on map)
 * @param {string} countyName - Name of clicked county
 * @param {Function} processGuess - The main processGuess function
 * @returns {Object|null} Guess object or null
 */
export function processLocateGuess(countyName, processGuess) {
    if (gameState.mode !== 'locate') return null;
    return processGuess(countyName);
}
