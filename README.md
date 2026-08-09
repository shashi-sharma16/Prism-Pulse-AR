# Prism Pulse AR

A real-time, motion-reactive AR experience that runs entirely in the browser. It uses your webcam and hand tracking to turn your fingertips into a glowing, particle-driven light show — no headset, no app install, just a camera and a browser tab.

## Features

- **Live hand tracking** via MediaPipe Hands (up to 2 hands, 21 landmarks each)
- **Reactive particle trails** on each fingertip that respond to motion
- **Two-hand light bridge** - bring your hands close together to spawn crackling arcs and a rotating mandala pattern between them
- **Gesture detection** - pinch, open hand, closed fist, and combined two-hand poses ("Power Surge", "Spark Bridge")
- **Procedural audio feedback** - a Web Audio synth that pulses on pinch and hums proportionally to hand proximity
- **5 visual themes** - Cyberpunk, Solar, Ocean, Lava, Nebula
- **2 ambient background modes** - Digital Rain and Warp Field starfield, plus a clean camera-only mode
- **Live settings drawer** - adjust volume, particle density, arc sensitivity, and motion trail length in real time

## Tech Stack

- [Vite](https://vitejs.dev/) - dev server & build tool
- [MediaPipe Hands](https://developers.google.com/mediapipe) - hand landmark detection (loaded via CDN)
- Vanilla JavaScript (ES modules), HTML5 Canvas, Web Audio API
- No UI framework - everything is hand-rolled for performance

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (includes npm)
- A webcam
- Chrome or Edge recommended for best camera/WebRTC support

## Getting Started

```bash
# Clone the repo
git clone https://github.com/<your-username>/prism-pulse-ar.git
cd prism-pulse-ar

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`), click **Launch Experience**, and allow camera access.

## Build for Production

```bash
npm run build
```

Outputs a static bundle to `dist/`, deployable to any static host (Vercel, Netlify, GitHub Pages, etc.).

```bash
npm run preview
```

Serves the production build locally so you can sanity-check it before deploying.

## Project Structure

```
prism-pulse-ar/
├── .gitignore
├── index.html
├── package.json
├── README.md
└── src/
    ├── main.js
    ├── poses.js
    ├── sound.js
    ├── style.css
    └── visuals.js
```

## Controls

| Control | Effect |
|---|---|
| Gear icon (top right) | Opens the settings drawer |
| Theme pills (bottom) | Switch color palette |
| Camera Feed | Toggle front/back camera |
| Ambient Layer | Digital Rain / Warp Field / Off |
| Feedback Volume | Master audio volume |
| Particle Density | How many particles spawn per fingertip |
| Arc Distance | How close hands must get to trigger light-bridge arcs |
| Trail Length | How long the motion trail lingers on screen |

## Notes

- Camera access requires a secure context - `localhost` works without HTTPS, but any other host (e.g. testing over your LAN IP) needs HTTPS.
- MediaPipe's model files load from a CDN on first run and are cached by the browser afterward.
- On Windows, if `npm` fails with a PowerShell execution policy error, run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` in PowerShell and confirm with `Y`.

## License

MIT - feel free to fork and remix.