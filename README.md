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
src/goldyEngine.js      Reusable creative planning engine
tests/goldyEngine.test.js
```
