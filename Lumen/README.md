# Lumen

Lumen is a visual WCAG contrast checker for text and background colors. Enter or convert colors, inspect every contrast verdict, compare a palette, and preview interface components in context.

## Status

**Built and deployed.** Open `index.html` directly in a browser, or visit [lumens.site.je](https://lumens.site.je). No build step, dependencies, or network calls are required.

## Self-check

Open the console on the deployed page or on `index.html` and run:

```js
selfCheck()
```

It logs `lumen self-check passed` when the luminance formula and the boundary fixtures are intact, and throws with a reason when they are not. Known values it verifies: `#767676` on white is `4.54`, `#777777` on white is `4.48`, and `4.499` fails a `4.5:1` threshold while exactly `4.5` passes.

## Deploy

`Deploy/deploy-Lumen-root.zip` in the parent workspace holds the 9 files needed on a host, flat at archive root. Upload and extract into the document root. `plan.md` and `sitemap.md` are not part of the bundle, and nothing in the site links to them.

## What it does

- Calculates contrast using the WCAG relative luminance formula
- Compares the unrounded ratio before displaying it to two decimals
- Reports AA normal text, AA large text, AAA normal text, and WCAG 1.4.11 non-text verdicts
- Previews body text, large text, buttons, links, cards, form fields, disabled controls, focus rings, icons, badges, and navigation
- Switches both editable color inputs between HEX, RGB, HSL, and OKLCH
- Supports 3-digit and 6-digit HEX values, with or without `#`; RGB, HSL, and OKLCH inputs are validated inline
- Provides inline validation without clearing the last valid result
- Includes native color swatches, swap colors, reset, and copy-as-CSS controls that use the selected notation
- Includes an interactive hue/saturation color wheel with a white-to-dark shade bar for either the text or background color
- Includes shareable query links (`?fg=...&bg=...`) that reopen a specific color pair
- Generates every text/background combination in a palette contrast matrix, with AA and AAA verdicts
- Offers AA or AAA fixes using smallest perceptual change, preserve-hue, preserve-saturation, text-only, or background-only strategies; displays the exact adjustment and OKLab distance
- Simulates protanopia, deuteranopia, tritanopia, and achromatopsia; labels and icons demonstrate non-color cues (illustrative simulation, not a substitute for user testing)
- Stores the 10 most recent valid pairs in local storage, with restore and compare actions
- Suggests nearby passing text colors when normal-text AA fails, with one-click application
- Includes browser-console self-check for the formula and important boundary fixtures
- Includes a calibrated light-stage animation, ratio transitions, signal states, and keyboard-accessible color orbs
- Includes optional soft-lab sound effects for copy, swap, reset, and threshold changes; sound is off by default and stored locally when enabled
- Works offline as a single static HTML file
- Keeps all color calculations and recent history in the browser; no backend or external service is used

## Design direction

Lumen is designed as a light-lab instrument: the result is prominent, verdicts are explicit, and the live preview shows the practical consequence of the number. The interface uses a warm paper palette, a dark measurement stage with live color orbs and a contrast beam, a responsive layout, and reduced-motion support.

## Formula

The implementation follows the current WCAG relative luminance formula:

```js
const lin = (c) => {
  const x = c / 255
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}

const ratio = (Math.max(L1, L2) + 0.05) /
              (Math.min(L1, L2) + 0.05)
```

Threshold comparison happens against the raw floating-point ratio. Rounding is only used for display, so a value such as `4.499` correctly fails a `4.5:1` threshold.

## Files

- `index.html`: complete application, styles, interactions, and self-check
- `lumen-mark.svg`: the favicon and mark, two orbs joined by a light beam
- `sitemap.md`: information architecture, navigation map, and user flow
- `sitemap.xml`: XML sitemap listing this page and the three supporting pages
- `robots.txt`: allows crawling and points search engines to `sitemap.xml`
- `wcag-guide.html`: supporting WCAG contrast reference page
- `palette-matrix.html`: supporting accessible palette workflow page
- `color-formats.html`: supporting color notation reference page
- `seo-pages.css`: shared styles for the supporting pages

## Notes

- Contrast is compared against the raw ratio. A displayed `4.50:1` can still fail AA, so the verdict is the value to trust, not the rounded number.
- Color-vision simulation is illustrative. It helps you catch problems, it does not replace testing with people.
- `sitemap.md` documents the intended structure. It is not served and not in the deploy bundle.

## Author

Created by **PsReader**.
