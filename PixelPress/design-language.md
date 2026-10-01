# Pixelpress Design Language

> **Pixelpress makes images lighter without making the work feel technical.**
>
> The product should feel like a small, clever darkroom instrument: tactile, precise, optimistic, and a little playful.

## 1. Product personality

Pixelpress is a private image utility, not an enterprise dashboard and not a generic file-upload form.

The visual personality is:

- **Precise** — dimensions, formats, quality, and file sizes are clear.
- **Playful** — compression feels like a satisfying transformation, not a chore.
- **Private** — “your files stay here” is visible and trustworthy.
- **Warm** — the interface has personality beyond default blue-gray SaaS styling.
- **Calm** — no noisy gradients, excessive badges, or distracting animation.

### The emotional target

The user should feel:

> “I understand what will happen, I can see the difference, and I’m in control.”

## 2. Core design rules

### Rule 01 — Make the result the hero

The product is not the upload form. The product is the visible before/after improvement.

- Keep the original and processed images visually prominent.
- Show file size savings as a rewarding moment.
- Never bury the final download action below unnecessary explanation.
- Use the UI to answer: **What changed? Is it good enough? What do I do next?**

### Rule 02 — Privacy is part of the interface

Do not hide the local-only behavior in a footer or legal page.

- Show “Runs entirely in your browser” near the first interaction.
- Use calm, factual language rather than fear-based security language.
- Never imply a cloud upload, account, or server queue exists.
- If a browser limitation affects output, explain it beside the affected control.

### Rule 03 — Use visual hierarchy before decoration

Every page should have a clear order:

1. Product promise
2. Drop or choose an image
3. Preview the original and result
4. Tune the output
5. Download
6. Learn more only if needed

If a decorative element competes with a control or result, remove the decorative element.

### Rule 04 — One strong accent, meaningful status colors

Use amber as the action and “press” color. Use jade for positive processing states. Use coral only for errors or warnings.

Do not use multiple bright accent colors for decoration. Color should communicate interaction or status, not fill empty space.

### Rule 05 — Make dense information feel intentional

Metadata is important but should read like an instrument readout:

- Use compact mono labels for dimensions, formats, and file sizes.
- Use short labels: `2.4 MB`, `1600 × 1067`, `WebP`.
- Keep explanatory prose outside of high-density metric rows.
- Prefer aligned values over repeated paragraphs.

## 3. Visual direction

### Concept: “The friendly darkroom”

Pixelpress combines a deep ink workbench with warm paper-like highlights and a soft mint processing signal.

It should feel like:

- A modern photo lab
- A compact piece of studio equipment
- A well-designed file utility
- A creative tool with visible cause and effect

Avoid:

- Generic light SaaS dashboards
- Neon cyberpunk effects
- Flat white card grids
- Overly luxurious black-and-gold styling
- Childish cartoon treatment
- Fake technical complexity

## 4. Color tokens

Use CSS custom properties so the system remains consistent.

```css
:root {
  --ink: #17201f;
  --ink-strong: #172522;
  --muted: #50615d;
  --paper: #f3f0e8;
  --panel: #fbfaf6;
  --panel-raised: #e9e4d9;
  --line: #c8c8bc;
  --line-strong: #9b9c8e;

  --amber: #c85c35;
  --amber-hover: #a74726;
  --amber-soft: rgba(200, 92, 53, .14);

  --mint: #d5b56c;
  --mint-soft: rgba(213, 181, 108, .16);

  --coral: #c85c35;
  --coral-soft: rgba(200, 92, 53, .14);

  --shadow-soft: 0 12px 30px rgba(0, 0, 0, .16);
  --shadow-deep: 0 22px 60px rgba(0, 0, 0, .24);
}
```

### Color usage

| Token | Use |
|---|---|
| `--paper` | Page background and deepest canvas. |
| `--panel` | Main editor and preview panels. |
| `--panel-raised` | Drop zones, metric cards, controls, and secondary surfaces. |
| `--amber` | Primary actions, selected controls, progress, and the “lighter” moment. |
| `--mint` | Privacy indicator, successful processing, and positive savings. |
| `--coral` | Validation errors, unsupported formats, and destructive warnings. |
| `--muted` | Secondary explanation and metadata only. |
| `--line` | Quiet structural separation. |

### Contrast rule

Text must remain readable against every surface. Never use `--muted` for required instructions, error messages, or primary labels when the contrast is insufficient.

## 5. Typography

### Type roles

- **Display:** Georgia or another high-quality editorial serif. Use for the product promise and major section titles.
- **UI:** Inter, system-ui, or another neutral sans-serif. Use for controls, labels, buttons, and body copy.
- **Instrument:** ui-monospace or SFMono-Regular. Use for dimensions, sizes, formats, percentages, and technical readouts.

### Type scale

```css
--text-xs: .68rem;
--text-sm: .76rem;
--text-md: .9rem;
--text-lg: 1.08rem;
--text-xl: 1.8rem;
--text-display: clamp(3rem, 7vw, 6.2rem);
```

### Typography rules

- Use generous letter spacing only for uppercase eyebrows and metadata labels.
- Keep display headlines tight and editorial: approximately `letter-spacing: -.07em`.
- Do not use all caps for sentences or body copy.
- Keep paragraphs short. Tool interfaces should scan quickly.
- Use sentence case for buttons: `Download image`, not `DOWNLOAD IMAGE`.

## 6. Logo and iconography

The Pixelpress mark is a pixel grid crossed by a press signal.

- Keep the mark small and crisp.
- Use the mark in the top-left brand position and favicon.
- Do not recolor the mark randomly per component.
- Use simple line or geometric icons with consistent visual weight.
- Avoid emoji as primary UI icons.
- Icons should support a text label, not replace it when the action matters.

## 7. Layout system

### Desktop

- Maximum content width: `1240px`.
- Outer gutter: `18–36px` depending on viewport.
- Main workspace: asymmetric two-column layout.
- Controls column: narrower and information-dense.
- Preview column: wider and visually dominant.
- Preview may be sticky while controls scroll.

### Mobile

- One column only.
- Order content as:
  1. Choose image
  2. Output controls
  3. Download action
  4. Original / processed comparison
  5. Educational content
- Put the processed result before the original when vertical space is limited.
- Keep the primary download button easy to reach.
- Never require a horizontal scroll for a primary workflow.
- Use full-width controls when the action is important.

### Spacing rhythm

Use a small set of spacing values:

```css
--space-1: 6px;
--space-2: 10px;
--space-3: 14px;
--space-4: 18px;
--space-5: 24px;
--space-6: 32px;
--space-7: 44px;
--space-8: 64px;
```

Do not add arbitrary one-off spacing unless the visual relationship genuinely requires it.

## 8. Component language

### Drop zone

The drop zone is the main invitation to begin.

- Dashed border, not a heavy solid card.
- Subtle mint glow or texture on hover.
- One clear action: `Choose image`.
- Supporting line: `JPG, PNG, WebP, or supported AVIF`.
- Focus state must be visible for keyboard users.
- Drag-over state should feel responsive but restrained.

### Buttons

Primary button:

- Amber fill
- Dark ink text
- Slight lift on hover
- Small press scale on click
- Use for `Download image` and the main entry action

Secondary button:

- Transparent or panel-raised surface
- Quiet border
- Use for `Copy summary`, `Reset`, and format actions

Rules:

- Minimum tap height: `40px`.
- Use visible labels for important actions.
- Never make every button primary.
- Disabled actions should remain understandable, not disappear.

### Panels

- Use deep panels to group work, not to create a dashboard maze.
- Radius: `16–22px` for main panels.
- Radius: `8–12px` for controls and metric cards.
- Use shadows sparingly; a panel should feel grounded, not floating in space.
- Prefer one strong panel hierarchy over many nested bordered boxes.

### Metrics

Metrics should feel like instrument readouts:

```text
SIZE
82 KB

DIMENSIONS
1600 × 1067

FORMAT
WEBP
```

Keep labels small and muted. Keep values mono, compact, and high-contrast.

### Before/after preview

- Always label `Original` and `Processed` explicitly.
- Never rely on position alone to communicate which is which.
- Use checkerboard transparency behind images.
- Show an empty-state explanation before a file is loaded.
- The processed panel may carry a subtle mint or amber emphasis after successful conversion.

## 9. Motion language

Pixelpress should feel responsive, not animated for its own sake.

### Timing

- Button press: `100–160ms`.
- Hover lift: `160–220ms`.
- Drop-zone state: `180–240ms`.
- Image preview replacement: `220–300ms`.
- Savings reveal: `240–360ms`.

Use a strong ease-out:

```css
--ease-out: cubic-bezier(.23, 1, .32, 1);
```

### Motion behaviors

- On drag-over, lift the drop zone by 1–2px and brighten its border.
- When output becomes available, fade and scale the processed preview from `opacity: 0; transform: scale(.98)` to visible.
- When savings improve, animate only opacity and transform, not layout dimensions.
- Do not animate every metric independently.
- Do not use looping animation while the user is reading.
- Respect `prefers-reduced-motion: reduce` and remove non-essential transitions.

## 10. Content and voice

### Voice

- Clear
- Reassuring
- Lightly witty
- Never salesy
- Never alarmist
- Technically honest

### Good copy

- “Runs entirely in your browser”
- “Your original stays untouched”
- “Find the right balance”
- “82 KB lighter · 34% smaller”
- “PNG output is lossless; quality does not change it.”

### Avoid

- “Revolutionary image optimization”
- “Guaranteed compression”
- “Military-grade privacy”
- “AI-powered” when no AI is involved
- “Upload your file” when the file never leaves the browser
- Technical error messages without a next step

## 11. States and feedback

Every important interaction needs a visible state:

| State | Visual treatment | Copy direction |
|---|---|---|
| Empty | Quiet drop zone, empty previews | “Drop an image here” |
| Dragging | Amber border, slight lift | “Release to process” if implemented |
| Processing | Small status, do not freeze silently | “Processing locally…” |
| Success | Mint savings signal | “82 KB lighter · 34% smaller” |
| Warning | Amber message | Explain tradeoff or fallback |
| Error | Coral message and next action | Explain what to change |
| Disabled | Reduced emphasis but readable | Keep the action label visible |

Never show a success state only through green color. Pair it with text.

## 12. Accessibility and privacy rules

- The entire workflow must be keyboard reachable.
- Use real `<label>` elements for controls.
- Use `aria-live="polite"` for processing and download feedback.
- Use `aria-pressed` or an equivalent state for selected modes.
- Keep focus visible against dark panels.
- Provide alt text for preview images based on the source file name.
- Do not expose local file paths in user-facing copy.
- Do not send image bytes to a network request.
- Revoke object URLs when files are replaced or reset.
- Explain format limitations close to the relevant control.

## 13. SEO and trust

The landing page should explain the tool in real language, not only present controls.

Include:

- A useful title and description
- Open Graph and Twitter metadata
- Favicon and manifest
- WebApplication structured data
- A short “How it works” section
- FAQ copy about privacy, WebP, PNG, JPG transparency, and browser support

Do not index user-generated images or create public URLs containing private image data.

## 14. Anti-slop checklist

Before shipping a Pixelpress page, confirm:

- There is one obvious primary action.
- The preview/result is more visually important than the form chrome.
- Empty states explain what to do next.
- Buttons are not all the same color.
- The page does not look like a generic SaaS dashboard.
- Every decorative effect has a reason.
- The mobile order makes sense without desktop context.
- No copy claims more privacy or browser support than the code provides.
- The interface still works with motion disabled.
- The result can be understood in under five seconds.

## 15. Future extension rule

New features should extend the same mental model:

> **Input → transform → compare → export.**

Good future features include batch processing, target file size, social-media presets, metadata controls, and ZIP export.

A feature should be rejected or deferred if it adds complexity without improving one of those four moments.
