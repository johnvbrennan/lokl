// ============================================
// CALCULATION UTILITIES
// ============================================

import { COLORS, MAX_DISTANCE, DIRECTION_ARROWS } from './constants.js';
import { areAdjacent as checkAdjacency } from '../data/adjacency.js';

/**
 * Calculate distance between two points using Haversine formula
 * @param {Object} c1 - First county with lat/lng
 * @param {Object} c2 - Second county with lat/lng
 * @returns {number} Distance in kilometers
 */
export function getDistance(c1, c2) {
    const R = 6371;
    const dLat = (c2.lat - c1.lat) * Math.PI / 180;
    const dLng = (c2.lng - c1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/**
 * Calculate bearing from one point to another and return arrow
 * @param {Object} from - Starting county with lat/lng
 * @param {Object} to - Target county with lat/lng
 * @returns {string} Arrow character indicating direction
 */
export function getBearing(from, to) {
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const lat1 = from.lat * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
    return arrows[Math.round(bearing / 45) % 8];
}

/**
 * Get color based on proximity to target
 * @param {number} distance - Distance in kilometers
 * @returns {string} Color code
 */
export function getProximityColor(distance) {
    if (distance === 0) return COLORS.CORRECT;
    const ratio = distance / MAX_DISTANCE;
    if (ratio >= 0.75) return COLORS.COLD_1;
    if (ratio >= 0.55) return COLORS.COLD_2;
    if (ratio >= 0.40) return COLORS.WARM_1;
    if (ratio >= 0.25) return COLORS.WARM_2;
    if (ratio >= 0.15) return COLORS.WARM_3;
    if (ratio >= 0.05) return COLORS.HOT;
    return COLORS.CORRECT;
}

/**
 * Check if two counties share a border
 * Re-export from adjacency module for convenience
 */
export const areAdjacent = checkAdjacency;
