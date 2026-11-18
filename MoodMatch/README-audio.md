# MoodMatch audio

This note covers the audio assets and playback behavior for the app described in [README.md](README.md). Keep the `audio/` folder beside `index.html` when serving or deploying the site.

The site has one optional background bed (`audio/site-ambience.mp3`) and one original generated loop for each of the eight standard moods. All bundled music is original AI-generated instrumental audio for this project. The secret moods reuse the soft loop for Hush Mode and Midnight Radio, and the chaos loop for Confetti Emergency and Joy Jolt.

## Playback behavior

- The page starts silent. Visitors use the **Sound off** control in the header to opt in; this user gesture starts the quiet site-wide bed.
- While sound is on, generating a moodboard crossfades from the site bed (or the previous mood) to that mood's loop.
- The Sound button fades audio out and stops it. Audio is never played on initial page load.
- If adding tracks or renaming files, update `moodAudioFiles` in `script.js` to match the files in `audio/`.

Deploy the HTML, CSS, JavaScript, and the entire `audio/` folder together, preserving the relative paths.

## Secret moods and dial effects

Hold the intensity slider at its minimum (1) or maximum (5) for about 700 ms. The minimum unlocks **Hush Mode** and **Midnight Radio**; the maximum unlocks **Confetti Emergency** and **Joy Jolt**. Unlocks reveal optional mood choices without changing the current selection. Leaving an extreme removes that end's secret choices; if one was selected, the previous regular mood is restored. Return to the endpoint and hold again to unlock them again.

Entering the minimum plays a quiet two-note sine chime, while entering the maximum plays a brighter rising three-note triangle fanfare. These effects are synthesized with the Web Audio API rather than downloaded audio files. Effects play once per visit to an endpoint and only after the visitor turns sound on. Leaving the endpoint resets its trigger so the effect can play on the next visit.
