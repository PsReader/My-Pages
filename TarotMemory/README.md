# Tarot Memory

A tarot-themed memory card game featuring the 22 Major Arcana sigils from Tarot Draw.

[Live site](https://tarotmemory.site.je) · [GitHub](https://github.com/PsReader/TarotMemory)

## Overview

Memory of the Tarot Club is a lightweight card-matching game where each run is a sequence of levels. Difficulty controls the run length:

| Difficulty | Levels per run |
| ---------- | -------------- |
| Small Rite | 5              |
| Medium     | 7              |
| Large      | 10             |

Clearing a level advances the run; running out of time resets the current run to level 1.

## Features

- three visual themes: Classic Sepia, Violet Dusk, and Rosewood Ritual
- Pattern Safe mode for players who rely on non-color cues
- gallery of all 22 Major Arcana sigils
- keyboard and touch friendly controls
- progress saved in the visitor's browser via `localStorage` keys prefixed with `tm.` — stars, every cleared level (RITES SEALED counter), and completed-run counts per difficulty

## How to run

No build step, npm, React, database, or server is required. Upload `index.html`, `style.css`, and `game.js` together to any static host, or open `index.html` directly in a browser.

## Author

Created by **PsReader**.