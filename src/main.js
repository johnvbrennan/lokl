// ============================================
// MAIN.JS - Application Orchestration Layer
// ============================================

// Data imports
import { COUNTIES, COUNTY_NAMES } from './data/counties.js';

// Utility imports
import { COLORS, COLOR_EMOJIS, DIRECTION_ARROWS } from './utils/constants.js';
import { getTodaysDateString, getGameNumber, getTimeUntilNextDay, formatTimeRemaining } from './utils/dateUtils.js';

// Map imports
import {
    initMap,
    updateMapTiles,
    setMapClickHandler,
    updateMapCounty,
    resetMapColors,
    highlightCounty,
    unhighlightCounty,
    updateAllMapBorders
} from './map/mapController.js';

// Storage imports
import { loadStatistics, loadSettings, saveSettings, setupPersistenceSubscriptions } from './storage/persistence.js';

// Game imports
import { store, getMaxGuesses } from './game/gameState.js';
import { setDifficulty } from './store/actions.js';
import { initGame, processGuess } from './game/gameLogic.js';
import { initLocateMode, exitLocateMode, startNextLocateRound } from './game/locateMode.js';

// Helper functions to get state
const getGame = () => store.getState().game;
const getSettings = () => store.getState().settings;
const getStats = () => store.getState().statistics;

// UI imports
import {
    updateGuessCounter,
    updateStatsBar,
    addGuessToHistory,
    refreshGuessHistory,
    updateModeBadge,
    showEndModal,
    hideModal,
    showHelp,
    hideHelp,
    shareResult,
    renderDistribution,
    updateGuessCounterPill,
    updateGuessRail,
    clearGuessRail,
    togglePanel,
    updateStartScreenDifficulty,
    updateWarningState,
    startCountdown,
    stopCountdown
} from './ui/components.js';

import {
    getAutocompleteMatches,
    showAutocomplete,
    hideAutocomplete,
    showAutocompleteNew,
    hideAutocompleteNew,
    updateSubmitButtonState,
    updateSubmitButtonStateNew
} from './ui/autocomplete.js';

import { initTheme, toggleTheme, setTheme } from './ui/theme.js';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Update stats display in header
 */
function updateStats() {
    updateStatsBar();
}

/**
 * Update difficulty display
 */
function updateDifficultyDisplay() {
    const diffBtn = document.getElementById('difficulty-toggle-btn');
    if (!diffBtn) return;

    const diffNames = {
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard'
    };

    diffBtn.textContent = diffNames[getSettings().difficulty] || getSettings().difficulty;
}

/**
 * Clear result line on map
 */
function clearResultLine() {
    // Placeholder for clearing any drawn lines on the map
    // Future enhancement could show a line from guess to target
}

/**
 * Show tutorial overlay
 */
function showTutorial() {
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    if (!tutorialOverlay) return;

    // Only show if user hasn't seen it before
    const hasSeenTutorial = localStorage.getItem('loklHasSeenTutorial');
    if (hasSeenTutorial) return;

    tutorialOverlay.classList.add('visible');
}

/**
 * Hide tutorial overlay
 */
function hideTutorial() {
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    if (!tutorialOverlay) return;

    tutorialOverlay.classList.remove('visible');
    localStorage.setItem('loklHasSeenTutorial', 'true');
}

/**
 * Initialize start screen event listeners
 */
function initStartScreenListeners() {
    const startOverlay = document.getElementById('start-overlay');
    if (!startOverlay) return;

    // Daily challenge button
    document.getElementById('start-daily')?.addEventListener('click', () => {
        startOverlay.classList.remove('visible');
        handleInitGame('daily');
    });

    // Practice button
    document.getElementById('start-practice')?.addEventListener('click', () => {
        startOverlay.classList.remove('visible');
        handleInitGame('practice');
    });

    // Locate mode button
    document.getElementById('start-locate')?.addEventListener('click', () => {
        startOverlay.classList.remove('visible');
        handleInitLocateMode();
    });

    // Close tutorial button
    document.getElementById('close-tutorial')?.addEventListener('click', hideTutorial);
    document.getElementById('close-tutorial-x')?.addEventListener('click', hideTutorial);
}

/**
 * Update floating menu state
 */
function updateFloatingMenuState() {
    // Update any dynamic menu items based on current game state
    const menuStats = document.getElementById('menu-stats');
    if (menuStats) {
        menuStats.style.display = getGame().status !== 'playing' ? '' : 'none';
    }
}

/**
 * Clear input field
 */
function clearInput() {
    const input = document.getElementById('county-input');
    const inputNew = document.getElementById('county-input-new');
    if (input) input.value = '';
    if (inputNew) inputNew.value = '';
}

/**
 * Disable input when game is over
 */
function disableInput() {
    const input = document.getElementById('county-input');
    const inputNew = document.getElementById('county-input-new');
    if (input) input.disabled = true;
    if (inputNew) inputNew.disabled = true;
}

/**
 * Enable input for new game
 */
function enableInput() {
    const input = document.getElementById('county-input');
    const inputNew = document.getElementById('county-input-new');
    if (input) input.disabled = false;
    if (inputNew) inputNew.disabled = false;
}

/**
 * Show result line on map
 */
function showResultLine() {
    // Implementation would show a line from guess to target
    // This is a placeholder for future enhancement
}

/**
 * Reset UI for new game
 */
function resetUI() {
    const list = document.getElementById('guess-list');
    if (list) list.innerHTML = '';

    clearGuessRail();
    resetMapColors(getGame().mode);
    clearResultLine();
    enableInput();
    clearInput();
    updateGuessCounter(highlightCounty, unhighlightCounty);
    updateModeBadge();

    const statGuesses = document.getElementById('stat-guesses');
    const statClosest = document.getElementById('stat-closest');
    const statProvince = document.getElementById('stat-province');
    if (statGuesses) statGuesses.textContent = `0/${getMaxGuesses()}`;
    if (statClosest) statClosest.textContent = '--';
    if (statProvince) statProvince.textContent = '--';
}

/**
 * Restore game UI from saved state
 */
function restoreGameUI() {
    const list = document.getElementById('guess-list');
    if (list) list.innerHTML = '';

    resetMapColors(getGame().mode);

    getGame().guesses.forEach((guess, index) => {
        updateMapCounty(guess.county, guess.color, guess.county === getGame().targetCounty);
        addGuessToHistory(guess, index + 1, highlightCounty, unhighlightCounty);
    });

    updateGuessCounter(highlightCounty, unhighlightCounty);
    updateStatsBar();
    updateGuessRail();
    updateGuessCounterPill();

    if (getGame().status !== 'playing') {
        disableInput();
    }
}

/**
 * Wrapper for processGuess with all callbacks
 */
function handleGuess(countyName) {
    return processGuess(countyName, {
        updateMapCounty,
        addGuessToHistory: (guess, number) => addGuessToHistory(guess, number, highlightCounty, unhighlightCounty),
        updateGuessCounter: () => updateGuessCounter(highlightCounty, unhighlightCounty),
        updateStatsBar,
        updateGuessRail,
        updateGuessCounterPill,
        startNextLocateRound: () => startNextLocateRound({
            resetUI,
            clearGuessRail,
            updateGuessCounterPill
        }),
        showEndModal: () => showEndModal(showResultLine),
        disableInput,
        clearInput,
        hideAutocomplete: () => {
            hideAutocomplete();
            hideAutocompleteNew();
        }
    });
}

/**
 * Wrapper for initGame with all callbacks
 */
function handleInitGame(mode = 'daily', suppressModal = false) {
    return initGame(mode, suppressModal, {
        resetUI,
        showEndModal: () => showEndModal(showResultLine),
        restoreGameUI,
        updateModeBadge,
        clearGuessRail
    });
}

/**
 * Wrapper for initLocateMode with all callbacks
 */
function handleInitLocateMode() {
    initLocateMode({
        clearGuessRail,
        resetMapColors: () => resetMapColors('locate'),
        clearResultLine,
        updateModeBadge
    });

    // Update map click handler for locate mode
    setMapClickHandler(handleGuess, 'locate', 'playing');
}

/**
 * Wrapper for exitLocateMode with all callbacks
 */
function handleExitLocateMode() {
    exitLocateMode(handleInitGame);

    // Update map click handler back to normal
    setMapClickHandler(null, getGame().mode, getGame().status);
}

// ============================================
// INITIALIZATION & EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Set up persistence subscriptions for auto-save
    setupPersistenceSubscriptions(store);

    // Initialize theme (reads from store, sets up subscriptions)
    initTheme(updateMapTiles, () => updateAllMapBorders(getGame().mode));

    // Initialize start screen listeners
    initStartScreenListeners();

    // Initialize map (this will call handleInitGame after GeoJSON loads)
    initMap(() => {
        handleInitGame('daily', true);
        setMapClickHandler(null, getGame().mode, getGame().status);
    });

    // ============================================
    // INPUT HANDLING - New Floating Input
    // ============================================

    const inputNew = document.getElementById('county-input-new');
    const submitBtnNew = document.getElementById('submit-btn-new');
    const autocompleteListNew = document.getElementById('autocomplete-list-new');

    let selectedIndexNew = -1;

    inputNew.addEventListener('input', (e) => {
        const matches = getAutocompleteMatches(e.target.value);
        showAutocompleteNew(matches, handleGuess);
        updateSubmitButtonStateNew();
    });

    inputNew.addEventListener('keydown', (e) => {
        const items = autocompleteListNew.querySelectorAll('.autocomplete-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndexNew = Math.min(selectedIndexNew + 1, items.length - 1);
            updateSelectionNew(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndexNew = Math.max(selectedIndexNew - 1, -1);
            updateSelectionNew(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndexNew >= 0 && items[selectedIndexNew]) {
                const county = items[selectedIndexNew].textContent;
                inputNew.value = county;
                hideAutocompleteNew();
                handleGuess(county);
            } else if (inputNew.value) {
                const matches = getAutocompleteMatches(inputNew.value);
                if (matches.length === 1) {
                    handleGuess(matches[0]);
                } else if (COUNTY_NAMES.includes(inputNew.value)) {
                    handleGuess(inputNew.value);
                }
            }
            selectedIndexNew = -1;
        } else if (e.key === 'Escape') {
            hideAutocompleteNew();
            selectedIndexNew = -1;
        }
    });

    function updateSelectionNew(items) {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === selectedIndexNew);
        });
    }

    submitBtnNew.addEventListener('click', () => {
        const value = inputNew.value.trim();
        const matches = getAutocompleteMatches(value);
        if (matches.length === 1) {
            handleGuess(matches[0]);
        } else if (COUNTY_NAMES.includes(value)) {
            handleGuess(value);
        }
    });

    // ============================================
    // INPUT HANDLING - Legacy Input
    // ============================================

    const input = document.getElementById('county-input');
    const submitBtn = document.getElementById('submit-btn');
    const autocompleteList = document.getElementById('autocomplete-list');

    let selectedIndex = -1;

    input.addEventListener('input', (e) => {
        const matches = getAutocompleteMatches(e.target.value);
        showAutocomplete(matches, handleGuess);
        updateSubmitButtonState();
    });

    input.addEventListener('keydown', (e) => {
        const items = autocompleteList.querySelectorAll('.autocomplete-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
                const county = items[selectedIndex].textContent;
                input.value = county;
                hideAutocomplete();
                handleGuess(county);
            } else if (input.value) {
                const matches = getAutocompleteMatches(input.value);
                if (matches.length === 1) {
                    handleGuess(matches[0]);
                } else if (COUNTY_NAMES.includes(input.value)) {
                    handleGuess(input.value);
                }
            }
            selectedIndex = -1;
        } else if (e.key === 'Escape') {
            hideAutocomplete();
            selectedIndex = -1;
        }
    });

    function updateSelection(items) {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === selectedIndex);
        });
    }

    submitBtn.addEventListener('click', () => {
        const value = input.value.trim();
        const matches = getAutocompleteMatches(value);
        if (matches.length === 1) {
            handleGuess(matches[0]);
        } else if (COUNTY_NAMES.includes(value)) {
            handleGuess(value);
        }
    });

    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.input-dock') && !e.target.closest('.input-wrapper')) {
            hideAutocomplete();
            hideAutocompleteNew();
        }
    });

    // ============================================
    // FLOATING MENU
    // ============================================

    const floatingMenu = document.getElementById('floating-menu');

    document.getElementById('floating-menu-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        floatingMenu.classList.toggle('visible');
        updateFloatingMenuState();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-container')) {
            floatingMenu.classList.remove('visible');
        }
    });

    document.getElementById('menu-new-game').addEventListener('click', () => {
        floatingMenu.classList.remove('visible');
        document.getElementById('guess-rail').innerHTML = '';
        document.getElementById('start-overlay').classList.add('visible');
        updateStartScreenDifficulty();
    });

    document.getElementById('menu-stats').addEventListener('click', () => {
        floatingMenu.classList.remove('visible');
        showEndModal(showResultLine);
    });

    document.getElementById('menu-help').addEventListener('click', () => {
        floatingMenu.classList.remove('visible');
        showHelp();
    });

    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
        toggleTheme(updateMapTiles, () => updateAllMapBorders(getGame().mode));
    });

    // ============================================
    // GAME MODE BUTTONS
    // ============================================

    document.getElementById('practice-btn').addEventListener('click', () => {
        if (getGame().mode === 'locate') {
            handleExitLocateMode();
            document.getElementById('practice-btn').innerHTML = '🎯 <span class="btn-text">Practice</span>';
            document.getElementById('practice-btn').title = 'Practice Mode (P)';
        } else if (getGame().mode === 'daily') {
            handleInitGame('practice');
            document.getElementById('practice-btn').innerHTML = '📅 <span class="btn-text">Daily</span>';
            document.getElementById('practice-btn').title = 'Return to Daily Challenge';
        } else {
            handleInitGame('daily', true);
            document.getElementById('practice-btn').innerHTML = '🎯 <span class="btn-text">Practice</span>';
            document.getElementById('practice-btn').title = 'Practice Mode (P)';
        }
    });

    document.getElementById('locate-btn').addEventListener('click', () => {
        if (getGame().mode === 'locate') {
            handleExitLocateMode();
            document.getElementById('locate-btn').innerHTML = '📍 <span class="btn-text">Locate</span>';
        } else {
            handleInitLocateMode();
            document.getElementById('locate-btn').innerHTML = '🔙 <span class="btn-text">Back</span>';
        }
    });

    // ============================================
    // MODAL & STATS
    // ============================================

    document.getElementById('stats-btn').addEventListener('click', () => {
        if (getGame().status !== 'playing') {
            showEndModal(showResultLine);
        }
    });

    document.getElementById('share-btn').addEventListener('click', shareResult);

    document.getElementById('play-again-btn').addEventListener('click', () => {
        hideModal();
        document.getElementById('start-overlay').classList.add('visible');
        updateStartScreenDifficulty();
    });

    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-overlay')) {
            hideModal();
            clearResultLine();
        }
    });

    // ============================================
    // HELP
    // ============================================

    document.getElementById('help-btn').addEventListener('click', showHelp);
    document.getElementById('close-help').addEventListener('click', hideHelp);
    document.getElementById('close-help-x').addEventListener('click', hideHelp);
    document.getElementById('help-overlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('help-overlay')) {
            hideHelp();
        }
    });

    // ============================================
    // SETTINGS
    // ============================================

    const settingsBtn = document.getElementById('settings-btn');
    const settingsDropdown = document.getElementById('settings-dropdown');

    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsDropdown.classList.toggle('visible');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.settings-container')) {
            settingsDropdown.classList.remove('visible');
        }
    });

    // Difficulty radio buttons
    document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            store.setState(setDifficulty(e.target.value), 'setDifficulty');
            refreshGuessHistory(highlightCounty, unhighlightCounty);
            updateModeBadge();
            updateDifficultyDisplay();
            updateGuessCounter(highlightCounty, unhighlightCounty);
            updateGuessCounterPill();
        });
    });

    // Mode badge click to cycle difficulty
    document.getElementById('mode-badge')?.addEventListener('click', () => {
        if (getGame().mode === 'locate') return;

        const difficulties = ['easy', 'medium', 'hard'];
        const currentIndex = difficulties.indexOf(getSettings().difficulty);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        const newDifficulty = difficulties[nextIndex];

        store.setState(setDifficulty(newDifficulty), 'setDifficulty');

        const radio = document.getElementById(`diff-${newDifficulty}`);
        if (radio) radio.checked = true;

        refreshGuessHistory(highlightCounty, unhighlightCounty);
        updateModeBadge();
        updateDifficultyDisplay();
        updateGuessCounter(highlightCounty, unhighlightCounty);
        updateGuessCounterPill();
    });

    // Difficulty toggle button in header
    document.getElementById('difficulty-toggle-btn')?.addEventListener('click', () => {
        const difficulties = ['easy', 'medium', 'hard'];
        const currentIndex = difficulties.indexOf(getSettings().difficulty);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        const newDifficulty = difficulties[nextIndex];

        store.setState(setDifficulty(newDifficulty), 'setDifficulty');

        const radio = document.getElementById(`diff-${newDifficulty}`);
        if (radio) radio.checked = true;

        refreshGuessHistory(highlightCounty, unhighlightCounty);
        updateModeBadge();
        updateDifficultyDisplay();
        updateGuessCounter(highlightCounty, unhighlightCounty);
        updateGuessCounterPill();
        updateStats();
    });

    // ============================================
    // PANEL TOGGLE
    // ============================================

    document.getElementById('panel-toggle').addEventListener('click', togglePanel);

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================

    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT') return;

        switch(e.key.toLowerCase()) {
            case '?':
                e.preventDefault();
                showHelp();
                break;
            case 'p':
                e.preventDefault();
                document.getElementById('practice-btn').click();
                break;
            case 'l':
                e.preventDefault();
                document.getElementById('locate-btn').click();
                break;
            case 'tab':
                e.preventDefault();
                togglePanel();
                break;
            case 'escape':
                hideHelp();
                hideModal();
                clearResultLine();
                hideTutorial();
                break;
        }
    });

    // Show tutorial for first-time users
    setTimeout(showTutorial, 1000);
});
