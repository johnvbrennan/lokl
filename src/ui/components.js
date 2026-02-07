// ============================================
// UI COMPONENTS
// Functions for updating UI elements
// ============================================

import { COUNTIES } from '../data/counties.js';
import { COLORS, COLOR_EMOJIS } from '../utils/constants.js';
import { store, getMaxGuesses } from '../game/gameState.js';
import { loadDailyState } from '../storage/persistence.js';
import { getTodaysDateString, getTimeUntilNextDay, formatTimeRemaining } from '../utils/dateUtils.js';
import { createConfetti } from './confetti.js';
import { formatTimeDisplay, getTimerColor } from '../game/timeTrialMode.js';
import { isTimeTrialMode } from '../store/selectors.js';

// Helper functions to get state slices
const getGame = () => store.getState().game;
const getStats = () => store.getState().statistics;
const getSettings = () => store.getState().settings;

/**
 * Update the guess counter display
 * @param {Function} highlightCounty - Callback to highlight county on map
 * @param {Function} unhighlightCounty - Callback to unhighlight county on map
 */
export function updateGuessCounter(highlightCounty, unhighlightCounty) {
    const maxGuesses = getMaxGuesses();
    const statGuesses = document.getElementById('stat-guesses');
    if (statGuesses) {
        statGuesses.textContent = `${getGame().guesses.length}/${maxGuesses}`;
    }

    // Update slot visibility based on max guesses
    for (let i = 0; i < 6; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (slot) {
            slot.style.display = i < maxGuesses ? '' : 'none';
        }
    }

    getGame().guesses.forEach((guess, index) => {
        const slot = document.getElementById(`slot-${index}`);
        if (slot) {
            slot.style.backgroundColor = guess.color;
            slot.classList.add('filled');
        }
    });

    updateWarningState();
}

/**
 * Update the stats bar with closest guess and province
 */
export function updateStatsBar() {
    if (getGame().guesses.length === 0) return;

    const closest = getGame().guesses.reduce((min, g) => g.distance < min.distance ? g : min);
    const showDistance = getSettings().difficulty === 'easy' || getSettings().difficulty === 'medium';

    const statClosest = document.getElementById('stat-closest');
    const statProvince = document.getElementById('stat-province');

    if (statClosest) {
        statClosest.textContent = showDistance ? `${closest.distance} km` : '--';
    }
    if (statProvince) {
        statProvince.textContent = closest.province.substring(0, 4);
    }
}

/**
 * Add a guess to the history list
 * @param {Object} guess - Guess object
 * @param {number} number - Guess number
 * @param {Function} highlightCounty - Callback to highlight county on map
 * @param {Function} unhighlightCounty - Callback to unhighlight county on map
 */
export function addGuessToHistory(guess, number, highlightCounty, unhighlightCounty) {
    const list = document.getElementById('guess-list');
    if (!list) return;

    const isCorrect = guess.county === getGame().targetCounty;

    // Determine what to show based on difficulty
    const showDistance = getSettings().difficulty === 'easy' || getSettings().difficulty === 'medium';
    const showDirection = getSettings().difficulty === 'easy' || getSettings().difficulty === 'hard';

    const item = document.createElement('div');
    item.className = `guess-item${isCorrect ? ' correct' : ''}${guess.isAdjacent ? ' adjacent' : ''}`;
    item.dataset.county = guess.county;
    item.innerHTML = `
        <span class="guess-number">${number}</span>
        <span class="guess-color" style="background-color: ${guess.color}"></span>
        <span class="guess-name">${guess.county}</span>
        ${showDistance ? `<span class="guess-distance">${guess.distance} km</span>` : ''}
        ${showDirection ? `<span class="guess-direction">${guess.direction}</span>` : ''}
        ${guess.isAdjacent && !isCorrect ? '<span class="adjacent-badge" title="Borders the target county!">🔗</span>' : ''}
        ${isCorrect ? '<span class="target-emoji">🎯</span>' : ''}
    `;

    // Add hover events for map highlighting
    if (highlightCounty && unhighlightCounty) {
        item.addEventListener('mouseenter', () => highlightCounty(guess.county));
        item.addEventListener('mouseleave', () => unhighlightCounty(guess.county));
    }

    list.insertBefore(item, list.firstChild);
}

/**
 * Refresh the entire guess history
 * @param {Function} highlightCounty - Callback to highlight county on map
 * @param {Function} unhighlightCounty - Callback to unhighlight county on map
 */
export function refreshGuessHistory(highlightCounty, unhighlightCounty) {
    const list = document.getElementById('guess-list');
    if (!list) return;

    list.innerHTML = '';
    getGame().guesses.forEach((guess, index) => {
        addGuessToHistory(guess, index + 1, highlightCounty, unhighlightCounty);
    });
}

/**
 * Update the mode badge display
 */
export function updateModeBadge() {
    const badge = document.getElementById('mode-badge');
    if (!badge) return;

    badge.classList.remove('practice', 'locate', 'timetrial', 'streak');

    // Build badge text with difficulty for non-locate modes
    let modeText = '';
    if (getGame().mode === 'locate') {
        modeText = 'Locate';
        badge.classList.add('locate');
        badge.title = 'Locate Mode - Click counties to find them';
    } else if (getGame().mode === 'practice') {
        modeText = 'Practice';
        badge.classList.add('practice');
    } else if (getGame().mode === 'timetrial') {
        modeText = '⏱️ Time Trial';
        badge.classList.add('timetrial');
        badge.title = 'Time Trial Mode - Race against the clock!';
    } else if (getGame().mode === 'streak') {
        modeText = '🔥 Streak';
        badge.classList.add('streak');
        badge.title = 'Streak Mode - One click, pass or fail!';
    } else {
        modeText = 'Daily';
    }

    // Add difficulty indicator for guess modes with full names
    if (getGame().mode !== 'locate' && getGame().mode !== 'timetrial' && getGame().mode !== 'streak') {
        const diffNames = {
            'easy': 'Easy',
            'medium': 'Medium',
            'hard': 'Hard'
        };
        const diffDescriptions = {
            'easy': 'Distance + Direction',
            'medium': 'Distance only',
            'hard': 'Direction only, 4 guesses'
        };

        const diffName = diffNames[getSettings().difficulty] || getSettings().difficulty;
        modeText += ` • ${diffName}`;
        badge.title = `${modeText} (${diffDescriptions[getSettings().difficulty]})`;
    }

    badge.textContent = modeText;
}

/**
 * Show the end game modal
 * @param {Function} showResultLine - Callback to show result line on map
 */
export function showEndModal(showResultLine) {
    const isWin = getGame().status === 'won';
    const county = COUNTIES[getGame().targetCounty];

    const modalTitle = document.getElementById('modal-title');
    const starsEl = document.getElementById('modal-stars');
    const modalCounty = document.getElementById('modal-county');
    const modalFact = document.getElementById('modal-fact');
    const modalGuesses = document.getElementById('modal-guesses');
    const modalStreak = document.getElementById('modal-streak');
    const modalWinPct = document.getElementById('modal-win-pct');

    if (modalTitle) modalTitle.textContent = isWin ? 'Well Done!' : 'Game Over';

    if (starsEl) {
        if (isWin) {
            const guessCount = getGame().guesses.length;
            const ratings = ['🤯 Genius!', '🤩 Brilliant!', '😎 Great!', '😀 Good!', '🙂 Solid!', '😅 Phew!'];
            const stars = ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐', '⭐', '✔️'];
            starsEl.innerHTML = `${stars[guessCount - 1]}<br>${ratings[guessCount - 1]}`;
        } else {
            starsEl.textContent = '❌ Better luck next time!';
        }
    }

    if (modalCounty) modalCounty.textContent = getGame().targetCounty;
    if (modalFact) modalFact.textContent = county.fact;
    if (modalGuesses) modalGuesses.textContent = isWin ? getGame().guesses.length : 'X';
    if (modalStreak) modalStreak.textContent = getStats().currentStreak;
    if (modalWinPct) {
        modalWinPct.textContent = getStats().gamesPlayed > 0
            ? Math.round((getStats().gamesWon / getStats().gamesPlayed) * 100) + '%'
            : '0%';
    }

    renderDistribution(isWin ? getGame().guesses.length : null);

    const countdownContainer = document.getElementById('countdown-container');
    if (countdownContainer) {
        if (getGame().mode === 'daily') {
            countdownContainer.style.display = 'block';
            startCountdown();
        } else {
            countdownContainer.style.display = 'none';
        }
    }

    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) modalOverlay.classList.add('visible');

    // Show line connecting last guess to target
    if (!isWin && showResultLine) {
        showResultLine();
    }

    if (isWin) {
        createConfetti();
    }
}

/**
 * Hide the end game modal
 */
export function hideModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) modalOverlay.classList.remove('visible');
}

/**
 * Render the guess distribution chart
 * @param {number|null} currentGuesses - Current game's guess count (for highlighting)
 */
export function renderDistribution(currentGuesses) {
    const bars = document.getElementById('distribution-bars');
    if (!bars) return;

    bars.innerHTML = '';

    const maxCount = Math.max(...getStats().distribution, 1);

    for (let i = 0; i < 6; i++) {
        const count = getStats().distribution[i];
        const percentage = (count / maxCount) * 100;
        const isCurrent = currentGuesses === i + 1;

        const row = document.createElement('div');
        row.className = 'distribution-row';
        row.innerHTML = `
            <span class="distribution-label">${i + 1}</span>
            <div class="distribution-bar-container">
                <div class="distribution-bar${isCurrent ? ' current' : ''}"
                     style="width: ${Math.max(percentage, count > 0 ? 10 : 0)}%">
                    ${count > 0 ? count : ''}
                </div>
            </div>
        `;
        bars.appendChild(row);
    }
}

/**
 * Show the help modal
 */
export function showHelp() {
    const helpOverlay = document.getElementById('help-overlay');
    if (helpOverlay) helpOverlay.classList.add('visible');
}

/**
 * Hide the help modal
 */
export function hideHelp() {
    const helpOverlay = document.getElementById('help-overlay');
    if (helpOverlay) helpOverlay.classList.remove('visible');
}

/**
 * Show the start screen
 */
export function showStartScreen() {
    const guessRail = document.getElementById('guess-rail');
    if (guessRail) guessRail.innerHTML = '';

    const startOverlay = document.getElementById('start-overlay');
    if (startOverlay) startOverlay.classList.add('visible');

    updateStartScreenDifficulty();

    // Check if daily challenge is already complete
    const savedDaily = loadDailyState();
    const today = getTodaysDateString();
    const dailyCard = document.querySelector('.mode-card[data-mode="daily"]');

    if (savedDaily && savedDaily.date === today && savedDaily.status !== 'playing') {
        // Daily already completed - disable it
        if (dailyCard) {
            dailyCard.style.opacity = '0.5';
            dailyCard.style.pointerEvents = 'none';
            dailyCard.style.cursor = 'not-allowed';
            const desc = dailyCard.querySelector('.mode-desc');
            if (desc) desc.textContent = 'Already completed today! Come back tomorrow.';
        }
        // Auto-select practice mode instead
        document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
        const practiceCard = document.querySelector('.mode-card[data-mode="practice"]');
        if (practiceCard) {
            practiceCard.classList.add('selected');
        }
    } else {
        // Daily available - reset card appearance
        if (dailyCard) {
            dailyCard.style.opacity = '1';
            dailyCard.style.pointerEvents = 'auto';
            dailyCard.style.cursor = 'pointer';
            const desc = dailyCard.querySelector('.mode-desc');
            if (desc) desc.textContent = 'Same county for everyone, one puzzle per day.';
        }
    }
}

/**
 * Hide the start screen
 */
export function hideStartScreen() {
    const startOverlay = document.getElementById('start-overlay');
    if (startOverlay) startOverlay.classList.remove('visible');
    localStorage.setItem('loklTutorialSeen', 'true');
}

/**
 * Update start screen difficulty buttons
 */
export function updateStartScreenDifficulty() {
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.difficulty === getSettings().difficulty);
    });
}

/**
 * Enable input fields
 */
export function enableInput() {
    const countyInput = document.getElementById('county-input');
    const submitBtn = document.getElementById('submit-btn');
    const countyInputNew = document.getElementById('county-input-new');
    const submitBtnNew = document.getElementById('submit-btn-new');

    if (countyInput) countyInput.disabled = false;
    if (submitBtn) submitBtn.disabled = false;
    if (countyInputNew) countyInputNew.disabled = false;
    if (submitBtnNew) submitBtnNew.disabled = false;
}

/**
 * Disable input fields
 */
export function disableInput() {
    const countyInput = document.getElementById('county-input');
    const submitBtn = document.getElementById('submit-btn');
    const countyInputNew = document.getElementById('county-input-new');
    const submitBtnNew = document.getElementById('submit-btn-new');

    if (countyInput) countyInput.disabled = true;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.remove('ready');
    }
    if (countyInputNew) countyInputNew.disabled = true;
    if (submitBtnNew) {
        submitBtnNew.disabled = true;
        submitBtnNew.classList.remove('ready');
    }
}

/**
 * Update warning state for low guesses remaining
 */
export function updateWarningState() {
    const guessCount = getGame().guesses.length;
    for (let i = 0; i < 6; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (slot) slot.classList.remove('warning');
    }

    // Warn on guess 5 and 6
    if (guessCount >= 4 && getGame().status === 'playing') {
        const nextSlot = document.getElementById(`slot-${guessCount}`);
        if (nextSlot) nextSlot.classList.add('warning');
    }
}

/**
 * Toggle the game panel (collapse/expand)
 * @param {Object} map - Leaflet map instance
 */
export function togglePanel(map) {
    const panel = document.getElementById('game-panel');
    const toggle = document.getElementById('panel-toggle');

    if (panel) panel.classList.toggle('collapsed');
    if (toggle) {
        toggle.innerHTML = panel?.classList.contains('collapsed') ? '&#9654;' : '&#9664;';
    }

    // Resize map after panel toggle
    setTimeout(() => {
        if (map) map.invalidateSize();
    }, 350);
}

/**
 * Update guess rail with horizontal pills
 * @param {Function} highlightCounty - Optional callback to highlight county on map
 * @param {Function} unhighlightCounty - Optional callback to unhighlight county on map
 */
export function updateGuessRail(highlightCounty, unhighlightCounty) {
    const rail = document.getElementById('guess-rail');
    if (!rail) return;

    rail.innerHTML = '';

    // Get difficulty settings to determine what info to show
    const difficulty = getSettings().difficulty;
    const showDistance = difficulty === 'easy' || difficulty === 'medium';
    const showDirection = difficulty === 'easy' || difficulty === 'hard';

    getGame().guesses.forEach((guess, index) => {
        const pill = document.createElement('div');
        pill.className = 'guess-pill glass neon-border';
        pill.style.borderColor = guess.color;
        pill.style.boxShadow = `0 0 10px ${guess.color}40`;

        const isCorrect = guess.county === getGame().targetCounty;
        if (isCorrect) {
            pill.classList.add('correct');
        }

        // Make pill interactive if highlight callbacks are provided
        if (highlightCounty && unhighlightCounty) {
            pill.style.cursor = 'pointer';
            pill.dataset.county = guess.county;

            // Add hover/click handlers to highlight county on map
            pill.addEventListener('mouseenter', () => highlightCounty(guess.county));
            pill.addEventListener('mouseleave', () => unhighlightCounty(guess.county));
            pill.addEventListener('click', () => {
                // Flash highlight on click for mobile
                highlightCounty(guess.county);
                setTimeout(() => unhighlightCounty(guess.county), 1000);
            });
        }

        // Build pill content with county abbreviation and conditional info
        const countyAbbr = guess.county.substring(0, 3).toUpperCase();

        let content = `<span class="guess-name">${countyAbbr}</span>`;

        if (showDistance && showDirection) {
            // Easy: Show both
            content += `<span class="guess-distance">${guess.distance}km</span>`;
            content += `<span class="guess-direction">${guess.direction}</span>`;
        } else if (showDistance) {
            // Medium: Distance only
            content += `<span class="guess-distance">${guess.distance}km</span>`;
        } else if (showDirection) {
            // Hard: Direction only
            content += `<span class="guess-direction">${guess.direction}</span>`;
        }

        pill.innerHTML = content;
        rail.appendChild(pill);
    });
}

/**
 * Update guess counter pill
 */
export function updateGuessCounterPill() {
    const pill = document.getElementById('guess-counter-pill');
    if (pill) {
        if (getGame().mode === 'streak') {
            pill.textContent = `🔥 ${getGame().streakCount || 0}`;
            pill.setAttribute('data-mode', 'streak');
        } else if (!isTimeTrialMode(store.getState())) {
            pill.textContent = `${getGame().guesses.length}/${getMaxGuesses()}`;
            pill.removeAttribute('data-mode');
        }
    }
}

/**
 * Reset UI to initial state
 * @param {Function} resetMapColors - Callback to reset map colors
 * @param {Function} clearResultLine - Callback to clear result line
 * @param {Function} updateSubmitButtonState - Callback to update submit button
 */
export function resetUI(resetMapColors, clearResultLine, updateSubmitButtonState) {
    if (resetMapColors) resetMapColors();
    if (clearResultLine) clearResultLine();

    const maxGuesses = getMaxGuesses();
    for (let i = 0; i < 6; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (slot) {
            slot.style.backgroundColor = '';
            slot.classList.remove('filled', 'warning');
            slot.style.display = i < maxGuesses ? '' : 'none';
        }
    }

    const guessList = document.getElementById('guess-list');
    if (guessList) guessList.innerHTML = '';

    const statGuesses = document.getElementById('stat-guesses');
    const statClosest = document.getElementById('stat-closest');
    const statProvince = document.getElementById('stat-province');
    if (statGuesses) statGuesses.textContent = `0/${maxGuesses}`;
    if (statClosest) statClosest.textContent = '--';
    if (statProvince) statProvince.textContent = '--';

    // Reset floating UI elements
    const guessRail = document.getElementById('guess-rail');
    const guessCounterPill = document.getElementById('guess-counter-pill');
    if (guessRail) guessRail.innerHTML = '';
    if (guessCounterPill) guessCounterPill.textContent = `0/${maxGuesses}`;

    enableInput();
    if (updateSubmitButtonState) updateSubmitButtonState();
}

/**
 * Restore game UI from saved state
 * @param {Function} updateMapCounty - Callback to update map county
 * @param {Function} highlightCounty - Callback to highlight county
 * @param {Function} unhighlightCounty - Callback to unhighlight county
 * @param {Function} resetUI - Callback to reset UI
 */
export function restoreGameUI(updateMapCounty, highlightCounty, unhighlightCounty, resetUI) {
    if (resetUI) resetUI();

    getGame().guesses.forEach((guess, index) => {
        if (updateMapCounty) {
            updateMapCounty(guess.county, guess.color, guess.county === getGame().targetCounty);
        }
        addGuessToHistory(guess, index + 1, highlightCounty, unhighlightCounty);
    });

    updateGuessCounter();
    updateGuessRail(highlightCounty, unhighlightCounty);
    updateGuessCounterPill();
    updateStatsBar();

    if (getGame().status !== 'playing') {
        disableInput();
        if (getGame().status === 'lost' && updateMapCounty) {
            updateMapCounty(getGame().targetCounty, COLORS.CORRECT, true);
        }
    }
}

/**
 * Share game result using Web Share API on mobile, clipboard on desktop
 */
export function shareResult() {
    const isWin = getGame().status === 'won';
    const emojis = getGame().guesses.map(g => {
        if (g.isAdjacent && g.county !== getGame().targetCounty) return '🔗';
        return COLOR_EMOJIS[g.color] || '⬜';
    }).join('');
    const score = isWin ? getGame().guesses.length : 'X';
    const difficultyLabel = getSettings().difficulty.charAt(0).toUpperCase() + getSettings().difficulty.slice(1);

    // Create engaging share text with results
    const resultEmoji = isWin ? '✅' : '❌';
    const resultText = isWin ? `Solved in ${score} guess${score === 1 ? '' : 'es'}!` : 'Gave it my best shot!';

    // Include URL directly in text for better WhatsApp/social media compatibility
    const shareText = `${resultEmoji} Lokl #${getGame().gameNumber} - ${score}/6 (${difficultyLabel})

${resultText}
${emojis}

Can you guess the Irish county? 🇮🇪
https://lokl.ie`;

    // Use Web Share API on mobile devices (opens native share sheet)
    // Note: Only using 'text' parameter because WhatsApp and other apps
    // ignore text content when both text and url are provided separately
    if (navigator.share && /mobile|android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
        navigator.share({
            text: shareText
        })
        .then(() => {
            // Share was successful - no feedback needed as user sees native UI
            console.log('Shared successfully');
        })
        .catch(err => {
            // User cancelled or share failed - fall back to clipboard
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
                fallbackToCopy(shareText);
            }
        });
    } else {
        // Desktop: Copy to clipboard
        fallbackToCopy(shareText);
    }
}

/**
 * Fallback to copy text to clipboard
 * @param {string} text - Text to copy
 */
function fallbackToCopy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showCopyFeedback())
            .catch(err => {
                console.error('Failed to copy:', err);
                alert('Could not copy to clipboard');
            });
    } else {
        // Legacy clipboard method for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showCopyFeedback();
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Could not copy to clipboard');
        }
        document.body.removeChild(textarea);
    }
}

/**
 * Show copy feedback message
 */
export function showCopyFeedback() {
    const feedback = document.getElementById('copy-feedback');
    if (feedback) {
        feedback.classList.add('visible');
        setTimeout(() => {
            feedback.classList.remove('visible');
        }, 2000);
    }
}

// ============================================
// COUNTDOWN TIMER
// ============================================

let countdownInterval = null;

/**
 * Start countdown timer for next daily challenge
 */
export function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    function updateCountdown() {
        const timeRemaining = getTimeUntilNextDay();
        const formatted = formatTimeRemaining(timeRemaining);

        const countdownTime = document.getElementById('countdown-time');
        if (countdownTime) {
            countdownTime.textContent = formatted;
        }
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

/**
 * Stop countdown timer
 */
export function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

/**
 * Clear input fields
 */
export function clearInput() {
    const countyInput = document.getElementById('county-input');
    const countyInputNew = document.getElementById('county-input-new');
    if (countyInput) countyInput.value = '';
    if (countyInputNew) countyInputNew.value = '';
}

/**
 * Clear guess rail
 */
export function clearGuessRail() {
    const guessRail = document.getElementById('guess-rail');
    if (guessRail) guessRail.innerHTML = '';
}

// ============================================
// TIME TRIAL UI FUNCTIONS
// ============================================

/**
 * Update timer display in header pill
 * @param {number} timeRemaining - Time remaining in seconds
 */
export function updateTimerDisplay(timeRemaining) {
    const pill = document.getElementById('guess-counter-pill');
    if (pill) {
        pill.textContent = formatTimeDisplay(timeRemaining);
        pill.setAttribute('data-mode', 'timetrial');
        pill.style.fontVariantNumeric = 'tabular-nums';
    }
}

/**
 * Update timer warning state based on remaining time
 * @param {number} timeRemaining - Time remaining in seconds
 * @param {number} timeLimit - Total time limit in seconds
 */
export function updateTimerWarningState(timeRemaining, timeLimit) {
    const pill = document.getElementById('guess-counter-pill');
    if (!pill) return;

    const colorState = getTimerColor(timeRemaining, timeLimit);

    // Remove all warning classes from pill
    pill.classList.remove('timer-warning', 'timer-danger', 'timer-critical', 'timer-urgent');

    // Remove screen glow classes from body
    document.body.classList.remove('timer-critical-glow', 'timer-urgent-glow');

    // Add appropriate class based on color state
    if (colorState === 'warning') {
        pill.classList.add('timer-warning');
    } else if (colorState === 'danger') {
        pill.classList.add('timer-danger');
    } else if (colorState === 'critical') {
        pill.classList.add('timer-critical');
        document.body.classList.add('timer-critical-glow');
    } else if (colorState === 'urgent') {
        pill.classList.add('timer-urgent');
        document.body.classList.add('timer-urgent-glow');
    }
}

/**
 * Show Time Trial end modal
 * @param {boolean} won - Whether the game was won
 * @param {number} timeElapsed - Time elapsed in seconds (for wins)
 * @param {number} guessCount - Number of guesses made
 * @param {string} targetCounty - Target county name
 * @param {Function} showResultLine - Callback to show result line
 */
export function showTimeTrialEndModal(won, timeElapsed, guessCount, targetCounty, showResultLine) {
    // Clean up timer visual effects
    cleanupTimerEffects();

    const county = COUNTIES[targetCounty];
    const modalTitle = document.getElementById('modal-title');
    const starsEl = document.getElementById('modal-stars');
    const modalCounty = document.getElementById('modal-county');
    const modalFact = document.getElementById('modal-fact');
    const modalStatsEl = document.getElementById('modal-stats-summary');
    const distributionContainer = document.getElementById('distribution-container');
    const countdownContainer = document.getElementById('countdown-container');

    if (modalTitle) modalTitle.textContent = won ? 'Well Done!' : "Time's Up!";

    if (starsEl) {
        if (won) {
            starsEl.innerHTML = `⏱️ ${formatTimeDisplay(timeElapsed)}<br>with ${guessCount} guesses`;
        } else {
            starsEl.textContent = '⏱️ Time ran out!';
        }
    }

    if (modalCounty) modalCounty.textContent = targetCounty;
    if (modalFact) modalFact.textContent = county.fact;

    // Show Time Trial statistics
    if (modalStatsEl) {
        const stats = store.getState().timeTrialStatistics;
        const winPct = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

        modalStatsEl.innerHTML = `
            <div class="modal-stat">
                <div class="modal-stat-value">${stats.gamesWon}/${stats.gamesPlayed}</div>
                <div class="modal-stat-label">Won</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-value">${stats.bestTime !== null ? formatTimeDisplay(stats.bestTime) : '--'}</div>
                <div class="modal-stat-label">Best Time</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-value">${winPct}%</div>
                <div class="modal-stat-label">Win %</div>
            </div>
        `;
    }

    // Show distribution for Time Trial stats
    if (distributionContainer) {
        renderTimeTrialDistribution(won ? guessCount : null);
    }

    // Hide countdown for Time Trial
    if (countdownContainer) {
        countdownContainer.style.display = 'none';
    }

    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) modalOverlay.classList.add('visible');

    // Show line connecting last guess to target
    if (!won && showResultLine) {
        showResultLine();
    }

    if (won) {
        createConfetti();
    }
}

/**
 * Render Time Trial guess distribution
 * @param {number|null} currentGuesses - Current game's guess count
 */
export function renderTimeTrialDistribution(currentGuesses) {
    const bars = document.getElementById('distribution-bars');
    if (!bars) return;

    bars.innerHTML = '';

    const stats = store.getState().timeTrialStatistics;
    const maxCount = Math.max(...stats.distribution, 1);

    for (let i = 0; i < 6; i++) {
        const count = stats.distribution[i];
        const percentage = (count / maxCount) * 100;
        const isCurrent = currentGuesses === i + 1;

        const row = document.createElement('div');
        row.className = 'distribution-row';
        row.innerHTML = `
            <span class="distribution-label">${i + 1}</span>
            <div class="distribution-bar-container">
                <div class="distribution-bar${isCurrent ? ' current' : ''}"
                     style="width: ${Math.max(percentage, count > 0 ? 10 : 0)}%">
                    ${count > 0 ? count : ''}
                </div>
            </div>
        `;
        bars.appendChild(row);
    }
}

/**
 * Update Time Trial settings UI (sliders and values)
 */
export function updateTimeTrialSettingsUI() {
    const settings = store.getState().settings.timeTrialDurations;

    const easySlider = document.getElementById('tt-easy');
    const mediumSlider = document.getElementById('tt-medium');
    const hardSlider = document.getElementById('tt-hard');

    const easyVal = document.getElementById('tt-easy-val');
    const mediumVal = document.getElementById('tt-medium-val');
    const hardVal = document.getElementById('tt-hard-val');

    if (easySlider && easyVal) {
        easySlider.value = settings.easy;
        easyVal.textContent = settings.easy;
    }

    if (mediumSlider && mediumVal) {
        mediumSlider.value = settings.medium;
        mediumVal.textContent = settings.medium;
    }

    if (hardSlider && hardVal) {
        hardSlider.value = settings.hard;
        hardVal.textContent = settings.hard;
    }
}

/**
 * Show "GO!" animation overlay for Time Trial start
 */
export function showGoAnimation() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'go-overlay';

    const text = document.createElement('div');
    text.className = 'go-text';
    text.textContent = 'GO!';

    overlay.appendChild(text);
    document.body.appendChild(overlay);

    // Remove after animation completes
    setTimeout(() => {
        overlay.remove();
    }, 1500);
}

/**
 * Show "SUCCESS!" animation overlay for game wins
 */
export function showSuccessAnimation() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';

    const text = document.createElement('div');
    text.className = 'success-text';
    text.textContent = 'SUCCESS!';

    overlay.appendChild(text);
    document.body.appendChild(overlay);

    // Remove after animation completes
    setTimeout(() => {
        overlay.remove();
    }, 2000);
}

/**
 * Show "CORRECT!" animation for Locate mode (quicker)
 */
export function showCorrectAnimation() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.style.animation = 'success-fade-out 1s ease-out forwards';

    const text = document.createElement('div');
    text.className = 'success-text';
    text.textContent = 'CORRECT!';

    overlay.appendChild(text);
    document.body.appendChild(overlay);

    // Remove after shorter animation
    setTimeout(() => {
        overlay.remove();
    }, 1000);
}

/**
 * Auto-focus the county input field
 */
export function focusInput() {
    // Try the new input first, fall back to old input
    const countyInputNew = document.getElementById('county-input-new');
    const countyInput = document.getElementById('county-input');

    if (countyInputNew && countyInputNew.style.display !== 'none') {
        countyInputNew.focus();
    } else if (countyInput && countyInput.style.display !== 'none') {
        countyInput.focus();
    }
}

/**
 * Clean up timer visual effects (remove screen glow)
 */
export function cleanupTimerEffects() {
    document.body.classList.remove('timer-critical-glow', 'timer-urgent-glow');
    const pill = document.getElementById('guess-counter-pill');
    if (pill) {
        pill.classList.remove('timer-warning', 'timer-danger', 'timer-critical', 'timer-urgent');
    }
}

/**
 * Show the streak end (game over) modal
 * @param {number} finalStreak - The streak count achieved
 * @param {string} targetCounty - County that ended the streak
 */
export function showStreakEndModal(finalStreak, targetCounty) {
    const county = COUNTIES[targetCounty];

    const modalTitle = document.getElementById('modal-title');
    const starsEl = document.getElementById('modal-stars');
    const modalCounty = document.getElementById('modal-county');
    const modalFact = document.getElementById('modal-fact');
    const modalStatsEl = document.getElementById('modal-stats-summary');
    const distributionContainer = document.getElementById('distribution-container');
    const countdownContainer = document.getElementById('countdown-container');

    if (modalTitle) {
        modalTitle.textContent = finalStreak > 0 ? 'Great Run!' : 'Game Over';
    }

    if (starsEl) {
        if (finalStreak >= 20) {
            starsEl.textContent = `${finalStreak} counties! Incredible!`;
        } else if (finalStreak >= 10) {
            starsEl.textContent = `${finalStreak} counties! Impressive!`;
        } else if (finalStreak >= 5) {
            starsEl.textContent = `${finalStreak} counties! Nice streak!`;
        } else if (finalStreak > 0) {
            starsEl.textContent = `${finalStreak} ${finalStreak === 1 ? 'county' : 'counties'}. Keep practicing!`;
        } else {
            starsEl.textContent = 'Better luck next time!';
        }
    }

    if (modalCounty) modalCounty.textContent = targetCounty;
    if (modalFact && county) modalFact.textContent = county.fact;

    // Show streak statistics
    if (modalStatsEl) {
        const stats = store.getState().streakStatistics;
        const statValues = modalStatsEl.querySelectorAll('.modal-stat-value');
        const statLabels = modalStatsEl.querySelectorAll('.modal-stat-label');
        if (statValues.length >= 3 && statLabels.length >= 3) {
            statValues[0].textContent = finalStreak;
            statLabels[0].textContent = 'Streak';
            statValues[1].textContent = stats.bestStreak;
            statLabels[1].textContent = 'Best';
            statValues[2].textContent = stats.averageStreak.toFixed(1);
            statLabels[2].textContent = 'Average';
        }
    }

    // Hide distribution and countdown (not relevant for streak)
    if (distributionContainer) distributionContainer.style.display = 'none';
    if (countdownContainer) countdownContainer.style.display = 'none';

    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) modalOverlay.classList.add('visible');
}
