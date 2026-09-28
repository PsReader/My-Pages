# Lumen sitemap

Lumen is currently a single-page accessibility instrument. The sitemap is organized around the user's primary task: **choose colors → understand the result → validate in context → compare or revisit**.

```mermaid
flowchart TD
    Home[ Lumen / Contrast checker ]
    Home --> Hero[Hero: readable colors]
    Hero --> Stage[Live color relationship stage]
    Stage --> Colors[01 Choose your colors]
    Colors --> Inputs[Text + background inputs]
    Colors --> Format[HEX / RGB / HSL / OKLCH]
    Colors --> FineTune[Color wheel + shade control]
    Colors --> Palettes[Curated + saved palettes]
    Colors --> Actions[Copy CSS / Copy link / Reset]
    Colors --> Result[02 Your result]
    Result --> Ratio[Contrast ratio + summary]
    Result --> Verdicts[AA / AAA / Non-text verdicts]
    Result --> Fix[Make this pair pass]
    Result --> Suggestions[Nearby passing suggestions]
    Result --> Preview[03 Live preview]
    Preview --> Vision[Color-vision simulation]
    Preview --> Components[Component previews]
    Components --> Matrix[04 Palette contrast matrix]
    Matrix --> History[05 Recent checks]
    History --> Restore[Restore or compare pair]
    Home --> About[How to read the results]
    Home --> Theme[Light / dark theme]
    Home --> Sound[Optional sound cues]
```

## SEO landing pages

These supporting pages are real crawlable HTML documents listed in `sitemap.xml`, each with a canonical URL, Open Graph metadata, Twitter metadata, and structured data:

- `wcag-guide.html` — WCAG AA, AAA, large-text, and non-text contrast guidance.
- `palette-matrix.html` — batch comparison workflow for accessible color systems.
- `color-formats.html` — HEX, RGB, HSL, and OKLCH input reference.

## Navigation map

| Anchor | Section | Purpose |
|---|---|---|
| `#top` | Home / hero | Set context and show the live relationship between colors. |
| `#colors-heading` | Choose your colors | Enter, convert, fine-tune, save, and share a color pair. |
| `#preview` | Live preview | See the pair applied to realistic interface components. |
| `#matrix` | Palette contrast matrix | Compare multiple text and background colors in one view. |
| `#history` | Recent checks | Restore, compare, or clear locally stored pairs. |
| `#about` | How to read the results | Explain AA, AAA, large text, and non-text thresholds. |

## Primary user flow

1. **Land on the hero** and understand that Lumen checks readability, not just color aesthetics.
2. **Choose or enter colors** using presets, native swatches, or a supported color format.
3. **Read the result** through the ratio, plain-language summary, and labeled verdict cards.
4. **Improve the pair** with a suggested adjustment or the “Make this pair pass” control.
5. **Validate in context** in the live preview and optional color-vision simulations.
6. **Scale the check** with the palette matrix, then revisit useful pairs from recent history.

## Persistent utilities

- Light/dark theme toggle
- Optional sound cues
- Keyboard shortcuts: `S` swap, `R` reset, `C` copy
- Shareable URL query parameters: `?fg=...&bg=...`
- Local-only storage for saved palettes and recent checks
