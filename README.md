# Goldie — Unified Creative Agent

**Goldie** merges **Goldy** (creative planning SPA) and **Goldie** (skills registry) into one website for Goldin Media.

Upload a video, click your AI stack, and Goldie plans autonomous edits: Opus-style clips with captions, b-roll from **Luma Labs** (primary creative agent), **Runway**, **Kling**, **Flux**, **Nano Banana Pro**, **Higgsfield**, **Cling**, **SeaDance**, and NLE finish in Premiere, Resolve, or Final Cut.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` — you'll get a **chat interface** (like Gemini). Just type what you want or tap a suggestion.

## Test

```bash
npm test
python3 scripts/goldie_skills.py validate
```

## What you can do

- **Upload video** — local ingest for edit planning (hooks, captions, b-roll map)
- **Click skills** — 25+ capabilities from `goldie/skills.json`
- **Click providers** — route beats across Luma, Runway, Kling, Flux, Opus Clips, etc.
- **Ask Goldie** — natural-language commands infer services, skills, and providers
- **Export** — copy or download markdown production packages

## Project structure

```text
index.html                 Goldie app shell
app.js                     UI, video upload, skills/providers, plan rendering
styles.css                 Black-and-gold design system
src/goldyEngine.js         Creative planning + autonomous edit engine
src/skillsLoader.js        Loads goldie/skills.json and goldie/providers.json
goldie/skills.json         Unified skills registry (Goldy + Goldie)
goldie/providers.json      AI provider routing (Luma primary)
scripts/goldie_skills.py   CLI: validate, list, show, search-github
tests/goldyEngine.test.js  Engine unit tests
```

## Bring your own tools

Goldie creates original briefs, edit plans, and provider-specific prompts. Connect your own API keys and subscriptions for Luma Labs, Runway, Kling, Flux, Higgsfield, and Opus Clips.
