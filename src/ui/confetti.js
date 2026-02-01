// ============================================
// CONFETTI ANIMATION
// Confetti effect for winning the game
// ============================================

/**
 * Create confetti animation
 */
export function createConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const colors = ['#27ae60', '#ffffff', '#e67e22'];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s ease-out forwards`;
        container.appendChild(confetti);
    }

    setTimeout(() => {
        container.innerHTML = '';
    }, 6000);
}
