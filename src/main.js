        // ============================================
        // COUNTY DATA (32 counties)
        // ============================================
        const COUNTIES = {
            "Antrim": { lat: 54.72, lng: -6.21, province: "Ulster", fact: "Home to the Giant's Causeway, one of Ireland's most famous landmarks!" },
            "Armagh": { lat: 54.35, lng: -6.65, province: "Ulster", fact: "Known as the Orchard County - famous for Bramley apples!" },
            "Carlow": { lat: 52.72, lng: -6.84, province: "Leinster", fact: "Ireland's second-smallest county - but packed with history!" },
            "Cavan": { lat: 53.99, lng: -7.36, province: "Ulster", fact: "The source of the River Shannon, Ireland's longest river!" },
            "Clare": { lat: 52.84, lng: -8.98, province: "Munster", fact: "Home to the Cliffs of Moher and the Burren's lunar landscape!" },
            "Cork": { lat: 51.90, lng: -8.47, province: "Munster", fact: "Ireland's largest county - the Rebel County!" },
            "Derry": { lat: 54.99, lng: -7.00, province: "Ulster", fact: "Derry's city walls are among the best-preserved in Europe!" },
            "Donegal": { lat: 54.83, lng: -7.95, province: "Ulster", fact: "Contains Ireland's most northerly point - Malin Head!" },
            "Down": { lat: 54.38, lng: -5.88, province: "Ulster", fact: "Home to the Mourne Mountains that inspired C.S. Lewis's Narnia!" },
            "Dublin": { lat: 53.35, lng: -6.26, province: "Leinster", fact: "Ireland's capital - home to about a third of the country's population!" },
            "Fermanagh": { lat: 54.34, lng: -7.64, province: "Ulster", fact: "A third of Fermanagh is covered by water - the Lakeland County!" },
            "Galway": { lat: 53.27, lng: -8.86, province: "Connacht", fact: "Home to the Aran Islands and the heart of the Gaeltacht!" },
            "Kerry": { lat: 52.06, lng: -9.85, province: "Munster", fact: "Home to Carrauntoohil - Ireland's highest mountain!" },
            "Kildare": { lat: 53.16, lng: -6.91, province: "Leinster", fact: "The home of Irish horse racing - the Curragh is legendary!" },
            "Kilkenny": { lat: 52.65, lng: -7.25, province: "Leinster", fact: "The Marble City - and hurling royalty with 36 All-Ireland titles!" },
            "Laois": { lat: 53.03, lng: -7.56, province: "Leinster", fact: "Home to the Rock of Dunamase, a stunning ruined fortress!" },
            "Leitrim": { lat: 54.12, lng: -8.00, province: "Connacht", fact: "Ireland's least populated county - but beautiful lake country!" },
            "Limerick": { lat: 52.66, lng: -8.63, province: "Munster", fact: "The Treaty City - where the famous Treaty of Limerick was signed!" },
            "Longford": { lat: 53.73, lng: -7.80, province: "Leinster", fact: "Corlea Trackway here is a 2,000-year-old Iron Age road!" },
            "Louth": { lat: 53.88, lng: -6.49, province: "Leinster", fact: "Ireland's smallest county - the Wee County!" },
            "Mayo": { lat: 53.76, lng: -9.53, province: "Connacht", fact: "Home to Croagh Patrick - Ireland's holy mountain!" },
            "Meath": { lat: 53.60, lng: -6.66, province: "Leinster", fact: "Newgrange is older than the Egyptian pyramids!" },
            "Monaghan": { lat: 54.25, lng: -6.97, province: "Ulster", fact: "The drumlin county - rolling hills shaped by ice age glaciers!" },
            "Offaly": { lat: 53.23, lng: -7.72, province: "Leinster", fact: "Clonmacnoise monastery was once one of Europe's great centres of learning!" },
            "Roscommon": { lat: 53.76, lng: -8.27, province: "Connacht", fact: "Home to Rathcroghan - the ancient capital of Connacht!" },
            "Sligo": { lat: 54.25, lng: -8.47, province: "Connacht", fact: "Yeats Country - the poet's beloved Ben Bulben is here!" },
            "Tipperary": { lat: 52.47, lng: -7.86, province: "Munster", fact: "The Rock of Cashel is one of Ireland's most spectacular sites!" },
            "Tyrone": { lat: 54.60, lng: -7.31, province: "Ulster", fact: "Ireland's largest inland county - the O'Neill heartland!" },
            "Waterford": { lat: 52.26, lng: -7.11, province: "Munster", fact: "Ireland's oldest city - founded by Vikings in 914 AD!" },
            "Westmeath": { lat: 53.53, lng: -7.34, province: "Leinster", fact: "The Lake County - home to beautiful Lough Ennell and Lough Owel!" },
            "Wexford": { lat: 52.47, lng: -6.58, province: "Leinster", fact: "The Sunny Southeast - has the most sunshine hours in Ireland!" },
            "Wicklow": { lat: 52.98, lng: -6.37, province: "Leinster", fact: "The Garden of Ireland - stunning mountains just south of Dublin!" }
        };

        const COUNTY_NAMES = Object.keys(COUNTIES).sort();
        const MAX_DISTANCE = 470; // Maximum distance across Ireland in km

        // County adjacency data - which counties share a border
        const COUNTY_ADJACENCY = {
            "Antrim": ["Londonderry", "Tyrone", "Armagh", "Down"],
            "Armagh": ["Tyrone", "Down", "Louth", "Monaghan", "Antrim"],
            "Carlow": ["Laois", "Kildare", "Wicklow", "Wexford", "Kilkenny"],
            "Cavan": ["Monaghan", "Fermanagh", "Leitrim", "Longford", "Westmeath", "Meath"],
            "Clare": ["Galway", "Limerick", "Tipperary"],
            "Cork": ["Kerry", "Limerick", "Tipperary", "Waterford"],
            "Donegal": ["Londonderry", "Tyrone", "Fermanagh", "Leitrim"],
            "Down": ["Antrim", "Armagh", "Louth"],
            "Dublin": ["Meath", "Kildare", "Wicklow"],
            "Fermanagh": ["Donegal", "Tyrone", "Monaghan", "Cavan", "Leitrim"],
            "Galway": ["Mayo", "Roscommon", "Offaly", "Tipperary", "Clare"],
            "Kerry": ["Limerick", "Cork"],
            "Kildare": ["Dublin", "Meath", "Offaly", "Laois", "Carlow", "Wicklow"],
            "Kilkenny": ["Laois", "Carlow", "Wexford", "Waterford", "Tipperary"],
            "Laois": ["Offaly", "Kildare", "Carlow", "Kilkenny", "Tipperary"],
            "Leitrim": ["Donegal", "Fermanagh", "Cavan", "Longford", "Roscommon", "Sligo"],
            "Limerick": ["Clare", "Tipperary", "Cork", "Kerry"],
            "Londonderry": ["Donegal", "Tyrone", "Antrim"],
            "Longford": ["Leitrim", "Cavan", "Westmeath", "Roscommon"],
            "Louth": ["Down", "Armagh", "Monaghan", "Meath"],
            "Mayo": ["Sligo", "Roscommon", "Galway"],
            "Meath": ["Louth", "Monaghan", "Cavan", "Westmeath", "Offaly", "Kildare", "Dublin"],
            "Monaghan": ["Armagh", "Tyrone", "Fermanagh", "Cavan", "Meath", "Louth"],
            "Offaly": ["Galway", "Roscommon", "Westmeath", "Meath", "Kildare", "Laois", "Tipperary"],
            "Roscommon": ["Sligo", "Leitrim", "Longford", "Westmeath", "Offaly", "Galway", "Mayo"],
            "Sligo": ["Leitrim", "Roscommon", "Mayo"],
            "Tipperary": ["Clare", "Galway", "Offaly", "Laois", "Kilkenny", "Waterford", "Cork", "Limerick"],
            "Tyrone": ["Londonderry", "Antrim", "Armagh", "Monaghan", "Fermanagh", "Donegal"],
            "Waterford": ["Cork", "Tipperary", "Kilkenny", "Wexford"],
            "Westmeath": ["Longford", "Cavan", "Meath", "Offaly", "Roscommon"],
            "Wexford": ["Wicklow", "Carlow", "Kilkenny", "Waterford"],
            "Wicklow": ["Dublin", "Kildare", "Carlow", "Wexford"]
        };

        function areAdjacent(county1, county2) {
            if (!county1 || !county2 || county1 === county2) return false;
            const neighbors = COUNTY_ADJACENCY[county1];
            return neighbors ? neighbors.includes(county2) : false;
        }

        // ============================================
        // COLOR CONSTANTS - Colorblind-friendly with Cyber theme
        // ============================================
        const COLORS = {
            COLD_1: '#1864ab',   // Dark Blue (75-100%)
            COLD_2: '#4dabf7',   // Medium Blue (55-75%)
            WARM_1: '#74c0fc',   // Light Blue (40-55%)
            WARM_2: '#ffd43b',   // Yellow (25-40%)
            WARM_3: '#ffa94d',   // Orange (15-25%)
            HOT: '#ff6b6b',      // Bright Red (5-15%)
            CORRECT: '#00ff88',  // Neon Mint (correct)
            DEFAULT: 'transparent'   // Unguessed
        };

        const COLOR_EMOJIS = {
            [COLORS.COLD_1]: '🔵',
            [COLORS.COLD_2]: '🔷',
            [COLORS.WARM_1]: '🟦',
            [COLORS.WARM_2]: '🟡',
            [COLORS.WARM_3]: '🟠',
            [COLORS.HOT]: '🔴',
            [COLORS.CORRECT]: '🎯'
        };

        // ============================================
        // GAME STATE
        // ============================================
        let gameState = {
            targetCounty: null,
            guesses: [],
            status: 'playing', // 'playing', 'won', 'lost'
            mode: 'daily', // 'daily', 'practice', 'locate'
            gameNumber: 0
        };

        let settings = {
            difficulty: 'medium' // 'easy', 'medium', 'hard'
        };

        function getMaxGuesses() {
            return settings.difficulty === 'hard' ? 4 : 6;
        }

        let statistics = {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            bestStreak: 0,
            distribution: [0, 0, 0, 0, 0, 0],
            lastPlayedDate: null
        };

        let currentHighlightedCounty = null;

        // ============================================
        // LEAFLET MAP
        // ============================================
        let map = null;
        let countyLayers = {}; // Store layer references by county name
        let geoJsonLayer = null;
        let tileLayer = null; // Store reference to current tile layer

        function initMap() {
            // Create map centered on Ireland
            map = L.map('map', {
                center: [53.5, -7.5],
                zoom: 7,
                minZoom: 6,
                maxZoom: 10,
                zoomControl: true,
                attributionControl: true
            });

            // Add initial tile layer based on current theme
            updateMapTiles();

            // Load GeoJSON after tiles
            loadGeoJSON();
        }

        function updateMapTiles() {
            // Remove existing tile layer if it exists
            if (tileLayer && map) {
                map.removeLayer(tileLayer);
            }

            // Choose tile layer based on current theme
            const isDark = currentTheme === 'dark';
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

        function loadGeoJSON() {
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

                    // Initialize game after map is ready (suppress modal on page load)
                    initGame('daily', true);
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

        function defaultStyle(feature) {
            // Locate mode: bright borders to help find counties
            // Practice/Daily: visible borders so you can see the map
            const isLocateMode = gameState.mode === 'locate';
            const mapBorder = getComputedStyle(document.documentElement)
                .getPropertyValue('--map-border').trim();
            const mapBorderBright = getComputedStyle(document.documentElement)
                .getPropertyValue('--map-border-bright').trim();

            return {
                fillColor: 'transparent',
                fillOpacity: 0,
                weight: isLocateMode ? 2 : 1,
                opacity: isLocateMode ? 1 : 0.6,
                color: isLocateMode ? mapBorderBright : mapBorder
            };
        }

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
                    // Show pointer cursor in locate mode
                    const el = layer.getElement();
                    if (el && gameState.mode === 'locate' && gameState.status === 'playing') {
                        el.style.cursor = 'pointer';
                    }
                },
                mouseout: function(e) {
                    const layer = e.target;
                    // Reset to default style based on game mode
                    const isLocateMode = gameState.mode === 'locate';
                    const mapBorder = getComputedStyle(document.documentElement)
                        .getPropertyValue('--map-border').trim();
                    const mapBorderBright = getComputedStyle(document.documentElement)
                        .getPropertyValue('--map-border-bright').trim();

                    layer.setStyle({
                        weight: isLocateMode ? 2 : 1,
                        opacity: isLocateMode ? 1 : 0.6,
                        color: isLocateMode ? mapBorderBright : mapBorder
                    });
                    const el = layer.getElement();
                    if (el) el.style.cursor = '';
                },
                click: function(e) {
                    handleMapClick(countyName);
                }
            });
        }

        function handleMapClick(countyName) {
            // Only process clicks in locate mode
            if (gameState.mode !== 'locate') return;
            if (gameState.status !== 'playing') return;

            // Use the normal processGuess - clicking is just another input method
            processGuess(countyName);
        }

        function updateMapCounty(countyName, color, isCorrect = false) {
            const layer = countyLayers[countyName];
            if (layer) {
                layer.setStyle({
                    fillColor: color,
                    fillOpacity: 0.9
                });

                if (isCorrect) {
                    // Add pulsing effect for correct answer
                    layer.getElement()?.classList.add('county-correct');
                }
            }
        }

        function resetMapColors() {
            Object.values(countyLayers).forEach(layer => {
                layer.setStyle(defaultStyle());
                layer.getElement()?.classList.remove('county-correct');
            });
        }

        function highlightCounty(countyName) {
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

        function unhighlightCounty(countyName) {
            const layer = countyLayers[countyName];
            if (layer) {
                // Restore to default border style based on game mode
                const isLocateMode = gameState.mode === 'locate';
                const mapBorder = getComputedStyle(document.documentElement)
                    .getPropertyValue('--map-border').trim();
                const mapBorderBright = getComputedStyle(document.documentElement)
                    .getPropertyValue('--map-border-bright').trim();

                layer.setStyle({
                    weight: isLocateMode ? 2 : 1,
                    opacity: isLocateMode ? 1 : 0.6,
                    color: isLocateMode ? mapBorderBright : mapBorder
                });

                // If it's no longer the highlighted county, clear the tracking
                if (currentHighlightedCounty === countyName) {
                    currentHighlightedCounty = null;
                }
            }
        }

        // ============================================
        // CORE ALGORITHMS
        // ============================================

        function getDistance(c1, c2) {
            const R = 6371;
            const dLat = (c2.lat - c1.lat) * Math.PI / 180;
            const dLng = (c2.lng - c1.lng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) *
                      Math.sin(dLng/2) * Math.sin(dLng/2);
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        }

        function getBearing(from, to) {
            const dLng = (to.lng - from.lng) * Math.PI / 180;
            const lat1 = from.lat * Math.PI / 180;
            const lat2 = to.lat * Math.PI / 180;
            const y = Math.sin(dLng) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
            const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
            const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
            return arrows[Math.round(bearing / 45) % 8];
        }

        function getProximityColor(distance) {
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

        function getDailyCounty() {
            const today = new Date().toISOString().split('T')[0];
            let hash = 0;
            for (let i = 0; i < today.length; i++) {
                hash = ((hash << 5) - hash) + today.charCodeAt(i);
                hash |= 0;
            }
            return COUNTY_NAMES[Math.abs(hash) % COUNTY_NAMES.length];
        }

        function getGameNumber() {
            const epoch = new Date('2026-01-01');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return Math.floor((today - epoch) / (1000 * 60 * 60 * 24)) + 1;
        }

        function getRandomCounty() {
            return COUNTY_NAMES[Math.floor(Math.random() * COUNTY_NAMES.length)];
        }

        // ============================================
        // GAME LOGIC
        // ============================================

        function initGame(mode = 'daily', suppressModal = false) {
            // Clear guess pills immediately
            document.getElementById('guess-rail').innerHTML = '';

            gameState.mode = mode;
            gameState.guesses = [];
            gameState.status = 'playing';

            if (mode === 'daily') {
                gameState.targetCounty = getDailyCounty();
                gameState.gameNumber = getGameNumber();

                const savedState = loadDailyState();
                if (savedState && savedState.date === new Date().toISOString().split('T')[0]) {
                    gameState.guesses = savedState.guesses;
                    gameState.status = savedState.status;
                    restoreGameUI();
                    if (gameState.status !== 'playing' && !suppressModal) {
                        // Show end modal with a note that this is today's completed challenge
                        setTimeout(() => {
                            showEndModal();
                            // Add a note to the modal
                            const modal = document.querySelector('.modal');
                            const subtitle = modal?.querySelector('.modal-subtitle');
                            if (subtitle && gameState.status === 'won') {
                                subtitle.textContent = `You already completed today's challenge! Come back tomorrow for a new one.`;
                            } else if (subtitle && gameState.status === 'lost') {
                                subtitle.textContent = `You already attempted today's challenge. Come back tomorrow for a new one.`;
                            }
                        }, 300);
                    }
                    return;
                }
            } else {
                gameState.targetCounty = getRandomCounty();
                gameState.gameNumber = 0;
            }

            resetUI();
            updateModeBadge();
        }

        // ============================================
        // LOCATE MODE
        // ============================================

        function initLocateMode() {
            // Clear guess pills immediately
            document.getElementById('guess-rail').innerHTML = '';

            gameState.mode = 'locate';
            gameState.guesses = [];
            gameState.status = 'playing';

            // Pick a random target county
            const targetCounty = getRandomCounty();
            gameState.targetCounty = targetCounty;

            // Clear previous game state
            resetMapColors();
            clearResultLine();
            document.getElementById('guess-list').innerHTML = '';

            // Reset guess slots
            for (let i = 0; i < 6; i++) {
                const slot = document.getElementById(`slot-${i}`);
                slot.style.backgroundColor = '';
                slot.classList.remove('filled', 'warning');
            }

            // Reset stats display
            document.getElementById('stat-guesses').textContent = '0/6';
            document.getElementById('stat-closest').textContent = '--';
            document.getElementById('stat-province').textContent = '--';

            // Switch UI - hide text input, show locate prompt
            document.getElementById('input-area').style.display = 'none';
            document.getElementById('locate-area').style.display = 'block';

            // NEW: Hide input dock, show locate dock
            document.getElementById('input-dock').style.display = 'none';
            document.getElementById('locate-dock').style.display = 'flex';

            // Show target county name
            document.getElementById('locate-target').textContent = targetCounty;
            document.getElementById('locate-hint').textContent = 'Click on the map to find it!';

            // NEW: Also update the new locate dock
            document.getElementById('locate-target-new').textContent = targetCounty;
            document.getElementById('locate-hint-new').textContent = 'Click on the map to find it!';

            updateModeBadge();
        }

        function exitLocateMode() {
            // Switch back to normal UI
            document.getElementById('input-area').style.display = '';
            document.getElementById('locate-area').style.display = 'none';

            // NEW: Show input dock, hide locate dock
            document.getElementById('input-dock').style.display = 'flex';
            document.getElementById('locate-dock').style.display = 'none';

            // Return to practice mode
            initGame('practice');
        }

        function startNextLocateRound() {
            // Pick a new random target
            gameState.targetCounty = getRandomCounty();
            gameState.guesses = [];
            gameState.status = 'playing';

            // Update UI
            document.getElementById('locate-target').textContent = gameState.targetCounty;
            document.getElementById('locate-hint').textContent = 'Click on the map to find it!';

            // NEW: Update the new locate dock
            document.getElementById('locate-target-new').textContent = gameState.targetCounty;
            document.getElementById('locate-hint-new').textContent = 'Click on the map to find it!';

            // NEW: Clear guess rail
            document.getElementById('guess-rail').innerHTML = '';
            updateGuessCounterPill();

            resetUI();
        }

        function processGuess(countyName) {
            if (gameState.status !== 'playing') return;
            if (gameState.guesses.some(g => g.county === countyName)) return;
            if (!COUNTIES[countyName]) return;

            const target = COUNTIES[gameState.targetCounty];
            const guessed = COUNTIES[countyName];
            const isCorrect = countyName === gameState.targetCounty;
            const isAdjacent = areAdjacent(countyName, gameState.targetCounty);
            // Adjacent counties = 0km (borders touch), otherwise use centroid distance
            const distance = isCorrect ? 0 : isAdjacent ? 0 : Math.round(getDistance(guessed, target));
            const direction = isCorrect ? '🎯' : getBearing(guessed, target);
            // Only correct answer gets green; adjacent gets HOT (red) to indicate "very close"
            const color = isCorrect ? COLORS.CORRECT : isAdjacent ? COLORS.HOT : getProximityColor(distance);

            const guess = {
                county: countyName,
                distance,
                direction,
                color,
                province: guessed.province,
                isAdjacent
            };

            gameState.guesses.push(guess);

            updateMapCounty(countyName, color, countyName === gameState.targetCounty);
            addGuessToHistory(guess, gameState.guesses.length);
            updateGuessCounter();
            updateStatsBar();

            // NEW: Update floating UI elements
            updateGuessRail();
            updateGuessCounterPill();

            if (countyName === gameState.targetCounty) {
                gameState.status = 'won';
                if (gameState.mode === 'locate') {
                    // Locate mode: auto-start next round after delay
                    setTimeout(() => startNextLocateRound(), 1500);
                } else {
                    updateStatistics(true, gameState.guesses.length);
                    saveDailyState();
                    setTimeout(() => showEndModal(), 500);
                }
            } else if (gameState.guesses.length >= getMaxGuesses()) {
                gameState.status = 'lost';
                updateMapCounty(gameState.targetCounty, COLORS.CORRECT, true);
                if (gameState.mode === 'locate') {
                    // Locate mode: show correct answer, then next round
                    setTimeout(() => startNextLocateRound(), 2000);
                } else {
                    updateStatistics(false);
                    saveDailyState();
                    setTimeout(() => showEndModal(), 500);
                }
            }

            if (gameState.mode === 'daily') {
                saveDailyState();
            }

            if (gameState.status !== 'playing') {
                disableInput();
            }

            document.getElementById('county-input').value = '';
            document.getElementById('county-input-new').value = '';
            hideAutocomplete();
            hideAutocompleteNew();
        }

        // ============================================
        // UI FUNCTIONS
        // ============================================

        function resetUI() {
            resetMapColors();
            clearResultLine();

            const maxGuesses = getMaxGuesses();
            for (let i = 0; i < 6; i++) {
                const slot = document.getElementById(`slot-${i}`);
                slot.style.backgroundColor = '';
                slot.classList.remove('filled', 'warning');
                // Show/hide slots based on difficulty
                slot.style.display = i < maxGuesses ? '' : 'none';
            }

            document.getElementById('guess-list').innerHTML = '';
            document.getElementById('stat-guesses').textContent = `0/${maxGuesses}`;
            document.getElementById('stat-closest').textContent = '--';
            document.getElementById('stat-province').textContent = '--';

            // NEW: Reset floating UI elements
            document.getElementById('guess-rail').innerHTML = '';
            document.getElementById('guess-counter-pill').textContent = `0/${maxGuesses}`;

            enableInput();
            updateSubmitButtonState();
            updateSubmitButtonStateNew();
        }

        function restoreGameUI() {
            resetUI();
            gameState.guesses.forEach((guess, index) => {
                updateMapCounty(guess.county, guess.color, guess.county === gameState.targetCounty);
                addGuessToHistory(guess, index + 1);
            });
            updateGuessCounter();
            // NEW: Restore guess rail
            updateGuessRail();
            updateGuessCounterPill();
            updateStatsBar();

            if (gameState.status !== 'playing') {
                disableInput();
                if (gameState.status === 'lost') {
                    updateMapCounty(gameState.targetCounty, COLORS.CORRECT, true);
                }
            }
        }

        function addGuessToHistory(guess, number) {
            const list = document.getElementById('guess-list');
            const isCorrect = guess.county === gameState.targetCounty;

            // Determine what to show based on difficulty
            // Easy: distance + direction, Medium: distance only, Hard: direction only
            console.log('[DEBUG] Current difficulty:', settings.difficulty);
            const showDistance = settings.difficulty === 'easy' || settings.difficulty === 'medium';
            const showDirection = settings.difficulty === 'easy' || settings.difficulty === 'hard';
            console.log('[DEBUG] showDistance:', showDistance, 'showDirection:', showDirection);

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
            item.addEventListener('mouseenter', () => highlightCounty(guess.county));
            item.addEventListener('mouseleave', () => unhighlightCounty(guess.county));

            list.insertBefore(item, list.firstChild);
        }

        function refreshGuessHistory() {
            const list = document.getElementById('guess-list');
            list.innerHTML = '';
            gameState.guesses.forEach((guess, index) => {
                addGuessToHistory(guess, index + 1);
            });
        }

        function updateGuessCounter() {
            const maxGuesses = getMaxGuesses();
            document.getElementById('stat-guesses').textContent = `${gameState.guesses.length}/${maxGuesses}`;

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

        function updateStatsBar() {
            if (gameState.guesses.length === 0) return;

            const closest = gameState.guesses.reduce((min, g) => g.distance < min.distance ? g : min);
            const showDistance = settings.difficulty === 'easy' || settings.difficulty === 'medium';
            document.getElementById('stat-closest').textContent = showDistance ? `${closest.distance} km` : '--';
            document.getElementById('stat-province').textContent = closest.province.substring(0, 4);
        }

        // NEW: Update floating menu active state (simplified - no longer needed)
        function updateFloatingMenuState() {
            // No longer tracking active menu items since we only have "New Game"
        }

        function updateDifficultyDisplay() {
            const display = document.getElementById('difficulty-display');
            if (!display) return;

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

            console.log('Current difficulty:', settings.difficulty);
            display.textContent = diffNames[settings.difficulty] || settings.difficulty;
            const btn = document.getElementById('difficulty-toggle-btn');
            if (btn) {
                btn.title = `Difficulty: ${diffNames[settings.difficulty]} (${diffDescriptions[settings.difficulty]}). Click to change.`;
            }
        }

        function updateModeBadge() {
            const badge = document.getElementById('mode-badge');
            if (!badge) return;
            badge.classList.remove('practice', 'locate');

            // Also update floating menu state
            updateFloatingMenuState();

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
                modeText = `${modeText} (${diffNames[settings.difficulty]})`;
                badge.title = `${modeText} - ${diffDescriptions[settings.difficulty]}. Click to change difficulty.`;
                badge.style.cursor = 'pointer';
            } else {
                badge.style.cursor = 'default';
            }

            badge.textContent = modeText;
        }

        function enableInput() {
            document.getElementById('county-input').disabled = false;
            document.getElementById('submit-btn').disabled = false;
            // NEW: Enable new input
            document.getElementById('county-input-new').disabled = false;
            document.getElementById('submit-btn-new').disabled = false;
            updateSubmitButtonState();
            updateSubmitButtonStateNew();
        }

        function disableInput() {
            document.getElementById('county-input').disabled = true;
            document.getElementById('submit-btn').disabled = true;
            document.getElementById('submit-btn').classList.remove('ready');
            // NEW: Disable new input
            document.getElementById('county-input-new').disabled = true;
            document.getElementById('submit-btn-new').disabled = true;
            document.getElementById('submit-btn-new').classList.remove('ready');
        }

        // PRD 8.2: Submit button ready state
        function updateSubmitButtonState() {
            const input = document.getElementById('county-input');
            const btn = document.getElementById('submit-btn');
            const value = input.value.trim();
            const matches = getAutocompleteMatches(value);
            const isValid = matches.length === 1 || COUNTY_NAMES.includes(value);

            if (isValid && gameState.status === 'playing') {
                btn.classList.add('ready');
            } else {
                btn.classList.remove('ready');
            }
        }

        // PRD 8.7: Warning state for low guesses
        function updateWarningState() {
            const guessCount = gameState.guesses.length;
            for (let i = 0; i < 6; i++) {
                const slot = document.getElementById(`slot-${i}`);
                slot.classList.remove('warning');
            }

            // Warn on guess 5 and 6
            if (guessCount >= 4 && gameState.status === 'playing') {
                const nextSlot = document.getElementById(`slot-${guessCount}`);
                if (nextSlot) {
                    nextSlot.classList.add('warning');
                }
            }
        }

        // PRD 8.1: Panel toggle
        function togglePanel() {
            const panel = document.getElementById('game-panel');
            const toggle = document.getElementById('panel-toggle');
            panel.classList.toggle('collapsed');
            toggle.innerHTML = panel.classList.contains('collapsed') ? '&#9654;' : '&#9664;';

            // Resize map after panel toggle
            setTimeout(() => {
                if (map) map.invalidateSize();
            }, 350);
        }

        // PRD 8.8: Start screen for first-time users and mode selection
        let selectedStartMode = 'daily';
        let selectedStartDifficulty = 'medium';

        function showStartScreen() {
            // Clear any previous game UI
            document.getElementById('guess-rail').innerHTML = '';

            document.getElementById('start-overlay').classList.add('visible');
            // Sync difficulty button with current settings
            updateStartScreenDifficulty();

            // Check if daily challenge is already complete
            const savedDaily = loadDailyState();
            const today = new Date().toISOString().split('T')[0];
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
                    selectedStartMode = 'practice';
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

        function hideStartScreen() {
            document.getElementById('start-overlay').classList.remove('visible');
            localStorage.setItem('loklTutorialSeen', 'true');
        }

        function updateStartScreenDifficulty() {
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.difficulty === settings.difficulty);
            });
            selectedStartDifficulty = settings.difficulty;
        }

        function initStartScreenListeners() {
            // Mode card selection
            document.querySelectorAll('.mode-card').forEach(card => {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    selectedStartMode = card.dataset.mode;
                });
            });

            // Difficulty button selection
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedStartDifficulty = btn.dataset.difficulty;
                    // Also update the settings dropdown to keep in sync
                    settings.difficulty = selectedStartDifficulty;
                    const radio = document.getElementById(`diff-${selectedStartDifficulty}`);
                    if (radio) radio.checked = true;
                    saveSettings();
                });
            });

            // Start game button
            document.getElementById('start-game-btn').addEventListener('click', () => {
                hideStartScreen();
                if (selectedStartMode === 'locate') {
                    initLocateMode();
                    document.getElementById('locate-btn').innerHTML = '&#128281; <span class="btn-text">Back</span>';
                } else {
                    // Pass suppressModal=true to prevent loop when daily game is already complete
                    initGame(selectedStartMode, true);
                    // Update practice button label
                    if (selectedStartMode === 'practice') {
                        document.getElementById('practice-btn').innerHTML = '&#128197; <span class="btn-text">Daily</span>';
                        document.getElementById('practice-btn').title = 'Return to Daily Challenge';
                    }
                }
            });

            // How to play toggle
            document.getElementById('how-to-play-toggle').addEventListener('click', () => {
                const content = document.getElementById('how-to-play-content');
                const arrow = document.getElementById('how-to-play-arrow');
                content.classList.toggle('visible');
                arrow.innerHTML = content.classList.contains('visible') ? '&#9650;' : '&#9660;';
            });
        }

        // Legacy aliases for backward compatibility
        function showTutorial() {
            showStartScreen();
        }

        function hideTutorial() {
            hideStartScreen();
        }

        // Help modal
        function showHelp() {
            document.getElementById('help-overlay').classList.add('visible');
        }

        function hideHelp() {
            document.getElementById('help-overlay').classList.remove('visible');
        }

        // PRD 8.3: Polyline connecting guess to target
        let resultLine = null;

        function showResultLine() {
            if (resultLine) {
                map.removeLayer(resultLine);
            }

            if (gameState.guesses.length === 0) return;

            const lastGuess = gameState.guesses[gameState.guesses.length - 1];
            const guessCoords = COUNTIES[lastGuess.county];
            const targetCoords = COUNTIES[gameState.targetCounty];

            if (guessCoords && targetCoords && lastGuess.county !== gameState.targetCounty) {
                resultLine = L.polyline([
                    [guessCoords.lat, guessCoords.lng],
                    [targetCoords.lat, targetCoords.lng]
                ], {
                    color: lastGuess.distance < 100 ? '#27ae60' : '#e74c3c',
                    weight: 3,
                    opacity: 0.8,
                    dashArray: '10, 10'
                }).addTo(map);

                // Add distance label at midpoint (only if distance is shown based on difficulty)
                const showDistance = settings.difficulty === 'easy' || settings.difficulty === 'medium';
                if (showDistance) {
                    const midLat = (guessCoords.lat + targetCoords.lat) / 2;
                    const midLng = (guessCoords.lng + targetCoords.lng) / 2;

                    L.marker([midLat, midLng], {
                        icon: L.divIcon({
                            className: 'distance-label',
                            html: `<div style="background:var(--bg-secondary);padding:4px 8px;border-radius:4px;font-size:12px;white-space:nowrap;">${lastGuess.distance} km</div>`,
                            iconSize: [60, 20],
                            iconAnchor: [30, 10]
                        })
                    }).addTo(map);
                }
            }
        }

        function clearResultLine() {
            if (resultLine) {
                map.removeLayer(resultLine);
                resultLine = null;
            }
            // Also clear any distance labels
            map.eachLayer(layer => {
                if (layer instanceof L.Marker && layer.options.icon?.options?.className === 'distance-label') {
                    map.removeLayer(layer);
                }
            });
        }

        // ============================================
        // AUTOCOMPLETE
        // ============================================

        function showAutocomplete(matches) {
            const list = document.getElementById('autocomplete-list');
            list.innerHTML = '';

            if (matches.length === 0) {
                hideAutocomplete();
                return;
            }

            matches.forEach((county, index) => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = county;
                item.dataset.index = index;
                item.addEventListener('click', () => {
                    document.getElementById('county-input').value = county;
                    hideAutocomplete();
                    processGuess(county);
                });
                list.appendChild(item);
            });

            list.classList.add('visible');
        }

        function hideAutocomplete() {
            document.getElementById('autocomplete-list').classList.remove('visible');
        }

        function getAutocompleteMatches(input) {
            if (!input) return [];
            const guessedCounties = gameState.guesses.map(g => g.county);
            return COUNTY_NAMES.filter(name =>
                name.toLowerCase().startsWith(input.toLowerCase()) &&
                !guessedCounties.includes(name)
            );
        }

        // NEW: Autocomplete for new floating input dock
        function showAutocompleteNew(matches) {
            const list = document.getElementById('autocomplete-list-new');
            list.innerHTML = '';

            if (matches.length === 0) {
                hideAutocompleteNew();
                return;
            }

            matches.forEach((county, index) => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = county;
                item.dataset.index = index;
                item.addEventListener('click', () => {
                    document.getElementById('county-input-new').value = county;
                    hideAutocompleteNew();
                    processGuess(county);
                });
                list.appendChild(item);
            });

            list.classList.add('visible');
        }

        function hideAutocompleteNew() {
            document.getElementById('autocomplete-list-new').classList.remove('visible');
        }

        function updateSubmitButtonStateNew() {
            const input = document.getElementById('county-input-new');
            const btn = document.getElementById('submit-btn-new');
            const value = input.value.trim();
            const matches = getAutocompleteMatches(value);

            if (matches.length === 1 || COUNTY_NAMES.includes(value)) {
                btn.classList.add('ready');
            } else {
                btn.classList.remove('ready');
            }
        }

        // NEW: Update guess rail with horizontal pills
        function updateGuessRail() {
            const rail = document.getElementById('guess-rail');
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
                if (guess.isAdjacent) {
                    pill.classList.add('adjacent');
                }

                // Respect difficulty settings: Easy = both, Medium = distance only, Hard = direction only
                const showDistance = settings.difficulty === 'easy' || settings.difficulty === 'medium';
                const showDirection = settings.difficulty === 'easy' || settings.difficulty === 'hard';

                pill.innerHTML = `
                    <span class="guess-name">${guess.county}</span>
                    ${showDirection ? `<span class="guess-direction">${guess.direction}</span>` : ''}
                    ${showDistance ? `<span class="guess-distance">${guess.distance}km</span>` : ''}
                `;

                pill.addEventListener('click', () => {
                    highlightCounty(guess.county);
                    map.panTo(L.latLng(COUNTIES[guess.county].lat, COUNTIES[guess.county].lng));
                });

                rail.appendChild(pill);
            });

            // Scroll to end of rail
            rail.scrollLeft = rail.scrollWidth;
        }

        // NEW: Update floating guess counter pill
        function updateGuessCounterPill() {
            const pill = document.getElementById('guess-counter-pill');
            pill.textContent = `${gameState.guesses.length}/${getMaxGuesses()}`;
        }

        // ============================================
        // MODAL & END GAME
        // ============================================

        function showEndModal() {
            const isWin = gameState.status === 'won';
            const county = COUNTIES[gameState.targetCounty];

            document.getElementById('modal-title').textContent = isWin ? 'Well Done!' : 'Game Over';

            const starsEl = document.getElementById('modal-stars');
            if (isWin) {
                const guessCount = gameState.guesses.length;
                const ratings = ['🤯 Genius!', '🤩 Brilliant!', '😎 Great!', '😀 Good!', '🙂 Solid!', '😅 Phew!'];
                const stars = ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐', '⭐', '✔️'];
                starsEl.innerHTML = `${stars[guessCount - 1]}<br>${ratings[guessCount - 1]}`;
            } else {
                starsEl.textContent = '❌ Better luck next time!';
            }

            document.getElementById('modal-county').textContent = gameState.targetCounty;
            document.getElementById('modal-fact').textContent = county.fact;

            document.getElementById('modal-guesses').textContent = isWin ? gameState.guesses.length : 'X';
            document.getElementById('modal-streak').textContent = statistics.currentStreak;
            document.getElementById('modal-win-pct').textContent =
                statistics.gamesPlayed > 0
                    ? Math.round((statistics.gamesWon / statistics.gamesPlayed) * 100) + '%'
                    : '0%';

            renderDistribution(isWin ? gameState.guesses.length : null);

            const countdownContainer = document.getElementById('countdown-container');
            if (gameState.mode === 'daily') {
                countdownContainer.style.display = 'block';
                startCountdown();
            } else {
                countdownContainer.style.display = 'none';
            }

            document.getElementById('modal-overlay').classList.add('visible');

            // PRD 8.3: Show line connecting last guess to target
            if (!isWin) {
                showResultLine();
            }

            if (isWin) {
                createConfetti();
            }
        }

        function hideModal() {
            document.getElementById('modal-overlay').classList.remove('visible');
        }

        function renderDistribution(currentGuesses) {
            const bars = document.getElementById('distribution-bars');
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

        // ============================================
        // CONFETTI
        // ============================================

        function createConfetti() {
            const container = document.getElementById('confetti-container');
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

        // ============================================
        // COUNTDOWN
        // ============================================

        let countdownInterval = null;

        function startCountdown() {
            if (countdownInterval) clearInterval(countdownInterval);

            function updateCountdown() {
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);

                const diff = tomorrow - now;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                document.getElementById('countdown-time').textContent =
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            updateCountdown();
            countdownInterval = setInterval(updateCountdown, 1000);
        }

        // ============================================
        // SHARE
        // ============================================

        function shareResult() {
            const isWin = gameState.status === 'won';
            // Show 🔗 for adjacent guesses, otherwise use color emoji
            const emojis = gameState.guesses.map(g => {
                if (g.isAdjacent && g.county !== gameState.targetCounty) return '🔗';
                return COLOR_EMOJIS[g.color] || '⬜';
            }).join('');
            const score = isWin ? gameState.guesses.length : 'X';
            const difficultyLabel = settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1);

            let text = `lokl`;
            if (gameState.mode === 'daily') {
                text += ` #${gameState.gameNumber}`;
            }
            text += ` (${difficultyLabel})  🎯 ${score}/6\n${emojis}\nlokl.ie`;

            navigator.clipboard.writeText(text).then(() => {
                showCopyFeedback();
            }).catch(() => {
                alert('Result copied to clipboard!');
            });
        }

        function showCopyFeedback() {
            const feedback = document.getElementById('copy-feedback');
            feedback.classList.add('visible');
            setTimeout(() => {
                feedback.classList.remove('visible');
            }, 2000);
        }

        // ============================================
        // PERSISTENCE
        // ============================================

        function loadStatistics() {
            try {
                const saved = localStorage.getItem('loklStats');
                if (saved) {
                    statistics = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Failed to load statistics:', e);
            }
        }

        function saveStatistics() {
            try {
                localStorage.setItem('loklStats', JSON.stringify(statistics));
            } catch (e) {
                console.error('Failed to save statistics:', e);
            }
        }

        function loadSettings() {
            try {
                const saved = localStorage.getItem('loklSettings');
                if (saved) {
                    settings = { ...settings, ...JSON.parse(saved) };
                }
                // Validate difficulty is valid
                if (!['easy', 'medium', 'hard'].includes(settings.difficulty)) {
                    console.warn('Invalid difficulty found, resetting to medium');
                    settings.difficulty = 'medium';
                    saveSettings();
                }
                console.log('Settings loaded:', settings);
                // Update UI to match loaded settings
                const radio = document.getElementById(`diff-${settings.difficulty}`);
                if (radio) radio.checked = true;
                updateDifficultyDisplay();
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }

        function saveSettings() {
            try {
                localStorage.setItem('loklSettings', JSON.stringify(settings));
            } catch (e) {
                console.error('Failed to save settings:', e);
            }
        }

        function updateStatistics(won, guessCount = null) {
            if (gameState.mode !== 'daily') return;

            const today = new Date().toISOString().split('T')[0];

            if (statistics.lastPlayedDate === today) return;

            statistics.gamesPlayed++;
            statistics.lastPlayedDate = today;

            if (won) {
                statistics.gamesWon++;
                statistics.currentStreak++;
                if (statistics.currentStreak > statistics.bestStreak) {
                    statistics.bestStreak = statistics.currentStreak;
                }
                if (guessCount >= 1 && guessCount <= 6) {
                    statistics.distribution[guessCount - 1]++;
                }
            } else {
                statistics.currentStreak = 0;
            }

            saveStatistics();
        }

        function loadDailyState() {
            try {
                const saved = localStorage.getItem('loklDaily');
                return saved ? JSON.parse(saved) : null;
            } catch (e) {
                return null;
            }
        }

        function saveDailyState() {
            if (gameState.mode !== 'daily') return;

            try {
                const state = {
                    date: new Date().toISOString().split('T')[0],
                    guesses: gameState.guesses,
                    status: gameState.status
                };
                localStorage.setItem('loklDaily', JSON.stringify(state));
            } catch (e) {
                console.error('Failed to save daily state:', e);
            }
        }

        // ============================================
        // THEME MANAGEMENT
        // ============================================

        let currentTheme = 'light';

        function initTheme() {
            const savedTheme = localStorage.getItem('loklTheme') || 'light';
            setTheme(savedTheme);
        }

        function setTheme(theme) {
            currentTheme = theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('loklTheme', theme);
            updateThemeButton();
            updateMapTiles();
            updateAllMapBorders();
        }

        function toggleTheme() {
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        }

        function updateThemeButton() {
            const btn = document.getElementById('theme-toggle-btn');
            if (btn) {
                const icon = btn.querySelector('.menu-icon');
                if (icon) {
                    icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
                }
                btn.title = currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
            }
        }

        function updateAllMapBorders() {
            // Update all county borders when theme changes
            if (countyLayers && Object.keys(countyLayers).length > 0) {
                Object.values(countyLayers).forEach(layer => {
                    const currentStyle = defaultStyle(layer.feature);
                    layer.setStyle({
                        color: currentStyle.color,
                        opacity: currentStyle.opacity,
                        weight: currentStyle.weight
                    });
                });
            }
        }

        // ============================================
        // EVENT LISTENERS
        // ============================================

        document.addEventListener('DOMContentLoaded', () => {
            initTheme(); // Initialize theme before anything else
            loadStatistics();
            loadSettings();
            initStartScreenListeners(); // Set up start screen interactions
            initMap(); // This will call initGame after GeoJSON loads

            // NEW: Setup new floating UI elements
            const inputNew = document.getElementById('county-input-new');
            const submitBtnNew = document.getElementById('submit-btn-new');
            const autocompleteListNew = document.getElementById('autocomplete-list-new');

            // Legacy elements (kept for compatibility)
            const input = document.getElementById('county-input');
            const submitBtn = document.getElementById('submit-btn');
            const autocompleteList = document.getElementById('autocomplete-list');

            // Setup input handlers for NEW input
            inputNew.addEventListener('input', (e) => {
                const matches = getAutocompleteMatches(e.target.value);
                showAutocompleteNew(matches);
                updateSubmitButtonStateNew();
            });

            let selectedIndexNew = -1;

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
                        processGuess(county);
                    } else if (inputNew.value) {
                        const matches = getAutocompleteMatches(inputNew.value);
                        if (matches.length === 1) {
                            processGuess(matches[0]);
                        } else if (COUNTY_NAMES.includes(inputNew.value)) {
                            processGuess(inputNew.value);
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
                    processGuess(matches[0]);
                } else if (COUNTY_NAMES.includes(value)) {
                    processGuess(value);
                }
            });

            // Also setup legacy input for backwards compat
            input.addEventListener('input', (e) => {
                const matches = getAutocompleteMatches(e.target.value);
                showAutocomplete(matches);
                updateSubmitButtonState();
            });

            let selectedIndex = -1;

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
                        processGuess(county);
                    } else if (input.value) {
                        const matches = getAutocompleteMatches(input.value);
                        if (matches.length === 1) {
                            processGuess(matches[0]);
                        } else if (COUNTY_NAMES.includes(input.value)) {
                            processGuess(input.value);
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
                    processGuess(matches[0]);
                } else if (COUNTY_NAMES.includes(value)) {
                    processGuess(value);
                }
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.input-dock') && !e.target.closest('.input-wrapper')) {
                    hideAutocomplete();
                    hideAutocompleteNew();
                }
            });

            // NEW: Floating menu dropdown
            const floatingMenu = document.getElementById('floating-menu');
            document.getElementById('floating-menu-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                floatingMenu.classList.toggle('visible');
                updateFloatingMenuState();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.menu-container')) {
                    floatingMenu.classList.remove('visible');
                }
            });

            // Menu item handlers
            document.getElementById('menu-new-game').addEventListener('click', () => {
                floatingMenu.classList.remove('visible');
                // Clear previous game UI before showing start screen
                document.getElementById('guess-rail').innerHTML = '';
                // Show the start screen to let user choose game type
                document.getElementById('start-overlay').classList.add('visible');
                updateStartScreenDifficulty();
            });

            document.getElementById('menu-stats').addEventListener('click', () => {
                floatingMenu.classList.remove('visible');
                showEndModal();
            });

            document.getElementById('menu-help').addEventListener('click', () => {
                floatingMenu.classList.remove('visible');
                showHelp();
            });

            document.getElementById('theme-toggle-btn').addEventListener('click', () => {
                toggleTheme();
                // Keep menu open so user can see the change
            });

            document.getElementById('practice-btn').addEventListener('click', () => {
                if (gameState.mode === 'locate') {
                    exitLocateMode();
                    document.getElementById('practice-btn').innerHTML = '🎯 <span class="btn-text">Practice</span>';
                    document.getElementById('practice-btn').title = 'Practice Mode (P)';
                } else if (gameState.mode === 'daily') {
                    initGame('practice');
                    document.getElementById('practice-btn').innerHTML = '📅 <span class="btn-text">Daily</span>';
                    document.getElementById('practice-btn').title = 'Return to Daily Challenge';
                } else {
                    initGame('daily', true); // true = suppress modal on completed game
                    document.getElementById('practice-btn').innerHTML = '🎯 <span class="btn-text">Practice</span>';
                    document.getElementById('practice-btn').title = 'Practice Mode (P)';
                }
            });

            document.getElementById('locate-btn').addEventListener('click', () => {
                if (gameState.mode === 'locate') {
                    exitLocateMode();
                    document.getElementById('locate-btn').innerHTML = '📍 <span class="btn-text">Locate</span>';
                } else {
                    initLocateMode();
                    document.getElementById('locate-btn').innerHTML = '🔙 <span class="btn-text">Back</span>';
                }
            });

            document.getElementById('stats-btn').addEventListener('click', () => {
                if (gameState.status !== 'playing') {
                    showEndModal();
                }
            });

            document.getElementById('share-btn').addEventListener('click', shareResult);

            document.getElementById('play-again-btn').addEventListener('click', () => {
                hideModal();
                // Show mode selection screen for a better experience
                document.getElementById('start-overlay').classList.add('visible');
                updateStartScreenDifficulty();
            });

            document.getElementById('modal-overlay').addEventListener('click', (e) => {
                if (e.target === document.getElementById('modal-overlay')) {
                    hideModal();
                    clearResultLine();
                }
            });

            // Help button
            document.getElementById('help-btn').addEventListener('click', showHelp);
            document.getElementById('close-help').addEventListener('click', hideHelp);
            document.getElementById('close-help-x').addEventListener('click', hideHelp);
            document.getElementById('help-overlay').addEventListener('click', (e) => {
                if (e.target === document.getElementById('help-overlay')) {
                    hideHelp();
                }
            });

            // Settings button
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
                    settings.difficulty = e.target.value;
                    saveSettings();
                    // Re-render guess history with new settings
                    refreshGuessHistory();
                    updateModeBadge();
                    updateDifficultyDisplay();
                    updateGuessCounter();
                    updateGuessCounterPill();
                });
            });

            // Mode badge click to cycle difficulty
            document.getElementById('mode-badge')?.addEventListener('click', () => {
                // Only allow cycling in non-locate modes
                if (gameState.mode === 'locate') return;

                // Cycle through difficulties: easy -> medium -> hard -> easy
                const difficulties = ['easy', 'medium', 'hard'];
                const currentIndex = difficulties.indexOf(settings.difficulty);
                const nextIndex = (currentIndex + 1) % difficulties.length;
                settings.difficulty = difficulties[nextIndex];

                // Update radio buttons
                const radio = document.getElementById(`diff-${settings.difficulty}`);
                if (radio) radio.checked = true;

                saveSettings();
                refreshGuessHistory();
                updateModeBadge();
                updateDifficultyDisplay();
                updateGuessCounter();
                updateGuessCounterPill();
            });

            // Difficulty toggle button in header
            document.getElementById('difficulty-toggle-btn')?.addEventListener('click', () => {
                // Cycle through difficulties: easy -> medium -> hard -> easy
                const difficulties = ['easy', 'medium', 'hard'];
                const currentIndex = difficulties.indexOf(settings.difficulty);
                const nextIndex = (currentIndex + 1) % difficulties.length;
                settings.difficulty = difficulties[nextIndex];

                console.log('Difficulty changed to:', settings.difficulty);

                // Update radio buttons to keep in sync
                const radio = document.getElementById(`diff-${settings.difficulty}`);
                if (radio) radio.checked = true;

                saveSettings();
                refreshGuessHistory();
                updateModeBadge();
                updateDifficultyDisplay();
                updateGuessCounter();
                updateGuessCounterPill();

                // Force UI update
                updateStats();
            });

            // Panel toggle
            document.getElementById('panel-toggle').addEventListener('click', togglePanel);

            // PRD 8.4: Global keyboard shortcuts
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

            // Show tutorial for first-time users (after map loads)
            setTimeout(showTutorial, 1000);
        });

        // ============================================
        // AUTOMATED TESTS
        // ============================================

        const tests = {
            'P1.1 - Responsive layout exists': () => {
                const app = document.querySelector('.app');
                const mapPanel = document.querySelector('.map-panel');
                const gamePanel = document.querySelector('.game-panel');
                return app && mapPanel && gamePanel;
            },

            'P1.2 - CSS custom properties defined': () => {
                const root = getComputedStyle(document.documentElement);
                return root.getPropertyValue('--color-correct').trim() !== '' &&
                       root.getPropertyValue('--color-default').trim() !== '';
            },

            'P1.3 - County data has 32 entries': () => {
                return Object.keys(COUNTIES).length === 32;
            },

            'P1.3 - Each county has required properties': () => {
                return Object.values(COUNTIES).every(c =>
                    typeof c.lat === 'number' &&
                    typeof c.lng === 'number' &&
                    typeof c.province === 'string' &&
                    typeof c.fact === 'string'
                );
            },

            'P1.4 - Leaflet map initialized': () => {
                return map !== null && typeof map.getCenter === 'function';
            },

            'P1.4 - GeoJSON loaded with 32 counties': () => {
                return Object.keys(countyLayers).length === 32;
            },

            'P2.1 - getDistance returns correct value': () => {
                const dublin = COUNTIES['Dublin'];
                const cork = COUNTIES['Cork'];
                const dist = getDistance(dublin, cork);
                return dist > 200 && dist < 250;
            },

            'P2.2 - getBearing returns valid arrow': () => {
                const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
                const dublin = COUNTIES['Dublin'];
                const cork = COUNTIES['Cork'];
                const bearing = getBearing(dublin, cork);
                return arrows.includes(bearing);
            },

            'P2.3 - getDailyCounty returns consistent result': () => {
                const c1 = getDailyCounty();
                const c2 = getDailyCounty();
                return c1 === c2 && COUNTY_NAMES.includes(c1);
            },

            'P2.4 - getProximityColor returns correct colors': () => {
                return getProximityColor(0) === COLORS.CORRECT &&
                       getProximityColor(400) === COLORS.COLD_1 &&
                       getProximityColor(100) === COLORS.WARM_2;
            },

            'P2.5 - gameState object has required properties': () => {
                return gameState.hasOwnProperty('targetCounty') &&
                       gameState.hasOwnProperty('guesses') &&
                       gameState.hasOwnProperty('status');
            },

            'P2.6 - Game initializes with target county': () => {
                return gameState.targetCounty !== null &&
                       COUNTY_NAMES.includes(gameState.targetCounty);
            },

            'P3.1 - Input field exists with placeholder': () => {
                const input = document.getElementById('county-input');
                return input && input.placeholder === 'Guess a county...';
            },

            'P3.2 - Autocomplete shows matches': () => {
                const matches = getAutocompleteMatches('Cor');
                return matches.includes('Cork');
            },

            'P3.4 - Submit button exists': () => {
                return document.getElementById('submit-btn') !== null;
            },

            'P3.7 - Guess slots exist': () => {
                const slots = document.querySelectorAll('.guess-slot');
                return slots.length === 6;
            },

            'P4.1 - Guess history container exists': () => {
                return document.getElementById('guess-list') !== null;
            },

            'P4.4 - Stats bar has 3 stat boxes': () => {
                const boxes = document.querySelectorAll('.stat-box');
                return boxes.length === 3;
            },

            'P5.2 - Modal exists': () => {
                return document.getElementById('modal-overlay') !== null;
            },

            'P5.3 - Confetti container exists': () => {
                return document.getElementById('confetti-container') !== null;
            },

            'P5.7 - Play again button exists': () => {
                return document.getElementById('play-again-btn') !== null;
            },

            'P6.1 - Statistics object has required properties': () => {
                return statistics.hasOwnProperty('gamesPlayed') &&
                       statistics.hasOwnProperty('gamesWon') &&
                       statistics.hasOwnProperty('currentStreak') &&
                       statistics.hasOwnProperty('distribution');
            },

            'P6.4 - Distribution histogram container exists': () => {
                return document.getElementById('distribution-bars') !== null;
            },

            'P7.1 - Share button exists': () => {
                return document.getElementById('share-btn') !== null;
            },

            'P7.4 - Practice mode button exists': () => {
                return document.getElementById('practice-btn') !== null;
            },

            'P7.7 - Countdown element exists': () => {
                return document.getElementById('countdown-time') !== null;
            },

            // Phase 8 Tests
            'P8.1 - Panel toggle button exists': () => {
                return document.getElementById('panel-toggle') !== null;
            },

            'P8.2 - Submit button has ready state logic': () => {
                return typeof updateSubmitButtonState === 'function';
            },

            'P8.4 - Help button exists': () => {
                return document.getElementById('help-btn') !== null;
            },

            'P8.4 - Help modal exists': () => {
                return document.getElementById('help-overlay') !== null;
            },

            'P8.8 - Start screen overlay exists': () => {
                return document.getElementById('start-overlay') !== null;
            },

            'P8.3 - Polyline functions exist': () => {
                return typeof showResultLine === 'function' && typeof clearResultLine === 'function';
            }
        };

        function runTests() {
            const results = [];
            let passed = 0;
            let failed = 0;

            for (const [name, test] of Object.entries(tests)) {
                try {
                    const result = test();
                    if (result) {
                        passed++;
                        results.push({ name, status: 'pass' });
                    } else {
                        failed++;
                        results.push({ name, status: 'fail' });
                    }
                } catch (e) {
                    failed++;
                    results.push({ name, status: 'fail', error: e.message });
                }
            }

            return { results, passed, failed, total: passed + failed };
        }

        function displayTestResults() {
            const { results, passed, failed, total } = runTests();
            const output = document.getElementById('test-output');

            output.innerHTML = `<p><strong>Passed: ${passed}/${total}</strong></p>`;

            results.forEach(r => {
                const div = document.createElement('div');
                div.className = `test-result ${r.status}`;
                div.textContent = `${r.status === 'pass' ? '✓' : '✗'} ${r.name}`;
                if (r.error) {
                    div.textContent += ` - ${r.error}`;
                }
                output.appendChild(div);
            });

            document.getElementById('test-results').classList.add('visible');
        }

        document.getElementById('test-btn')?.addEventListener('click', displayTestResults);
        document.getElementById('close-tests')?.addEventListener('click', () => {
            document.getElementById('test-results').classList.remove('visible');
        });

        // Expose for console testing
        window.gameState = gameState;
        window.COUNTIES = COUNTIES;
        window.getDistance = getDistance;
        window.getBearing = getBearing;
        window.getProximityColor = getProximityColor;
        window.getDailyCounty = getDailyCounty;
        window.runTests = runTests;
        window.countyLayers = countyLayers;
