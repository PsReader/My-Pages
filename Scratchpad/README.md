# Scratchpad — Thought Dashboard

A lightweight personal note-taking app with themed UI, persistent local storage, and structured note categories.

[GitHub](https://github.com/PsReader/Scratchpad)

## Overview

Scratchpad is a browser-based journaling and notes dashboard designed for quick daily capture. It lets users create, organize, search, pin, and manage notes without needing any backend or database.

## Features

- create notes with title, section, tags, and content
- organize notes by category: Quick Notes, Ideas, or Journal
- pin important notes to the top
- search by title, content, tags, or section
- undo and redo note actions
- clear all notes when needed
- switch between multiple visual themes, including a randomized SVG pine-forest backdrop
- notes show browser-local save status ("Saved at" timestamp)
- responsive layout for desktop and mobile use

## Tech stack

- HTML5
- CSS3
- JavaScript
- Browser `localStorage`

## Project structure

```text
Scratchpad/
├── images/
├── index.html
├── script.js
├── style.css
├── README.md
└── ...
```

## How to run

Open the app directly in a browser:

```bash
cd "Scratchpad"
start index.html
```

Or simply double-click `index.html`.

## Notes

- notes are saved locally in the browser using `localStorage`
- data persists only on the current browser/device
- no server setup or dependencies are required

## Author

Created by **PsReader**.

**[Return to the main portfolio](../index.html)**
