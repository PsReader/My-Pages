# My Projects

A portfolio workspace of creative web experiments, themed mini-projects, and interactive front-end builds.

This collection brings together different directions in web development practice: immersive motion experiences, storytelling-driven pages, playful storefront designs, and lightweight utility apps. Each project lives in its own folder and reflects a different style of interface design and front-end problem solving.

---

## Projects

### GestureLab

The only build-managed project. A webcam-powered interaction sandbox built with React, TypeScript, Three.js, and MediaPipe hand tracking.

- interactive hand gesture controls
- 3D scene rendering with React Three Fiber
- shader-based visual effects and live motion feedback
- real-time camera-driven experimentation
- folder: `GestureLab` · live: `gesturelab.site.je`

### LOTM

A fan-made lore archive and storytelling website for _Lord of the Mysteries_.

- 19-page content structure with shared CSS/JS
- dark fantasy aesthetic
- lore, pathways, character references, volumes, and galleries
- static HTML/CSS/JavaScript implementation
- folder: `LOTM` · live: `lotm-fan-wiki.site.je`

### Pudding Paradise

A dessert-themed storefront and landing page concept with a soft, pastel personality.

- responsive static website
- menu, home, and review pages plus a shared stylesheet
- brand-driven visual design with a custom image set
- folder: `Pudding Paradise` · live: `pudding-paradise.site.je`

### Tarot Draw

A single-file tarot reader for the 22 Major Arcana, delivered behind an open-book veil.

- choose a spread, flip sigil cards, or draw today's card
- shareable readings
- local-only journal with backup export
- folder: `TarotDraw` · live: `tarotdraw.site.je`

### Mystic Coin

A small digital divination tool in a mystical gold-and-dark theme.

- ask a question, flip the gilded coin, and receive a symbolic Yes / No / Again answer
- running history of past flips
- self-contained single-file page
- folder: `MysticCoin` · live: `mystic-coin.site.je`

### Scratchpad

A thought-dashboard for lightweight, browser-based note organization.

- local localStorage persistence
- theme switching
- searchable and organized notes
- folder: `Scratchpad`

### Music collection

A set of freely used ambient MP3 tracks (likely for site or video background audio).

- folder: `music`

---

## Root files & folders

- `index.html` — portfolio landing page with the Live Demos carousel (project cards with view-live links)
- `portfolio.html` — polished personal portfolio page
- `ghost-cursor.js` — Three.js ES module cursor-trail effect used by the portfolio
- `assets/` — shared card images and logo SVGs (e.g. `TarotDraw.png`, `MysticCoinLogo.svg`)
- `Deploy/` — ready-to-publish ZIP bundles, one set per project (see below)
- `robots.txt`, `sitemap.xml`, `site.webmanifest` — site metadata

## Deploy folder

`Deploy/` holds publish-ready ZIPs, named `deploy-<Project>-<category>.zip`:

| Bundle | Contents |
|---|---|
| `deploy-root.zip`, `deploy-root-assets.zip` | portfolio pages, cursor script, shared `assets/` |
| `deploy-GestureLab-root.zip`, `deploy-GestureLab-assets.zip` | production `dist/` build |
| `deploy-LOTM-{html,css,js,images}.zip` | LOTM split by content type |
| `deploy-PuddingParadise-{html,images}.zip` | pages + image set |
| `deploy-TarotDraw-root.zip`, `deploy-MysticCoin-root.zip` | single-file apps |
| `deploy-Scratchpad-{root,images}.zip` | app + logo SVGs |
| `deploy-music.zip` | audio tracks |

Regenerate after source changes (e.g. rebuilding the root `index.html` cards).

---

## How to use this workspace

- For static HTML projects, open the relevant page directly in a browser.
- For `GestureLab`, install dependencies and run the Vite app locally:

```bash
cd GestureLab
npm install
npm run dev
```

- For deployable builds, upload the matching ZIP from `Deploy/`.

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