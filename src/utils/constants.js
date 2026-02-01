// ============================================
// GAME CONSTANTS
// ============================================

export const MAX_DISTANCE = 470; // Maximum distance across Ireland in km

// ============================================
// COLOR CONSTANTS - Colorblind-friendly with Cyber theme
// ============================================
export const COLORS = {
    COLD_1: '#1864ab',   // Dark Blue (75-100%)
    COLD_2: '#4dabf7',   // Medium Blue (55-75%)
    WARM_1: '#74c0fc',   // Light Blue (40-55%)
    WARM_2: '#ffd43b',   // Yellow (25-40%)
    WARM_3: '#ffa94d',   // Orange (15-25%)
    HOT: '#ff6b6b',      // Bright Red (5-15%)
    CORRECT: '#00ff88',  // Neon Mint (correct)
    DEFAULT: 'transparent'   // Unguessed
};

export const COLOR_EMOJIS = {
    [COLORS.COLD_1]: '🔵',
    [COLORS.COLD_2]: '🔷',
    [COLORS.WARM_1]: '🟦',
    [COLORS.WARM_2]: '🟡',
    [COLORS.WARM_3]: '🟠',
    [COLORS.HOT]: '🔴',
    [COLORS.CORRECT]: '🎯'
};

// ============================================
// DIRECTION ARROWS
// ============================================
export const DIRECTION_ARROWS = {
    N: '↑',
    NE: '↗',
    E: '→',
    SE: '↘',
    S: '↓',
    SW: '↙',
    W: '←',
    NW: '↖'
};
