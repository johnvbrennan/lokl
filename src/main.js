// ============================================
// MAIN.JS - Application Orchestration Layer
// ============================================

// Data imports
import { COUNTIES, COUNTY_NAMES } from './data/counties.js';

// Utility imports
import { COLORS, COLOR_EMOJIS, DIRECTION_ARROWS } from './utils/constants.js';
import { getTodaysDateString, getGameNumber, getTimeUntilNextDay, formatTimeRemaining, getRandomCounty } from './utils/dateUtils.js';

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
import { loadStatistics, loadSettings, saveSettings, setupPersistenceSubscriptions, loadDailyState, saveTimeTrialSettings, clearTimeTrialState, loadTimeTrialState } from './storage/persistence.js';

// Game imports
import { store, getMaxGuesses } from './game/gameState.js';
import { setDifficulty, updateTimeTrialSettings, initLocateMode as initLocateModeAction, exitLocateMode as exitLocateModeAction, startNextLocateRound as startNextLocateRoundAction } from './store/actions.js';
import { initGame, processGuess } from './game/gameLogic.js';
import { initLocateModeUI, exitLocateMode, startNextLocateRoundUI } from './game/locateMode.js';
import { stopTimeTrialTimer, handleTimeout } from './game/timeTrialMode.js';

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
    stopCountdown,
    showStartScreen,
    updateTimerDisplay,
    updateTimerWarningState,
    showTimeTrialEndModal,
    updateTimeTrialSettingsUI,
    showGoAnimation,
    showSuccessAnimation,
    focusInput,
    cleanupTimerEffects
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

    // Store selected mode and difficulty
    let selectedMode = 'daily';
    let selectedDifficulty = getSettings().difficulty;

    // Mode card selection
    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            card.classList.add('selected');
            // Store selected mode
            selectedMode = card.dataset.mode;
        });
    });

    // Difficulty button selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selected class from all buttons
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
            // Add selected class to clicked button
            btn.classList.add('selected');
            // Store selected difficulty
            selectedDifficulty = btn.dataset.difficulty;
        });
    });

    // Start game button
    document.getElementById('start-game-btn')?.addEventListener('click', () => {
        startOverlay.classList.remove('visible');

        // Apply difficulty setting first
        if (selectedDifficulty !== getSettings().difficulty) {
            store.setState(setDifficulty(selectedDifficulty), 'setDifficulty');
            const radio = document.getElementById(`diff-${selectedDifficulty}`);
            if (radio) radio.checked = true;
        }

        // Start the game based on selected mode
        if (selectedMode === 'locate') {
            handleInitLocateMode();
        } else {
            handleInitGame(selectedMode);
        }
    });

    // How to play toggle
    document.getElementById('how-to-play-toggle')?.addEventListener('click', () => {
        const content = document.getElementById('how-to-play-content');
        const arrow = document.getElementById('how-to-play-arrow');
        if (content && arrow) {
            const isExpanded = content.style.display === 'block';
            content.style.display = isExpanded ? 'none' : 'block';
            arrow.textContent = isExpanded ? '▼' : '▲';
        }
    });
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
        updateGuessRail: () => updateGuessRail(highlightCounty, unhighlightCounty),
        updateGuessCounterPill,
        startNextLocateRound: () => {
            // 1. Generate new target county
            const newTargetCounty = getRandomCounty();

            // 2. Update store FIRST
            store.setState(startNextLocateRoundAction(newTargetCounty), 'startNextLocateRound');

            // 3. Update UI
            startNextLocateRoundUI(newTargetCounty, {
                resetUI,
                clearGuessRail,
                updateGuessCounterPill
            });
        },
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
    const result = initGame(mode, suppressModal, {
        resetUI,
        showEndModal: () => showEndModal(showResultLine),
        showTimeTrialEndModal: (won, timeElapsed, guessCount, targetCounty) => {
            showTimeTrialEndModal(won, timeElapsed, guessCount, targetCounty, showResultLine);
        },
        showSuccessAnimation,
        restoreGameUI,
        updateModeBadge,
        clearGuessRail,
        updateTimerDisplay,
        updateTimerWarningState,
        onTimeout: (targetCounty) => {
            updateMapCounty(targetCounty, COLORS.CORRECT, true);
        }
    });

    // Special handling for Time Trial mode
    if (mode === 'timetrial' && result) {
        // Show "GO!" animation
        showGoAnimation();

        // Auto-focus input after short delay (let GO animation show first)
        setTimeout(() => {
            focusInput();
        }, 500);
    } else if (result && (mode === 'practice' || mode === 'daily')) {
        // Auto-focus input for practice and daily modes too
        setTimeout(() => {
            focusInput();
        }, 100);
    }

    return result;
}

/**
 * Wrapper for initLocateMode with all callbacks
 */
function handleInitLocateMode() {
    // 1. Generate target county
    const targetCounty = getRandomCounty();

    // 2. Update store FIRST
    store.setState(initLocateModeAction(targetCounty), 'initLocateMode');

    // 3. Update UI
    initLocateModeUI(targetCounty, {
        clearGuessRail,
        resetMapColors: () => resetMapColors('locate'),
        clearResultLine,
        updateModeBadge
    });

    // 4. Set click handler AFTER state is updated
    const game = getGame();
    setMapClickHandler(handleGuess, game.mode, game.status);
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

    // Set up store subscription for timer updates
    store.subscribe((newState, oldState) => {
        // Update timer display for Time Trial mode
        if (newState.game.mode === 'timetrial' && newState.game.timerActive) {
            if (newState.game.timeRemaining !== oldState.game.timeRemaining) {
                updateTimerDisplay(newState.game.timeRemaining);
                updateTimerWarningState(newState.game.timeRemaining, newState.game.timeLimit);
            }
        }
    });

    // Initialize theme (reads from store, sets up subscriptions)
    initTheme(updateMapTiles, () => updateAllMapBorders(getGame().mode));

    // Initialize start screen listeners
    initStartScreenListeners();

    // Initialize map
    initMap(() => {
        // Check if there's a saved daily game to restore
        const savedDailyState = loadDailyState();
        const today = getTodaysDateString();
        const hasSavedGame = savedDailyState && savedDailyState.date === today;

        if (hasSavedGame) {
            // Restore the saved daily game
            handleInitGame('daily', true);
            setMapClickHandler(null, getGame().mode, getGame().status);
        } else {
            // Show start screen for new users or when no game is in progress
            showStartScreen();
        }
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

    document.getElementById('timetrial-btn').addEventListener('click', () => {
        if (getGame().mode === 'locate') {
            handleExitLocateMode();
        }
        handleInitGame('timetrial');
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

    // Time Trial settings sliders
    const ttEasySlider = document.getElementById('tt-easy');
    const ttMediumSlider = document.getElementById('tt-medium');
    const ttHardSlider = document.getElementById('tt-hard');

    if (ttEasySlider) {
        ttEasySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('tt-easy-val').textContent = value;
            store.setState(updateTimeTrialSettings({ easy: value }), 'updateTimeTrialSettings');
            saveTimeTrialSettings(store.getState().settings.timeTrialDurations);
        });
    }

    if (ttMediumSlider) {
        ttMediumSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('tt-medium-val').textContent = value;
            store.setState(updateTimeTrialSettings({ medium: value }), 'updateTimeTrialSettings');
            saveTimeTrialSettings(store.getState().settings.timeTrialDurations);
        });
    }

    if (ttHardSlider) {
        ttHardSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('tt-hard-val').textContent = value;
            store.setState(updateTimeTrialSettings({ hard: value }), 'updateTimeTrialSettings');
            saveTimeTrialSettings(store.getState().settings.timeTrialDurations);
        });
    }

    // Initialize Time Trial settings UI
    updateTimeTrialSettingsUI();

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
    // PAGE VISIBILITY API - Handle tab switching
    // ============================================

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && getGame().mode === 'timetrial' && getGame().timerActive) {
            // Tab became visible - recalculate timer
            const state = store.getState();
            const elapsed = (Date.now() - state.game.startTime) / 1000;
            const newRemaining = Math.max(0, state.game.timeLimit - elapsed);

            if (newRemaining === 0) {
                // Timer expired while tab was hidden
                stopTimeTrialTimer();
                handleTimeout({
                    onTimeout: (targetCounty) => {
                        updateMapCounty(targetCounty, COLORS.CORRECT, true);
                        showTimeTrialEndModal(false, 0, getGame().guesses.length, targetCounty, showResultLine);
                    }
                });
            }
        }
    });

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
