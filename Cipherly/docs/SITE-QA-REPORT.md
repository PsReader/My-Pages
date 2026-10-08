# Cipherly Website — QA & Refinement Report

## Result

**49/49 automated Chromium checks passed** on the refined static site. A separate focused pass also confirmed that all bundled font families load, the site makes no third-party requests, and the cached generator page opens while offline.

## Changes made

- **Corrected the PIN preset:** it now uses the full `0–9` digit set, matching its “6 digits” label.
- **Made bulk generation fail clearly:** the generator checks whether the requested number of unique values is possible for the selected alphabet and length. Impossible requests now explain how to fix the settings instead of silently returning a short list.
- **Closed an HTML injection risk:** user-defined batch values are inserted as text nodes rather than interpolated into HTML.
- **Improved keyboard and screen-reader support:** generator tabs now point to their panels, maintain the selected-tab state, support arrow/Home/End navigation, and use roving focus. Pressing Enter on the Generate button runs it once.
- **Fixed tablet overflow:** the landing-page hero artwork now remains inside the viewport around the 761–900 px tablet range.
- **Improved download cleanup and feedback:** downloaded object URLs are revoked after the browser has time to start the download, and the copy button restores its full shortcut label.
- **Removed runtime Google Fonts requests:** DM Sans, DM Mono, and Playfair Display are now bundled as local WOFF2 files with their SIL Open Font License texts. This preserves the existing typography while avoiding third-party font requests and allowing offline use.
- **Hardened offline caching:** the service worker uses a versioned cache, removes older Cipherly caches, caches local font assets, and returns an appropriate cached page for offline navigation.

## Coverage

The Chromium run covered:

- Both pages, titles, internal navigation, and light/dark theme persistence.
- All six generator presets: PIN, Wi-Fi, memorable phrase, API key, one-time code, and strong phrase.
- Password/passphrase/bulk mode controls, passphrase options, custom alphabets, compatibility rules, details panels, and feedback preferences.
- Bulk uniqueness, copy-to-clipboard, downloaded filename/content, impossible-batch messaging, and safe rendering of HTML-looking custom text.
- Keyboard tab navigation and Enter activation.
- Horizontal overflow on both pages at **390, 760, 761, 768, 800, 850, 900, 901, and 1280 px**.
- Service-worker registration and absence of uncaught browser errors.

The additional focused offline check verified that DM Sans, DM Mono, and Playfair Display load from the bundled files; the two pages issued **zero third-party requests**; and the generator remained accessible after taking the test browser offline.

## Deliverables

The complete ZIP contains the updated static website, fonts and licenses, six hosting error pages, offline fallback, setup instructions, Apache/LiteSpeed mappings, QA report, and page previews. No production deployment or external publication was performed.


## Follow-up refinements

Two usability refinements were added after the initial QA pass: the copy shortcut now displays the platform-appropriate label, and manually changing a preset’s settings clears its selected highlight so it no longer appears unchanged. The service worker now caches the standalone error pages and a dedicated `offline.html` screen; uncached navigation while offline presents a clear offline message rather than silently showing the homepage.

**All 8 focused follow-up browser checks passed**, including preset editing, shortcut labeling, offline-page rendering, service-worker caching of the offline page/error pages/fonts, successful offline navigation fallback, and no uncaught browser errors.


## Passphrase and result controls

Passphrase mode now supports hyphen, space, period, and underscore separators. A quiet **Reset** control restores generator defaults. Compact eye/trash icon controls hide or reveal single and bulk results, or clear results from the page. Copy and download are disabled after clearing, and the status message explains that existing clipboard contents and downloaded files are unchanged.

**All 26 final feature and service-worker regression checks passed** for separator output, number/symbol options, reset defaults, preset status, single/bulk hide and clear behavior, copy while concealed, clipboard/download disclosure, the v4 offline cache, and layout at 320, 360, 375, 390, 768, and 1280 px. Uncached navigation while offline showed the dedicated offline page. No runtime errors or third-party requests were observed.
