# ☘️ County Globle — Game Specification

**Project:** County Globle
**Authors:** John & Sean
**Platform:** Web (HTML / CSS / JavaScript)
**Version:** 1.0 — January 2026
**Status:** Ready for Implementation

---

## 1. Game Overview

**County Globle** is a daily geography guessing game inspired by Globle and Wordle. The player must identify a mystery Irish county in a maximum of **6 guesses**. After each guess, the guessed county lights up on a map of Ireland with a colour indicating proximity to the target. Hotter colours mean closer; cooler colours mean further away.

The game is designed to be fun, educational, and replayable for players of all ages, with a particular focus on learning Irish geography, GAA knowledge, and county trivia.

| Field | Detail |
|-------|--------|
| Genre | Geography guessing / puzzle game |
| Inspiration | Globle + Wordle (map-based, limited guesses) |
| Target Audience | All ages; particularly suited to GAA fans and geography enthusiasts |
| Platform | Web browser (mobile responsive) |
| Session Length | 2–5 minutes per game |
| Core Loop | Guess → See colour feedback on map → Refine → Repeat (max 6 times) |

---

## 2. Game Rules

### 2.1 Objective

Identify the mystery county from all 32 counties of Ireland (Republic and Northern Ireland) in 6 guesses or fewer.

### 2.2 Turn Structure

1. The player types a county name into the input field. Autocomplete assists with valid county names.
2. On submission, the guessed county is highlighted on the SVG map of Ireland with a colour representing geographic proximity to the target county.
3. The guess appears in a scrollable list showing: guess number (1–6), colour indicator dot, county name, distance in kilometres, and directional arrow pointing toward the target.
4. If the guess is correct, the game ends in a win. If the guess is wrong and the player has used all 6 guesses, the game ends in a loss and the target county is revealed.
5. The player cannot guess the same county twice. Previously guessed counties are excluded from autocomplete.

### 2.3 Guess Limit

The player has exactly **6 guesses**. This is displayed prominently as a guess counter (e.g. **3/6**) that updates after each attempt. The remaining guess slots should also be visually represented, similar to Wordle's tile rows, so the player always knows how many attempts they have left.

### 2.4 Win Condition

The player guesses the correct county within 6 attempts. A celebration screen is displayed with confetti, the county name, a fun fact, and the player's score.

### 2.5 Lose Condition

The player exhausts all 6 guesses without finding the correct county. A "game over" screen reveals the target county on the map (highlighted in green), shows the fun fact, and offers a "Play Again" option.

---

## 3. Colour & Proximity System

Distance is calculated using the **Haversine formula** between the geographic centre points (centroids) of each county. The maximum possible distance across Ireland is approximately 470 km. Colours are assigned based on the ratio of guess distance to this maximum.

### 3.1 Colour Bands

| Colour | Distance Ratio | Approx. Distance | Meaning |
|--------|---------------|-------------------|---------|
| Dark Blue | 75%–100% | 350–470 km | Very far – opposite end of the island |
| Blue | 55%–75% | 260–350 km | Far away |
| Yellow | 40%–55% | 190–260 km | Getting warmer |
| Orange | 25%–40% | 120–190 km | Warm – in the right region |
| Red-Orange | 15%–25% | 70–120 km | Very warm – nearby counties |
| Red | 5%–15% | 25–70 km | Hot – almost there! |
| Green | 0%–5% (correct) | 0 km | 🎯 Correct! |

### 3.2 Directional Arrow

In addition to colour, each guess displays a **compass arrow** pointing from the guessed county toward the target county. This gives the player two pieces of information per guess: how far away they are (colour) and which direction to look (arrow). The arrow is calculated from the bearing between the two county centroids.

Use one of 8 directional arrows: ↑ ↗ → ↘ ↓ ↙ ← ↖

---

## 4. User Interface

### 4.1 Layout

The game uses a responsive layout. On desktop (700px+), the map occupies the left panel and the guess interface sits on the right. On mobile, these stack vertically with the map on top.

### 4.2 Map Panel

- An SVG map of all 32 Irish counties, rendered on a dark background.
- Unguessed counties appear in a neutral dark tone with subtle borders.
- Guessed counties are filled with their proximity colour and have slightly stronger borders.
- The correct county (when found or revealed) pulses with a gentle green glow animation.
- County names are **not** labelled on the map to maintain the challenge.
- The map should support basic pan and zoom on mobile via touch gestures.

### 4.3 Input Area

- A text input field with placeholder text "Guess a county…".
- Autocomplete dropdown appears after 1+ characters, showing matching county names (excluding already-guessed counties).
- Keyboard navigation: arrow keys to select, Enter to submit, Escape to dismiss.
- A submit button (arrow icon) beside the input.
- Input is disabled once the game ends (win or loss).

### 4.4 Guess Counter Display

A prominent **visual guess tracker** showing 6 slots (circles or tiles). Filled slots represent used guesses, empty slots represent remaining guesses. The current guess number is displayed as **X/6**. As guesses are used, the tracker fills in with the colour of each guess, creating a visual summary of the player's progress.

### 4.5 Guess History List

A scrollable list showing all guesses in reverse chronological order (most recent first). Each entry displays: guess number, colour dot, county name, distance in km, and directional arrow. The correct guess is visually distinguished with a green highlight and a target emoji.

### 4.6 Stats Bar

Three compact stat boxes showing: current guess count (X/6), closest distance so far, and the province of the closest guess (as a subtle hint).

---

## 5. Game Modes

### 5.1 Daily Challenge

One mystery county per day, seeded from the current date so all players get the same county. Resets at midnight local time. The player gets **one attempt per day**. Results can be shared as an emoji grid (like Wordle), e.g.:

```
County Globle #42  🎯 4/6
🔵🟡🟠🟢
countygloble.ie
```

### 5.2 Practice Mode

Unlimited games with randomly selected counties. No streak tracking. Ideal for learning and warming up. The player can toggle into practice mode from the main menu.

### 5.3 Difficulty Levels (Future Enhancement)

| Difficulty | Description |
|------------|-------------|
| Easy (6 guesses) | Full colour feedback + distance + directional arrow + province hint after guess 3 |
| Normal (6 guesses) | Full colour feedback + distance + directional arrow (default mode) |
| Hard (4 guesses) | Colour feedback only – no distance or directional arrow shown |
| Expert (3 guesses) | Colour feedback only, no distance, no arrow, and a 30-second time limit per guess |

---

## 6. County Data Requirements

Each of the 32 counties requires the following data:

| Field | Details |
|-------|---------|
| Name | Official county name (e.g. "Cork", "Derry") |
| Latitude / Longitude | Geographic centroid coordinates for distance calculation |
| Province | Munster, Leinster, Ulster, or Connacht |
| SVG Path | Vector outline for the map – ideally sourced from accurate GeoJSON data |
| Fun Fact | One interesting, family-friendly fact per county (displayed on win/loss) |
| GAA Colours | Primary jersey colours for potential hint system |
| GAA Titles | Number of All-Ireland senior titles (hurling and football) for potential hints |

### County Data (Coordinates and Facts)

```json
{
  "Antrim": { "lat": 54.72, "lng": -6.21, "province": "Ulster", "fact": "Home to the Giant's Causeway, one of Ireland's most famous landmarks!" },
  "Armagh": { "lat": 54.35, "lng": -6.65, "province": "Ulster", "fact": "Known as the Orchard County — famous for Bramley apples!" },
  "Carlow": { "lat": 52.72, "lng": -6.84, "province": "Leinster", "fact": "Ireland's second-smallest county — but packed with history!" },
  "Cavan": { "lat": 53.99, "lng": -7.36, "province": "Ulster", "fact": "The source of the River Shannon, Ireland's longest river!" },
  "Clare": { "lat": 52.84, "lng": -8.98, "province": "Munster", "fact": "Home to the Cliffs of Moher and the Burren's lunar landscape!" },
  "Cork": { "lat": 51.90, "lng": -8.47, "province": "Munster", "fact": "Ireland's largest county — the Rebel County!" },
  "Derry": { "lat": 54.99, "lng": -7.00, "province": "Ulster", "fact": "Derry's city walls are among the best-preserved in Europe!" },
  "Donegal": { "lat": 54.83, "lng": -7.95, "province": "Ulster", "fact": "Contains Ireland's most northerly point — Malin Head!" },
  "Down": { "lat": 54.38, "lng": -5.88, "province": "Ulster", "fact": "Home to the Mourne Mountains that inspired C.S. Lewis's Narnia!" },
  "Dublin": { "lat": 53.35, "lng": -6.26, "province": "Leinster", "fact": "Ireland's capital — home to about a third of the country's population!" },
  "Fermanagh": { "lat": 54.34, "lng": -7.64, "province": "Ulster", "fact": "A third of Fermanagh is covered by water — the Lakeland County!" },
  "Galway": { "lat": 53.27, "lng": -8.86, "province": "Connacht", "fact": "Home to the Aran Islands and the heart of the Gaeltacht!" },
  "Kerry": { "lat": 52.06, "lng": -9.85, "province": "Munster", "fact": "Home to Carrauntoohil — Ireland's highest mountain!" },
  "Kildare": { "lat": 53.16, "lng": -6.91, "province": "Leinster", "fact": "The home of Irish horse racing — the Curragh is legendary!" },
  "Kilkenny": { "lat": 52.65, "lng": -7.25, "province": "Leinster", "fact": "The Marble City — and hurling royalty with 36 All-Ireland titles!" },
  "Laois": { "lat": 53.03, "lng": -7.56, "province": "Leinster", "fact": "Home to the Rock of Dunamase, a stunning ruined fortress!" },
  "Leitrim": { "lat": 54.12, "lng": -8.00, "province": "Connacht", "fact": "Ireland's least populated county — but beautiful lake country!" },
  "Limerick": { "lat": 52.66, "lng": -8.63, "province": "Munster", "fact": "The Treaty City — where the famous Treaty of Limerick was signed!" },
  "Longford": { "lat": 53.73, "lng": -7.80, "province": "Leinster", "fact": "Corlea Trackway here is a 2,000-year-old Iron Age road!" },
  "Louth": { "lat": 53.88, "lng": -6.49, "province": "Leinster", "fact": "Ireland's smallest county — the Wee County!" },
  "Mayo": { "lat": 53.76, "lng": -9.53, "province": "Connacht", "fact": "Home to Croagh Patrick — Ireland's holy mountain!" },
  "Meath": { "lat": 53.60, "lng": -6.66, "province": "Leinster", "fact": "Newgrange is older than the Egyptian pyramids!" },
  "Monaghan": { "lat": 54.25, "lng": -6.97, "province": "Ulster", "fact": "The drumlin county — rolling hills shaped by ice age glaciers!" },
  "Offaly": { "lat": 53.23, "lng": -7.72, "province": "Leinster", "fact": "Clonmacnoise monastery was once one of Europe's great centres of learning!" },
  "Roscommon": { "lat": 53.76, "lng": -8.27, "province": "Connacht", "fact": "Home to Rathcroghan — the ancient capital of Connacht!" },
  "Sligo": { "lat": 54.25, "lng": -8.47, "province": "Connacht", "fact": "Yeats Country — the poet's beloved Ben Bulben is here!" },
  "Tipperary": { "lat": 52.47, "lng": -7.86, "province": "Munster", "fact": "The Rock of Cashel is one of Ireland's most spectacular sites!" },
  "Tyrone": { "lat": 54.60, "lng": -7.31, "province": "Ulster", "fact": "Ireland's largest inland county — the O'Neill heartland!" },
  "Waterford": { "lat": 52.26, "lng": -7.11, "province": "Munster", "fact": "Ireland's oldest city — founded by Vikings in 914 AD!" },
  "Westmeath": { "lat": 53.53, "lng": -7.34, "province": "Leinster", "fact": "The Lake County — home to beautiful Lough Ennell and Lough Owel!" },
  "Wexford": { "lat": 52.47, "lng": -6.58, "province": "Leinster", "fact": "The Sunny Southeast — has the most sunshine hours in Ireland!" },
  "Wicklow": { "lat": 52.98, "lng": -6.37, "province": "Leinster", "fact": "The Garden of Ireland — stunning mountains just south of Dublin!" }
}
```

---

## 7. Scoring & Persistence

### 7.1 Score Rating

| Guesses Used | Rating | Stars |
|-------------|--------|-------|
| 1 | Genius! 🤯 | ⭐⭐⭐⭐⭐ |
| 2 | Brilliant 🤩 | ⭐⭐⭐⭐ |
| 3 | Great 😎 | ⭐⭐⭐ |
| 4 | Good 😀 | ⭐⭐ |
| 5 | Solid 🙂 | ⭐ |
| 6 | Phew! 😅 | ✔️ |
| Loss | Better luck next time 😞 | ❌ |

### 7.2 Local Storage

The following statistics are persisted in the browser's localStorage:

- Games played (total count)
- Games won (total wins)
- Win percentage
- Current streak (consecutive daily wins)
- Best streak (longest ever consecutive daily wins)
- Guess distribution (histogram of how many games were won in 1, 2, 3, 4, 5, or 6 guesses)
- Best score (fewest guesses to win)
- Today's game state (to prevent replaying the daily challenge)

---

## 8. Share Functionality

After completing a game (win or loss), the player can tap a "Share" button to copy their result to the clipboard in a Wordle-style format:

```
County Globle #42  🎯 4/6
🔵🟡🟠🟢
countygloble.ie
```

Each coloured emoji corresponds to the proximity colour of that guess. The emoji mapping is:

| Colour | Emoji |
|--------|-------|
| Dark Blue | 🔵 |
| Blue | 🔷 |
| Yellow | 🟡 |
| Orange | 🟠 |
| Red-Orange | 🟧 |
| Red | 🔴 |
| Green (correct) | 🟢 |

This allows players to share on WhatsApp, Twitter/X, or other platforms without spoiling the answer. For a loss, display as `X/6` instead of a number.

---

## 9. Win & Loss Screens

### 9.1 Win Screen

A modal overlay with the following elements:

- Confetti animation (Irish tricolour colours: green, white, orange)
- "Well Done!" title with star rating based on number of guesses
- The mystery county name displayed prominently
- A fun fact about the county
- Score summary: guesses used, best ever score, current streak
- Guess distribution histogram (bar chart of guess counts across all games)
- "Share" button to copy emoji result to clipboard
- "Play Again" button (practice mode) or countdown to next daily challenge

### 9.2 Loss Screen

Similar to the win screen but with a commiserating tone:

- The target county is revealed and highlighted in green on the map
- "The answer was [County Name]" displayed prominently
- The fun fact about the target county is shown
- The player's 6 guesses are summarised with colours and distances
- "Share" button (shares result with `X/6` showing as "X" for a loss)
- "Play Again" button or countdown to next daily

---

## 10. Hint System (Optional Enhancement)

An optional hint system can be enabled to help younger or less experienced players. Hints are revealed progressively after certain guess thresholds:

| After Guess | Hint Revealed |
|------------|---------------|
| Guess 3 | Province is revealed (e.g. "The mystery county is in Munster") |
| Guess 4 | GAA jersey colours are revealed (e.g. "This county plays in saffron and blue") |
| Guess 5 | First letter of the county name is revealed (e.g. "The county starts with 'C'") |

Hints can be toggled on/off from a settings menu. When hints are enabled, the share result includes a "💡" emoji to indicate hints were used.

---

## 11. Technical Specification

### 11.1 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Single HTML file with embedded CSS and JavaScript (no build step required) |
| Map Rendering | Inline SVG with path elements for each county |
| Styling | CSS custom properties (variables) for theming; responsive grid layout |
| State Management | Vanilla JavaScript; game state held in memory during session |
| Persistence | localStorage for statistics, streak data, and daily game state |
| Distance Calculation | Haversine formula (JavaScript implementation) |
| Daily Seed | Date-based deterministic selection using a seeded random function |
| Hosting | Any static host (GitHub Pages, Netlify, Vercel, or local file) |

### 11.2 Key Algorithms

**Haversine Distance:** Calculate the great-circle distance between two county centroids using their latitude and longitude. Returns distance in kilometres.

```javascript
function getDistance(c1, c2) {
  const R = 6371; // Earth's radius in km
  const dLat = (c2.lat - c1.lat) * Math.PI / 180;
  const dLng = (c2.lng - c1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

**Bearing Calculation:** Calculate the initial compass bearing from the guessed county to the target county. Map to one of 8 directional arrows: ↑ ↗ → ↘ ↓ ↙ ← ↖.

```javascript
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
```

**Daily Seed:** Use the current date (YYYY-MM-DD string) to generate a deterministic index into the county array. A simple hash function ensures all players get the same county each day while distributing selections evenly.

```javascript
function getDailyCounty(countyNames) {
  const today = new Date().toISOString().split('T')[0]; // "2026-01-31"
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0;
  }
  return countyNames[Math.abs(hash) % countyNames.length];
}
```

### 11.3 File Structure

For the initial implementation, the entire game lives in a single HTML file for simplicity. As features grow, this can be refactored into separate files:

- `index.html` – Main game file (HTML + CSS + JS)
- `counties.json` – County data (coordinates, facts, SVG paths) – can be embedded or separate
- `README.md` – Project documentation and setup instructions

### 11.4 SVG Map

The map should use accurate county boundary paths. The recommended approach is to source GeoJSON boundary data for Irish counties and convert to SVG paths. Each county path element should have:

- An `id` attribute matching the county name (e.g. `id="county-Cork"`)
- A `data-county` attribute with the county name for JavaScript access
- Default fill of `#1a2a4a` (dark neutral)
- Stroke of `#2a3d5e` with width `0.5`

### 11.5 Colour Constants

```javascript
const COLOURS = {
  COLD_1:   '#1a5276',  // Dark Blue  (75-100%)
  COLD_2:   '#2980b9',  // Blue       (55-75%)
  WARM_1:   '#f39c12',  // Yellow     (40-55%)
  WARM_2:   '#e67e22',  // Orange     (25-40%)
  WARM_3:   '#e74c3c',  // Red-Orange (15-25%)
  HOT:      '#c0392b',  // Red        (5-15%)
  CORRECT:  '#27ae60',  // Green      (0-5% / correct)
  DEFAULT:  '#1a2a4a',  // Unguessed
};
```

---

## 12. Future Enhancements

The following features are out of scope for v1 but documented here for future development sessions:

1. Sound effects – satisfying pop on guess, celebration sound on win, commiseration on loss
2. Animations – smooth county fill transitions, map camera pan to guessed county
3. Leaderboard – family/friends leaderboard using a simple backend or shared code
4. GAA Quiz Mode – identify the county from a GAA-related clue instead of map proximity
5. Towns Mode – expand the game to 800+ Irish towns for extreme difficulty
6. Accessibility – screen reader support, keyboard-only navigation, colour-blind friendly palette
7. PWA support – installable on mobile with offline play capability
8. Dark/light theme toggle

---

*End of Specification — Ready for implementation with Claude Code ☘️*
