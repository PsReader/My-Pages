# Hexfall: Hexa Battle

A dependency-free browser prototype of a tactical hex dungeon crawler inspired by Hexa Battle.

## Run locally

From this folder:

```bash
python3 -m http.server 3000
```

Then open <http://localhost:3000>.

The app is intentionally static. No account, backend, package install, or build step is required.

## Included

- Seeded procedural rooms; the market opens after every two cleared rooms and rerolls eight offers per visit
- Permanent meta-tree progression funded by meta-shards earned from cleared floors
- A single fixed Main Class slot, chosen in the Meta Tree, plus a prestige-scaled companion team with nineteen distinct disciplines. Warden, Vanguard, and Arcanist start unlocked as leaders; every other leader is bought with Meta-shards. Companions are recruited with Ember shards in the market and can repeat, but Main Classes never occupy companion slots
- Companion-only battle XP and five promotion levels that improve health, damage, movement, and attack range
- Separate per-class Main Class mastery ranks in the Meta Tree, purchased with Meta-shards and applied only while that class leads
- Sub-boss rooms every fifth room except every tenth; defeat the named target within four rounds and its escorts scatter. Full bosses appear every tenth room, while every hundredth floor is a named Big Bad with a six-round kill objective and milestone rewards
- Ten 100-floor bands: floors 1–100 are the standard descent; floors 101–1,000 span Prestige I–IX. Every two prestige ranks add one companion (up to seven), strengthen enemies, and the map grows in width and height. Clear floor 1,000 to finish the run
- Expanded 21-relic ember-shard market, with rarity tiers, unique hand-authored SVG art, repeat purchases, and relic upgrades up to tier III
- Additional permanent archive nodes: Ember Well, Iron Vow, and Combo Memory
- Meta-tree visual uses an original recursive branch-and-rotated-square treatment inspired by the supplied Context Free reference
- Recursive branches pulse from the background music analyser, with motion respecting reduced-motion settings
- Meta-node synergy paths: Molten Bastion, Perfect Opening, Deep Reserve, and Edge Theory
- Persistent run telemetry screen retaining the latest 40 outcomes, seeds, relic loadouts, classes, floors, and synergy snapshots
- Rare legendary branches with three-node prerequisites: Emberheart Ascendant, Singularity Edge, and Worldroot Covenant
- Custom persistent achievement badges for run milestones, relic collection, synergy usage, and each legendary branch
- Legendary badge unlocks trigger Web Audio fanfares, particle bursts, and celebration overlays
- Six-slot hub trophy room for pinning earned badges from the telemetry screen
- Companion pair synergies: Ashen Reprieve (Cinderwake + Veilmender), Rooted Citadel (Gravebastion + Oathroot), and Moonlit Ambush (Knifewisp + Moonquill), each with a distinct battle trait shown in the formation panel and on the live board
- Expanded team synergies: Veiled Citadel (Veilmender + Gravebastion), Iron & Ember (Cinderwake + Ruinpike), and Three-Point Ward (Wayfarer + Knifewisp + Moonquill)
- New companion classes trigger individualized ember, veil, stone, root, blade, pike, or moon-quill particle signatures when they strike or use a signature ability
- Every Main Class and companion now has its own combat signature palette and particle silhouette; Emberling and the cinder classes use flame-shaped bursts
- Battle plane uses a restrained tabletop perspective tilt with shadowed, depth-treated class sigils and unit bodies; reduced-motion settings disable the tilt and nonessential effects
- Higher-tier balance pass keeps a fully synergized seven-companion formation under the five-round room limit in the modeled Prestige difficulty tiers (approximately 0.8–3.9 clear rounds from tier 0 through tier 4)
- Meta Tree rebuilt as two readable branching purchase maps: General Team Tree for formation-wide upgrades and a Selected Class Tree with persistent upgrades for the currently selected Main Class; legacy saves migrate with empty class-node inventories
- Added General Team purchases: Ward Lattice, Field Rations, Quickstep Archive, Companion Oath, Battlefield Cache, and Rallying Step
- Added six per-class purchases for every Main Class: Tempered Sigil, Sharpened Instinct, Far Reach, Quickstep, Iron Will, and Focused Core
- Added individualized Web Audio action cues for every Main Class and companion, with the selected Main Class correctly driving the leader’s sound, plus distinct audio/visual cues when companion synergies trigger in battle
- Added remaining companion team synergies: Smoke & Spark, Mended Bulwark, Prism Rift, and Lantern Archive
- Battle tiles now use per-hex extrusion faces and matching extruded unit tokens, while the board and class sigils remain flat, crisp, and free of scene-wide blur
- Field Guide now includes a Companion Pairings reference with every two- and three-member trait combination
- Trophy-room ambient lighting and particle density scale with displayed legendary badges
- Pinned badges open an interactive pointer-controlled 3D close inspection modal
- Badge previews include a softly looping ambient bed, open/close chimes, and throttled rotation hover cues
- Ambient score now continues through the expedition hub, telemetry, and relic shop, with global UI cues for navigation, purchases, confirmations, warnings, class selection, and settings toggles
- Visual language is built from inline SVGs: a custom broken-ward logo and favicon, bespoke framed sigils for every Main Class, hero, enemy, and boss across class cards, party setup, battlefield, turn order, and roster, plus a different custom SVG illustration for every market relic and achievement seal
- Interactive SVG motion includes logo orbiting, hover-reactive class emblems, rotating unit core rings, pulsing sacred tiles, and pointer-rotated trophy inspection badges
- SVG hex board with movement highlighting and target previews
- Ten selectable Main Classes, plus nineteen field companions: Emberling, Wayfarer, ten existing specialists, and seven new AOE, healer, tank, short-range, and long-range specialists
- Husk, Lantern Wisp, Rootmother, Glass Skitter, Mireling, and Hollow Shade enemy AI
- Higher-floor elite modifiers: Fortified, Frenzied, Swift, and Volatile
- Visible enemy intent ribbons and danger zones
- Move, attack, guard, and signature abilities
- Victory, defeat, reward, retry, and return-to-map flows, plus a completed-run ending and final market after floor 1,000
- Versioned localStorage save plus backup key
- JSON export/import and safe save validation
- Responsive desktop and touch-friendly layout; prestige-sized battle maps can be swipe-scrolled on narrow screens
- First-run quick-start steps, contextual combat prompts, and a persistent Field Guide explaining actions, targets, currencies, classes, market timing, and prestige progression
- New-expedition confirmation that preserves permanent progression, badges, run history, party formation, and settings

## Controls

1. Select a hero on the board or in the party timeline.
2. Choose Move, Attack, Guard, or the hero's signature action.
3. Click a highlighted tile or enemy when required.
4. Resolve the enemy turn when ready; any living ally you leave unused skips this round.
5. Expect a sub-boss every fifth room and a full boss every tenth; each hundredth room is a Big Bad. Defeat the named target within its round limit. The relic market opens after rooms 2, 4, 6, and so on.
6. Use the gear icon to export or import the local save.
7. Open the ? button in the top bar for the Field Guide at any time.

## Party formation, classes, and the market

- Your Main Class is fixed in slot one. Choose it from the Meta Tree’s unlocked Main Classes; buy additional leaders in the separate class vault, and set or swap companion slots from the hub. Duplicate class selections are allowed. A legacy save is automatically migrated.
- Starting at Prestige II (floor 201), gain one additional active companion at every even-numbered prestige rank, up to seven. Recruited companions can still be swapped in the deployment panel before the first move or action; deployment locks once an ally acts or the enemy turn is committed.
- Only deployed companions earn battle XP. From the hub, spend their displayed XP to promote each companion through five levels: promotions grant +1 maximum HP, +1 base damage, +1 movement, and +1 attack range in turn.
- Upgrade the selected Main Class separately in the Meta Tree with permanent Meta-shards. Its three class-specific ranks grant +1 maximum HP, then +1 base damage, then +1 range and movement; changing leaders does not transfer those ranks.
- The Meta Tree separates team-wide benefits, Main Class unlocks, per-class mastery, and branch synergies. Warden, Vanguard, and Arcanist start unlocked; all other Main Classes are bought directly with Meta-shards. Companion recruitment is handled separately in the Ember-shard market.
- Every Main Class previews its movement pace, basic-attack trait, and signature before selection. Vanguard trades speed for armor and close damage; Arcanist burns at range; Scout and Riftblade reposition differently; Duelist rewards criticals; Geomancer exploits bramble; Conduit and Stormcaller chain hits; Soulweaver heals and guards the team.
- The standard descent covers floors 1–100, then Prestige I–IX each cover 100 floors. Enemies strengthen every two prestige ranks and the battlefield grows at each prestige.
- The hundredth floors (100, 200, …, 1,000) replace the regular boss with a named Big Bad; defeat it within six rounds for extra Ember and Meta-shards. Clearing floor 1,000 completes the run; the final two-room market is available before returning to the completed-run archive.
- Every market visit draws eight items from a 21-relic catalogue. Stock stays fixed while that visit is open, then rerolls the next time the market is opened after a floor.
- Relics persist for the run. Each offer can be bought once per visit; if an owned relic appears again in a later rotation, buy its next tier instead. Items cap at tier I, II, or III and have individual shard-price progressions and battle effects.


## Combat responsiveness and visual update

Battle targets can be clicked directly on their enemy SVGs or in the turn-order strip; the game validates range and phase and marks legal targets. The Warden's Brace Line resolves as a direct self/ally guard action. Combat uses a faster, percussion-led adaptive Web Audio score with punchier attack cues; sound and music can still be adjusted or muted in Settings. Selected heroes carry class-colored SVG auras, movement leaves a brief particle trail, and class emblems react to hover, keyboard focus, and the selected class. Victory and defeat enter through distinct animated SVG ward screens. Reduced-motion preference disables the nonessential animation.


## Mobile controls and expanded combat

- On narrow screens, the hex board can be swiped horizontally and units have larger invisible tap targets; the action tray stays thumb-accessible with 48–54px controls and safe-area padding.
- Touch Haptics is enabled by default in Field Settings. Supported browsers use short `navigator.vibrate()` patterns; unsupported devices get a brief board-pulse simulation. Turn the option off any time.
- From floor 4, the Rift Stalker can blink beside a hero before attacking on its next turn. From floor 6, the Moss Oracle marks a hero so the next enemy hit against them deals +1 damage.
- Boss signature turns are now explicitly telegraphed with danger tiles: the Ash Colossus marks heroes in its quake radius, while the Bell Widow marks a webfall tile and summon cue.


## Dungeon battlefield

The battle board uses a custom top-down stone crypt backdrop with restrained torchlight, a shallow arch silhouette, and ground mist. The center stays low-contrast so hex occupancy, unit silhouettes, and attack warnings remain easy to read; the JPEG asset is stored in `public/images/dungeon-hall.jpg` and optimized for faster mobile loading.


## SEO and production deployment

- The single indexable route is `/`; `manus-routes.json` and `public/manus-routes.json` both declare it.
- The initial HTML contains a descriptive game overview and VideoGame JSON-LD. Title, description, keywords, robots directives, Open Graph and Twitter metadata are configured for `https://hexfall.site.je/`.
- `robots.txt` allows public crawling and links to the root `sitemap.xml`; the sitemap lists only the canonical home route. The dungeon-hall JPEG is the social preview image and the in-battle backdrop.
- Publish the project root at `https://hexfall.site.je/` so the homepage, `/robots.txt`, `/sitemap.xml`, and `/public/images/dungeon-hall.jpg` all serve this project over HTTPS. The sandbox Preview URL is temporary and is not canonical. Read-only checks on 2026-10-06 were inconsistent: one returned 200 for `/`, 404 for `/robots.txt`, and HTML rather than XML at `/sitemap.xml`; a later check returned 502 for the site paths. The live host is not confirmed to serve this build, so verify those exact URLs before submitting for indexing.
