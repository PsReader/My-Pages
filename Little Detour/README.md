# Boredom Roulette
A playful, no-dependencies website for picking one easy activity when you need a break from being bored. Filter by category or leave it to chance, spin the colorful wheel with optional synthesized sound effects, and get one of 101 tiny quests.

## Run locally
From this folder, start a static HTTP server on port 3000:
```sh
python3 -m http.server 3000 --bind 0.0.0.0
```
Then open the site at the local server address. The site is plain HTML, CSS, and JavaScript; no build step or package installation is required.

## Deploy to InfinityFree
Extract `Deploy/deploy-Little-Detour-root.zip` and upload all of its contents into the site's `htdocs` folder. Keep `index.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `404.html`, and `.htaccess` at the archive root. Enable hidden-file uploads for `.htaccess`. If the host does not accept it, set `404.html` as the 404 page in InfinityFree's Error Pages control panel.

After uploading, submit `https://little-detour.site.je/sitemap.xml` in Google Search Console.

## Project files
- `index.html` contains the accessible page structure, category filters, sound toggle and wheel.
- `styles.css` contains the responsive arcade-poster design, category wheel, sound control, motion and reduced-motion styles.
- `script.js` contains the curated 101-idea deck, category filters, category-matched wheel animation, synthesized spin/stop tones and non-repeating selection.
- `assets/roulette-mark.svg` is the original wheel mark used in the interface and as its favicon.
- `dist/` mirrors the static files for anyone who wants a ready-to-serve copy.
