// ============================================
// COUNTRY ADJACENCY MATRIX
// Defines which European countries share land borders
// Maritime borders are NOT considered adjacent
// ============================================

export const COUNTRY_ADJACENCY = {
    // Western Europe
    "United Kingdom": [], // Island nation - no land borders
    "Ireland": [], // Island nation - no land borders
    "France": ["Spain", "Andorra", "Monaco", "Italy", "Switzerland", "Germany", "Luxembourg", "Belgium"],
    "Belgium": ["France", "Luxembourg", "Germany", "Netherlands"],
    "Netherlands": ["Belgium", "Germany"],
    "Luxembourg": ["Belgium", "France", "Germany"],
    "Monaco": ["France"],

    // Central Europe
    "Germany": ["Denmark", "Poland", "Czech Republic", "Austria", "Switzerland", "France", "Luxembourg", "Belgium", "Netherlands"],
    "Switzerland": ["Germany", "Austria", "Liechtenstein", "Italy", "France"],
    "Austria": ["Germany", "Czech Republic", "Slovakia", "Hungary", "Slovenia", "Italy", "Switzerland", "Liechtenstein"],
    "Poland": ["Germany", "Czech Republic", "Slovakia", "Ukraine", "Lithuania"],
    "Czech Republic": ["Germany", "Poland", "Slovakia", "Austria"],
    "Slovakia": ["Poland", "Ukraine", "Hungary", "Austria", "Czech Republic"],
    "Hungary": ["Slovakia", "Ukraine", "Romania", "Serbia", "Croatia", "Slovenia", "Austria"],
    "Liechtenstein": ["Switzerland", "Austria"],

    // Northern Europe
    "Norway": ["Sweden", "Finland"],
    "Sweden": ["Norway", "Finland"],
    "Finland": ["Norway", "Sweden"],
    "Denmark": ["Germany"],
    "Iceland": [], // Island nation - no land borders
    "Estonia": [], // No land borders with other EU countries (borders Russia)
    "Latvia": ["Estonia", "Lithuania"],
    "Lithuania": ["Latvia", "Poland"],

    // Southern Europe
    "Spain": ["France", "Andorra", "Portugal"],
    "Portugal": ["Spain"],
    "Italy": ["France", "Switzerland", "Austria", "Slovenia", "San Marino", "Vatican City"],
    "Greece": ["Albania", "North Macedonia", "Bulgaria"],
    "Malta": [], // Island nation - no land borders
    "Cyprus": [], // Island nation - no land borders
    "Andorra": ["France", "Spain"],
    "San Marino": ["Italy"],
    "Vatican City": ["Italy"],

    // Eastern Europe
    "Romania": ["Ukraine", "Moldova", "Bulgaria", "Serbia", "Hungary"],
    "Bulgaria": ["Romania", "Serbia", "North Macedonia", "Greece"],
    "Serbia": ["Hungary", "Romania", "Bulgaria", "North Macedonia", "Kosovo", "Montenegro", "Bosnia and Herzegovina", "Croatia"],
    "Croatia": ["Slovenia", "Hungary", "Serbia", "Bosnia and Herzegovina", "Montenegro"],
    "Bosnia and Herzegovina": ["Croatia", "Serbia", "Montenegro"],
    "Montenegro": ["Croatia", "Bosnia and Herzegovina", "Serbia", "Kosovo", "Albania"],
    "Albania": ["Montenegro", "Kosovo", "North Macedonia", "Greece"],
    "North Macedonia": ["Serbia", "Kosovo", "Albania", "Greece", "Bulgaria"],
    "Kosovo": ["Serbia", "Montenegro", "Albania", "North Macedonia"],
    "Slovenia": ["Austria", "Italy", "Hungary", "Croatia"],
    "Moldova": ["Romania", "Ukraine"],
    "Ukraine": ["Poland", "Slovakia", "Hungary", "Romania", "Moldova"]
};

/**
 * Check if two countries share a land border
 * @param {string} country1 - First country name
 * @param {string} country2 - Second country name
 * @returns {boolean} True if countries are adjacent
 */
export function areAdjacent(country1, country2) {
    return COUNTRY_ADJACENCY[country1]?.includes(country2) || false;
}
