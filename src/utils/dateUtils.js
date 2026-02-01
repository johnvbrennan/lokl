// ============================================
// DATE UTILITIES
// ============================================

import { COUNTY_NAMES } from '../data/counties.js';

/**
 * Get today's date string in ISO format (YYYY-MM-DD)
 * @returns {string} Date string
 */
export function getTodaysDateString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get the daily county based on date-based seeding
 * @returns {string} County name
 */
export function getDailyCounty() {
    const today = getTodaysDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash |= 0;
    }
    return COUNTY_NAMES[Math.abs(hash) % COUNTY_NAMES.length];
}

/**
 * Get the current game number (days since epoch)
 * @returns {number} Game number
 */
export function getGameNumber() {
    const epoch = new Date('2026-01-01');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((today - epoch) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Get time remaining until next day in milliseconds
 * @returns {number} Milliseconds until midnight
 */
export function getTimeUntilNextDay() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow - now;
}

/**
 * Format time difference as HH:MM:SS
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time string
 */
export function formatTimeRemaining(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get a random county name
 * @returns {string} Random county name
 */
export function getRandomCounty() {
    return COUNTY_NAMES[Math.floor(Math.random() * COUNTY_NAMES.length)];
}
