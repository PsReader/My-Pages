# GestureLab

A real-time hand-tracking sandbox powered by your webcam. Uses MediaPipe to detect hand landmarks and lets you manipulate a 3D central sphere through gestures — with full shader effects, GIF capture, and a creative sandbox for visual experimentation.

Built with React Three Fiber, MediaPipe HandLandmarker, and custom GLSL shaders.

## Getting Started Locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`. Grant camera access when prompted.

## How It Works

**Two hands, two roles:**

| Hand | Role |
|------|------|
| The hand showing 1–4 fingers | **Mode selector** — picks which property to control |
| The other hand | **Manipulator** — performs the gesture to change that property |

### Modes

| Fingers | Mode | Manipulator Gesture |
|---------|------|-------------------|
| 0 | Auto | Sphere animates from motion energy & hand proximity |
| 1 | Move | Palm position → sphere position |
| 2 | Scale | Pinch thumb & index → sphere size |
| 3 | Color | Hand slides left/right → hue |
| 4 | Rotate | Hand rotates → ring tilt |

All gesture values persist when you leave the mode and return to Auto.

## Gestures & Controls

| Action | How |
|--------|-----|
| **Select a mode** | Hold up 1–4 fingers on one hand |
| **Manipulate** | Use the other hand (pinch, move, rotate) |
| **Open palm menu** | Keep thumb & index apart for ½ second |
| **Select menu item** | Rotate hand to highlight, then pinch closed |
| **Toggle navbar** | Fold your ring finger |
| **Drag sphere** | Click and drag on the halo ring |

### Palm Menu

- **Center** — Open the Center Controls panel (position, scale, rotation, color sliders)
- **Tweak** — Open the Shader Sandbox (per-shader parameter sliders)
- **Joint** — Cycle the active landmark joint
- **Capture** — Download a screenshot
- **Reset** — Reset sandbox parameters

### Navbar

- Toggle between Left/Right hand
- Select which finger landmark routes to a shader
- Choose from 8 shader presets
- Capture screenshot or record a GIF (20 frames)

## Shaders

Each joint sphere uses a per-finger shader assigned from the **shader map** — you can route different shaders to different fingers per hand.

| Shader | Look |
|--------|------|
| Thermal Vision | Heat-map glow |
| Chromatic Aberration | Split-spectrum shimmer |
| Entropy Erosion | Fractal noise |
| Gravitational Lensing | Warp field around motion |
| Plasma Bridge | Dynamic arc bands |
| Scanline Pulse | Pulsing scanlines |
| Neon Scattering | Neon chromatic scatter |
| Topographic Matrix | Contour lines |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server on `localhost:3000` |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |

## Tech Stack

React 18, Three.js / R3F, MediaPipe HandLandmarker, Vite, TypeScript, GSAP, Tailwind CSS, GLSL shaders.


