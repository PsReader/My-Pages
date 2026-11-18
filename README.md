# My Projects

A workspace of browser games, creative tools, and static sites. Each project folder is maintained independently. `Deploy/` contains publish-ready ZIP files for selected projects.

## Projects

| Project | What it is | Local entry point |
|---|---|---|
| Cipherly | Browser-only password and passphrase generator | `Cipherly/index.html` |
| FandomFate | Fandom personality quizzes | `FandomFate/index.html` |
| GestureLab | Webcam hand tracking and 3D gesture effects | `GestureLab/` with Vite |
| HexFall | Tactical hex dungeon crawler | `HexFall/index.html` via a local server |
| Little Detour | Wheel of small activity ideas | `Little Detour/index.html` |
| LOTM | Lord of the Mysteries fan lore archive | `LOTM/index.html` |
| Lumen | WCAG color contrast checker | `Lumen/index.html` |
| MoodMatch | Local moodboard generator with optional audio | `MoodMatch/index.html` |
| MysticCoin | Yes, no, or again coin reading | `MysticCoin/index.html` |
| PixelPress | In-browser image compressor and converter | `PixelPress/index.html` |
| Pomodoro Pet | Focus timer with a virtual pet | `Pomodoro Pet/index.html` |
| Pudding Paradise | Dessert storefront concept | `Pudding Paradise/index.html` |
| Scratchpad | Local notes and thought dashboard | `Scratchpad/index.html` |
| Starcoil | Cosmic arcade game | `Starcoil/index.html` |
| Tarot Draw | Major Arcana reading and journal | `TarotDraw/index.html` |
| Tarot Memory | Tarot-themed matching game | `TarotMemory/index.html` |
| TypeBound | Typing challenge with optional cloud and multiplayer modes | `TypeBound/index.html` |
| Witbit | Local idea generator | `Witbit/index.html` |

`FandomFate/` is a nested Git repository. Most other folders belong to the workspace repository. Repository links and live addresses are documented in the individual project pages where available.

## Run locally

Most projects are static. Open their `index.html` files directly. A local HTTP server is needed for features that depend on browser secure-context rules, service workers, or module loading.

GestureLab uses React, TypeScript, Vite, Three.js, and MediaPipe. From its folder:

```bash
npm install
npm run dev
```

TypeBound is also static, but optional Supabase accounts require a local `src/supabase-config.js`, copied from the example and filled with the project's public client settings. Never put a service-role key in browser code.

## Workspace files

- `index.html` and `portfolio.html` are the workspace portfolio pages.
- `ghost-cursor.js` and `assets/` provide shared portfolio effects and artwork.
- `privacy.html`, `terms.html`, and the root status pages belong to the portfolio site.
- `Deploy/` stores generated hosting bundles. Keep each project's internal file paths intact when packaging.

For project-specific behavior, requirements, and hosting notes, use that folder's README.
