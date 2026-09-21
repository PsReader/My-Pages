# My Projects

A portfolio workspace of creative web experiments, themed mini-projects, and interactive front-end builds.

This collection brings together different directions in web development practice: immersive motion experiences, storytelling-driven pages, playful storefront designs, and lightweight utility apps. Each project lives in its own folder and reflects a different style of interface design and front-end problem solving. Most projects are also published in their own dedicated GitHub repository.

---

## Projects

### GestureLab

The only build-managed project. A webcam-powered interaction sandbox built with React, TypeScript, Three.js, and MediaPipe hand tracking.

- interactive hand gesture controls
- 3D scene rendering with React Three Fiber
- shader-based visual effects and live motion feedback
- real-time camera-driven experimentation
- folder: `GestureLab` · repo: [github.com/PsReader/GestureLab](https://github.com/PsReader/GestureLab) · live: `gesturelab.site.je`

### LOTM

A fan-made lore archive and storytelling website for _Lord of the Mysteries_.

- 20-page content structure with shared CSS/JS
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

- local localStorage persistence
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

### Music collection

A set of freely used ambient MP3 tracks (likely for site or video background audio).

- folder: `music`

---

## Root files & folders

- `index.html` — portfolio landing page with the Live Demos carousel (project cards with view-live links)
- `portfolio.html` — polished personal portfolio page
- `ghost-cursor.js` — Three.js ES module cursor-trail effect used by the portfolio
- `assets/` — shared card images and logo SVGs (e.g. `TarotDraw.png`, `MysticCoinLogo.svg`)
- `robots.txt`, `sitemap.xml`, `site.webmanifest` — site metadata

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

This workspace is a combination of learning projects, creative prototypes, and personal experiments. It reflects a growing range of skills across:

- responsive front-end design
- interactive UI and motion
- storytelling-driven content pages
- JavaScript behavior and browser APIs
- React and 3D web experiences

---

## License

This workspace is available under the MIT License unless otherwise noted in an individual project folder.