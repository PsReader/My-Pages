# Origami AR

An interactive web experience that blends real-time hand tracking with 3D visuals and shader effects.

## Overview

Origami AR is a React + Vite project built for desktop browsers that support webcam access. It detects hand landmarks using MediaPipe and maps them into a Three.js scene, letting users explore custom shader effects by selecting fingers and joints.

## Key Features

- Real-time hand tracking via webcam
- Custom 3D visuals powered by `@react-three/fiber` and `three`
- Joint-specific shader selection for thumb, index, middle, ring, and pinky
- Dynamic ambient background that responds to hand motion
- Smooth UI transitions using `gsap`
- Hidden video input with live landmark analysis

## Tech Stack

- React 18
- TypeScript
- Vite
- Three.js
- @react-three/fiber
- @react-three/drei
- @mediapipe/tasks-vision
- gsap
- Tailwind CSS

## Project Structure

```
Origami AR/
├── public/                # Static assets (if used)
├── src/
│   ├── components/        # UI components
│   ├── hooks/             # Custom hooks for webcam and hand tracking
│   ├── scene/             # Three.js scene components
│   ├── shaders/           # Shader registry and helpers
│   ├── App.tsx            # Main application logic
│   └── main.tsx           # Vite React entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install

```bash
cd "c:\Users\WilliEdo\Documents\My Projects\Origami AR"
npm install
```

### Run Locally

```bash
npm run dev
```

Open the address shown in the terminal (usually `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Notes

- Grant webcam permission when prompted.
- The app depends on browser support for MediaPipe and WebRTC webcam access.
- If hand tracking does not start, confirm your camera is connected and allowed in browser settings.

## License

This project is available under the MIT License.
