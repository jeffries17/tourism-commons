#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Requires: firebase-tools installed and logged in

(
  cd "$ROOT_DIR/functions"
  npm i
  npm run build
  firebase emulators:start --only functions,hosting
) &

sleep 3

echo "Starting web dev server..."
cd "$ROOT_DIR/app/web"
npm i
npm run dev
