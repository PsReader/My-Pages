# Cipherly

Cipherly is a static, browser-only password utility and promotional site.

## Name direction

**Cipherly** was chosen because it feels modern and approachable while still suggesting encryption and secure secrets. It also leaves room for future tools such as token generation, API key helpers, and secure identifiers.

## Files

- `index.html` — promotional landing page inspired by the Pixelpress editorial utility style.
- `generator.html` — working password generator.
- `offline.html` — a dedicated offline landing page served for uncached navigation without a connection.
- `styles.css` — shared responsive design system.
- `fonts.css` and `fonts/` — locally bundled WOFF2 fonts and their SIL Open Font Licenses.
- `visual-polish.css` — page composition accents and brand mark styling.
- `brand-mark.svg` — reusable Cipherly favicon and logo asset.
- `app.js` — local-only password, passphrase, bulk, custom charset, copy, and download behavior.

## Generator features

- Password mode with adjustable length and character groups.
- Passphrase mode with word count, capitalization, number, symbol, and selectable word-separator options.
- Bulk mode for generating 2–100 unique passwords.
- Hide or reveal a generated result, clear it from the page, or reset generator settings to defaults.
- Custom character set support for legacy systems and constrained formats.
- Optional look-alike character exclusion.
- Preset templates for PIN codes, Wi-Fi keys, and memorable phrases.
- Persistent light/dark mode toggle on the generator page.
- Optional success feedback with a short sound cue and supported-device haptics.
- API key, one-time code, and strong passphrase presets.
- Compatibility rules for flexible, Wi-Fi-safe, URL-safe, and digits-only output.
- Security explanation panel covering Web Crypto, local-only behavior, and password-manager practice.
- Copy-success animation, strength-meter motion, generated timestamp, and keyboard shortcuts.
- Accessible mode tabs with arrow-key navigation and linked tab panels.
- Bulk uniqueness-capacity checks with clear warnings when a requested batch is impossible.
- User-defined bulk output is inserted as text, not interpreted as HTML.
- Shared theme preference and installable offline shell via a service worker.
- Versioned service-worker cache cleanup, cached error documents, and a dedicated offline fallback.
- Strength meter and entropy estimate.
- Copy to clipboard and download as `.txt`.
- Clear removes the result from the page; clipboard contents and downloaded files are not changed.
- Uses `crypto.getRandomValues()` with rejection sampling.
- No account, backend, database, analytics, cookies, or password history.

## UX direction

The landing page sells the privacy promise first, then shows three concrete jobs: generate one password, batch many, or bring a custom alphabet. The generator page keeps the result visually dominant, uses tabs to avoid a crowded control panel, and makes bulk output easy to copy or download.

## Run locally

Extract the ZIP and open `index.html`. To use a local server instead:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/`.

All site assets, including fonts, are local. The pages make no third-party font requests and are designed to work offline after the service worker has cached the app shell.


## Hosting error pages

The `errors/` folder contains standalone pages for HTTP 400, 401, 403, 404, 500, and 503, plus setup guidance and an Apache/LiteSpeed `ErrorDocument` snippet. See [`errors/README.md`](errors/README.md). The status mappings belong in the hosting panel or existing document-root configuration; do not replace an existing `.htaccess` file.
