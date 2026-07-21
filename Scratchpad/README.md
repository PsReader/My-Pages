# Scratchpad

A browser-based note-taking dashboard with theme switching, persistent storage, and sectioned notes.

## Overview

Scratchpad is a lightweight web app for capturing quick thoughts, ideas, and journal-style entries. Notes are stored locally in the browser using `localStorage`, making it easy to use without a backend.

## Key Features

- Add notes with title, section, tags, and content
- Choose a note section: Quick Notes, Ideas, or Journal
- Pin notes to keep them at the top
- Search notes by title, content, tags, or section
- Undo and redo note changes
- Clear all notes
- Theme picker with multiple visual styles
- Responsive layout optimized for desktop and mobile

## Built With

- HTML
- CSS
- JavaScript

## Project Structure

```
Scratchpad/
├── images/              # Optional image assets
├── ScratchpadHome.html  # Main note-taking app page
├── script.js            # App behavior and state management
├── style.css            # Styling and theme rules
└── README.md
```

## Usage

1. Open `ScratchpadHome.html` in a browser.
2. Add notes using the form.
3. Notes are saved automatically in your browser.

## Notes

- The app supports multiple themes and stores the selected theme in `localStorage`.
- Data only persists on the current device and browser.
- No additional tools or server setup are required.

## License

This project is available under the MIT License.
