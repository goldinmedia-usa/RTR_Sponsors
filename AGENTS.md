# AGENTS.md

Guidance for AI agents working in the **Goldie** unified creative platform.

## Product

**Chat-first UI** — users talk to Goldie like Gemini/Higgsfield. No studio forms. The engine (`goldyEngine.js`) runs behind the scenes; responses are plain-language summaries with optional "technical details" expand.

## Run (dev)

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. Do not open `index.html` via `file://` — skills/providers fetch will fail.

## Test

```bash
npm test
python3 scripts/goldie_skills.py validate
```

## Key files

| Path | Role |
|------|------|
| `src/goldyEngine.js` | Plan engine: storyboard, prompts, video edit, provider handoffs |
| `src/skillsLoader.js` | Browser loader for skills + providers JSON |
| `goldie/skills.json` | Skills registry (video, AI gen, ops) |
| `goldie/providers.json` | Click-through AI provider routing |
| `app.js` | Video upload, skills/providers UI, plan rendering |

## Cursor Cloud specific instructions

- **No backend** — video upload is analyzed client-side for metadata only; no cloud encoding.
- **No `npm install`** — zero npm dependencies.
- **Static server required** on port 8080 for JSON fetch.
- **Hello-world demo**: load app → click skills/providers → upload or use sample ask → verify autonomous edit + provider handoff sections render.
- **Primary agent**: Luma Labs (`luma_labs` in providers.json).
