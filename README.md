# Goldy Creative Agent

Goldy is a dependency-free creative production assistant for Goldin Media. It runs as a
single-page web app with a command-first interface: ask Goldy what to build, then use the
generated production view as the working dashboard. It turns a client brief, website/source
notes, and asset list into a client-ready production package:

- cinematic campaign strategy
- 4K storyboard and shot prompts
- social media packs for multiple formats
- voiceover, narration, music, and sound direction
- editable deck outlines
- website / landing page buildout notes
- photo and video replacement guidance
- markdown export for client handoff

Goldy creates original strategy, copy, and prompts. It does not clone paid platforms or
bypass subscriptions. Use the outputs with your own approved tools, local models, footage,
audio software, editors, and client permissions.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Use it like an app

Goldy is now an installable web app/PWA.

1. Start the local server above or deploy the files to any static web host.
2. Open Goldy in Chrome, Edge, or another browser that supports installing web apps.
3. Click **Install app** inside Goldy if the button appears.
4. If the button does not appear, open the browser menu and choose **Install app** or
   **Add to Home Screen**.

After the browser caches it, Goldy can open in its own app window and keep working offline.

## Export the app folder

Create a portable app bundle:

```bash
npm run export
```

This creates:

```text
dist/goldy-app/
dist/goldy-app.tar.gz
```

Upload the `dist/goldy-app` folder to a static host, or open it locally with a static server.

## Test

The core planning engine has dependency-free Node tests:

```bash
npm test
```

## Project structure

```text
index.html              Goldy app shell and studio form
styles.css              Black-and-gold responsive design system
app.js                  Browser UI interactions and export actions
manifest.webmanifest    Installable app manifest
sw.js                   Offline app cache
icons/                  Goldy app icons
src/goldyEngine.js      Reusable creative planning engine
scripts/export-app.js   Portable app export script
tests/goldyEngine.test.js
```
