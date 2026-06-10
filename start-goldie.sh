#!/bin/bash
# Double-click won't work on all systems — run this once in Terminal:
#   cd path/to/RTR_Sponsors && ./start-goldie.sh
cd "$(dirname "$0")"
echo ""
echo "  Goldie is starting..."
echo "  Open your browser to:  http://localhost:8080"
echo ""
echo "  (Leave this window open. Press Ctrl+C to stop.)"
echo ""
python3 -m http.server 8080
