/**
 * Mock data and fixtures for testing
 */

// Sample counties for testing
export const MOCK_COUNTIES = {
  Cork: {
    name: 'Cork',
    lat: 51.8985,
    lng: -8.4756,
    province: 'Munster',
    funFact: 'Cork is the largest county in Ireland by area.'
  },
  Dublin: {
    name: 'Dublin',
    lat: 53.3498,
    lng: -6.2603,
    province: 'Leinster',
    funFact: 'Dublin is the capital of Ireland.'
  },
  Galway: {
    name: 'Galway',
    lat: 53.2707,
    lng: -9.0568,
    province: 'Connacht',
    funFact: 'Galway is known for its vibrant arts scene.'
  },
  Kerry: {
    name: 'Kerry',
    lat: 52.1551,
    lng: -9.5671,
    province: 'Munster',
    funFact: 'Kerry is home to Ireland\'s highest mountain.'
  },
  Antrim: {
    name: 'Antrim',
    lat: 54.7186,
    lng: -6.2088,
    province: 'Ulster',
    funFact: 'Antrim has the famous Giant\'s Causeway.'
  }
};

// Sample adjacency data for testing
export const MOCK_ADJACENCY = {
  Cork: ['Limerick', 'Tipperary', 'Waterford', 'Kerry'],
  Dublin: ['Meath', 'Kildare', 'Wicklow'],
  Galway: ['Mayo', 'Roscommon', 'Clare', 'Offaly', 'Tipperary'],
  Kerry: ['Cork', 'Limerick'],
  Antrim: ['Down', 'Derry']
};

// Sample game state for testing
export const MOCK_GAME_STATE = {
  mode: 'daily',
  targetCounty: 'Cork',
  guesses: [
    {
      county: 'Dublin',
      distance: 219.5,
      bearing: 225,
      color: '#2980b9'
    },
    {
      county: 'Galway',
      distance: 103.8,
      bearing: 180,
      color: '#f39c12'
    }
  ],
  gameStatus: 'playing',
  startTime: Date.now()
};

// Sample statistics for testing
export const MOCK_STATISTICS = {
  gamesPlayed: 10,
  gamesWon: 8,
  currentStreak: 3,
  maxStreak: 5,
  guessDistribution: {
    1: 2,
    2: 3,
    3: 2,
    4: 1,
    5: 0,
    6: 0
  }
};

// Sample settings for testing
export const MOCK_SETTINGS = {
  theme: 'light',
  animations: true,
  showHints: true
};

// Known distance calculations for testing
export const KNOWN_DISTANCES = [
  {
    from: { lat: 51.8985, lng: -8.4756 }, // Cork
    to: { lat: 53.3498, lng: -6.2603 },   // Dublin
    expectedDistance: 219.5, // Approximate km
    tolerance: 1.0
  },
  {
    from: { lat: 53.3498, lng: -6.2603 }, // Dublin
    to: { lat: 53.2707, lng: -9.0568 },   // Galway
    expectedDistance: 187.7, // Approximate km
    tolerance: 1.0
  },
  {
    from: { lat: 51.8985, lng: -8.4756 }, // Cork
    to: { lat: 51.8985, lng: -8.4756 },   // Cork (same location)
    expectedDistance: 0,
    tolerance: 0.1
  }
];

// Known bearing calculations for testing
export const KNOWN_BEARINGS = [
  {
    from: { lat: 51.8985, lng: -8.4756 }, // Cork
    to: { lat: 53.3498, lng: -6.2603 },   // Dublin (northeast)
    expectedBearing: 45, // NE
    tolerance: 22.5
  },
  {
    from: { lat: 53.3498, lng: -6.2603 }, // Dublin
    to: { lat: 51.8985, lng: -8.4756 },   // Cork (southwest)
    expectedBearing: 225, // SW
    tolerance: 22.5
  }
];

// Color ranges for proximity testing
export const COLOR_RANGES = [
  { ratio: 0.85, expectedColor: '#1a5276' },  // 75-100% - Dark Blue
  { ratio: 0.65, expectedColor: '#2980b9' },  // 55-75% - Blue
  { ratio: 0.47, expectedColor: '#f39c12' },  // 40-55% - Yellow
  { ratio: 0.32, expectedColor: '#e67e22' },  // 25-40% - Orange
  { ratio: 0.20, expectedColor: '#e74c3c' },  // 15-25% - Red-Orange
  { ratio: 0.10, expectedColor: '#c0392b' },  // 5-15% - Red
  { ratio: 0.02, expectedColor: '#27ae60' },  // 0-5% - Green
  { ratio: 0.00, expectedColor: '#27ae60' }   // Correct - Green
];
