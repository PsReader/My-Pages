# Cipherly generator enhancements

## Implementation

- Add a compact light/dark theme toggle to the generator header. Store the selected theme in `localStorage`, apply it before the page paints when possible, and keep the control accessible with an explicit label and pressed state.
- Add a preset strip above the generator mode tabs. Presets are buttons, not a select menu, so the common jobs are visible and one tap away.
- Implement `PIN code` as a six-digit password with all other character groups disabled and ambiguous-character filtering enabled.
- Implement `Wi-Fi key` as a 20-character password using uppercase, lowercase, numbers, and symbols with ambiguous-character filtering enabled.
- Add `Memorable phrase` as a helpful third preset that switches to passphrase mode with four capitalized words and a number.
- Applying a preset updates the visible controls, switches the mode when needed, clears any custom character set, and generates immediately.

## Design

- **Design movement:** quiet editorial utility with a tactile paper-and-ink contrast; dark mode becomes a low-glare night version rather than a separate visual language.
- **Core principles:** private by default, obvious at a glance, tactile controls, and restrained motion.
- **Color philosophy:** preserve Cipherly's green/gold identity while shifting the page background, panels, borders, and text through semantic CSS variables for comfortable contrast in either theme.
- **Layout paradigm:** keep the result dominant and place the new controls in the settings rail, where intent is chosen before configuration.
- **Signature elements:** the cipher dial and keyway mark, mono utility labels, and gold action surfaces remain consistent across themes.
- **Interaction philosophy:** presets are quick-start decisions; manual settings remain available and take over naturally after selection.
- **Animation:** use the existing short hover transitions only; respect reduced-motion preferences.
- **Typography:** DM Sans for controls, DM Mono for security values and metadata, Playfair Display for editorial headings.
- **Brand essence:** a private, browser-local key maker for people who want strong secrets without ceremony. Personality: calm, precise, discreet.
- **Brand voice:** direct and reassuring. Example lines: “Pick a job. We’ll shape the key.” and “Nothing leaves this device.”
- **Wordmark & logo:** cipher dial and keyway mark beside the lowercase wordmark.
- **Signature brand color:** Cipherly gold (`#e7bb70`) used for action and trust cues.

## Project structure

- `generator.html` — generator page markup, theme control, preset controls, and existing output/settings panels.
- `app.js` — local generator state, preset application, theme persistence, generation, copy, and download behavior.
- `styles.css` — semantic theme variables, toggle/preset styling, responsive layout, and existing design system.
- `index.html` — unchanged promotional entry point.
