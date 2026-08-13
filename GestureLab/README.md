# GestureLab

GestureLab is a webcam-powered, real-time hand-tracking sandbox for creative interaction and motion-driven visuals. It combines MediaPipe hand detection with React Three Fiber and custom GLSL shaders to turn hand gestures into interactive 3D effects.

## What it does

- Tracks up to two hands using MediaPipe HandLandmarker.
- Renders detected hand joints and skeletons in a responsive Three.js scene.
- Uses one hand for mode selection and the other hand for direct manipulation.
- Controls a central sphere/halo object via gestures for position, scale, color, and rotation.
- Supports screenshot capture and GIF recording.

## Getting Started Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and allow camera access when prompted.

## How it works

GestureLab maps the hands into two roles:

| Hand                         | Role                                                            |
| ---------------------------- | --------------------------------------------------------------- |
| The hand showing 1–4 fingers | **Mode selector** — choose the active control mode              |
| The other hand               | **Manipulator** — perform gestures to adjust the central object |

When no mode is selected, the app uses **Auto** mode and animates the scene from motion energy and proximity.

### Gesture modes

| Fingers | Mode   | Manipulator effect                                    |
| ------- | ------ | ----------------------------------------------------- |
| 0       | Auto   | Sphere animates from motion energy and hand proximity |
| 1       | Move   | Palm position maps to sphere position                 |
| 2       | Scale  | Pinch thumb and index to adjust sphere size           |
| 3       | Color  | Move hand left/right to change hue                    |
| 4       | Rotate | Rotate the hand to tilt the halo ring                 |

Changes persist when switching modes, so the scene keeps its last state when you return to Auto.

## Controls

| Action                  | Input                                                 |
| ----------------------- | ----------------------------------------------------- |
| Select a mode           | Hold up 1–4 fingers on one hand                       |
| Manipulate              | Use the opposite hand with pinch/move/rotate gestures |
| Toggle navbar           | Fold your ring finger                                 |
| Switch interactive view | Use the UI controls in the overlay                    |

### Interactive modes

GestureLab supports two interactive views:

- **Sphere & Halo** — the default mode where hand gestures control a central sphere and halo.
- **Retrolens** — a video-based portal effect that uses both hands as corner anchors and cycles image filters.

In Retrolens:

- both hands must be visible to form the portal.
- the portal is drawn between the thumb and index points on each hand.
- to change the active filter, bring the index fingertips close together or fold only the pinky on either hand.
- each pose cycles to the next effect, such as MONO, DUAL-TONE, PIXELATE, INVERT, SEPIA, BLUR, THERMAL, SKETCH, GLITCH, and NEON.

### Navbar / overlay

- Shows tracking status and current shader/joint information.
- Enables screenshot capture and GIF recording.
- Displays live info for active mode and hand detection.

## Visuals & shaders

Each tracked joint can use a different shader style, creating a layered, reactive effect. Shader examples include:

- **Thermal Vision** — heat-map glow
- **Chromatic Aberration** — split-spectrum shimmer
- **Entropy Erosion** — fractal, noise-driven motion
- **Gravitational Lensing** — warped motion field
- **Plasma Bridge** — dynamic arc bands
- **Scanline Pulse** — pulsing scanlines
- **Neon Scattering** — glowing chromatic scatter
- **Topographic Matrix** — contour/trail lines

## Behind the scenes

- `src/hooks/useWebcam.ts` handles webcam access and video readiness.
- `src/hooks/useHands.ts` runs MediaPipe detection, smooths landmark data, and keeps left/right hand assignment stable.
- `src/hooks/useFingerCount.ts` counts extended fingers and detects ring-finger fold for UI toggles.
- `src/scene/HandScene.tsx` renders landmark spheres, skeleton lines, and the main interactive object in Three.js.
- `src/components/CentralSphere.tsx` drives the central sphere and halo based on gesture mode.
- `src/shaders/buildShaderMaterial.ts` creates the custom shader materials used for landmark visuals.
- `src/captureStore.ts` shares screenshot/GIF capture state across the app.

## Scripts

| Command           | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start the development server                        |
| `npm run build`   | Run TypeScript build and generate production assets |
| `npm run preview` | Preview the production build locally                |

## Tech stack

- React 18
- Vite
- TypeScript
- Three.js / React Three Fiber
- MediaPipe HandLandmarker
- Tailwind CSS
- GSAP
- GLSL shaders
