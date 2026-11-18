STARCOIL: Cosmic Arcade
========================
A self-contained, original browser arcade game. No PHP, database, build tools, or third-party game libraries are required.

PLAY
----
Open index.html in a modern browser. For the intended play experience, use a desktop browser or rotate a phone to landscape and tap TAKE THE LONG WAY.

CONTROLS
--------
Desktop: aim with the mouse, or steer with arrow keys (default) / WASD (choose the layout in Settings). Hold Shift or Space to sprint. Press E or N to trigger Nova Pulse when a Nova Charge is ready. Press Esc or P to pause. Gamepads are supported through the standard browser Gamepad API.

Phone: rotate to landscape. Drag the left joystick to steer; hold SPRINT to accelerate; tap the smaller NOVA button when a charge is ready. The touch controls are sized so the ability button stays secondary to Sprint and does not crowd the steering pad. Portrait mode and hidden tabs pause active runs so a run cannot progress off-screen.

AUDIO FEEDBACK
--------------
Power-up collection uses distinct short musical signatures: a glassy shield rise for Moon Shell, a petal-like bloom arpeggio for Lumen Bloom, a bright climbing charge for Comet Core, and a higher rare-charge flourish for Nova Charge. Nova Pulse adds a low expanding sweep with a harmonic shimmer. Music and sound effects can be toggled independently in Settings.

POWER-UPS
---------
Moon Shell: a 12-second one-hit shield against hazards and rival body/head collisions. The arena boundary still ends the run; the orbit ring visibly fractures when the shield is spent.
Lumen Bloom: lasts 7.5 seconds and pulls nearby motes toward Pip, helping with dense risky lanes. Orbiting petals fade as the effect runs out.
Comet Core: restores up to 35% of the Sprint reserve, capped at 100% when the reserve is already partly full.
Nova Charge: a rare field pickup. Collect up to two charges, then press E/N or tap NOVA. Nova Pulse expands a visible ring and pushes nearby rivals away without damaging or killing them. It has a 6.5-second cooldown.

The arena keeps at most two pickups in play. A new pickup appears after the opening 3.5 seconds and then roughly every 7.5 to 12 seconds, with Nova Charge appearing rarely. Pickups are placed near hazard lanes so they are readable but carry a route risk; their names and effects are announced when they appear.

COLLISION RULES
---------------
The rival collision model follows the core Worms Zone-style rule: a worm's head hitting another worm's body eliminates the head owner. Pip's head touching a rival body ends Pip's run regardless of length. When a rival head hits Pip's body, that rival crashes, drops a burst of food, and Pip receives a bounty. Head-on contact ends the run as a mutual collision. The arena boundary remains fatal, while Moon Shell can absorb one hazard or worm impact.

HOST ON INFINITYFREE
--------------------
1. Extract Deploy/deploy-Starcoil-root.zip on your computer.
2. In InfinityFree, open your hosting account's Online File Manager or connect with FTP.
3. Open the website's htdocs folder and upload every extracted file directly into it. Keep robots.txt, sitemap.xml, site.webmanifest, 404.html, and .htaccess at the same level as index.html. Enable hidden-file uploads for .htaccess.
4. Visit your domain. The game is static and needs no install or server-side runtime.
5. If .htaccess cannot be used, set 404.html as the 404 page in InfinityFree's Error Pages control panel.

The sitemap lists the home page. After uploading, submit https://starcoil.site.je/sitemap.xml in Google Search Console.

The game is static HTML/CSS/JavaScript and can run on other basic static web hosts too. Internet access is only needed to fetch the optional Google Fonts; system sans-serif/monospace fallbacks are included. All game art and sound effects are drawn/generated locally in the browser. Music and sound can be toggled in Settings. Scores and settings are stored locally in the player's browser and are not shared between devices; if storage is blocked or corrupted, the game falls back to safe defaults. Pip and rivals have a length cap to keep long sessions responsive.

GAME NOTES
----------
Collect motes and comets to grow and score. Use your coil to make rivals run into you, but never drive Pip's head into a rival's body. Avoid rival heads/bodies, asteroids, mines, solar flares and the arena edge. Purple eddies slingshot the player. The golden crown marks the arena leader; collect a crown spark for bonus points. Sprint drains a visible reserve, which recharges when released.
