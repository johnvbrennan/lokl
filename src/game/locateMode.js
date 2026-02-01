// ============================================
// LOCATE MODE
// Functions specific to locate mode gameplay
// ============================================

import { getRandomCounty } from '../utils/dateUtils.js';
import { areAdjacent } from '../utils/calculations.js';
import { gameState, getMaxGuesses } from './gameState.js';
import { COUNTY_ADJACENCY } from '../data/adjacency.js';

/**
 * Initialize locate mode
 * @param {Object} callbacks - UI callback functions
 */
export function initLocateMode(callbacks = {}) {
    const {
        clearGuessRail,
        resetMapColors,
        clearResultLine,
        updateModeBadge
    } = callbacks;

    // Clear guess pills immediately
    if (clearGuessRail) clearGuessRail();

    gameState.mode = 'locate';
    gameState.guesses = [];
    gameState.status = 'playing';

    // Pick a random target county
    const targetCounty = getRandomCounty();
    gameState.targetCounty = targetCounty;

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

    // Hide input dock, show locate dock
    const inputDock = document.getElementById('input-dock');
    const locateDock = document.getElementById('locate-dock');
    if (inputDock) inputDock.style.display = 'none';
    if (locateDock) locateDock.style.display = 'flex';

    // Show target county name
    const locateTarget = document.getElementById('locate-target');
    const locateHint = document.getElementById('locate-hint');
    if (locateTarget) locateTarget.textContent = targetCounty;
    if (locateHint) locateHint.textContent = 'Click on the map to find it!';

    // Also update the new locate dock
    const locateTargetNew = document.getElementById('locate-target-new');
    const locateHintNew = document.getElementById('locate-hint-new');
    if (locateTargetNew) locateTargetNew.textContent = targetCounty;
    if (locateHintNew) locateHintNew.textContent = 'Click on the map to find it!';

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

    // Show input dock, hide locate dock
    const inputDock = document.getElementById('input-dock');
    const locateDock = document.getElementById('locate-dock');
    if (inputDock) inputDock.style.display = 'flex';
    if (locateDock) locateDock.style.display = 'none';

    // Return to practice mode
    if (initGame) initGame('practice');
}

/**
 * Start next locate round
 * @param {Object} callbacks - UI callback functions
 */
export function startNextLocateRound(callbacks = {}) {
    const {
        resetUI,
        clearGuessRail,
        updateGuessCounterPill
    } = callbacks;

    // Pick a new random target
    gameState.targetCounty = getRandomCounty();
    gameState.guesses = [];
    gameState.status = 'playing';

    // Update UI
    const locateTarget = document.getElementById('locate-target');
    const locateHint = document.getElementById('locate-hint');
    if (locateTarget) locateTarget.textContent = gameState.targetCounty;
    if (locateHint) locateHint.textContent = 'Click on the map to find it!';

    // Update the new locate dock
    const locateTargetNew = document.getElementById('locate-target-new');
    const locateHintNew = document.getElementById('locate-hint-new');
    if (locateTargetNew) locateTargetNew.textContent = gameState.targetCounty;
    if (locateHintNew) locateHintNew.textContent = 'Click on the map to find it!';

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
