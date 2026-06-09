# AGENTS.md

Guidance for AI agents and cloud development environments working in this repository.

## Repository layout

`main` currently contains only a stub README. Runnable products live on feature branches:

| Branch | Product | Description |
|--------|---------|-------------|
| `cursor/goldy-creative-agent-6444` | **Goldy Creative Agent** | Dependency-free SPA that turns client briefs into creative production packages |
| `cursor/add-goldie-skills-086b` | **Goldie Skills Registry** | Declarative skill registry + Python stdlib CLI |

Check out the branch for the product you are working on before developing or testing.

## Goldy Creative Agent

**Stack:** Vanilla HTML/CSS/JS, no build step, zero npm dependencies.

### Run (dev)

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`. You can also open `index.html` directly in a browser, but a static server is preferred.

### Test

```bash
npm test
```

Runs `node tests/goldyEngine.test.js` using Node's built-in `assert` module. No `npm install` is required.

### Lint

No linter is configured in this project.

## Goldie Skills Registry

**Stack:** Python 3 (stdlib only), JSON skill definitions.

### Validate / explore

```bash
python3 scripts/goldie_skills.py validate
python3 scripts/goldie_skills.py list
python3 scripts/goldie_skills.py show <skill_id>
```

Optional: set `GITHUB_TOKEN` to improve GitHub API rate limits for `search-github`.

## Cursor Cloud specific instructions

- **No Docker, databases, or external APIs** are required for local development.
- **Goldy** is the primary interactive product. Start a static HTTP server from the repo root on port 8080 (see README). The full UI runs client-side; core logic is in `src/goldyEngine.js`.
- **Goldie** is a separate branch with a Python CLI only — no web server.
- **Node.js** is only needed for `npm test` on the Goldy branch, not for running the web app.
- **No `npm install`** — `package.json` has no dependencies.
- When demonstrating Goldy end-to-end: load the app in a browser, click **Load sample view** or use **Use sample ask** → **Ask Goldy**, then confirm the production plan renders (Creative Brief, services, storyboard, etc.).
