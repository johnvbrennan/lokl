# lokl 🌍

A geography guessing game inspired by Globle and Wordle. Test your knowledge of Irish counties or European countries!

## Game Regions

lokl now supports two geographic regions:

- **🇮🇪 Irish Counties** (32 counties): The original lokl experience featuring all counties of Ireland
- **🇪🇺 European Countries** (44 countries): Expanded European geography challenge

Each region has:
- Independent daily challenges
- Separate statistics and progress tracking
- Region-specific leaderboards

You can switch regions from the start screen before beginning a game.

## Game Modes

- **Daily Challenge**: Same place for everyone, one puzzle per day
- **Practice Mode**: Random places, unlimited plays
- **Locate Mode**: Click on the map to find named places - great for learning!
- **⏱️ Time Trial**: Race against the clock with unlimited guesses
- **🔥 Streak**: One click per place - how many can you identify in a row?

## How to Play

1. Select your region (Irish Counties or European Countries)
2. Choose your game mode and difficulty
3. Guess places by typing their names or clicking on the map
4. Colors indicate how close you are:
   - 🟢 Green: Correct!
   - 🔴 Red: Very close
   - 🟡 Yellow: Getting warmer
   - 🔵 Blue: Far away

## Development

### Prerequisites
- Node.js (for Vite dev server)

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npx vite

# Open http://localhost:5173
```

### Building for Production

```bash
# Build optimized production files
npm run build

# Preview production build
npm run preview
```

## Technology Stack

- **Vanilla JavaScript** - No frameworks, pure JS
- **Leaflet.js** - Interactive maps
- **Vite** - Fast development and building
- **localStorage** - Persistent game state and statistics
- **Natural Earth Data** - GeoJSON map data

## Data Sources

- **Irish Counties**: Custom curated data with fun facts
- **European Countries**: Natural Earth 1:50m Cultural Vectors
- **Country Adjacency**: Manually curated border relationships

## Credits

Created by John & Seán Brennan with Claude (Sonnet 4.5)

Inspired by:
- [Globle](https://globle-game.com/) - Geography guessing game
- [Wordle](https://www.nytimes.com/games/wordle/) - Daily word puzzle

## License

MIT License - feel free to use and modify!
