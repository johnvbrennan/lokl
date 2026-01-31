# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

County Globle (lokl) is an Irish county geography guessing game inspired by Globle and Wordle. Players identify a mystery county from 32 Irish counties in up to 6 guesses, receiving color-coded proximity feedback on an SVG map.

**Status:** Specification complete, ready for implementation.

## Recommended Approach When Planning
The file lokl-specification.md provides an overview of what we are trying to create here. Ensure that you read that carefully so you understand what needs to be built.

Before you start writing implementation code you must do the following in plan mode:
 
 - Think through the end to end solution and break it up into logical Phases for implementation. Remember you can't eat an elephant in one bite, you need to break it up into smaller pieces. 
 - In the planning phase I expect you to break up the overall solution into individual phases. 
 - For each phase create a Phase-X.json file in the Planning folder that describes what you are going to implement for that phase.
 - Use the "Sample PRD Structure" below to outline the distinct tasks/PRDs required for that phase.
 - When ready to implement, you will need to walk through each Phase-X.json file and start building it out. 
 - Only move on to the next phase when all items are complete and all tests are passing successfully. 
 - Ensure you update each PRD item in the Phase-X.json file to mark "passes" as true/false based on the outcome of the tests. Important: We only move forward to the next phase when all PRDs have "passes" set to true.
 
Sample PRD structure
{
    "category": "functional",
    "description": "New chat button creates a fresh conversation",
    "steps": [
      "Navigate to main interface",
      "Click the 'New Chat' button",
      "Verify a new conversation is created",
      "Check that chat area shows welcome state",
      "Verify conversation appears in sidebar"
    ],
    "passes": false
  }

## Architecture

Single-file web application with no build system or dependencies:
- **Frontend:** Vanilla HTML/CSS/JavaScript in a single `index.html`
- **Map:** Inline SVG with paths for 32 Irish counties (id format: `county-Cork`)
- **State:** In-memory JavaScript objects during session
- **Persistence:** Browser localStorage for statistics and daily game state
- **Hosting:** Any static host (GitHub Pages, Netlify, etc.)

## Key Algorithms

- **Distance:** Haversine formula between county centroids (see `lokl-specification.md` section 11.2)
- **Direction:** Bearing calculation mapped to 8 compass arrows (↑ ↗ → ↘ ↓ ↙ ← ↖)
- **Daily seed:** Date-based hash for deterministic county selection

## Color System

Distance ratios map to colors:
- 75-100%: Dark Blue (`#1a5276`)
- 55-75%: Blue (`#2980b9`)
- 40-55%: Yellow (`#f39c12`)
- 25-40%: Orange (`#e67e22`)
- 15-25%: Red-Orange (`#e74c3c`)
- 5-15%: Red (`#c0392b`)
- 0-5%/correct: Green (`#27ae60`)

## Game Modes

- **Daily Challenge:** Same county for all players (date-seeded), one attempt per day
- **Practice Mode:** Random counties, unlimited plays

## Data Requirements

County data is in `lokl-specification.md` (section 6): name, lat/lng, province, fun fact, SVG path. All 32 counties (Republic + Northern Ireland) must be included.

## Responsive Layout

- Desktop (700px+): Map left, guess interface right
- Mobile: Stacked vertically, map on top
