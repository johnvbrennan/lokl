// ============================================
// MAP CONTROLLER
// Manages Leaflet map interactions
// ============================================

// Map state
let map = null;
let countyLayers = {}; // Store layer references by county name
let countyColors = new Map(); // Store current fill colors by county name
let geoJsonLayer = null;
let tileLayer = null; // Store reference to current tile layer
let currentHighlightedCounty = null;

/**
 * Initialize the Leaflet map
 * @param {Function} onMapReady - Callback when map is loaded
 */
export function initMap(onMapReady) {
    // Create map centered on Ireland with forced SVG renderer for mobile compatibility
    map = L.map('map', {
        center: [53.5, -7.5],
        zoom: 7,
        minZoom: 6,
        maxZoom: 10,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: false, // Force SVG rendering (not Canvas)
        renderer: L.svg() // Explicitly use SVG renderer
    });

    console.log('🗺️ Map initialized with SVG renderer');

    // Add initial tile layer based on current theme
    updateMapTiles();

    // Load GeoJSON after tiles
    loadGeoJSON(onMapReady);

    // Set up resize handler
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (map && geoJsonLayer) {
                console.log('📐 Resize detected');

                // Check map container dimensions
                const mapContainer = map.getContainer();
                const containerRect = mapContainer.getBoundingClientRect();
                console.log('  📏 Map container:', {
                    width: containerRect.width,
                    height: containerRect.height,
                    visible: containerRect.width > 0 && containerRect.height > 0
                });

                // Step 1: Invalidate map size
                map.invalidateSize(true);

                // Step 2: Wait for Leaflet to finish rendering using animation frames
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        // Step 3: Force complete redraw of GeoJSON layer
                        console.log('🎨 Redrawing GeoJSON layer');
                        let redrawnCount = 0;
                        geoJsonLayer.eachLayer(layer => {
                            // Force Leaflet to recalculate and apply styles
                            layer.setStyle(defaultStyle(layer.feature));

                            // Check if this layer has a color
                            const countyName = layer.feature?.properties?.name;
                            if (countyColors.has(countyName)) {
                                redrawnCount++;
                                const el = layer.getElement();
                                if (el) {
                                    const computedStyle = window.getComputedStyle(el);
                                    console.log(`    ✅ ${countyName}:`, {
                                        'fill-attr': el.getAttribute('fill'),
                                        'fill-opacity-attr': el.getAttribute('fill-opacity'),
                                        'computed-fill': computedStyle.fill,
                                        'computed-fill-opacity': computedStyle.fillOpacity,
                                        'computed-opacity': computedStyle.opacity,
                                        'computed-display': computedStyle.display,
                                        'computed-visibility': computedStyle.visibility
                                    });
                                } else {
                                    console.log(`    ❌ ${countyName}: NO ELEMENT!`);
                                }
                            }
                        });

                        console.log(`  📊 Redrawn ${redrawnCount} colored counties`);

                        // Step 4: Fix SVG container dimensions (Leaflet bug on mobile)
                        const overlayPane = map.getPanes().overlayPane;
                        if (overlayPane) {
                            const svg = overlayPane.querySelector('svg');
                            if (svg) {
                                const svgRect = svg.getBoundingClientRect();
                                console.log('  📦 SVG container before fix:', {
                                    width: svgRect.width,
                                    height: svgRect.height
                                });

                                // Force SVG to fill its container
                                if (svgRect.width === 0 || svgRect.height === 0) {
                                    console.log('  🔧 Fixing SVG dimensions...');
                                    const mapSize = map.getSize();
                                    const mapContainer = map.getContainer();

                                    // Set explicit dimensions
                                    svg.setAttribute('width', mapSize.x);
                                    svg.setAttribute('height', mapSize.y);
                                    svg.style.width = mapSize.x + 'px';
                                    svg.style.height = mapSize.y + 'px';

                                    // Set viewBox to cover the map bounds
                                    const bounds = map.getBounds();
                                    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
                                    const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());
                                    const viewBoxWidth = bottomRight.x - topLeft.x;
                                    const viewBoxHeight = bottomRight.y - topLeft.y;
                                    svg.setAttribute('viewBox', `${topLeft.x} ${topLeft.y} ${viewBoxWidth} ${viewBoxHeight}`);

                                    console.log('  ✅ SVG fixed:', {
                                        width: mapSize.x,
                                        height: mapSize.y,
                                        viewBox: `${topLeft.x} ${topLeft.y} ${viewBoxWidth} ${viewBoxHeight}`
                                    });
                                }
                            }
                        }

                        // Step 5: Bring colored counties to front
                        countyColors.forEach((data, countyName) => {
                            const layer = countyLayers[countyName];
                            if (layer) {
                                layer.bringToFront();
                            }
                        });

                        console.log('✅ Redraw complete');
                    });
                });
            }
        }, 200);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
}

/**
 * Update map tile layer based on current theme
 * @param {string} theme - Current theme ('light' or 'dark')
 */
export function updateMapTiles(theme) {
    // Remove existing tile layer if it exists
    if (tileLayer && map) {
        map.removeLayer(tileLayer);
    }

    // Choose tile layer based on current theme
    const isDark = theme === 'dark';
    const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

    // Create and add the appropriate tile layer
    tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    if (map) {
        tileLayer.addTo(map);
    }
}

/**
 * Load GeoJSON data for Irish counties
 * @param {Function} onMapReady - Callback when GeoJSON is loaded
 */
export function loadGeoJSON(onMapReady) {
    fetch('/assets/ireland.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('GeoJSON loaded, features:', data.features.length);

            geoJsonLayer = L.geoJSON(data, {
                style: defaultStyle,
                onEachFeature: onEachFeature
            }).addTo(map);

            // Bring counties to front
            geoJsonLayer.bringToFront();

            // Fit map to Ireland bounds
            map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });

            // Hide loading indicator
            document.getElementById('loading').style.display = 'none';

            console.log('County layers loaded:', Object.keys(countyLayers).length);

            // Force map to recalculate size - multiple passes to catch mobile layout delays
            [100, 300, 600].forEach(delay => {
                setTimeout(() => {
                    if (map) {
                        map.invalidateSize(true);
                    }
                }, delay);
            });

            // Call callback when map is ready
            if (onMapReady) {
                onMapReady();
            }
        })
        .catch(error => {
            console.error('Failed to load GeoJSON:', error);
            console.log('To run locally, start a web server:');
            console.log('  Python: python -m http.server 8000');
            console.log('  Node:   npx serve');
            console.log('  Then open: http://localhost:8000');
            document.getElementById('loading').innerHTML =
                'Failed to load map data.<br><small>Run from a web server (see console for instructions)</small>';
        });
}

/**
 * Default style for county layers
 * @param {Object} feature - GeoJSON feature (optional)
 * @param {string} gameMode - Current game mode
 * @returns {Object} Leaflet style object
 */
function defaultStyle(feature, gameMode = null) {
    const isLocateMode = gameMode === 'locate';
    const mapBorder = getComputedStyle(document.documentElement)
        .getPropertyValue('--map-border').trim();
    const mapBorderBright = getComputedStyle(document.documentElement)
        .getPropertyValue('--map-border-bright').trim();

    // Check if this county has a stored color - check BOTH Map and feature properties
    const countyName = feature?.properties?.name;
    const storedColorFromMap = countyName ? countyColors.get(countyName) : null;
    const storedColorFromFeature = feature?.properties?._guessColor;

    // Prefer Map, fallback to feature properties
    const guessColor = storedColorFromMap?.color || storedColorFromFeature;

    // DEBUG: Log what we're finding
    if (guessColor) {
        console.log(`  🎨 ${countyName}: found color ${guessColor} (from ${storedColorFromMap ? 'Map' : 'feature'})`);
    }

    // If there's a stored color, use it; otherwise transparent
    if (guessColor) {
        return {
            fillColor: guessColor,
            fillOpacity: 0.9,
            weight: isLocateMode ? 2 : 1,
            opacity: isLocateMode ? 1 : 0.6,
            color: isLocateMode ? mapBorderBright : mapBorder
        };
    }

    // Default: transparent fill
    return {
        fillColor: 'transparent',
        fillOpacity: 0,
        weight: isLocateMode ? 2 : 1,
        opacity: isLocateMode ? 1 : 0.6,
        color: isLocateMode ? mapBorderBright : mapBorder
    };
}

/**
 * Set up event handlers for each county feature
 * @param {Object} feature - GeoJSON feature
 * @param {Object} layer - Leaflet layer
 */
function onEachFeature(feature, layer) {
    const countyName = feature.properties.name;
    countyLayers[countyName] = layer;

    // Hover effects
    layer.on({
        mouseover: function(e) {
            const layer = e.target;
            const mapHover = getComputedStyle(document.documentElement)
                .getPropertyValue('--map-hover').trim();

            layer.setStyle({
                weight: 3,
                color: mapHover
            });
            layer.bringToFront();
            // Show pointer cursor - callback will be set by caller
            const el = layer.getElement();
            if (el && layer.shouldShowPointer) {
                el.style.cursor = 'pointer';
            }
        },
        mouseout: function(e) {
            const layer = e.target;
            // Get current fill to preserve guess colors
            const currentFill = layer.options.fillColor;
            const currentFillOpacity = layer.options.fillOpacity;

            // Reset to default border style but preserve fill
            const defaultBorderStyle = defaultStyle(layer.feature, layer.gameMode);
            layer.setStyle({
                fillColor: currentFill,
                fillOpacity: currentFillOpacity,
                weight: defaultBorderStyle.weight,
                color: defaultBorderStyle.color,
                opacity: defaultBorderStyle.opacity
            });

            const el = layer.getElement();
            if (el) el.style.cursor = '';
        },
        click: function(e) {
            // Click handler will be set by caller
            if (layer.clickHandler) {
                layer.clickHandler(countyName);
            }
        }
    });
}

/**
 * Set click handler for map clicks
 * @param {Function} handler - Function to call when county is clicked
 * @param {string} gameMode - Current game mode
 * @param {string} gameStatus - Current game status
 */
export function setMapClickHandler(handler, gameMode, gameStatus) {
    Object.entries(countyLayers).forEach(([name, layer]) => {
        layer.clickHandler = handler;
        layer.gameMode = gameMode;
        layer.shouldShowPointer = gameMode === 'locate' && gameStatus === 'playing';
    });
}

/**
 * Update a county's color on the map
 * @param {string} countyName - Name of the county
 * @param {string} color - Color code
 * @param {boolean} isCorrect - Whether this is the correct answer
 */
export function updateMapCounty(countyName, color, isCorrect = false) {
    const layer = countyLayers[countyName];
    if (layer) {
        // Store color in BOTH the Map AND the feature properties
        countyColors.set(countyName, { color, isCorrect });

        // Store in feature properties so it persists through Leaflet re-renders
        if (layer.feature && layer.feature.properties) {
            layer.feature.properties._guessColor = color;
            layer.feature.properties._isCorrect = isCorrect;
        }

        // Apply the style
        const style = {
            fillColor: color,
            fillOpacity: 0.9,
            weight: 1,
            opacity: 0.6,
            color: getComputedStyle(document.documentElement).getPropertyValue('--map-border').trim()
        };

        layer.setStyle(style);

        // Add correct class if needed
        if (isCorrect) {
            const element = layer.getElement();
            if (element) {
                element.classList.add('county-correct');
            }
        }

        layer.bringToFront();

        console.log(`✅ Updated ${countyName} to ${color}`);
    }
}

/**
 * Restore county colors after resize/re-render
 * Simply tells each layer to recalculate its style (which reads from countyColors Map)
 */
function restoreCountyColors() {
    if (countyColors.size === 0) return;

    console.log('🔄 Restoring', countyColors.size, 'counties');

    // Force each colored county to recalculate its style
    countyColors.forEach((data, countyName) => {
        const layer = countyLayers[countyName];
        if (layer) {
            // Get the style we want to apply
            const style = defaultStyle(layer.feature);
            console.log(`  ${countyName}:`, style);

            // Apply it
            layer.setStyle(style);

            // Check what actually got applied
            const element = layer.getElement();
            if (element) {
                console.log(`    ↳ Element:`, {
                    fill: element.getAttribute('fill'),
                    fillOpacity: element.getAttribute('fill-opacity'),
                    styleFill: element.style.fill,
                    styleFillOpacity: element.style.fillOpacity,
                    display: element.style.display,
                    visibility: element.style.visibility,
                    opacity: element.style.opacity
                });
            } else {
                console.log(`    ↳ Element: NULL - THIS IS THE PROBLEM!`);
            }

            layer.bringToFront();
        }
    });

    console.log('✅ Colors restored');
}

/**
 * Reset all counties to default colors
 * @param {string} gameMode - Current game mode
 */
export function resetMapColors(gameMode) {
    console.log('🧹 Resetting map colors');

    // Clear the color storage
    countyColors.clear();

    // Reset all layers to default style and clear feature properties
    Object.values(countyLayers).forEach(layer => {
        // Clear feature properties
        if (layer.feature && layer.feature.properties) {
            delete layer.feature.properties._guessColor;
            delete layer.feature.properties._isCorrect;
        }

        layer.setStyle(defaultStyle(layer.feature, gameMode));

        const el = layer.getElement();
        if (el) {
            el.classList.remove('county-correct');
        }
    });
}

/**
 * Highlight a specific county with white border
 * @param {string} countyName - Name of the county to highlight
 */
export function highlightCounty(countyName) {
    // Unhighlight previous county first
    if (currentHighlightedCounty && currentHighlightedCounty !== countyName) {
        unhighlightCounty(currentHighlightedCounty);
    }

    const layer = countyLayers[countyName];
    if (layer) {
        layer.setStyle({
            weight: 4,
            color: '#ffffff',
            opacity: 1
        });
        layer.bringToFront();
        currentHighlightedCounty = countyName;

        // Also pan to county if not in view
        const bounds = layer.getBounds();
        if (!map.getBounds().contains(bounds)) {
            map.panTo(bounds.getCenter());
        }
    }
}

/**
 * Remove highlight from a county
 * @param {string} countyName - Name of the county to unhighlight
 * @param {string} gameMode - Current game mode
 */
export function unhighlightCounty(countyName, gameMode) {
    const layer = countyLayers[countyName];
    if (layer) {
        // If gameMode not provided, try to get from layer's stored mode
        if (!gameMode && layer.gameMode) {
            gameMode = layer.gameMode;
        }

        // Get current style to preserve fill color (from guesses)
        const currentStyle = layer.options;
        const defaultBorderStyle = defaultStyle(layer.feature, gameMode);

        // Restore border styling but KEEP the fill color
        layer.setStyle({
            fillColor: currentStyle.fillColor,
            fillOpacity: currentStyle.fillOpacity,
            weight: defaultBorderStyle.weight,
            opacity: defaultBorderStyle.opacity,
            color: defaultBorderStyle.color
        });

        // If it's no longer the highlighted county, clear the tracking
        if (currentHighlightedCounty === countyName) {
            currentHighlightedCounty = null;
        }
    }
}

/**
 * Update all map borders (useful when theme or mode changes)
 * @param {string} gameMode - Current game mode
 */
export function updateAllMapBorders(gameMode) {
    // Update all county borders when theme changes
    if (countyLayers && Object.keys(countyLayers).length > 0) {
        Object.values(countyLayers).forEach(layer => {
            const currentStyle = defaultStyle(layer.feature, gameMode);
            layer.setStyle({
                color: currentStyle.color,
                opacity: currentStyle.opacity,
                weight: currentStyle.weight
            });
        });
    }
}

/**
 * Get the map instance (for advanced use cases)
 * @returns {Object} Leaflet map instance
 */
export function getMap() {
    return map;
}

/**
 * Get county layers object
 * @returns {Object} County layers keyed by name
 */
export function getCountyLayers() {
    return countyLayers;
}
