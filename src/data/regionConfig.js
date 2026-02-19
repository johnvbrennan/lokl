// ============================================
// REGION CONFIGURATION
// Defines all region-specific parameters for multi-region support
// ============================================

/**
 * Region configuration object
 * Each region defines:
 * - Geographic data (places, coordinates, facts)
 * - Map settings (center, zoom, GeoJSON path)
 * - Distance parameters (max distance)
 * - UI labels (province vs region)
 * - Storage keys (isolated stats per region)
 */
export const REGIONS = {
    'irish-counties': {
        id: 'irish-counties',
        name: 'Irish Counties',
        displayName: 'Ireland',
        flag: '🇮🇪',
        maxDistance: 470,           // Maximum distance across Ireland in km
        mapCenter: [53.5, -7.5],    // Center of Ireland
        mapZoom: 7,                 // Default zoom level
        minZoom: 6,                 // Minimum zoom level
        maxZoom: 10,                // Maximum zoom level
        geoJsonPath: '/assets/ireland.json',
        dataModule: './counties.js',
        adjacencyModule: './adjacency.js',
        groupingField: 'province',   // Data field for grouping (province)
        groupingLabel: 'Province',   // UI label for grouping
        placeType: 'county',         // Singular place type for UI text
        placeTypePlural: 'counties'  // Plural place type for UI text
    },
    'europe': {
        id: 'europe',
        name: 'European Countries',
        displayName: 'Europe',
        flag: '🇪🇺',
        maxDistance: 4000,          // Maximum distance across Europe (Portugal to Ukraine)
        mapCenter: [52.0, 10.0],    // Center of Europe
        mapZoom: 4,                 // Default zoom level
        minZoom: 3,                 // Minimum zoom level
        maxZoom: 7,                 // Maximum zoom level
        geoJsonPath: '/assets/europe.json',
        dataModule: './countries.js',
        adjacencyModule: './countryAdjacency.js',
        groupingField: 'subregion',  // Data field for grouping (subregion)
        groupingLabel: 'Region',     // UI label for grouping
        placeType: 'country',        // Singular place type for UI text
        placeTypePlural: 'countries' // Plural place type for UI text
    }
};

/**
 * Default region to use when none is selected
 */
export const DEFAULT_REGION = 'irish-counties';

/**
 * Get region configuration by ID
 * @param {string} regionId - Region identifier
 * @returns {Object} Region configuration object
 */
export function getRegionConfig(regionId) {
    return REGIONS[regionId] || REGIONS[DEFAULT_REGION];
}

/**
 * Get list of all available region IDs
 * @returns {string[]} Array of region IDs
 */
export function getAvailableRegions() {
    return Object.keys(REGIONS);
}
