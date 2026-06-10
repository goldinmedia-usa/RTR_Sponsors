const { execFileSync } = require("node:child_process");
const { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const dist = join(root, "dist");
const appOut = join(dist, "goldy-app");

const filesToCopy = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "sw.js",
  "README.md",
  "src",
  "icons"
];

rmSync(appOut, { recursive: true, force: true });
mkdirSync(appOut, { recursive: true });

filesToCopy.forEach((file) => {
  const from = join(root, file);
  const to = join(appOut, file);
  if (!existsSync(from)) {
    throw new Error(`Missing app export file: ${file}`);
  }
  cpSync(from, to, { recursive: true });
});

writeFileSync(
  join(appOut, "INSTALL.md"),
  `# Install Goldy

Goldy is exported as a portable web app.

## Quick local preview

\`\`\`bash
python3 -m http.server 8080
\`\`\`

Then open:

\`\`\`text
http://localhost:8080
\`\`\`

## Install like an app

1. Open Goldy in Chrome, Edge, or another PWA-capable browser.
2. Click **Install app** inside Goldy if the button appears.
3. If the button does not appear, open the browser menu and choose **Install app** or **Add to Home Screen**.

Goldy works offline after the browser installs/caches it.
`
);

try {
  execFileSync("tar", ["-czf", join(dist, "goldy-app.tar.gz"), "-C", dist, "goldy-app"], {
    stdio: "ignore"
  });
  console.log("Exported Goldy app to dist/goldy-app and dist/goldy-app.tar.gz");
} catch (error) {
  console.log("Exported Goldy app to dist/goldy-app");
  console.log("Archive skipped because tar was not available.");
}
