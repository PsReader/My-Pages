# My Projects

A portfolio workspace of creative web projects and interactive front-end builds. The group repository is [PsReader/My-Pages](https://github.com/PsReader/My-Pages).

Each project lives in its own folder. Cipherly, FandomFate, HexFall, and PixelPress also have standalone GitHub repositories.

---

## Projects

### Cipherly

A browser-based password utility for single and batch generation, with password and passphrase modes.

- Runs in the browser and includes an offline fallback
- Folder: `Cipherly` · repo: [github.com/PsReader/Cipherly](https://github.com/PsReader/Cipherly)

### FandomFate

An unofficial fandom personality quiz site with 17 playable quizzes across eight fandoms.

- Quiz content and result cards are customized for each fandom
- Folder: `FandomFate` · repo: [github.com/PsReader/Fandom-Fate](https://github.com/PsReader/Fandom-Fate) · live: `fandomfate.site.je`

### GestureLab

The only build-managed project. A webcam-powered interaction sandbox built with React, TypeScript, Three.js, and MediaPipe hand tracking.

- interactive hand gesture controls
- 3D scene rendering with React Three Fiber
- shader-based visual effects and live motion feedback
- real-time camera-driven experimentation
- folder: `GestureLab` · repo: [github.com/PsReader/GestureLab](https://github.com/PsReader/GestureLab) · live: `gesturelab.site.je`

### LOTM

A fan-made lore archive and storytelling website for _Lord of the Mysteries_.

- 24-page content structure with shared CSS and JavaScript
- dark fantasy aesthetic
- lore, pathways, character references, volumes, and galleries
- static HTML/CSS/JavaScript implementation
- folder: `LOTM` · repo: [github.com/PsReader/LOTM](https://github.com/PsReader/LOTM) · live: `lotm-fan-wiki.site.je`

### Pudding Paradise

A dessert-themed storefront and landing page concept with a soft, pastel personality.

- responsive static website
- menu, home, and review pages plus a shared stylesheet
- brand-driven visual design with a custom image set
- folder: `Pudding Paradise` · repo: [github.com/PsReader/PuddingParadise](https://github.com/PsReader/PuddingParadise) · live: `pudding-paradise.site.je`

### Tarot Draw

A single-file tarot reader for the 22 Major Arcana, delivered behind an open-book veil.

- choose a spread, flip sigil cards, or draw today's card
- shareable readings
- local-only journal with backup export
- folder: `TarotDraw` · repo: [github.com/PsReader/TarotDraw](https://github.com/PsReader/TarotDraw) · live: `tarotdraw.site.je`

### Mystic Coin

A small digital divination tool in a mystical gold-and-dark theme.

- ask a question, flip the gilded coin, and receive a symbolic Yes / No / Again answer
- running history of past flips
- self-contained single-file page
- folder: `MysticCoin` · repo: [github.com/PsReader/MysticCoin](https://github.com/PsReader/MysticCoin) · live: `mystic-coin.site.je`

### Scratchpad

A thought-dashboard for lightweight, browser-based note organization.

- localStorage persistence
- theme switching
- searchable and organized notes
- folder: `Scratchpad` · repo: [github.com/PsReader/Scratchpad](https://github.com/PsReader/Scratchpad)

### Tarot Memory

A tarot-themed memory card game.

- card-matching gameplay with tarot artwork
- keyboard and touch friendly controls
- folder: `TarotMemory` · repo: [github.com/PsReader/TarotMemory](https://github.com/PsReader/TarotMemory) · live: `tarotmemory.site.je`

### Pomodoro Pet

A cozy pomodoro timer that rewards completed focus sessions with XP and coins for a virtual pet.

- focus, short-break, and long-break timers
- XP, coins, streaks, and session tracking
- pet evolution and cosmetic accessory shop
- local-only persistence
- folder: `Pomodoro Pet` · repo: [github.com/PsReader/PomodoroPet](https://github.com/PsReader/PomodoroPet)

### Type Bound

A browser typing challenge with local scoring, analytics, optional Supabase cloud accounts, and multiplayer races.

- multiple difficulty modes plus custom text and daily challenge
- local history with export/import
- optional cloud accounts with leaderboards and local-history sync
- peer-to-peer WebRTC race mode
- folder: `TypeBound` · repo: [github.com/PsReader/TypeBound](https://github.com/PsReader/TypeBound) · live: `typebound.site.je`

### Lumen

A WCAG contrast ratio checker for text and background colors.

- ratio and AA, AAA, and non-text verdicts from the raw value, rounded for display only
- HEX, RGB, HSL, and OKLCH input, with a color wheel and shade bar
- palette contrast matrix, saved palettes of up to 12, and 10-pair local history
- component previews, plus protanopia, deuteranopia, tritanopia, and achromatopsia simulation
- shareable `?fg=...&bg=...` links and a browser-console self-check
- no build step, no dependencies, works offline
- deploy bundle: `Deploy/deploy-Lumen-root.zip`
- folder: `Lumen` · repo: [github.com/PsReader/Lumen](https://github.com/PsReader/Lumen) · live: `lumens.site.je`

### PixelPress

A browser-only image utility that compresses, resizes, crops, and converts images.

- JPG, PNG, WebP, and feature-detected AVIF output with a quality slider
- fit-to-bounds, custom width, custom height, and original-size modes
- numeric crop controls with center-crop presets
- original vs processed preview with file size and savings comparison
- processing stays in the browser, no upload, no build step
- folder: `PixelPress` · repo: [github.com/PsReader/PixelPress](https://github.com/PsReader/PixelPress) · live: `pixelpress.site.je`

### HexFall

A tactical hex dungeon crawler that runs entirely in the browser.

- seeded rooms, a sub-boss every fifth room, a full boss every tenth
- 1,000 floors across ten prestige bands, ending at a named Big Bad
- permanent meta-tree progression, 21 relics, and six playable classes
- versioned localStorage saves with JSON export and import
- folder: `HexFall` · repo: [github.com/PsReader/Hexfall](https://github.com/PsReader/Hexfall) · live: `hexfall.site.je`

---

## Root files & folders

- `index.html`: portfolio landing page with the Live Demos carousel
- `portfolio.html`: personal portfolio page
- `ghost-cursor.js`: Three.js ES module cursor-trail effect used by the portfolio
- `assets/`: shared card images and branding assets
- `robots.txt`, `sitemap.xml`, `site.webmanifest`: site metadata
- `404.html` and `errors/`: root not-found page and status-specific error pages
- `Deploy/`: local publish-ready ZIP bundles, one per project, flat at archive root

---

## How to use this workspace

- For static HTML projects, open the relevant page directly in a browser.
- For `GestureLab`, install dependencies and run the Vite app locally:

```bash
cd GestureLab
npm install
npm run dev
```

---

## Notes

Most projects are static websites without a build step; GestureLab uses React and Vite, and TypeBound supports optional Supabase accounts.

Static project error pages live in each project's `errors/` folder. GestureLab keeps them in `GestureLab/public/errors/` so Vite copies them into the build output. Hosting setup notes are in each folder's `errors/README.md`.

---

## License

This workspace is available under the MIT License unless otherwise noted in an individual project folder.
