#!/bin/bash
# Creates goldie-app.zip — send this file to anyone; they unzip and double-click START-GOLDIE
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/goldie-app.zip"
cd "$ROOT"
zip -r "$OUT" \
  index.html app.js styles.css package.json README.md START-GOLDIE.command START-GOLDIE.bat \
  src/ goldie/ scripts/goldie_skills.py tests/ \
  -x "*.git*" -x "node_modules/*" -x "goldie-app.zip"
chmod +x START-GOLDIE.command 2>/dev/null || true
echo "Created: $OUT"
echo "To use: unzip goldie-app.zip, double-click START-GOLDIE"
