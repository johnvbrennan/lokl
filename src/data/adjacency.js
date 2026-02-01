// ============================================
// COUNTY ADJACENCY DATA
// Defines which counties share borders
// ============================================

export const COUNTY_ADJACENCY = {
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

/**
 * Check if two counties share a border
 * @param {string} county1 - First county name
 * @param {string} county2 - Second county name
 * @returns {boolean} True if counties are adjacent
 */
export function areAdjacent(county1, county2) {
    if (!county1 || !county2 || county1 === county2) return false;
    const neighbors = COUNTY_ADJACENCY[county1];
    return neighbors ? neighbors.includes(county2) : false;
}
