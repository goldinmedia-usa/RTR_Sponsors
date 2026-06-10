#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Goldie..."
echo "Opening http://localhost:8080 in your browser"
echo "Keep this window open while you use Goldie."
echo ""
if command -v python3 &>/dev/null; then
  (sleep 1 && open "http://localhost:8080" 2>/dev/null || xdg-open "http://localhost:8080" 2>/dev/null) &
  python3 -m http.server 8080
elif command -v python &>/dev/null; then
  (sleep 1 && open "http://localhost:8080" 2>/dev/null || xdg-open "http://localhost:8080" 2>/dev/null) &
  python -m http.server 8080
else
  echo "ERROR: Python not found. Install Python from python.org"
  read -p "Press Enter to close..."
fi
