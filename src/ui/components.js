// ============================================
// UI COMPONENTS
// Functions for updating UI elements
// ============================================

import { COUNTIES } from '../data/counties.js';
import { COLORS, COLOR_EMOJIS } from '../utils/constants.js';
import { gameState, statistics, settings, getMaxGuesses } from '../game/gameState.js';
import { loadDailyState } from '../storage/persistence.js';
import { getTodaysDateString, getTimeUntilNextDay, formatTimeRemaining } from '../utils/dateUtils.js';
import { createConfetti } from './confetti.js';

/**
 * Update the guess counter display
 * @param {Function} highlightCounty - Callback to highlight county on map
 * @param {Function} unhighlightCounty - Callback to unhighlight county on map
 */
export function updateGuessCounter(highlightCounty, unhighlightCounty) {
    const maxGuesses = getMaxGuesses();
    const statGuesses = document.getElementById('stat-guesses');
    if (statGuesses) {
        statGuesses.textContent = `${gameState.guesses.length}/${maxGuesses}`;
    }

    // Update slot visibility based on max guesses
    for (let i = 0; i < 6; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (slot) {
            slot.style.display = i < maxGuesses ? '' : 'none';
        }
    }

    gameState.guesses.forEach((guess, index) => {
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
    if (gameState.guesses.length === 0) return;

    const closest = gameState.guesses.reduce((min, g) => g.distance < min.distance ? g : min);
    const showDistance = settings.difficulty === 'easy' || settings.difficulty === 'medium';

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

    const isCorrect = guess.county === gameState.targetCounty;

    // Determine what to show based on difficulty
    const showDistance = settings.difficulty === 'easy' || settings.difficulty === 'medium';
    const showDirection = settings.difficulty === 'easy' || settings.difficulty === 'hard';

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
    gameState.guesses.forEach((guess, index) => {
        addGuessToHistory(guess, index + 1, highlightCounty, unhighlightCounty);
    });
}

/**
 * Update the mode badge display
 */
export function updateModeBadge() {
    const badge = document.getElementById('mode-badge');
    if (!badge) return;

    badge.classList.remove('practice', 'locate');

    // Build badge text with difficulty for non-locate modes
    let modeText = '';
    if (gameState.mode === 'locate') {
        modeText = 'Locate';
        badge.classList.add('locate');
        badge.title = 'Locate Mode - Click counties to find them';
    } else if (gameState.mode === 'practice') {
        modeText = 'Practice';
        badge.classList.add('practice');
    } else {
        modeText = 'Daily';
    }

    // Add difficulty indicator for guess modes with full names
    if (gameState.mode !== 'locate') {
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

        const diffName = diffNames[settings.difficulty] || settings.difficulty;
        modeText += ` • ${diffName}`;
        badge.title = `${modeText} (${diffDescriptions[settings.difficulty]})`;
    }

    badge.textContent = modeText;
}

/**
 * Show the end game modal
 * @param {Function} showResultLine - Callback to show result line on map
 */
export function showEndModal(showResultLine) {
    const isWin = gameState.status === 'won';
    const county = COUNTIES[gameState.targetCounty];

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
            const guessCount = gameState.guesses.length;
            const ratings = ['🤯 Genius!', '🤩 Brilliant!', '😎 Great!', '😀 Good!', '🙂 Solid!', '😅 Phew!'];
            const stars = ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐', '⭐', '✔️'];
            starsEl.innerHTML = `${stars[guessCount - 1]}<br>${ratings[guessCount - 1]}`;
        } else {
            starsEl.textContent = '❌ Better luck next time!';
        }
    }

    if (modalCounty) modalCounty.textContent = gameState.targetCounty;
    if (modalFact) modalFact.textContent = county.fact;
    if (modalGuesses) modalGuesses.textContent = isWin ? gameState.guesses.length : 'X';
    if (modalStreak) modalStreak.textContent = statistics.currentStreak;
    if (modalWinPct) {
        modalWinPct.textContent = statistics.gamesPlayed > 0
            ? Math.round((statistics.gamesWon / statistics.gamesPlayed) * 100) + '%'
            : '0%';
    }

    renderDistribution(isWin ? gameState.guesses.length : null);

    const countdownContainer = document.getElementById('countdown-container');
    if (countdownContainer) {
        if (gameState.mode === 'daily') {
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

    const maxCount = Math.max(...statistics.distribution, 1);

    for (let i = 0; i < 6; i++) {
        const count = statistics.distribution[i];
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
        btn.classList.toggle('selected', btn.dataset.difficulty === settings.difficulty);
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
    const guessCount = gameState.guesses.length;
    for (let i = 0; i < 6; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (slot) slot.classList.remove('warning');
    }

    // Warn on guess 5 and 6
    if (guessCount >= 4 && gameState.status === 'playing') {
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
 */
export function updateGuessRail() {
    const rail = document.getElementById('guess-rail');
    if (!rail) return;

    rail.innerHTML = '';

    gameState.guesses.forEach((guess, index) => {
        const pill = document.createElement('div');
        pill.className = 'guess-pill glass neon-border';
        pill.style.borderColor = guess.color;
        pill.style.boxShadow = `0 0 10px ${guess.color}40`;

        const isCorrect = guess.county === gameState.targetCounty;
        if (isCorrect) {
            pill.classList.add('correct');
        }

        pill.textContent = guess.county.substring(0, 3).toUpperCase();
        rail.appendChild(pill);
    });
}

/**
 * Update guess counter pill
 */
export function updateGuessCounterPill() {
    const pill = document.getElementById('guess-counter-pill');
    if (pill) {
        pill.textContent = `${gameState.guesses.length}/${getMaxGuesses()}`;
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

    gameState.guesses.forEach((guess, index) => {
        if (updateMapCounty) {
            updateMapCounty(guess.county, guess.color, guess.county === gameState.targetCounty);
        }
        addGuessToHistory(guess, index + 1, highlightCounty, unhighlightCounty);
    });

    updateGuessCounter();
    updateGuessRail();
    updateGuessCounterPill();
    updateStatsBar();

    if (gameState.status !== 'playing') {
        disableInput();
        if (gameState.status === 'lost' && updateMapCounty) {
            updateMapCounty(gameState.targetCounty, COLORS.CORRECT, true);
        }
    }
}

/**
 * Share game result
 */
export function shareResult() {
    const isWin = gameState.status === 'won';
    const emojis = gameState.guesses.map(g => {
        if (g.isAdjacent && g.county !== gameState.targetCounty) return '🔗';
        return COLOR_EMOJIS[g.color] || '⬜';
    }).join('');
    const score = isWin ? gameState.guesses.length : 'X';
    const difficultyLabel = settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1);

    const text = `Locle #${gameState.gameNumber} ${score}/6 (${difficultyLabel})\n${emojis}\nhttps://locle.app`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showCopyFeedback())
            .catch(err => {
                console.error('Failed to copy:', err);
                alert('Could not copy to clipboard');
            });
    } else {
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
